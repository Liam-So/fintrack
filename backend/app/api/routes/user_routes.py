from flask import Blueprint, request, jsonify
from http import HTTPStatus
from app.services.user_services import UserService

user_bp = Blueprint('user', __name__)

@user_bp.route('/<email>', methods=['GET'])
def get_user(email):
  try:
    user = UserService.get_user_by_email(email)
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "monthly_income": user.monthly_income}), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/<id>', methods=['PUT'])
def update_user_route(id):
   try:
    UserService.update_user(id, request.get_json(silent=True) or {})
    return jsonify({"message": "User updated successfully"}), HTTPStatus.OK
   except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
   except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/', methods=['POST'])
def create_user():
  try:
    data = request.get_json(silent=True) or {}
    UserService.create_user(data)
    return jsonify({"message": "User created successfully"}), HTTPStatus.CREATED
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR
  

@user_bp.route('/onboard/<id>', methods=['POST'])
def onboard_user(id):
  data = request.get_json(silent=True) or {}

  try:
    UserService.onboard_user(id, data)
    return jsonify({"message": "User onboarded successfully"}), HTTPStatus.CREATED
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/categories/<id>', methods=['GET'])
def get_user_categories(id):
  try:
    categories = UserService.get_user_categories(id)
    return jsonify(categories), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/categories/percentages/<id>', methods=['POST'])
def get_category_percentages(id):
  data = request.get_json(silent=True) or {}
  transactions = data.get("transactions", [])

  transactions_by_category = UserService.get_categories_by_percentages(transactions)
  
  return transactions_by_category, HTTPStatus.OK