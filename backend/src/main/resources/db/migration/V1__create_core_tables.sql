
-- Cars
CREATE TABLE cars (
                      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                      num VARCHAR(10) NOT NULL,
                      color VARCHAR(20) NOT NULL,
                      mark VARCHAR(20) NOT NULL,
                      is_foreign BOOLEAN NOT NULL
);

-- Masters
CREATE TABLE masters (
                         id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         name VARCHAR(20) NOT NULL UNIQUE
);

-- Services
CREATE TABLE services (
                          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          name VARCHAR(20) NOT NULL,
                          cost_our NUMERIC(10, 2) NOT NULL,
                          cost_foreign NUMERIC(10, 2) NOT NULL,

                          CONSTRAINT chk_services_cost_our
                              CHECK (cost_our >= 0),

                          CONSTRAINT chk_services_cost_foreign
                              CHECK (cost_foreign >= 0)
);

-- Works
CREATE TABLE works (
                       id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       date_work DATE NOT NULL,
                       master_id INTEGER NOT NULL,
                       car_id INTEGER NOT NULL,
                       service_id INTEGER NOT NULL,

                       CONSTRAINT fk_works_masters
                           FOREIGN KEY (master_id)
                               REFERENCES masters(id)
                               ON DELETE CASCADE,

                       CONSTRAINT fk_works_cars
                           FOREIGN KEY (car_id)
                               REFERENCES cars(id)
                               ON DELETE CASCADE,

                       CONSTRAINT fk_works_services
                           FOREIGN KEY (service_id)
                               REFERENCES services(id)
                               ON DELETE CASCADE
);
