from app.models.db_models import User, Category, user_categories
from app import db
from uuid import UUID

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
  def add_user_categories(id: UUID, categories: list) -> User:
    user = User.query.get(id)
    if not user:
      raise ValueError(f'User {id} not found')
        
    try:
      for category_data in categories:
        if 'id' in category_data:
          cat = Category.query.get(category_data['id'])
          if not cat:
            raise ValueError(f'Category with id {category_data["id"]} not found')
        elif 'name' in category_data:
          cat = Category.query.filter_by(name=category_data['name']).first()
          if not cat:
            cat = Category(name=category_data['name'])
            db.session.add(cat)
            db.session.flush()  # Get the ID of the new category
        else:
          raise ValueError(f'Category {category_data} is invalid')
        
        # Check if association already exists
        assoc = db.session.query(user_categories).filter_by(
          user_id=user.id,
          category_id=cat.id
        ).first()
        
        if not assoc:
          # Add association with essential flag
          essential = category_data.get('essential', False)
          stmt = user_categories.insert().values(
              user_id=user.id,
              category_id=cat.id,
              essential=essential
          )
          db.session.execute(stmt)
      
      db.session.commit()
      return user
        
    except Exception as e:
        db.session.rollback()
        raise ValueError(f'Error adding categories: {str(e)}')
    
  
  @staticmethod
  def delete_user_category(id: UUID, category_id: int) -> User:
    user = User.query.get(id)
    if not user:
      raise ValueError(f'User {id} not found')
    
    category = Category.query.get(category_id)
    if not category:
      raise ValueError(f'Category {category_id} not found')
    
    if category not in user.categories:
      raise ValueError(f'Category {category_id} not associated with user {id}')
    else:
      user.categories.remove(category)
      db.session.commit()


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