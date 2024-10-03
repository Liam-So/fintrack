from flask import Blueprint, request, jsonify
from app.services.pdf_extractor import PDFExtractor, Institution
from app.services.transaction_extractor import TransactionExtractor
from app.services.llm_controller import generate_response, PromptRequest, get_transaction_prompt, parse_json_response, clean_response
from app import db

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Util.Padding import unpad

from app.models.db_models import User, Category

import traceback

import tempfile
import os
import uuid
import json

bp = Blueprint('api', __name__)

# Generate RSA key pair (do this securely and store the private key safely)
key = RSA.generate(2048)
private_key = key.export_key()
public_key = key.publickey().export_key()


@bp.route('/', methods=['GET'])
def hello():
    return 'Welcome to FinTrack 💸'


@bp.route('/generate_temp_session', methods=['GET'])
def generate_temp_session():
   return jsonify({"session_id": f"temp_{str(uuid.uuid4())}"}), 200

@bp.route('/transactions', methods=['GET'])
def transactions():
     # pull transactions from the database
      # return them as JSON
      return jsonify({
          "transactions": [
              {
                  "date": "2021-10-01",
                  "description": "Whole Foods",
                  "amount": 50.00,
                  "category": "Groceries"
              },
              {
                  "date": "2021-10-02",
                  "description": "Starbucks",
                  "amount": 5.00,
                  "category": "Restaurants"
              },
              {
                  "date": "2021-10-03",
                  "description": "Amazon",
                  "amount": 100.00,
                  "category": "Shopping"
              }
          ]
      }), 200   


@bp.route('/get-public-key', methods=['GET'])
def get_public_key():
    return public_key.decode(), 200


@bp.route('/categories/percentages', methods=['GET'])
def categories():
    # pull transactions from the database
    # calculate the percentage of each category

    # This is a dummy response for now
    return jsonify({
       "Groceries": 300,
       "Restaurants": 100,
       "Shopping": 200,
       "Transportation": 50
    }), 200


@bp.route('/trial/categories/percentages', methods=['POST'])
def trial_categories():
   request_data = json.loads(request.data)

   transactions = request_data['transactions']

   categories = {}

   for transaction in transactions:
      if transaction['category'] not in categories:
         categories[transaction['category']] = float(transaction['amount'])
      else:
         categories[transaction['category']] += float(transaction['amount'])

      categories[transaction['category']] = round(categories[transaction['category']], 2)

   return categories, 200


@bp.route('/extract', methods=['POST'])
def extract():
    if 'pdf' not in request.files:
      return 'No file part', 400
    
    file = request.files['pdf']
    
    if file.filename == '':
      return 'No selected file', 400
    
    json_data = {}

    if 'json' in request.form:
       try:
          json_data = json.loads(request.form['json'])
          categories = json_data['categories']
       except Exception as e:
          return jsonify({"Error processing JSON": str(e)}), 400

    if file and file.filename.endswith('.pdf'):
      # Create a temporary file with a unique name
      temp_dir = tempfile.gettempdir()
      temp_filename = f"{uuid.uuid4()}.pdf"
      temp_filepath = os.path.join(temp_dir, temp_filename)

      try:
        # Save the file temporarily
        file.save(temp_filepath)
        institution = Institution("AMEX")
        text_by_page = PDFExtractor.extract_text(temp_filepath, institution)
        transactions = TransactionExtractor.extract_transactions(text_by_page)

        transactions_to_return = []

        for i in range(0, len(transactions), 5):
           chunk_of_transactions = transactions[i:i+5]
           print(f"⏳ Processing 5 transactions...")

           descriptions = [t.description for t in chunk_of_transactions]
           prompt = get_transaction_prompt(categories, descriptions)
           model = 'mistral'

           prompt_request = PromptRequest(prompt=prompt, model=model)
           parsed_items = generate_response(prompt_request)

           cleaned_response = clean_response(parsed_items, categories, descriptions, chunk_of_transactions)
           transactions_to_return.extend(cleaned_response)

        return jsonify({"transactions": [t.__dict__ for t in transactions_to_return]}), 200
      except Exception as e:
        print(f"Error processing PDF file: {str(e)}")
        print(traceback.format_exc())
        return str(e), 500
      finally:
        # Always attempt to delete the temporary file
        if os.path.exists(temp_filepath):
          print(f"Deleting PDF file: {temp_filename} in location: {temp_filepath}")
          os.remove(temp_filepath)


## Users
@bp.route('/user_count')
def user_count():
    count = User.query.count()
    return jsonify({"user_count": count}), 200 


@bp.route('/user/<username>', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "monthly_income": user.monthly_income}), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/user/<id>', methods=['PUT'])
def update_user(id):
    user = User.query.get(id)
    if user:
        data = request.json
        user.email = data.get("email", user.email)
        user.monthly_income = data.get("monthly_income", user.monthly_income)
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    return jsonify({"message": "User not found"}), 404


@bp.route('/user', methods=['POST'])
def create_user():
    data = request.json
    monthly_income = data.get("monthly_income", None)
    new_user = User(username=data['username'], email=data['email'], monthly_income=monthly_income)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@bp.route('/onboard/<id>', methods=['POST'])
def onboard_user(id):
    data = request.json
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


        return jsonify({"message": "User onboarded successfully"}), 200
    return jsonify({"message": "User not found"}), 404