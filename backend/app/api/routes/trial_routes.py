from flask import Blueprint, request, jsonify, make_response
from http import HTTPStatus
from app.services.csv_generator import generate_csv

import uuid

trial_bp = Blueprint('trial', __name__)

@trial_bp.route('/session', methods=['GET'])
def generate_temp_session():
  return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), HTTPStatus.OK


@trial_bp.route('/download', methods=['GET'])
def download_csv():
  sample = request.args.get('sample', None)

  if sample and sample in ['TX', 'MTL']:
    output = make_response(generate_csv(sample))
    output.headers["Content-Disposition"] = "attachment; filename=export.csv"
    output.headers["Content-type"] = "text/csv"
    return output
