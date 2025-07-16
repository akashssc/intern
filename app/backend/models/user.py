from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
import re

# Use relative import for db
from . import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    def set_password(self, password):
        if not self.is_password_complex(password):
            raise ValueError("Password does not meet complexity requirements.")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def is_password_complex(password):
        # At least 8 characters, one uppercase, one lowercase, one digit, one special char
        if (len(password) < 8 or
            not re.search(r"[A-Z]", password) or
            not re.search(r"[a-z]", password) or
            not re.search(r"[0-9]", password) or
            not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)):
            return False
        return True

    @validates('username', 'email')
    def validate_unique(self, key, value):
        if key == 'username':
            if User.query.filter_by(username=value).first():
                raise ValueError('Username already exists.')
        if key == 'email':
            if User.query.filter_by(email=value).first():
                raise ValueError('Email already exists.')
        return value
