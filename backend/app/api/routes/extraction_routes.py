import os
import json
import numpy as np
import math
import uuid
import traceback

from flask import Blueprint, request, jsonify
from app.models.db_models import User, Category, Transaction
from app.services.llm_controller import generate_response, PromptRequest, get_transaction_prompt, parse_json_response, clean_response
from app.models.transaction import UserTransaction
from app.services.csv_extractor_services import CSVExtractorService
from http import HTTPStatus
from werkzeug.exceptions import BadRequest

extraction_bp = Blueprint('extraction', __name__)

MAX_RETRIES = 3
MODEL= 'mistral'

@extraction_bp.route('/<id>', methods=['POST'])
def extract_csv(id):
  temp_file_path = None
  try:
    if 'file' not in request.files:
      return 'No file part', HTTPStatus.BAD_REQUEST

    is_trial = 'temp' in id and 'json' in request.form

    if is_trial:
      json_data = json.loads(request.form['json'])
      categories = {value: int(key) for key, value in json_data['categories'].items()}
    else:
      user = User.query.get(id)
      categories = {cat.name : cat.id for cat in user.categories}
    
    temp_file_path, df = CSVExtractorService.load_csv_file(request.files['file'])

    chunk_size = math.ceil((len(df))/10)
    new_transactions = []
    
    # Create a new transaction for each row in the CSV
    for _, row in df.iterrows():
      new_transaction = UserTransaction(id=str(uuid.uuid4()), date=row["Date"], amount=row["Amount"], description=row["Description"], category_id=-1)
      new_transactions.append(new_transaction)
    
    list_df = np.array_split(new_transactions, chunk_size)

    # From the list of transactions, categorize each one
    for i, chunk in enumerate(list_df):
      print('Processing chunk...', i)

      # Pass categories and descriptions to create a prompt
      descriptions = [t.description for t in chunk]
      category_list = list(categories.keys())

      # Create the prompt
      prompt = create_prompt(category_list, descriptions)
      prompt_request = PromptRequest(prompt=prompt, model=MODEL)

      # LLM's response is not always accurate, so we will retry a few times
      for idx in range(1, MAX_RETRIES + 1):
        print(f'Try number: {idx}')

        try:
          # invoke LLM to categorize transactions
          parsed_items = generate_response(prompt_request)
          llm_hit = len(parsed_items) == len(chunk)

          if llm_hit:
            print(json.dumps(parsed_items, indent=4))

            is_complete = True

            for item in parsed_items:
              row_data = chunk[int(item)-1]
              new_category = parsed_items[item]

              # Assign the category if not yet classified and the category is in the sample categories
              if row_data.category_id == -1 and new_category in categories:
                row_data.category_id = categories[new_category]
              else:
                is_complete = False
            
            if not is_complete:
              # invoke a retry
              raise ValueError('Some transactions were not categorized')

            break
        except ValueError as e:
          print(f"Error generating response: {str(e)}")
          print(traceback.format_exc())
        except Exception as e:
          print(f"Error generating response: {str(e)}")
          print(traceback.format_exc())

    return jsonify({"transactions": [t.__dict__ for t in new_transactions]}), 200
  except BadRequest as e:
    return str(e), HTTPStatus.BAD_REQUEST
  except Exception as e:
    print(f"Error processing CSV file: {str(e)}")
    print(traceback.format_exc())
    return str(e), 500
  finally:
    if temp_file_path and os.path.exists(temp_file_path):
      print(f"Deleting CSV file in location: {temp_file_path}")
      os.remove(temp_file_path)


def create_prompt(categories: list[str], descriptions: list[str]):
    enumerated_descriptions = ""
    enumerated_categories = ""

    for index, description in enumerate(descriptions):
      enumerated_descriptions += f"{index+1}. {description}\n"
    for index, category in enumerate(categories):
      enumerated_categories += f"{index+1}. {category}\n"

    return f'''
You are the most precise and accurate classifier. Your task is to categorize the following transactions into the correct categories.

Categories:
{enumerated_categories}

Transactions:
{enumerated_descriptions}

## IMPORTANT ##
Only use the categories provided above. If unsure, choose the closest match.


Output a JSON where the key is the index of the transaction and the value is the category.
{{
  "1": {categories[0]},
  "2": {categories[len(categories)-1]},
  ...
}}

I have provided {len(descriptions)} transactions.
You MUST return {len(descriptions)} categories.

Only output the JSON, nothing else.
The value of the JSON should be the category name nothing else.

Before returning, double check that the category you selected is in the list of categories provided above.
If not, retry,
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
