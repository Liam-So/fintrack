from flask import Blueprint, request, jsonify
from app.models.db_models import User, Category, Transaction
from app import db
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
    monthly_income = data.get("monthly_income", None)
    categories = data.get("categories", [])
    user = User.query.get(id)

    # if user and monthly_income and len(categories) > 0:
    if user:
        if monthly_income:
          # update user income
          user.monthly_income = monthly_income
          db.session.commit()

        if len(categories) > 0:
           # if user already has existing categories, only update them with the latest ones
          if len(user.categories) > 0:
            user.categories = []

          # update categories
          existing_categories = Category.query.filter(Category.name.in_(categories)).all()

          # can't use set as they are Category objects
          existing_category_names = {category.name for category in existing_categories}

          # find new categories that need to be created if any
          new_category_names = set(categories) - existing_category_names

          new_categories = [Category(name=cat_name, is_predefined=False) for cat_name in new_category_names]

          # add new categories to the session
          if new_categories:
              db.session.add_all(new_categories)
              db.session.commit()

          # associate user with all new categories
          user.categories.extend(existing_categories + new_categories)

          # comit the associations
          db.session.commit()


        return jsonify({"message": "User onboarded successfully"}), HTTPStatus.OK
    return jsonify({"message": "User not found"}), HTTPStatus.NOT_FOUND


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