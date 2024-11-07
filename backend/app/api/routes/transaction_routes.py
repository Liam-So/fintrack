from flask import Blueprint, request, jsonify
from app.models.db_models import User, Category, Transaction
from app import db
from http import HTTPStatus
from app.services.transaction_services import TransactionService

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/<id>', methods=['GET'])
def get_transactions(id):
  try:
    date_range = request.args.get('query_by_date', None)
    transactions = TransactionService.get_transactions(id, date_range)
    return jsonify(transactions), HTTPStatus.OK
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@transaction_bp.route('/<id>', methods=['POST'])
def post_transactions(id):
  data = request.get_json(silent=True) or {}
  try:
    TransactionService.post_transactions(id, data)
    return jsonify({"message": "Transactions added successfully"}), HTTPStatus.CREATED
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@transaction_bp.route('/<id>', methods=['DELETE'])
def delete_transactions(id):
    try:
      TransactionService.delete_transaction(id)
      return jsonify({"message": "Transaction deleted successfully"}), HTTPStatus.OK
    except ValueError as e:
      return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND   
    except Exception as e:
      return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
    

@transaction_bp.route('/<id>', methods=['PUT'])
def update_transactions(id):
  data = request.get_json(silent=True) or {}

  try:
    TransactionService.update_transaction(id, data)
    return jsonify({"message": "Transaction updated successfully"}), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@transaction_bp.route('/dates/<id>', methods=['GET'])  
def get_dates(id):
  try:
    id = request.args.get('id', -1)
    formatted_months = TransactionService.get_transaction_dates(id)
    return jsonify(formatted_months), HTTPStatus.OK
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR