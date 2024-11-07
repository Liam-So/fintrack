from flask import Blueprint, request, jsonify
from datetime import datetime
from http import HTTPStatus

import json
import uuid

trial_bp = Blueprint('trial', __name__)

@trial_bp.route('/session', methods=['GET'])
def generate_temp_session():
  return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), HTTPStatus.OK


@trial_bp.route('/transactions', methods=['POST'])
def trial_transactions():
  data = request.get_json(silent=True) or {}
  transactions = data.get('transactions', [])
  month = int(data.get('month', None))

  transactions_to_return = []

  for transaction in transactions:
      parsed_date = datetime.strptime(transaction['date'],"%Y-%m-%dT%H:%M:%S.%fZ")
      if month and parsed_date.month == month:
          transactions_to_return.append(transaction)

  return jsonify({"transactions": transactions_to_return}), HTTPStatus.OK


@trial_bp.route('/categories/percentages', methods=['POST'])
def trial_categories():
  request_data = json.loads(request.data)

  transactions = request_data['transactions']
  categories = request_data['categories']

  categories = {}

  for transaction in transactions:
    if transaction['category_id'] not in categories:
      categories[transaction['category_id']] = float(transaction['amount'])
    else:
      categories[transaction['category_id']] += float(transaction['amount'])

    categories[transaction['category_id']] = round(categories[transaction['category_id']], 2)

  return categories, HTTPStatus.OK
