from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz
import re
from enum import Enum
from typing import Dict, List, Optional
from dataclasses import dataclass

app = Flask(__name__)
CORS(app)

class Institution(Enum):
    AMEX = "AMEX"
    SCOTIA = "SCOTIA"

@dataclass
class Transaction:
    date: str
    amount: float
    description: str

class PDFExtractor:
    @staticmethod
    def extract_text(pdf_path: str, institution: Institution) -> Dict[str, str]:
        if institution == Institution.AMEX:
            return PDFExtractor._extract_text_for_amex(pdf_path)
        raise NotImplementedError(f"Extraction for {institution.value} not implemented")

    @staticmethod
    def _extract_text_for_amex(pdf_path: str) -> Dict[str, str]:
        pages = {}
        with fitz.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf, start=1):
                # We need to make the name dynamic
                your_transactions = fitz.Rect(19.5, 150.05201721191406, 127.6919937133789, 166.67201232910156)
                text = page.get_text("text", clip=your_transactions).replace("\n", "")

                if text == "Your Transactions":
                    list_of_transactions = fitz.Rect(18, 199, 533, 731)
                    # Only the first page has a different clip
                    if not pages:
                        text = "New Transactions for" 
                        text_instances = page.search_for(text, clip=list_of_transactions)
                        if text_instances:
                            top_left = text_instances[0].top_left
                            first_page_transactions = fitz.Rect(top_left.x, top_left.y, 533, 731)
                            text = page.get_text("text", clip=first_page_transactions, sort=True)
                    else:
                        text = page.get_text("text", clip=list_of_transactions, sort=True)
                    pages[f"page_{page_num}"] = text
        return pages

class TransactionExtractor:
    @staticmethod
    def extract_transactions(text_by_page: Dict[str, str]) -> List[Transaction]:
        transactions = []
        for page_text in text_by_page.values():
            transactions.extend(TransactionExtractor._extract_transactions_from_page(page_text))
        return transactions

    @staticmethod
    def _extract_transactions_from_page(page_text: str) -> List[Transaction]:
        transactions = []
        lines = page_text.split("\n")
        current_transaction = {}
        
        for line in lines:
            if line == "New Transactions for LIAM MARCUS SO":
                continue
            if line == "Total of New Transactions for":
                break
            
            if TransactionExtractor._is_valid_date(line):
                if current_transaction.get('date') and current_transaction.get('amount') and current_transaction.get('description'):
                    transactions.append(Transaction(**current_transaction))
                current_transaction = {'date': line}
            elif TransactionExtractor._is_valid_amount(line):
                current_transaction['amount'] = float(line.replace(",", ""))
            elif current_transaction.get('date') and 'description' not in current_transaction:
                current_transaction['description'] = TransactionExtractor._normalize_spaces(line)
            
            # If we have all required fields, add the transaction
            if all(key in current_transaction for key in ['date', 'amount', 'description']):
                transactions.append(Transaction(**current_transaction))
                current_transaction = {}
        
        # Add the last transaction if it's complete
        if all(key in current_transaction for key in ['date', 'amount', 'description']):
            transactions.append(Transaction(**current_transaction))
        
        return transactions

    @staticmethod
    def _is_valid_date(s: str) -> bool:
        date_pattern = r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{1,2})$'
        return bool(re.match(date_pattern, s))

    @staticmethod
    def _is_valid_amount(s: str) -> bool:
        amount_pattern = r'^-?(\d{1,3}(,\d{3})*|\d+)(\.\d{2})$'
        return bool(re.match(amount_pattern, s))

    @staticmethod
    def _normalize_spaces(s: str) -> str:
        return re.sub(r'\s+', ' ', s).strip()

@app.route('/', methods=['GET'])
def hello():
    return 'Welcome to FinTrack 💸'

@app.route('/extract', methods=['POST'])
def extract():
    json_content = request.json
    pdf_path = json_content["filename"]
    institution = Institution(json_content.get("institution", "AMEX"))

    text_by_page = PDFExtractor.extract_text(pdf_path, institution)
    transactions = TransactionExtractor.extract_transactions(text_by_page)

    return jsonify({"transactions": [t.__dict__ for t in transactions]})

if __name__ == '__main__':
    app.run(port=8000, debug=True)