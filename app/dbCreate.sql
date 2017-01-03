DROP TABLE IF EXISTS company_names;
CREATE TABLE company_names (
    id            SERIAL PRIMARY KEY,
    nzbn          TEXT NOT NULL,
    companyName   TEXT NOT NULL,
    startDate     DATE NOT NULL,
    endDate       DATE
);
