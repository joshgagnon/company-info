DROP TABLE IF EXISTS company_names;
CREATE TABLE company_names (
    id             SERIAL PRIMARY KEY,
    nzbn           TEXT NOT NULL,
    company_number TEXT NOT NULL,
    company_name   TEXT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE
);
