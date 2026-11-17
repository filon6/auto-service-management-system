CREATE TABLE app_users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_hash CHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_app_users_role
        CHECK (role IN ('ADMIN', 'USER'))
);
