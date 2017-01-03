-- this file should contain all the functions

DROP FUNCTION IF EXISTS company_from_nzbn_at_date(text, timestamp with time zone);
DROP FUNCTION IF EXISTS nzbn_at_date(text, timestamp with time zone);
DROP FUNCTION IF EXISTS company_name_at_date(text, timestamp with time zone, timestamp with time zone);


-- function 1: get company for nzbn at a specific date
CREATE OR REPLACE FUNCTION company_from_nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        SELECT companyName FROM company_names
        WHERE nzbn = $1
            AND startDate <= $2
            AND (endDate IS NULL OR endDate >= $2)
        ORDER BY startDate DESC
    $$ LANGUAGE SQL;


-- function 2: get nzbn for companyName at a specific date
CREATE OR REPLACE FUNCTION nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        SELECT nzbn FROM company_names
        WHERE companyName = $1
            AND startDate <= $2
            AND (endDate IS NULL OR endDate >= $2)
        ORDER BY startDate DESC
    $$ LANGUAGE SQL;



-- functio 3: get companyName at a specific date for a given companyName and date
CREATE OR REPLACE FUNCTION company_name_at_date(commanyName text, inDate timestamp with time zone , outDate timestamp with time zone)
    RETURNS text
    AS $$
        SELECT companyName from company_names
        WHERE nzbn = (
                SELECT nzbn FROM company_names
                WHERE companyName = $1
                    AND startDate <= $2
                    AND (endDate IS NULL OR endDate >= $2)
                )
            AND startDate <= $3
            AND (endDate IS NULL OR endDate >= $3)
    $$ LANGUAGE SQL;
