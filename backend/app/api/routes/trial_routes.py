from flask import Blueprint, request, jsonify, make_response
from http import HTTPStatus
from app.services.csv_generator import generate_csv
from uuid import uuid4

import uuid

trial_bp = Blueprint('trial', __name__)

@trial_bp.route('/session', methods=['GET'])
def generate_temp_session():
  return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), HTTPStatus.OK


@trial_bp.route('/download', methods=['GET'])
def download_csv():
    sample = request.args.get('sample', None)
    if sample and sample in ['TX', 'MTL']:
        csv_content = generate_csv(sample)
        output = make_response(csv_content)
        id = str(uuid4())
        output.headers["Content-Disposition"] = f"attachment; filename=sample_{id}.csv"
        output.headers["Content-type"] = "text/csv"
        output.headers["Content-Encoding"] = "UTF-8"
        output.headers["Content-Transfer-Encoding"] = "binary"
        output.headers["Charset"] = "UTF-8"
        return output