-- V2: PostgreSQL views, stored procedures, and reporting function.
-- Adapted from laboratory work No. 3 (variant 9).
-- Apply to a database that already has V1 (cars, masters, services, works).

-- 1. Services whose total billed amount exceeds 2000.
CREATE VIEW expensive_services AS
SELECT
    s.id,
    s.name,
    SUM(
            CASE
                WHEN c.is_foreign THEN s.cost_foreign
                ELSE s.cost_our
                END
    ) AS total_cost
FROM services s
         JOIN works w ON w.service_id = s.id
         JOIN cars c ON c.id = w.car_id
GROUP BY s.id, s.name
HAVING SUM(
               CASE
                   WHEN c.is_foreign THEN s.cost_foreign
                   ELSE s.cost_our
                   END
       ) > 2000;

-- 2. Revenue associated with each master over the last year.
-- Includes masters with no works (zero revenue).
CREATE VIEW masters_income AS
SELECT
    m.id,
    m.name,
    COALESCE(
            SUM(
                    CASE
                        WHEN c.is_foreign THEN s.cost_foreign
                        ELSE s.cost_our
                        END
            ), 0
    ) AS total_income
FROM masters m
         LEFT JOIN works w
                   ON w.master_id = m.id
                       AND w.date_work >= CURRENT_DATE - INTERVAL '1 year'
        AND w.date_work <= CURRENT_DATE
        LEFT JOIN cars c ON c.id = w.car_id
        LEFT JOIN services s ON s.id = w.service_id
        GROUP BY m.id, m.name;

-- 3. Average service cost for each car, including cars without works.
-- Caller fetches from a refcursor within the same transaction.
CREATE OR REPLACE PROCEDURE get_cars_avg_cost(
    INOUT result_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
OPEN result_cursor FOR
SELECT
    c.id,
    c.num,
    c.mark,
    COALESCE(
            AVG(
                    CASE
                        WHEN c.is_foreign THEN s.cost_foreign
                        ELSE s.cost_our
                        END
            ), 0
    ) AS avg_cost
FROM cars c
         LEFT JOIN works w ON w.car_id = c.id
         LEFT JOIN services s ON s.id = w.service_id
GROUP BY c.id, c.num, c.mark;
END;
$$;

-- 4. Total cost and count of a service for a specified car.
CREATE OR REPLACE PROCEDURE get_service_cost(
    IN p_service_id INTEGER,
    IN p_car_id INTEGER,
    OUT total_cost NUMERIC,
    OUT works_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
SELECT
    COALESCE(
            SUM(
                    CASE
                        WHEN c.is_foreign THEN s.cost_foreign
                        ELSE s.cost_our
                        END
            ), 0
    ),
    COUNT(w.id)
INTO total_cost, works_count
FROM works w
         JOIN cars c ON c.id = w.car_id
         JOIN services s ON s.id = w.service_id
WHERE w.service_id = p_service_id
  AND w.car_id = p_car_id;
END;
$$;

-- 5. Number of distinct services performed by both masters.
CREATE OR REPLACE PROCEDURE common_services(
    IN p_master1 INTEGER,
    IN p_master2 INTEGER,
    OUT services_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
SELECT COUNT(DISTINCT w1.service_id)
INTO services_count
FROM works w1
         JOIN works w2 ON w1.service_id = w2.service_id
WHERE w1.master_id = p_master1
  AND w2.master_id = p_master2;
END;
$$;

-- 6. Current-month salary plus bonus based on works (cursor implementation).
CREATE OR REPLACE PROCEDURE calculate_master_salary(
    IN p_master_id INTEGER,
    IN p_salary NUMERIC,
    OUT total_salary NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
work_cursor CURSOR FOR
SELECT car_id
FROM works
WHERE master_id = p_master_id
  AND date_work >= DATE_TRUNC('month', CURRENT_DATE)
  AND date_work < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

v_car_id INTEGER;
    v_works_count INTEGER;
    v_bonus NUMERIC := 0;
BEGIN
OPEN work_cursor;

LOOP
FETCH work_cursor INTO v_car_id;
        EXIT WHEN NOT FOUND;

SELECT COUNT(*)
INTO v_works_count
FROM works
WHERE car_id = v_car_id
  AND date_work >= DATE_TRUNC('month', CURRENT_DATE)
  AND date_work < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

IF v_works_count < 3 THEN
            v_bonus := v_bonus + p_salary * 0.05;
ELSE
            v_bonus := v_bonus + p_salary * 0.07;
END IF;
END LOOP;

CLOSE work_cursor;
total_salary := p_salary + v_bonus;
END;
$$;

-- 7. JSONB information about a master and the current month's works.
CREATE OR REPLACE FUNCTION get_master_info(p_master_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
result JSONB;
BEGIN
SELECT jsonb_build_object(
               'master_id', m.id,
               'master_name', m.name,
               'works_count_current_month', COUNT(w.id),
               'serviced_cars', COALESCE(
                       jsonb_agg(DISTINCT c.num) FILTER (WHERE c.num IS NOT NULL),
                       '[]'::JSONB
                                )
       )
INTO result
FROM masters m
         LEFT JOIN works w
                   ON w.master_id = m.id
                       AND w.date_work >= DATE_TRUNC('month', CURRENT_DATE)
                       AND w.date_work < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    LEFT JOIN cars c ON c.id = w.car_id
WHERE m.id = p_master_id
GROUP BY m.id, m.name;

RETURN result;
END;
$$;
