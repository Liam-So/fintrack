import os
import json
import numpy as np
import math
import uuid
import traceback
import time
import secrets
from flask import Blueprint, request, jsonify
from app.models.db_models import User
from app.models.transaction import UserTransaction
from app.services.csv_extractor_services import CSVExtractorService
from http import HTTPStatus
from werkzeug.exceptions import BadRequest
from app.services.transaction_categorizer import TransactionCategorizer

extraction_bp = Blueprint('extraction', __name__)
MAX_RETRIES = 3
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def secure_file_delete(filepath):
    """Securely delete a file by overwriting it before removal"""
    if filepath and os.path.exists(filepath):
        try:
            # Overwrite the file with random data
            with open(filepath, 'wb') as f:
                f.write(secrets.token_bytes(os.path.getsize(filepath)))
            # Remove the file
            os.remove(filepath)
            return True
        except Exception as e:
            print(f"Error securely deleting file: {str(e)}")
            return False
    return False


@extraction_bp.route('/<id>', methods=['POST'])
def extract_csv(id):
    start = time.time()
    temp_file_path = None
    
    try:
        # Validate request
        if 'file' not in request.files:
            raise BadRequest('No file part')
        
        file = request.files['file']

        # Load and process CSV
        temp_file_path, df = CSVExtractorService.load_csv_file(file)
        print(f"📁 CSV file loaded successfully: {temp_file_path}")
        
        # Validate user and get categories
        is_trial = 'temp' in id and 'json' in request.form
        if is_trial:
            json_data = json.loads(request.form['json'])
            categories = {item['name']: item['id'] for item in json_data['categories']}
        else:
            user = User.query.get(id)
            if not user:
                raise BadRequest('Invalid user ID')
            categories = {cat.name: cat.id for cat in user.categories}
        
        # Process transactions
        chunk_size = math.ceil(len(df) / 20)
        new_transactions = []
        
        # Create sanitized transactions
        for _, row in df.iterrows():
            description = " ".join(str(row.get("Description", "")).split())  # Sanitize and handle missing values
            try:
                amount = float(row.get("Amount", 0))
                date = row.get("Date")
                if not date:
                    raise ValueError("Missing date")
                    
                new_transaction = UserTransaction(
                    id=str(uuid.uuid4()),
                    date=date,
                    amount=amount,
                    description=description[:255],  # Limit description length
                    category_id=-1
                )
                new_transactions.append(new_transaction)
            except (ValueError, TypeError) as e:
                print(f"Skipping invalid row: {str(e)}")
                continue
        
        list_df = np.array_split(new_transactions, chunk_size)
        print(f"📊 Categorizing {len(new_transactions)} transactions...")
        
        categorizer = TransactionCategorizer(categories=categories, max_retries=MAX_RETRIES)
        categorizer.categorize_all(list_df)
        
        return jsonify({
            "transactions": [t.__dict__ for t in new_transactions],
            "processed_count": len(new_transactions)
        }), 200
        
    except BadRequest as e:
        return str(e), HTTPStatus.BAD_REQUEST
    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")
        print(traceback.format_exc())
        return "An error occurred processing the file", 500
    finally:
        end = time.time()
        print(f"⏱️ Elapsed time: {end - start} seconds")
        if temp_file_path:
            print(f"Securely deleting CSV file: {temp_file_path}")
            secure_file_delete(temp_file_path)
