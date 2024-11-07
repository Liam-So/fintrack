import os
import json
import pandas as pd
import numpy as np
import math
import uuid
import traceback

from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename
from app.models.db_models import User, Category, Transaction
from app.services.llm_controller import generate_response, PromptRequest, get_transaction_prompt, parse_json_response, clean_response
from app.models.transaction import UserTransaction

extraction_bp = Blueprint('extraction', __name__)


@extraction_bp.route('/<id>', methods=['POST'])
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

    is_trial = 'temp' in id and 'json' in request.form

    if is_trial:
      try:
          json_data = json.loads(request.form['json'])
          # TODO: we should standardize the JSON format so we don't have to keep casting the keys to int
          json_data['categories'] = {int(key): value for key, value in json_data['categories'].items()}
          categories = json_data['categories']
          print(categories)
      except Exception as e:
          return jsonify({"Error processing JSON": str(e)}), 400
    else:
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

      # TODO: to prevent the LLM from returning a lot of -1, create a dictionary to keep track of past categorizations
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


# @extraction_bp.route('/pdf', methods=['POST'])
# def extract():
#     if 'pdf' not in request.files:
#       return 'No file part', 400
    
#     file = request.files['pdf']
    
#     if file.filename == '':
#       return 'No selected file', 400
    
#     json_data = {}

#     if 'json' in request.form:
#        try:
#           json_data = json.loads(request.form['json'])
#           categories = json_data['categories']
#        except Exception as e:
#           return jsonify({"Error processing JSON": str(e)}), 400

#     if file and file.filename.endswith('.pdf'):
#       # Create a temporary file with a unique name
#       temp_dir = tempfile.gettempdir()
#       temp_filename = f"{uuid.uuid4()}.pdf"
#       temp_filepath = os.path.join(temp_dir, temp_filename)

#       try:
#         # Save the file temporarily
#         file.save(temp_filepath)
#         institution = Institution("AMEX")
#         text_by_page, open_close_dates = PDFExtractor.extract_text(temp_filepath, institution)
#         transactions = TransactionExtractor.extract_transactions(text_by_page, open_close_dates)

#         transactions_to_return = []

#         for i in range(0, len(transactions), 5):
#            chunk_of_transactions = transactions[i:i+5]
#            print(f"⏳ Processing 5 transactions...")

#            descriptions = [t.description for t in chunk_of_transactions]
#            prompt = get_transaction_prompt(categories, descriptions)
#            model = 'mistral'

#            prompt_request = PromptRequest(prompt=prompt, model=model)
#            parsed_items = generate_response(prompt_request)

#            cleaned_response = clean_response(parsed_items, categories, descriptions, chunk_of_transactions)
#            transactions_to_return.extend(cleaned_response)
#         return jsonify({"transactions": [t.__dict__ for t in transactions]}), 200
#       except Exception as e:
#         print(f"Error processing PDF file: {str(e)}")
#         print(traceback.format_exc())
#         return str(e), 500
#       finally:
#         # Always attempt to delete the temporary file
#         if os.path.exists(temp_filepath):
#           print(f"Deleting PDF file: {temp_filename} in location: {temp_filepath}")
#           os.remove(temp_filepath)
