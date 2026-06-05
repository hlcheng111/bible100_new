import sqlite3
import json
import os

db_path = 'c:\\Users\\hlche\\.cursor\\bible100_new\\data\\bibles\\综合解读.db'
print(f"Checking for database file at: {db_path}")

if not os.path.exists(db_path):
    print("Database file not found!")
else:
    print("Database file found.")
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("Successfully connected to the database.")

        # Get the list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables found: {tables}")

        if not tables:
            print("No tables found. Let's see all objects in sqlite_master.")
            cursor.execute("SELECT sql, name, type FROM sqlite_master;")
            all_objects = cursor.fetchall()
            print(f"All objects in sqlite_master: {all_objects}")

        # Create a dictionary to store the data
        data = {}

        # Iterate over the tables
        for table_name in tables:
            table_name = table_name[0]
            print(f"Processing table: {table_name}")
            
            # Get the data from the table
            cursor.execute(f'SELECT * FROM {table_name}')
            rows = cursor.fetchall()
            print(f"Found {len(rows)} rows in {table_name}")
            
            # Get the column names
            column_names = [description[0] for description in cursor.description]
            
            # Create a list of dictionaries for the table data
            table_data = []
            for row in rows:
                table_data.append(dict(zip(column_names, row)))
            
            # Add the table data to the main dictionary
            data[table_name] = table_data

        # Close the connection
        conn.close()

        # Write the data to a JSON file
        with open('bible_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print('Successfully converted the database to JSON.')
    except Exception as e:
        print(f"An error occurred: {e}")