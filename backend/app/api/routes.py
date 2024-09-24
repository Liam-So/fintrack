from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor
from app.services.llm_controller import generate_response, PromptRequest, get_transaction_prompt, parse_json_response, clean_response

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Util.Padding import unpad
import traceback

import tempfile
import os
import uuid
import json

bp = Blueprint('api', __name__)

CATEGORIES = ["Cellphone", "Utilities", "Groceries", "Restaurants", "Beverages", "Transportation", "Entertainment", "Gym", "Subscriptions"]

# Generate RSA key pair (do this securely and store the private key safely)
key = RSA.generate(2048)
private_key = key.export_key()
public_key = key.publickey().export_key()


@bp.route('/', methods=['GET'])
def hello():
    return 'Welcome to FinTrack 💸'


@bp.route('/get-public-key', methods=['GET'])
def get_public_key():
    return public_key.decode(), 200

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
        text_by_page = PDFExtractor.extract_text(temp_filepath, institution)
        transactions = TransactionExtractor.extract_transactions(text_by_page)

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

        return jsonify({"transactions": [t.__dict__ for t in transactions_to_return]}), 200
      except Exception as e:
        print(f"Error processing PDF file: {str(e)}")
        print(traceback.format_exc())
        return str(e), 500
      finally:
        # Always attempt to delete the temporary file
        if os.path.exists(temp_filepath):
          print(f"Deleting PDF file: {temp_filename} in location: {temp_filepath}")
          os.remove(temp_filepath)
      