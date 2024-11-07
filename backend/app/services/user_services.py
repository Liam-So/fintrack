from app.models.db_models import User, Category
from app import db

class UserService:

  @staticmethod
  def update_user(id: int, data: dict) -> User:
    user = User.query.get(id)
    if not user:
      raise ValueError(f'User {id} not found')
    user.email = data.get("email", user.email)
    user.monthly_income = data.get("monthly_income", user.monthly_income)
    db.session.commit()

    return user

  @staticmethod
  def create_user(data: dict) -> User:
    new_user = User(username=data['username'], email=data['email'], monthly_income=data.get("monthly_income", None))
    db.session.add(new_user)
    db.session.commit()
    return new_user
  

  @staticmethod
  def get_user_by_email(email: str) -> User:
    user = User.query.filter_by(email=email).first()
    if not user:
      raise ValueError(f'User {email} not found')
    return user


  @staticmethod
  def get_user_categories(id: int) -> dict:
    user = User.query.get(id)
    if not user:
      raise ValueError(f'User {id} not found')
    return { cat.id: cat.name for cat in user.categories }
  

  @staticmethod
  def get_categories_by_percentages(transactions: list) -> dict:
    transactions_by_category = {}

    for transaction in transactions:
      category = transaction['category_id']
      amount = transaction['amount']

      if category not in transactions_by_category:
        transactions_by_category[category] = amount
      else:
        transactions_by_category[category] += amount

      round(transactions_by_category[category], 2)
    
    return transactions_by_category


  @staticmethod
  def onboard_user(id, monthly_income, categories):
    user = User.query.get(id)

    if not user:
      raise ValueError(f'User {id} not found')

    # if user and monthly_income and len(categories) > 0:
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