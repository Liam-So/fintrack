from flask import Blueprint, request, jsonify
from app.models.db_models import User, Category, Transaction
from app import db
from http import HTTPStatus

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/<id>', methods=['GET'])
def get_transactions(id):
  try:
    query_by_month = int(request.args.get('query_by_month', -1))
    transactions = Transaction.query.filter_by(user_id=id).all()
    if query_by_month and query_by_month > 0 and query_by_month <= 12:
      transactions = [t for t in transactions if t.date.month == query_by_month]
    return jsonify({"transactions": [{"id": t.id, "amount": t.amount, "description": t.description, "date": t.date, "category_id": t.category_id} for t in transactions]}), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
  

@transaction_bp.route('/<id>', methods=['POST'])
def post_transactions(id):
  data = request.get_json(silent=True) or {}
  transactions = data.get("transactions", [])
  try:
    user = User.query.get(id)
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
    return jsonify({"message": "Transactions added successfully"}), HTTPStatus.CREATED
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@transaction_bp.route('/<id>', methods=['DELETE'])
def delete_transactions(id):
    try:
      transaction = Transaction.query.get(id)
      if not transaction:
        raise ValueError(f'Transaction {id} not found')
      db.session.delete(transaction)
      db.session.commit()
      return jsonify({"message": "Transaction deleted successfully"}), HTTPStatus.OK
    except ValueError as e:
      return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND   
    except Exception as e:
      return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
    

@transaction_bp.route('/<id>', methods=['PUT'])
def update_transactions(id):
  data = request.get_json(silent=True) or {}

  try:
    transaction = Transaction.query.get(id)
    category = Category.query.get(data.get("category_id"))

    if transaction and category:
        transaction.amount = data.get("amount", transaction.amount)
        transaction.date = data.get("date", transaction.date)
        transaction.description = data.get("description", transaction.description)
        transaction.category_id = category.id
        db.session.commit()
        return jsonify({"message": "Transaction updated successfully"}), HTTPStatus.OK
    return jsonify({"message": "Transaction not found"}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
