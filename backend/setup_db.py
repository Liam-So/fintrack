import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

def create_database(database_name: str, user: str, password: str, host: str):
    '''Create a new database'''
    conn = psycopg2.connect(dbname='postgres', user=user, password=password, host=host)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    try:
      cur.execute(f'SELECT 1 FROM pg_catalog.pg_database WHERE datname = \'{database_name}\';')
      exists = cur.fetchone()

      if not exists:
        cur.execute(f'CREATE DATABASE {database_name}')
        print(f'Database {database_name} created')
      else:
        print(f'Database {database_name} already exists')

    except Exception as e:
      print(f'Error creating database {database_name}: {e}')
    finally:
      cur.close()
      conn.close()


def setup_database():
    '''Setup the complete database with schema'''
    DB_NAME = os.getenv('DB_NAME', 'fintrack')
    DB_USER = os.getenv('DB_USER', 'liam.so')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password')
    DB_HOST = os.getenv('DB_HOST', 'localhost')

    # create database
    create_database(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)

    try:
       # Check if migrations directory exists
        if not os.path.exists('migrations'):
            os.system('flask db init')
            print('Migrations initialized.')
        
        # Generate and apply migrations
        os.system('flask db migrate -m "Initial migration"')
        os.system('flask db upgrade')
        print('Migration applied successfully!')
    except Exception as e:
        print(f'Error applying migrations: {e}')


if __name__ == '__main__':
    setup_database()