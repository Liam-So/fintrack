from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Util.Padding import unpad

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
    json_content = request.json
    pdf_path = json_content["filename"]
    institution = Institution(json_content.get("institution", "AMEX"))

    text_by_page = PDFExtractor.extract_text(pdf_path, institution)
    transactions = TransactionExtractor.extract_transactions(text_by_page)

    return jsonify({"transactions": [t.__dict__ for t in transactions]})