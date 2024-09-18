import re
from typing import List
from app.models.transaction import Transaction
from typing import Dict, List, Optional

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