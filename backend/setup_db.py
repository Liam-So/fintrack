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


def upload_category_data(database_name: str, user: str, password: str, host: str):
    '''Upload category data to the database'''
    conn = psycopg2.connect(dbname=database_name, user=user, password=password, host=host)
    cur = conn.cursor()

    try:
        cur.execute('''
          INSERT INTO categories (id, name) VALUES
          (1, 'Groceries'),
          (2, 'Rent'),
          (3, 'Utilities'),
          (4, 'Dining Out'),
          (5, 'Drinks'),
          (6, 'Entertainment'),
          (7, 'Shopping'),
          (8, 'Transportation'),
          (9, 'Health'),
          (10, 'Education'),
          (11, 'Travel'),
          (12, 'Cell Phone'),
          (13, 'Insurance'),
          (14, 'Pet Care'),
          (15, 'Repairs'),
          (16, 'Clothing'),
          (17, 'Subscriptions')
        ''')
        conn.commit()
        print('Category data uploaded successfully!')
    except Exception as e:
        print(f'Error uploading category data: {e}')
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

        # Upload category data
        upload_category_data(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
    except Exception as e:
        print(f'Error applying migrations: {e}')


if __name__ == '__main__':
    setup_database()