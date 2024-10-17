from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor
from app.services.llm_controller import generate_response, PromptRequest, get_transaction_prompt, parse_json_response, clean_response
from app import db
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Util.Padding import unpad

from app.models.db_models import User, Category, Transaction
from app.models.transaction import UserTransaction
from datetime import datetime
import traceback

import tempfile
import os
import uuid
import json
import pandas as pd
import numpy as np
import math


bp = Blueprint('api', __name__)

# Generate RSA key pair (do this securely and store the private key safely)
key = RSA.generate(2048)
private_key = key.export_key()
public_key = key.publickey().export_key()


@bp.route('/', methods=['GET'])
def hello():
    return 'Welcome to FinTrack 💸'


@bp.route('/generate_temp_session', methods=['GET'])
def generate_temp_session():
   return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), 200

@bp.route('/get-public-key', methods=['GET'])
def get_public_key():
    return public_key.decode(), 200


@bp.route('/user/<id>/categories/percentages', methods=['POST'])
def categories(id):
  data = request.get_json(silent=True) or {}

  transactions_by_category = {}
  transactions = data.get("transactions", [])

  for transaction in transactions:
    category = transaction['category']
    amount = transaction['amount']

    if category not in transactions_by_category:
      transactions_by_category[category] = amount
    else:
      transactions_by_category[category] += amount

    round(transactions_by_category[category], 2)
  
  return transactions_by_category, 200


@bp.route('/trial/transactions', methods=['POST'])
def trial_transactions():
    data = request.get_json(silent=True) or {}
    transactions = data.get('transactions', [])
    month = int(data.get('month', None))

    transactions_to_return = []

    for transaction in transactions:
      parsed_date = datetime.strptime(transaction['date'],"%Y-%m-%dT%H:%M:%S.%fZ")
      if month and parsed_date.month == month:
        transactions_to_return.append(transaction)
  
    return jsonify({"transactions": transactions_to_return}), 200


@bp.route('/trial/categories/percentages', methods=['POST'])
def trial_categories():
   request_data = json.loads(request.data)

   transactions = request_data['transactions']

   categories = {}

   for transaction in transactions:
      if transaction['category'] not in categories:
         categories[transaction['category']] = float(transaction['amount'])
      else:
         categories[transaction['category']] += float(transaction['amount'])

      categories[transaction['category']] = round(categories[transaction['category']], 2)

   return categories, 200


@bp.route('/extract', methods=['POST'])
def extract():
    if 'pdf' not in request.files:
      return 'No file part', 400
    
    file = request.files['pdf']
    
    if file.filename == '':
      return 'No selected file', 400
    
    json_data = {}

    if 'json' in request.form:
       try:
          json_data = json.loads(request.form['json'])
          categories = json_data['categories']
       except Exception as e:
          return jsonify({"Error processing JSON": str(e)}), 400

    if file and file.filename.endswith('.pdf'):
      # Create a temporary file with a unique name
      temp_dir = tempfile.gettempdir()
      temp_filename = f"{uuid.uuid4()}.pdf"
      temp_filepath = os.path.join(temp_dir, temp_filename)

      try:
        # Save the file temporarily
        file.save(temp_filepath)
        institution = Institution("AMEX")
        text_by_page, open_close_dates = PDFExtractor.extract_text(temp_filepath, institution)
        transactions = TransactionExtractor.extract_transactions(text_by_page, open_close_dates)

        transactions_to_return = []

        for i in range(0, len(transactions), 5):
           chunk_of_transactions = transactions[i:i+5]
           print(f"⏳ Processing 5 transactions...")

           descriptions = [t.description for t in chunk_of_transactions]
           prompt = get_transaction_prompt(categories, descriptions)
           model = 'mistral'

           prompt_request = PromptRequest(prompt=prompt, model=model)
           parsed_items = generate_response(prompt_request)

           cleaned_response = clean_response(parsed_items, categories, descriptions, chunk_of_transactions)
           transactions_to_return.extend(cleaned_response)
        return jsonify({"transactions": [t.__dict__ for t in transactions]}), 200
      except Exception as e:
        print(f"Error processing PDF file: {str(e)}")
        print(traceback.format_exc())
        return str(e), 500
      finally:
        # Always attempt to delete the temporary file
        if os.path.exists(temp_filepath):
          print(f"Deleting PDF file: {temp_filename} in location: {temp_filepath}")
          os.remove(temp_filepath)


