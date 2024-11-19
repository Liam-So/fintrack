from flask import Blueprint, request, jsonify
from http import HTTPStatus
from app.services.transaction_services import TransactionService
import traceback

transaction_bp = Blueprint('transaction', __name__)


@transaction_bp.route('/<id>', methods=['GET'])
def get_transactions(id):
  type = request.args.get('type', None)
  period = request.args.get('period', None)
  try:
    transactions = TransactionService.get_transactions(id, type, period)
  except Exception as e:
    print(traceback.format_exc())
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
  return jsonify(transactions), HTTPStatus.OK


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