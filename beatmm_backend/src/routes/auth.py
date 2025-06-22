from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from src.models.user import db, User, UserRole, SystemLog
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

def validate_phone(phone):
    """验证缅甸手机号码格式"""
    pattern = r'^09\d{8,9}$'
    return re.match(pattern, phone) is not None

def validate_password(password):
    """验证密码强度"""
    if len(password) < 6:
        return False, "密码至少需要6位字符"
    return True, ""

def log_action(user_id, action, details=None, ip_address=None):
    """记录系统日志"""
    log = SystemLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address
    )
    db.session.add(log)
    db.session.commit()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['phone', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填字段'}), 400
        
        phone = data['phone'].strip()
        password = data['password']
        
        # 验证手机号格式
        if not validate_phone(phone):
            return jsonify({'error': '请输入有效的缅甸手机号码 (09xxxxxxxx)'}), 400
        
        # 验证密码强度
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(phone=phone).first():
            return jsonify({'error': '该手机号码已被注册'}), 400
        
        if data.get('email'):
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': '该邮箱已被注册'}), 400
        
        # 创建新用户
        user = User(
            phone=phone,
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role=UserRole.USER,
            wallet_balance=1000.00  # 新用户赠送1000 MMK
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # 记录注册日志
        log_action(user.id, 'user_register', f'新用户注册: {phone}', request.remote_addr)
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'message': '注册成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '注册失败，请稍后重试'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('phone') or not data.get('password'):
            return jsonify({'error': '手机号码和密码不能为空'}), 400
        
        phone = data['phone'].strip()
        password = data['password']
        
        # 查找用户
        user = User.query.filter_by(phone=phone).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': '手机号码或密码错误'}), 401
        
        if not user.is_active:
            return jsonify({'error': '账户已被禁用，请联系管理员'}), 403
        
        # 更新登录信息
        user.last_login = datetime.utcnow()
        user.login_count += 1
        db.session.commit()
        
        # 记录登录日志
        log_action(user.id, 'user_login', f'用户登录: {phone}', request.remote_addr)
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'message': '登录成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': '登录失败，请稍后重试'}), 500

@auth_bp.route('/super-admin-register', methods=['POST'])
def super_admin_register():
    """隐藏的超级管理员注册接口"""
    try:
        data = request.get_json()
        
        # 验证超级管理员注册密钥
        secret_key = data.get('secret_key')
        if secret_key != 'BEATMM_SUPER_ADMIN_2024_SECRET':
            return jsonify({'error': '无效的注册密钥'}), 403
        
        # 检查是否已有超级管理员
        existing_super_admin = User.query.filter_by(role=UserRole.SUPER_ADMIN).first()
        if existing_super_admin:
            return jsonify({'error': '系统已存在超级管理员'}), 400
        
        # 验证必填字段
        required_fields = ['phone', 'password', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填字段'}), 400
        
        phone = data['phone'].strip()
        password = data['password']
        email = data['email'].strip()
        
        # 验证手机号格式
        if not validate_phone(phone):
            return jsonify({'error': '请输入有效的缅甸手机号码 (09xxxxxxxx)'}), 400
        
        # 验证密码强度（超级管理员需要更强的密码）
        if len(password) < 8:
            return jsonify({'error': '超级管理员密码至少需要8位字符'}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(phone=phone).first():
            return jsonify({'error': '该手机号码已被注册'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': '该邮箱已被注册'}), 400
        
        # 创建超级管理员
        user = User(
            phone=phone,
            email=email,
            first_name=data.get('first_name', 'Super'),
            last_name=data.get('last_name', 'Admin'),
            role=UserRole.SUPER_ADMIN,
            wallet_balance=100000.00  # 超级管理员初始余额
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # 记录超级管理员注册日志
        log_action(user.id, 'super_admin_register', f'超级管理员注册: {phone}', request.remote_addr)
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'message': '超级管理员注册成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '注册失败，请稍后重试'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': '用户不存在或已被禁用'}), 404
        
        # 创建新的访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': '令牌刷新失败'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        
        # 记录登出日志
        log_action(current_user_id, 'user_logout', '用户登出', request.remote_addr)
        
        return jsonify({'message': '登出成功'}), 200
        
    except Exception as e:
        return jsonify({'error': '登出失败'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': '获取用户信息失败'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        
        # 更新允许的字段
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data and data['email'] != user.email:
            # 检查邮箱是否已被使用
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': '该邮箱已被使用'}), 400
            user.email = data['email']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        # 记录更新日志
        log_action(user.id, 'profile_update', '用户更新个人资料', request.remote_addr)
        
        return jsonify({
            'message': '个人资料更新成功',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '更新失败，请稍后重试'}), 500

