CREATE OR REPLACE PROCEDURE get_revenue_by_origin(
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT domestic_total NUMERIC,
    OUT foreign_total NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_start_date IS NOT NULL
       AND p_end_date IS NOT NULL
       AND p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Начальная дата позже конечной'
            USING ERRCODE = '22023';
END IF;

SELECT
    COALESCE(SUM(
                     CASE WHEN NOT c.is_foreign
                              THEN s.cost_our ELSE 0 END
             ), 0),
    COALESCE(SUM(
                     CASE WHEN c.is_foreign
                              THEN s.cost_foreign ELSE 0 END
             ), 0)
INTO domestic_total, foreign_total
FROM works w
         JOIN cars c ON c.id = w.car_id
         JOIN services s ON s.id = w.service_id
WHERE (p_start_date IS NULL OR w.date_work >= p_start_date)
  AND (p_end_date IS NULL OR w.date_work <= p_end_date);
END;
$$;


CREATE OR REPLACE PROCEDURE get_top_masters_by_month(
    IN p_month DATE,
    INOUT result_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_month IS NULL THEN
        RAISE EXCEPTION 'Месяц обязателен'
            USING ERRCODE = '22023';
END IF;

OPEN result_cursor FOR
SELECT
    m.id,
    m.name,
    COUNT(w.id) AS works_count,
    COUNT(DISTINCT w.car_id) AS distinct_cars_count
FROM masters m
         LEFT JOIN works w
                   ON w.master_id = m.id
                       AND w.date_work >= DATE_TRUNC('month', p_month::timestamp)
                       AND w.date_work < DATE_TRUNC('month', p_month::timestamp)
                           + INTERVAL '1 month'
GROUP BY m.id, m.name
ORDER BY
    distinct_cars_count DESC,
    works_count DESC,
    m.name
    LIMIT 5;
END;
$$;