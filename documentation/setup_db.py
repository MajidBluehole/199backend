import os
import sys
import mysql.connector
from mysql.connector import errorcode
from dotenv import dotenv_values
import subprocess
import random
import string

# Set project root path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Path to .env
env_path = os.path.join(project_root, '.env')

# Check if .env exists
if not os.path.exists(env_path):
    sys.exit("❌ .env file not found in project root.")

# Load .env variables
env_vars = dotenv_values(env_path)

required_keys = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_DIALECT']
missing_keys = [key for key in required_keys if key not in env_vars]

if missing_keys:
    sys.exit(f"❌ Missing keys in .env: {', '.join(missing_keys)}")

db_host = env_vars['DB_HOST']
db_user = env_vars['DB_USER']
db_pass = env_vars['DB_PASS']
db_name = env_vars['DB_NAME']
db_dialect = env_vars['DB_DIALECT']

if db_dialect.lower() != 'mysql':
    sys.exit("❌ DB_DIALECT must be 'mysql'.")

# Connect to MySQL
try:
    conn = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_pass
    )
    cursor = conn.cursor()
except mysql.connector.Error as err:
    sys.exit(f"❌ MySQL connection error: {err}")

# Check if DB exists
cursor.execute("SHOW DATABASES")
databases = [db[0] for db in cursor.fetchall()]

if db_name not in databases:
    cursor.execute(f"CREATE DATABASE {db_name}")
    print(f"✅ Database '{db_name}' created.")
    selected_db = db_name
else:
    # Check if DB is empty
    cursor.execute(f"USE {db_name}")
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()

    if tables:
        # Create a new DB
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        new_db_name = f"{db_name}_{suffix}"
        cursor.execute(f"CREATE DATABASE {new_db_name}")
        selected_db = new_db_name
        print(f"⚠️ Existing DB not empty. Created new DB: {selected_db}")
    else:
        selected_db = db_name
        print(f"✅ Existing DB '{db_name}' is empty.")

# Update .env if a new DB was created
if selected_db != db_name:
    print(f"🔄 Updating .env file with new DB_NAME: {selected_db}")
    new_lines = []
    with open(env_path, 'r') as file:
        for line in file:
            if line.startswith('DB_NAME='):
                new_lines.append(f'DB_NAME={selected_db}\n')
            else:
                new_lines.append(line)
    with open(env_path, 'w') as file:
        file.writelines(new_lines)
    print("✅ .env file updated.")


# Import SQL file
sql_file_path = os.path.join(project_root, 'documentation', 'mysql_database.sql')
if not os.path.exists(sql_file_path):
    sys.exit("❌ SQL dump file not found at 'documentation/mysql_database.sql'.")

print(f"⏳ Importing database into {selected_db}...")
cmd = f"mysql -h {db_host} -u {db_user} -p{db_pass} {selected_db} < \"{sql_file_path}\""
result = subprocess.run(cmd, shell=True)

if result.returncode != 0:
    sys.exit("❌ Failed to import SQL file.")

print("✅ Database imported successfully.")

# Connect to the selected DB and fetch user data
try:
    conn.database = selected_db
    cursor.execute("SELECT email, password, role FROM Users")
    users = cursor.fetchall()
    if not users:
        print("ℹ️ No users found in the 'user' table.")
    else:
        print("\n👤 User Details:")
        for email, password, role in users:
            print(f"Email: {email}, Password: admin@123, Role: {role}")
except Exception as e:
    print(f"⚠️ Failed to fetch user data: {e}")

# Clean up
cursor.close()
conn.close()
