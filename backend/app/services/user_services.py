from app.models.db_models import User, Category, user_categories
from app.models.category import UserCategory
from app import db
from uuid import UUID

class UserService:

  @staticmethod
  def update_user(id: int, data: dict) -> User:
    try:
      user = User.query.get(id)
      if not user:
        raise ValueError(f'User {id} not found')
      user.email = data.get("email", user.email)
      user.monthly_income = data.get("monthly_income", user.monthly_income)
      db.session.commit()
    except Exception as e:
      db.session.rollback()
      raise ValueError(f'Error updating user: {str(e)}')

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
        # If no ID is present, create a new category
        elif 'name' in category_data:
          cat = Category.query.filter_by(name=category_data['name']).first()
          if not cat:
            cat = Category(name=category_data['name'])
            print(f'Adding category {cat.name}')
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
          print(f'Adding association with essential flag {essential}')
          stmt = user_categories.insert().values(
              user_id=user.id,
              category_id=cat.id,
              essential=essential
          )
          db.session.execute(stmt)
      
      db.session.commit()
      return { cat.id: cat.name for cat in user.categories }
        
    except Exception as e:
        db.session.rollback()
        raise ValueError(f'Error adding categories: {str(e)}')
    
  
  @staticmethod
  def delete_user_category(id: UUID, category_id: int) -> User:
    try:
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
        return { cat.id: cat.name for cat in user.categories }
    except Exception as e:
      db.session.rollback()
      raise ValueError(f'Error deleting category: {str(e)}')


  @staticmethod
  def create_user(data: dict) -> User:
    try:
      new_user = User(username=data['username'], email=data['email'], monthly_income=data.get("monthly_income", None))
      db.session.add(new_user)
      db.session.commit()
    except Exception as e:
      db.session.rollback()
      raise ValueError(f'Error creating user: {str(e)}')
    return new_user
  

  @staticmethod
  def get_user_by_email(email: str) -> User:
    try:
      user = User.query.filter_by(email=email).first()
      if not user:
        raise ValueError(f'User {email} not found')
    except Exception as e:
      raise ValueError(f'Error getting user: {str(e)}')
    return user


  @staticmethod
  def get_user_categories(id: int) -> dict:
    try:
      user = User.query.get(id)

      if not user:
        raise ValueError(f'User {id} not found')

      user_category_details = db.session.query(
        Category.id,
        Category.name, 
        user_categories.c.essential
      ).join(
          user_categories, 
          Category.id == user_categories.c.category_id
      ).filter(
          user_categories.c.user_id == user.id
      ).all()

      # validate if user has categories
      user_categories_list = [UserCategory(category_id=uc.id, name=uc.name, essential=uc.essential) for uc in user_category_details]
      return { cat.category_id: cat.dict() for cat in user_categories_list }
      
    except Exception as e:
      raise ValueError(f'Error getting user: {str(e)}')
    
  

  @staticmethod
  def get_categories_by_percentages(transactions: list) -> dict:
    try:
      transactions_by_category = {}

      for transaction in transactions:
        category = transaction['category_id']
        amount = transaction['amount']

        if category not in transactions_by_category:
          transactions_by_category[category] = amount
        else:
          transactions_by_category[category] += amount

        round(transactions_by_category[category], 2)
    except Exception as e:
      raise ValueError(f'Error getting categories by percentages: {str(e)}')
    
    return transactions_by_category