## Users
@bp.route('/user_count')
def user_count():
    count = User.query.count()
    return jsonify({"user_count": count}), 200 


@bp.route('/user/<email>', methods=['GET'])
def get_user(email):
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "monthly_income": user.monthly_income}), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/user/<id>', methods=['PUT'])
def update_user(id):
    user = User.query.get(id)
    if user:
        data = request.get_json(silent=True) or {}
        user.email = data.get("email", user.email)
        user.monthly_income = data.get("monthly_income", user.monthly_income)
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/user', methods=['POST'])
def create_user():
    data = request.get_json(silent=True) or {}
    monthly_income = data.get("monthly_income", None)
    new_user = User(username=data['username'], email=data['email'], monthly_income=monthly_income)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@bp.route('/onboard/<id>', methods=['POST'])
def onboard_user(id):
    data = request.get_json(silent=True) or {}
    monthly_income = data.get("monthly_income", None)
    categories = data.get("categories", [])
    user = User.query.get(id)

    # if user and monthly_income and len(categories) > 0:
    if user:
        if monthly_income:
          # update user income
          user.monthly_income = monthly_income
          db.session.commit()

        if len(categories) > 0:
           # if user already has existing categories, only update them with the latest ones
          if len(user.categories) > 0:
            user.categories = []

          # update categories
          existing_categories = Category.query.filter(Category.name.in_(categories)).all()

          # can't use set as they are Category objects
          existing_category_names = {category.name for category in existing_categories}

          # find new categories that need to be created if any
          new_category_names = set(categories) - existing_category_names

          new_categories = [Category(name=cat_name, is_predefined=False) for cat_name in new_category_names]

          # add new categories to the session
          if new_categories:
              db.session.add_all(new_categories)
              db.session.commit()

          # associate user with all new categories
          user.categories.extend(existing_categories + new_categories)

          # comit the associations
          db.session.commit()


        return jsonify({"message": "User onboarded successfully"}), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/transactions/<id>', methods=['POST'])
def post_transactions(id):
  data = request.get_json(silent=True) or {}
  transactions = data.get("transactions", [])
  user = User.query.get(id)
  categories = {cat.id: cat.name for cat in user.categories}

  transactions_to_send = []

  # TODO specify chunk size for bulk insert

  if user and len(transactions) > 0:
    for transaction in transactions:
      amount = transaction.get("amount", 0)
      date = transaction.get("date", None)
      description = transaction.get("description", "")
      category_id = int(transaction.get("category_id", None))

      if category_id in categories:
        user_transaction = Transaction(
            user_id=id, date=date, amount=amount, description=description, category_id=category_id)
        transactions_to_send.append(user_transaction)

  db.session.bulk_save_objects(transactions_to_send)
  db.session.commit()
  return jsonify({"message": "Transactions added successfully"}), 200
   

@bp.route('/transactions/<id>', methods=['DELETE'])
def delete_transactions(id):
    transaction = Transaction.query.get(id)
    if transaction:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({"message": "Transaction deleted successfully"}), 200

    return jsonify({"message": "Transaction not found"}), 404


@bp.route('/transactions/<id>', methods=['PUT'])
def update_transaction(id):
    data = request.get_json(silent=True) or {}

    transaction = Transaction.query.get(id)
    category = Category.query.filter_by(name=data.get("category")).first()
    print(category.name)

    if transaction and category:
        transaction.amount = data.get("amount", transaction.amount)
        transaction.date = data.get("date", transaction.date)
        transaction.description = data.get("description", transaction.description)
        transaction.category_id = category.id
        db.session.commit()
        return jsonify({"message": "Transaction updated successfully"}), 200
    return jsonify({"message": "Transaction not found"}), 404


@bp.route('/users/<id>/transactions', methods=['GET'])
def get_transactions(id):
   # NOTE query by month must be a value from 1-12
   query_by_month = int(request.args.get('query_by_month'))
  
   user = User.query.get(id)
   
   if user:
    transactions = user.transactions
    if query_by_month and query_by_month > 0 and query_by_month <= 12:
      transactions = [t for t in transactions if t.date.month == query_by_month]

    return jsonify({"transactions": [{"id": t.id, "amount": t.amount, "description": t.description, "date": t.date, "category": t.category.name} for t in transactions]}), 200
   
   return jsonify({"message": "User not found"}), 404


