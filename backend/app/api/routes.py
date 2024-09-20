from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Util.Padding import unpad

import tempfile
import os
import uuid

bp = Blueprint('api', __name__)

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

        return jsonify({"transactions": [t.__dict__ for t in transactions]}), 200

      except Exception as e:
        return str(e), 500
      finally:
        # Always attempt to delete the temporary file
        if os.path.exists(temp_filepath):
          print(f"Deleting PDF file: {temp_filename} in location: {temp_filepath}")
          os.remove(temp_filepath)
      