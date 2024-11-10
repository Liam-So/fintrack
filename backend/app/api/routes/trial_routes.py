from flask import Blueprint, request, jsonify
from datetime import datetime
from http import HTTPStatus
import traceback

import json
import uuid

trial_bp = Blueprint('trial', __name__)

@trial_bp.route('/session', methods=['GET'])
def generate_temp_session():
  return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), HTTPStatus.OK


@trial_bp.route('/transactions/dates', methods=['POST'])
def trial_transaction_dates():
   data = request.get_json(silent=True) or {}
   transactions = data.get('transactions', [])
   date = data.get('date', None)

   if date:
     print(f"DATE: {date}")
     return jsonify(transactions), HTTPStatus.OK

   dates = {}

   try:
    for transaction in transactions:
      parsed_date = datetime.strptime(transaction['date'], "%Y-%m-%d")
      date_str = parsed_date.strftime('%b %Y')
      if date_str not in dates:
        dates[date_str] = [transaction]
      else:
        dates[date_str].append(transaction)
   except Exception as e:
    print(traceback.format_exc())
    return jsonify({"Error processing JSON": str(e)}), 400


   return jsonify(dates), HTTPStatus.OK
      

@trial_bp.route('/categories/percentages', methods=['POST'])
def trial_categories():
  request_data = json.loads(request.data)

  transactions = request_data['transactions']
  categories = request_data['categories']

  categories = {}

  # TODO: refactor so we don't have to cast it each time
  try:
    for transaction in transactions:
      if transaction['category_id'] not in categories:
        categories[int(transaction['category_id'])] = float(transaction['amount'])
      else:
        categories[int(transaction['category_id'])] += float(transaction['amount'])

      categories[int(transaction['category_id'])] = round(categories[int(transaction['category_id'])], 2)
  except Exception as e:
    print(traceback.format_exc())
    return jsonify({"Error processing JSON": str(e)}), 400

  return categories, HTTPStatus.OK
