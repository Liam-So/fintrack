from flask import Blueprint, request, jsonify
from http import HTTPStatus
import traceback

import json
import uuid

trial_bp = Blueprint('trial', __name__)

@trial_bp.route('/session', methods=['GET'])
def generate_temp_session():
  return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), HTTPStatus.OK


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
