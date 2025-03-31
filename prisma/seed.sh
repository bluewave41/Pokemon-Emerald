#!/bin/bash

# Configuration
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="pokemon"
PGUSER="postgres"
PGPASSWORD="password"
SQL_DIR="./prisma/seeds"

export PGPASSWORD  # Prevent password prompt

# Execute all .sql files in the directory
for sql_file in "$SQL_DIR"/*.sql; do
    echo "Running: $(basename "$sql_file")"
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$sql_file"
    
    if [ $? -ne 0 ]; then
        echo "Error executing $(basename "$sql_file")"
        exit 1
    fi
done

echo "All SQL scripts executed successfully."
exit 0