@bp.route('/users/<id>/categories', methods=['GET'])
def get_categories(id):
    user = User.query.get(id)
    if user:
        # return jsonify({"categories": [category.name for category in user.categories]}), 200
        return jsonify({ cat.id: cat.name for cat in user.categories }), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/extract_csv/<id>', methods=['POST'])
def extract_csv(id):
    temp_file_path = None
    try:
      if 'file' not in request.files:
        return 'No file part', 400

      file = request.files['file']
      filename = secure_filename(file.filename)
      temp_file_path = os.path.join("/tmp", filename)
      file.save(temp_file_path)

      if file.filename == '':
         raise BadRequest('No selected file')
      
      if not file.filename.endswith('.csv') or file.filename.endswith('.xlsx'):
        raise BadRequest('Invalid file format. Please upload a CSV file.')
      
      # sample_path = '/Users/liam.so/Personal/fintrack_Liam-So/backend/app/api/activity.csv'
      # user_id = 'c029af26-ea61-4d36-bb53-d879aca81c29'
      user = User.query.get(id)
      categories = {cat.id: cat.name for cat in user.categories}

      df = pd.read_csv(temp_file_path, parse_dates=['Date'])

      chunk_size = math.ceil((len(df))/10)
      list_df = np.array_split(df, chunk_size)

      new_transactions = []

      for i, chunk in enumerate(list_df):
        print('Processing chunk...', i)
        descriptions = {idx: desc for idx, desc in chunk['Description'].items()}
        prompt = create_prompt(categories, descriptions)
        model = 'mistral'
        prompt_request = PromptRequest(prompt=prompt, model=model)

        retries = 3


        for idx in range(1, retries + 1):
          print(f'Try number: {idx}')
          transactions_to_append = []

          try:
            # invoke LLM to categorize transactions
            parsed_items = generate_response(prompt_request)

            if len(parsed_items) == len(chunk):
              for item in parsed_items:
                new_category = int(parsed_items[item])
                if new_category in categories:
                    category = new_category
                else:
                    if idx == retries:
                      category = -1
                    else:
                      raise ValueError(f'Category {new_category} not found')
                    
                row_data = chunk.loc[int(item)]
                amount = row_data['Amount']
                date = row_data['Date']
                description = row_data['Description']

                new_transaction = UserTransaction(id=str(uuid.uuid4()), date=date, amount=amount, description=description, category_id=category)
                print(f'{description}: {new_transaction.category_id}')

                transactions_to_append.append(UserTransaction(id=str(uuid.uuid4()), date=date, amount=amount, description=description, category_id=category))
              
              new_transactions.extend(transactions_to_append)
              break
            else:
              print("retrying...")
          except Exception as e:
            print(f"Error generating response: {str(e)}")
            print(traceback.format_exc())
      
      return jsonify({"transactions": [t.__dict__ for t in new_transactions]}), 200
    except Exception as e:
      print(f"Error processing CSV file: {str(e)}")
      print(traceback.format_exc())
      return str(e), 500
    finally:
      if temp_file_path and os.path.exists(temp_file_path):
        print(f"Deleting CSV file: {filename} in location: {temp_file_path}")
        os.remove(temp_file_path)



def create_prompt(categories, descriptions):
    enumerated_descriptions = ""
    enumerated_categories = ""

    for id in descriptions:
      enumerated_descriptions += f"{id}. {descriptions[id]}\n"
    for id in categories:
      enumerated_categories += f"{id}. {categories[id]}\n"

    return f'''
You are the most precise and accurate financial advisor. Your task is to categorize the following transactions into the correct categories.

Categories:
{enumerated_categories}

Transactions:
{enumerated_descriptions}

## IMPORTANT ##
Only use the categories provided above. If unsure, choose the closest match.


Output a JSON where the key is the index of the transaction and the value is the category index.
{{
  "1": 4,
  "2": 8,
  "3": 7,
  "4": 2,
  "5": 8
  ...
}}

If I provide 10 transactions, you should provide 10 categories.
Only output the JSON, nothing else.
The value of the JSON should be the category name nothing else.
'''