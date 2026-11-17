ALTER TABLE cars
    ADD CONSTRAINT uq_cars_num UNIQUE (num);

CREATE OR REPLACE FUNCTION enforce_master_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(834010001::bigint);
    IF (SELECT COUNT(*) FROM masters) >= 10 THEN
        RAISE EXCEPTION 'В автосервисе не может быть больше 10 мастеров';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_master_limit
BEFORE INSERT ON masters
FOR EACH ROW
EXECUTE FUNCTION enforce_master_limit();

CREATE OR REPLACE FUNCTION enforce_master_daily_work_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    PERFORM 1 FROM masters WHERE id = NEW.master_id FOR UPDATE;

    SELECT COUNT(*) INTO v_count
    FROM works w
    WHERE w.master_id = NEW.master_id
      AND w.date_work = NEW.date_work
      AND w.id <> NEW.id;

    IF v_count >= 2 THEN
        RAISE EXCEPTION 'На % у мастера % уже две работы', NEW.date_work, NEW.master_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_master_daily_work_limit
BEFORE INSERT OR UPDATE OF master_id, date_work ON works
FOR EACH ROW
EXECUTE FUNCTION enforce_master_daily_work_limit();
