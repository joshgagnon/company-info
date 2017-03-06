SELECT array_to_json(array_agg(row_to_json(qq))) FROM 
(SELECT "companyNumber", "nzbn", "companyName", "incorporationDate", coalesce(data->'previousNames', '[]'::jsonb) from company_basic_info where data is not null) qq;



