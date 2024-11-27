import os
import json
import numpy as np
import math
import uuid
import traceback
import time

from flask import Blueprint, request, jsonify
from app.models.db_models import User
from app.models.transaction import UserTransaction
from app.services.csv_extractor_services import CSVExtractorService
from http import HTTPStatus
from werkzeug.exceptions import BadRequest
from app.services.transaction_categorizer import TransactionCategorizer

extraction_bp = Blueprint('extraction', __name__)
MAX_RETRIES = 3

@extraction_bp.route('/<id>', methods=['POST'])
def extract_csv(id):
  start = time.time()
  temp_file_path = None
  try:
    if 'file' not in request.files:
      return 'No file part', HTTPStatus.BAD_REQUEST
    
    temp_file_path, df = CSVExtractorService.load_csv_file(request.files['file'])
    print(f"📁 CSV file loaded successfully: {temp_file_path}")

    # TODO refactor isTrial to use os env
    is_trial = 'temp' in id and 'json' in request.form

    if is_trial:
      json_data = json.loads(request.form['json'])
      categories = {item['name']: item['id'] for item in json_data['categories']}
    else:
      user = User.query.get(id)
      categories = {cat.name : cat.id for cat in user.categories}

    # process roughly 20 transactions at a time
    chunk_size = math.ceil((len(df))/20)
    new_transactions = []
    
    # Create a new transaction for each row in the CSV
    for _, row in df.iterrows():
      description = " ".join(row["Description"].split()) # clean spacing up
      new_transaction = UserTransaction(id=str(uuid.uuid4()), date=row["Date"], amount=row["Amount"], description=description, category_id=-1)
      new_transactions.append(new_transaction)
    
    list_df = np.array_split(new_transactions, chunk_size)

    print(f"📊 Categorizing {len(new_transactions)} transactions...")

    categorizer = TransactionCategorizer(categories=categories, max_retries=MAX_RETRIES)
    categorizer.categorize_all(list_df)

    return jsonify({"transactions": [t.__dict__ for t in new_transactions]}), 200
  except BadRequest as e:
    return str(e), HTTPStatus.BAD_REQUEST
  except Exception as e:
    print(f"Error processing CSV file: {str(e)}")
    print(traceback.format_exc())
    return str(e), 500
  finally:
    end = time.time()
    print(f"⏱️ Elapsed time: {end - start} seconds")
    if temp_file_path and os.path.exists(temp_file_path):
      print(f"Deleting CSV file in location: {temp_file_path}")
      os.remove(temp_file_path)

