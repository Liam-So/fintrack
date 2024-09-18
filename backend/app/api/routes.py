from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor

bp = Blueprint('api', __name__)

@bp.route('/', methods=['GET'])
def hello():
    return 'Welcome to FinTrack 💸'

@bp.route('/extract', methods=['POST'])
def extract():
    json_content = request.json
    pdf_path = json_content["filename"]
    institution = Institution(json_content.get("institution", "AMEX"))

    text_by_page = PDFExtractor.extract_text(pdf_path, institution)
    transactions = TransactionExtractor.extract_transactions(text_by_page)

    return jsonify({"transactions": [t.__dict__ for t in transactions]})