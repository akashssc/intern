from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from models import db
from werkzeug.security import check_password_hash
from main import limiter  # Import the limiter instance
import re

auth_bp = Blueprint('auth', __name__)

# Helper: sanitize input
sanitize = lambda s: re.sub(r'[^\w@.\-]', '', s) if isinstance(s, str) else s

@auth_bp.route('/api/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    data = request.get_json()
    username = sanitize(data.get('username', '').strip())
    email = sanitize(data.get('email', '').strip())
    password = data.get('password', '')

    # Validate required fields
    if not username or not email or not password:
        return jsonify({'msg': 'All fields are required.'}), 400

    # Password complexity
    if not User.is_password_complex(password):
        return jsonify({'msg': 'Password does not meet complexity requirements.'}), 400

    # Uniqueness
    if User.query.filter_by(username=username).first():
        return jsonify({'msg': 'Username already exists.'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists.'}), 400

    # Create user
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created successfully.'}), 201

@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    identifier = sanitize(data.get('username', '') or data.get('email', ''))
    password = data.get('password', '')

    # Find user by username or email
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials.'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token, 'user': {'id': user.id, 'username': user.username, 'email': user.email}}), 200 