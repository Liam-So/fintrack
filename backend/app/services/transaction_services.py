from app.models.db_models import User, Category, Transaction
from app import db
from sqlalchemy import extract, desc
from datetime import datetime, date, timedelta

class TransactionService:
  @staticmethod
  def get_transactions(id, query_by_date):
    if not query_by_date:
      transactions = Transaction.query.filter_by(user_id=id).all()
      query_by_date = datetime.now().strftime('%b %Y')

    month_str, year = query_by_date.split()
    month = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4,
        "May": 5, "Jun": 6, "Jul": 7, "Aug": 8,
        "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
    }[month_str]
    
    # Query transactions by user ID and filter by month and year
    transactions = (
        Transaction.query
        .filter_by(user_id=id)
        .filter(extract("month", Transaction.date) == month)
        .filter(extract("year", Transaction.date) == int(year))
        .order_by(desc(Transaction.date))
        .all()
    )

    # Format the result
    return {
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "description": t.description,
                "date": t.date.strftime('%Y-%m-%d'),
                "category_id": t.category_id
            }
            for t in transactions
        ]
    }


  @staticmethod
  def delete_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
      raise ValueError(f'Transaction {id} not found')
    db.session.delete(transaction)
    db.session.commit()


  @staticmethod
  def update_transaction(id, data):
    transaction = Transaction.query.get(id)
    category = Category.query.get(data.get("category_id"))
    
    if not transaction or not category:
      raise ValueError(f'Cannot update transaction {id} with category {category}')
    
    transaction.amount = data.get("amount", transaction.amount)
    transaction.date = data.get("date", transaction.date)
    transaction.description = data.get("description", transaction.description)
    transaction.category_id = category.id
    db.session.commit()


  @staticmethod
  def post_transactions(id, data):
    transactions = data.get("transactions", [])
    user = User.query.get(id)

    if not user:
      raise ValueError(f'User {id} not found')

    categories = {cat.id: cat.name for cat in user.categories}

    transactions_to_send = []

    chunk_size = 100

    print(f'Processing {len(transactions)} transactions...')

    for i in range(0, len(transactions), chunk_size):
      chunk = transactions[i:i+chunk_size]
      for transaction in chunk:
        amount = transaction.get("amount", 0)
        date = transaction.get("date", None)
        description = transaction.get("description", "")
        category_id = int(transaction.get("category_id", None))

        if category_id in categories:
          user_transaction = Transaction(
              user_id=id, date=date, amount=amount, description=description, category_id=category_id)
          transactions_to_send.append(user_transaction)

    db.session.bulk_save_objects(transactions_to_send)
    db.session.commit()


  @staticmethod
  def get_transaction_dates(id):
    months = db.session.query(
          extract('year', Transaction.date).label('year'),
          extract('month', Transaction.date).label('month')
    ).filter(Transaction.user_id == id).distinct().all()

    # Format the months into "Month Year" strings
    formatted_months = [
        f"{date(year=int(year), month=int(month), day=1).strftime('%b %Y')}"
        for year, month in months
    ]

    # Sort by year and month if needed
    formatted_months.sort(key=lambda x: datetime.strptime(x, "%b %Y"))

    return formatted_months

