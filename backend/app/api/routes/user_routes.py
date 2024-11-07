from flask import Blueprint, request, jsonify
from app.models.db_models import User, Category, Transaction
from app import db
from http import HTTPStatus

user_bp = Blueprint('user', __name__)

@user_bp.route('/<email>', methods=['GET'])
def get_user(email):
  try:
    user = User.query.filter_by(email=email).first()
    if not user:
      raise ValueError(f'User {email} not found')
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "monthly_income": user.monthly_income}), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/<id>', methods=['PUT'])
def update_user(id):
   try:
    user = User.query.get(id)
    if not user:
      raise ValueError(f'User {id} not found')
    data = request.get_json(silent=True) or {}
    user.email = data.get("email", user.email)
    user.monthly_income = data.get("monthly_income", user.monthly_income)
    db.session.commit()
    return jsonify({"message": "User updated successfully"}), HTTPStatus.OK
   except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
   except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/', methods=['POST'])
def create_user():
  try:
    data = request.get_json(silent=True) or {}
    monthly_income = data.get("monthly_income", None)
    new_user = User(username=data['username'], email=data['email'], monthly_income=monthly_income)
    db.session.add(new_user)
    db.session.commit()
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
    user = User.query.get(id)
    if not user:
        raise ValueError(f'User {id} not found')
    return jsonify({ cat.id: cat.name for cat in user.categories }), HTTPStatus.OK
  except ValueError as e:
    return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
  except Exception as e:
    return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@user_bp.route('/categories/percentages/<id>', methods=['POST'])
def get_category_percentages(id):
  data = request.get_json(silent=True) or {}

  transactions_by_category = {}
  transactions = data.get("transactions", [])

  for transaction in transactions:
    category = transaction['category_id']
    amount = transaction['amount']

    if category not in transactions_by_category:
      transactions_by_category[category] = amount
    else:
      transactions_by_category[category] += amount

    round(transactions_by_category[category], 2)
  
  return transactions_by_category, HTTPStatus.OK