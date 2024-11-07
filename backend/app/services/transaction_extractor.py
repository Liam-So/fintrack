import uuid
import re
from typing import List
from app.models.transaction import Transaction
from typing import Dict, List
from datetime import datetime

class TransactionExtractor:
  @staticmethod
  def extract_transactions(text_by_page: Dict[str, str], open_close_dates: List[str]) -> List[Transaction]:
    transactions = []
    for page_text in text_by_page.values():
      transactions.extend(TransactionExtractor._extract_transactions_from_page(page_text, open_close_dates))
    return transactions

  @staticmethod
  def _extract_transactions_from_page(page_text: str, open_close_dates: List[str]) -> List[Transaction]:
    transactions = []
    lines = page_text.split("\n")
    current_transaction = {}
    
    for line in lines:
      if line == "New Transactions for LIAM MARCUS SO":
          continue
      if line == "Total of New Transactions for":
          break
      
      if TransactionExtractor._is_valid_date(line):
        if 'date' not in current_transaction:
          inferred_date = TransactionExtractor.infer_year(open_close_dates, line)
          current_transaction = {'date': inferred_date}
      elif TransactionExtractor._is_valid_amount(line):
        if 'amount' not in current_transaction:
          current_transaction['amount'] = float(line.replace(",", ""))
      # if the description is more than one line we only want to add the first line
      elif current_transaction.get('date') and 'description' not in current_transaction:
        current_transaction['description'] = TransactionExtractor._normalize_spaces(line)
      
      # If we have all required fields, add the transaction
      if all(key in current_transaction for key in ['date', 'amount', 'description']):
        current_transaction['id'] = str(uuid.uuid4())
        current_transaction['category'] = ""
        transactions.append(Transaction(**current_transaction))
        current_transaction = {}
    
    return transactions

  @staticmethod
  def _is_valid_date(s: str) -> bool:
    date_pattern = r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{1,2})$'
    return bool(re.match(date_pattern, s))
  
  @staticmethod
  def infer_year(existing_dates, new_date_str: str) -> datetime.date:
    # Parse the new date string (MMM DD)
    new_date = datetime.strptime(new_date_str, "%b %d")
    
    # Iterate through the existing dates to find a matching month
    for existing_date in existing_dates:
      if existing_date.date.month == new_date.month:
        # Return the new date with the inferred year
        return datetime(year=existing_date.date.year, month=new_date.month, day=new_date.day).date()
    
    # Handle if no matching month is found (optional logic)
    raise ValueError("No matching month found to infer the year.")

  @staticmethod
  def _is_valid_amount(s: str) -> bool:
    amount_pattern = r'^-?(\d{1,3}(,\d{3})*|\d+)(\.\d{2})$'
    return bool(re.match(amount_pattern, s))

  @staticmethod
  def _normalize_spaces(s: str) -> str:
    return re.sub(r'\s+', ' ', s).strip()