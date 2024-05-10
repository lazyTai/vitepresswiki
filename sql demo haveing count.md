
```sql
SELECT sd.*, COUNT (sdv. Dic_id) AS child_count
FROM sys_dictionary sd
LEFT JOIN sys_dictionary_value sdv ON sd. Id = sdv. Dic_id
GROUP BY sd. Id
HAVING child_count > 1;
```