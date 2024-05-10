

```sql
SELECT sd. Id, COUNT (sdv. Dic_id) AS child_count
FROM sys_dictionary sd
LEFT JOIN sys_dictionary_value sdv ON sd. Id = sdv. Dic_id

GROUP BY id
Having   child_count>1
# And sd. Id=24
# Limit 10
# Offset 0
```