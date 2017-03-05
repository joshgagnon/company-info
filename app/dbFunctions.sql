-- this file should contain all the functions


-- function 1: get company for nzbn at a specific date
CREATE OR REPLACE FUNCTION company_from_nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        SELECT company_name FROM company_names
        WHERE nzbn = $1
            AND start_date <= $2
            AND (end_date IS NULL OR end_date >= $2)
        ORDER BY start_date DESC
    $$ LANGUAGE SQL;


-- function 2: get nzbn for company name at a specific date
CREATE OR REPLACE FUNCTION nzbn_at_date(text, timestamp with time zone)
    RETURNS text
    AS $$
        SELECT nzbn FROM company_names
        WHERE company_name = $1
            AND start_date <= $2
            AND (end_date IS NULL OR end_date >= $2)
        ORDER BY start_date DESC
    $$ LANGUAGE SQL;



-- function 3: get company_name at a specific date for a given company name and date
CREATE OR REPLACE FUNCTION company_name_at_date(commanyName text, inDate timestamp with time zone , outDate timestamp with time zone)
    RETURNS text
    AS $$
        SELECT company_name FROM company_names
        WHERE nzbn = (
                SELECT nzbn FROM company_names
                WHERE company_name = $1
                    AND start_date <= $2
                    AND (end_date IS NULL OR end_date >= $2)
            )
            AND start_date <= $3
            AND (end_date IS NULL OR end_date >= $3)
        ORDER BY start_date DESC
    $$ LANGUAGE SQL;


-- function 4: get a companies name history (rows of: nzbn, company number, name, start date, and end date)
CREATE OR REPLACE FUNCTION company_name_history(text, timestamp with time zone)
    RETURNS TABLE (nzbn TEXT, company_number TEXT, company_name TEXT, start_date DATE, end_date DATE)
    AS $$
        SELECT nzbn, company_number, company_name, start_date, end_date
        FROM company_names
        WHERE nzbn = (
                SELECT nzbn FROM company_names
                WHERE company_name = $1
                    AND start_date <= $2
                    AND (end_date IS NULL OR end_date >= $2)
            )
        ORDER BY start_date DESC
    $$ LANGUAGE SQL;



CREATE OR REPLACE FUNCTION nzbns(text[])
    RETURNS JSON
    AS $$
        SELECT array_to_json(array_agg(row_to_json(q)))
        FROM (
        SELECT nzbn, company_name, company_number FROM company_names
        WHERE nzbn = ANY($1)
        and end_date is null
        ) q ;
    $$ LANGUAGE SQL;
