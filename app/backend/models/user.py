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
    # Profile fields
    title = db.Column(db.String(128))
    location = db.Column(db.String(128))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)  # Comma-separated
    experience = db.Column(db.Text)  # JSON or string
    education = db.Column(db.Text)  # JSON or string
    phone = db.Column(db.String(32))
    linkedin = db.Column(db.String(256))
    github = db.Column(db.String(256))
    twitter = db.Column(db.String(256))
    avatar = db.Column(db.String(256))  # Image filename or URL

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

    @validates('title', 'location')
    def validate_string_fields(self, key, value):
        if value and len(value) > 128:
            raise ValueError(f'{key.capitalize()} must be at most 128 characters.')
        return value

    @validates('bio')
    def validate_bio(self, key, value):
        if value and len(value) > 1000:
            raise ValueError('Bio must be at most 1000 characters.')
        return value

    @validates('phone')
    def validate_phone(self, key, value):
        if value and not re.match(r'^\+?[0-9\- ]{7,32}$', value):
            raise ValueError('Invalid phone number format.')
        if value and len(value) > 32:
            raise ValueError('Phone must be at most 32 characters.')
        return value

    @validates('linkedin', 'github', 'twitter')
    def validate_url_fields(self, key, value):
        if value and len(value) > 256:
            raise ValueError(f'{key.capitalize()} URL must be at most 256 characters.')
        if value and not re.match(r'^https?://', value):
            raise ValueError(f'{key.capitalize()} must be a valid URL.')
        return value

    @validates('avatar')
    def validate_avatar_field(self, key, value):
        if value and len(value) > 256:
            raise ValueError('Avatar must be at most 256 characters.')
        # Do not require avatar to be a URL; allow plain filenames
        return value
