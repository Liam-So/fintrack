from app.models.db_models import User, Category, Transaction
from app import db

class TransactionService:
  @staticmethod
  def get_transactions(id, query_by_month):
    transactions = Transaction.query.filter_by(user_id=id).all()
    if query_by_month and query_by_month > 0 and query_by_month <= 12:
      transactions = [t for t in transactions if t.date.month == query_by_month]

    return {"transactions": [{"id": t.id, "amount": t.amount, "description": t.description, "date": t.date, "category_id": t.category_id} for t in transactions]}
  
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
