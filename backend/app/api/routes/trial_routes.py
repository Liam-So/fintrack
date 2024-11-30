from flask import Blueprint, request, jsonify, make_response
from http import HTTPStatus
from app.services.csv_generator import generate_csv

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


@trial_bp.route('/download', methods=['GET'])
def download_csv():
  sample = request.args.get('sample', None)

  if sample and sample in ['TX', 'MTL']:
    output = make_response(generate_csv(sample))
    output.headers["Content-Disposition"] = "attachment; filename=export.csv"
    output.headers["Content-type"] = "text/csv"
    return output
