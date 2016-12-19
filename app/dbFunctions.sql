-- this file should contain all the functions

DROP FUNCTION IF EXISTS nzbn_at_date(text, timestamp with time zone);
DROP FUNCTION IF EXISTS company_name_at_date(text, timestamp with time zone, timestamp with time zone);


-- function 2: get company for nzbn at a specific date
CREATE OR REPLACE FUNCTION company_from_nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        select $1
    $$ LANGUAGE SQL;


-- function 2: get nzbn for companyName at a specific date
CREATE OR REPLACE FUNCTION nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        select $1
    $$ LANGUAGE SQL;



-- functio 3: get companyName at a specific date for a given companyName and date

CREATE OR REPLACE FUNCTION company_name_at_date(commanyName text, inDate timestamp with time zone , outDate timestamp with time zone)
    RETURNS text
    AS $$
        select $1
    $$ LANGUAGE SQL;
