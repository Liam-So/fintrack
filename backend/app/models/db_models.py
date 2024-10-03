from app import db
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Create an association table for many-to-many relationship between users and categories
user_categories = db.Table('user_categories',
    db.Column('user_id', UUID(as_uuid=True), db.ForeignKey('users.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    monthly_income = db.Column(db.Integer, nullable=True)
    # Should we add an onboarded flag?

    categories = db.relationship('Category', secondary=user_categories, lazy='subquery',
        backref=db.backref('users', lazy=True))

    def __repr__(self):
        return f'<User {self.username}>'


class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    is_predefined = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Category {self.name}>'