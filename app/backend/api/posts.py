from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.post import Post
from models.user import User
import os
import time
from werkzeug.utils import secure_filename
from sqlalchemy import or_, desc, asc
from functools import lru_cache
from flask import after_this_request

posts_bp = Blueprint('posts', __name__)
 
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_media_url(filename):
    if not filename:
        return None
    return url_for('uploaded_file', filename=filename, _external=True)

# Simple in-memory cache for categories and tags
@lru_cache(maxsize=1)
def get_cached_categories():
    return sorted(set([p.category for p in Post.query.distinct(Post.category) if p.category]))

@lru_cache(maxsize=1)
def get_cached_tags():
    tags = {}
    for p in Post.query.distinct(Post.tags):
        if p.tags:
            for t in [tag.strip() for tag in p.tags.split(',') if tag.strip()]:
                tags[t] = tags.get(t, 0) + 1
    # Return tags sorted by popularity (count desc)
    return [t for t, _ in sorted(tags.items(), key=lambda x: -x[1])]

@posts_bp.route('/api/posts/categories', methods=['GET'])
@jwt_required()
def get_categories():
    return jsonify({'categories': get_cached_categories()}), 200

@posts_bp.route('/api/posts/popular-tags', methods=['GET'])
@jwt_required()
def get_popular_tags():
    return jsonify({'tags': get_cached_tags()}), 200

# Invalidate cache when posts are created, updated, or deleted

def invalidate_post_cache():
    get_cached_categories.cache_clear()
    get_cached_tags.cache_clear()

@posts_bp.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    title = request.form.get('title', '').strip()
    content = request.form.get('content', '').strip()
    visibility = request.form.get('visibility', 'Public').strip() if 'visibility' in request.form else 'Public'
    if not title or not content:
        return jsonify({'msg': 'Title and content are required.'}), 400

    media_url = None
    if 'media' in request.files:
        file = request.files['media']
        if file and allowed_file(file.filename):
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            if file_length > MAX_FILE_SIZE:
                return jsonify({'msg': 'File too large (max 10MB).'}), 400
            filename = secure_filename(f"{user.id}_{int(time.time())}_" + file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            media_url = filename
        elif file.filename:
            return jsonify({'msg': 'Invalid media file type.'}), 400

    post = Post(user_id=user.id, title=title, content=content, media_url=media_url, visibility=visibility)
    db.session.add(post)
    db.session.commit()
    invalidate_post_cache()

    return jsonify({
        'id': post.id,
        'user_id': post.user_id,
        'title': post.title,
        'content': post.content,
        'media_url': get_media_url(post.media_url),
        'visibility': post.visibility,
        'created_at': post.created_at,
        'updated_at': post.updated_at
    }), 201

@posts_bp.route('/api/posts', methods=['GET'])
@jwt_required()
def get_posts():
    # Query params
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    category = request.args.get('category')
    search = request.args.get('search')
    tags = request.args.get('tags')  # comma-separated
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    exclude_user_id = request.args.get('exclude_user_id')

    query = Post.query
    if category:
        query = query.filter(Post.category == category)
    if exclude_user_id:
        query = query.filter(Post.user_id != int(exclude_user_id))
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(or_(Post.title.ilike(like), Post.content.ilike(like)))
    if tags:
        tag_list = [t.strip() for t in tags.split(',') if t.strip()]
        for tag in tag_list:
            query = query.filter(Post.tags.ilike(f"%{tag}%"))
    # Sorting
    sort_column = getattr(Post, sort_by, Post.created_at)
    if sort_order == 'asc':
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    # Pagination
    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    result = []
    for post in posts:
        result.append({
            'id': post.id,
            'user_id': post.user_id,
            'username': post.user.username if post.user else None,
            'title': post.title,
            'content': post.content,
            'media_url': get_media_url(post.media_url),
            'category': post.category,
            'visibility': post.visibility,
            'tags': [t.strip() for t in post.tags.split(',')] if post.tags else [],
            'likes_count': post.likes_count,
            'views_count': post.views_count,
            'created_at': post.created_at,
            'updated_at': post.updated_at
        })
    return jsonify({
        'posts': result,
        'total': total,
        'page': page,
        'per_page': per_page,
        'categories': get_cached_categories(),
        'tags': get_cached_tags()
    }), 200

@posts_bp.route('/api/my-posts', methods=['GET'])
@jwt_required()
def get_my_posts():
    user_id = get_jwt_identity()
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        result.append({
            'id': post.id,
            'user_id': post.user_id,
            'title': post.title,
            'content': post.content,
            'media_url': get_media_url(post.media_url),
            'created_at': post.created_at,
            'updated_at': post.updated_at
        })
    return jsonify(result), 200

@posts_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    if post.user_id != int(user_id):
        return jsonify({'msg': 'Unauthorized'}), 403
    # Optionally delete media file
    if post.media_url:
        media_path = os.path.join(UPLOAD_FOLDER, post.media_url)
        if os.path.exists(media_path):
            os.remove(media_path)
    db.session.delete(post)
    db.session.commit()
    invalidate_post_cache()
    return jsonify({'msg': 'Post deleted'}), 200 

@posts_bp.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def edit_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    if post.user_id != int(user_id):
        return jsonify({'msg': 'Unauthorized'}), 403

    # Accept both form-data (for media) and JSON
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form
    else:
        data = request.get_json() or {}

    title = data.get('title', post.title).strip() if data.get('title') is not None else post.title
    content = data.get('content', post.content).strip() if data.get('content') is not None else post.content
    category = data.get('category', post.category)
    visibility = data.get('visibility', post.visibility)
    tags = data.get('tags', post.tags)

    if not title or not content:
        return jsonify({'msg': 'Title and content are required.'}), 400

    # Handle media update (optional)
    if request.files and 'media' in request.files:
        file = request.files['media']
        if file and allowed_file(file.filename):
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            if file_length > MAX_FILE_SIZE:
                return jsonify({'msg': 'File too large (max 10MB).'}), 400
            # Remove old media file if exists
            if post.media_url:
                old_media_path = os.path.join(UPLOAD_FOLDER, post.media_url)
                if os.path.exists(old_media_path):
                    os.remove(old_media_path)
            filename = secure_filename(f"{user_id}_{int(time.time())}_" + file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            post.media_url = filename
        elif file.filename:
            return jsonify({'msg': 'Invalid media file type.'}), 400
    elif data.get('remove_media'):
        # Optionally allow removing media
        if post.media_url:
            old_media_path = os.path.join(UPLOAD_FOLDER, post.media_url)
            if os.path.exists(old_media_path):
                os.remove(old_media_path)
            post.media_url = None

    post.title = title
    post.content = content
    post.category = category
    post.visibility = visibility
    post.tags = tags
    db.session.commit()
    invalidate_post_cache()

    return jsonify({
        'id': post.id,
        'user_id': post.user_id,
        'title': post.title,
        'content': post.content,
        'media_url': get_media_url(post.media_url),
        'category': post.category,
        'visibility': post.visibility,
        'tags': [t.strip() for t in post.tags.split(',')] if post.tags else [],
        'likes_count': post.likes_count,
        'views_count': post.views_count,
        'created_at': post.created_at,
        'updated_at': post.updated_at
    }), 200 

# --- STUB CONNECTION ENDPOINTS FOR FRONTEND TESTING ---
@posts_bp.route('/api/connections/status/<int:user_id>', methods=['GET'])
@jwt_required()
def connection_status(user_id):
    # Always return 'none' for demo
    return jsonify({'status': 'none'}), 200

@posts_bp.route('/api/connections/request', methods=['POST'])
@jwt_required()
def send_connection_request():
    # Always return success for demo
    return jsonify({'success': True, 'msg': 'Request sent (stub, not implemented)'}), 200 