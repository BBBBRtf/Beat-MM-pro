from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, UserRole, Notification, NotificationType, WalletTransaction, TransactionType, TransactionStatus, SystemLog
from datetime import datetime, timedelta
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def super_admin_required(f):
    """超级管理员权限装饰器"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_super_admin():
            return jsonify({'error': '需要超级管理员权限'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """管理员权限装饰器（包括超级管理员）"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin():
            return jsonify({'error': '需要管理员权限'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def log_admin_action(user_id, action, details=None, ip_address=None):
    """记录管理员操作日志"""
    log = SystemLog(
        user_id=user_id,
        action=f'admin_{action}',
        details=details,
        ip_address=ip_address
    )
    db.session.add(log)
    db.session.commit()

# ==================== 用户管理 ====================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """获取用户列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role_filter = request.args.get('role')
        search = request.args.get('search')
        
        query = User.query
        
        if role_filter:
            query = query.filter(User.role == UserRole(role_filter))
        
        if search:
            query = query.filter(
                db.or_(
                    User.phone.contains(search),
                    User.first_name.contains(search),
                    User.last_name.contains(search),
                    User.email.contains(search)
                )
            )
        
        query = query.order_by(User.created_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users = [user.to_dict() for user in pagination.items]
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': '获取用户列表失败'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_detail(user_id):
    """获取用户详情"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取用户统计信息
        play_count = len(user.play_history)
        favorite_count = len(user.favorites)
        transaction_count = len(user.wallet_transactions)
        
        user_data = user.to_dict()
        user_data['statistics'] = {
            'play_count': play_count,
            'favorite_count': favorite_count,
            'transaction_count': transaction_count
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': '获取用户详情失败'}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@super_admin_required
def update_user_role(user_id):
    """更新用户角色（仅超级管理员）"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        if user.id == current_user_id:
            return jsonify({'error': '不能修改自己的角色'}), 400
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['user', 'admin', 'super_admin']:
            return jsonify({'error': '无效的角色'}), 400
        
        # 防止创建多个超级管理员
        if new_role == 'super_admin':
            existing_super_admin = User.query.filter_by(role=UserRole.SUPER_ADMIN).filter(User.id != user_id).first()
            if existing_super_admin:
                return jsonify({'error': '系统只能有一个超级管理员'}), 400
        
        old_role = user.role.value
        user.role = UserRole(new_role)
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # 记录操作日志
        log_admin_action(
            current_user_id,
            'update_user_role',
            f'用户 {user.phone} 角色从 {old_role} 更改为 {new_role}',
            request.remote_addr
        )
        
        return jsonify({
            'message': '用户角色更新成功',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '更新用户角色失败'}), 500

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    """更新用户状态（启用/禁用）"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        if user.id == current_user_id:
            return jsonify({'error': '不能修改自己的状态'}), 400
        
        data = request.get_json()
        is_active = data.get('is_active')
        
        if is_active is None:
            return jsonify({'error': '缺少is_active参数'}), 400
        
        old_status = '启用' if user.is_active else '禁用'
        user.is_active = is_active
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        new_status = '启用' if is_active else '禁用'
        
        # 记录操作日志
        log_admin_action(
            current_user_id,
            'update_user_status',
            f'用户 {user.phone} 状态从 {old_status} 更改为 {new_status}',
            request.remote_addr
        )
        
        return jsonify({
            'message': f'用户已{new_status}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '更新用户状态失败'}), 500

# ==================== 钱包管理 ====================

@admin_bp.route('/users/<int:user_id>/wallet/adjust', methods=['POST'])
@admin_required
def adjust_user_wallet(user_id):
    """调整用户钱包余额"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        amount = data.get('amount')
        description = data.get('description', '管理员调整')
        
        if amount is None:
            return jsonify({'error': '缺少金额参数'}), 400
        
        try:
            amount = float(amount)
        except ValueError:
            return jsonify({'error': '无效的金额格式'}), 400
        
        if amount == 0:
            return jsonify({'error': '调整金额不能为零'}), 400
        
        old_balance = float(user.wallet_balance)
        new_balance = old_balance + amount
        
        if new_balance < 0:
            return jsonify({'error': '余额不足，无法扣减'}), 400
        
        # 更新用户余额
        user.wallet_balance = new_balance
        user.updated_at = datetime.utcnow()
        
        # 创建交易记录
        transaction = WalletTransaction(
            user_id=user_id,
            amount=amount,
            transaction_type=TransactionType.ADMIN_ADJUST,
            description=description,
            processed_by=current_user_id,
            status=TransactionStatus.COMPLETED,
            processed_at=datetime.utcnow()
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # 记录操作日志
        log_admin_action(
            current_user_id,
            'adjust_wallet',
            f'调整用户 {user.phone} 钱包余额 {amount} MMK，原余额: {old_balance}，新余额: {new_balance}',
            request.remote_addr
        )
        
        return jsonify({
            'message': '钱包余额调整成功',
            'old_balance': old_balance,
            'new_balance': new_balance,
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '调整钱包余额失败'}), 500

# ==================== 通知管理 ====================

@admin_bp.route('/notifications', methods=['POST'])
@admin_required
def create_notification():
    """发布通知"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['title', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填字段'}), 400
        
        title = data['title']
        content = data['content']
        notification_type = data.get('type', 'info')
        target_role = data.get('target_role', 'all')
        target_user_id = data.get('target_user_id')
        is_global = data.get('is_global', True)
        expires_hours = data.get('expires_hours', 24)
        
        # 验证通知类型
        if notification_type not in ['info', 'warning', 'success', 'error']:
            return jsonify({'error': '无效的通知类型'}), 400
        
        # 验证目标角色
        if target_role not in ['all', 'user', 'admin', 'super_admin']:
            return jsonify({'error': '无效的目标角色'}), 400
        
        # 如果指定了目标用户，验证用户是否存在
        if target_user_id:
            target_user = User.query.get(target_user_id)
            if not target_user:
                return jsonify({'error': '目标用户不存在'}), 404
            is_global = False
        
        # 计算过期时间
        expires_at = datetime.utcnow() + timedelta(hours=expires_hours) if expires_hours > 0 else None
        
        # 创建通知
        notification = Notification(
            title=title,
            content=content,
            type=NotificationType(notification_type),
            target_role=target_role,
            target_user_id=target_user_id,
            is_global=is_global,
            created_by=current_user_id,
            expires_at=expires_at
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # 记录操作日志
        target_desc = f'用户 {target_user_id}' if target_user_id else f'角色 {target_role}'
        log_admin_action(
            current_user_id,
            'create_notification',
            f'发布通知: {title}，目标: {target_desc}',
            request.remote_addr
        )
        
        return jsonify({
            'message': '通知发布成功',
            'notification': notification.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '发布通知失败'}), 500

@admin_bp.route('/notifications', methods=['GET'])
@admin_required
def get_notifications():
    """获取通知列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        notification_type = request.args.get('type')
        target_role = request.args.get('target_role')
        
        query = Notification.query
        
        if notification_type:
            query = query.filter(Notification.type == NotificationType(notification_type))
        
        if target_role:
            query = query.filter(Notification.target_role == target_role)
        
        query = query.order_by(Notification.created_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        notifications = [notification.to_dict() for notification in pagination.items]
        
        return jsonify({
            'notifications': notifications,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': '获取通知列表失败'}), 500

@admin_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@admin_required
def delete_notification(notification_id):
    """删除通知"""
    try:
        current_user_id = get_jwt_identity()
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'error': '通知不存在'}), 404
        
        title = notification.title
        db.session.delete(notification)
        db.session.commit()
        
        # 记录操作日志
        log_admin_action(
            current_user_id,
            'delete_notification',
            f'删除通知: {title}',
            request.remote_addr
        )
        
        return jsonify({'message': '通知删除成功'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '删除通知失败'}), 500

# ==================== 系统统计 ====================

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_system_statistics():
    """获取系统统计信息"""
    try:
        # 用户统计
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])).count()
        
        # 今日新增用户
        today = datetime.utcnow().date()
        today_users = User.query.filter(
            db.func.date(User.created_at) == today
        ).count()
        
        # 钱包统计
        total_balance = db.session.query(db.func.sum(User.wallet_balance)).scalar() or 0
        
        # 音乐统计
        from src.models.user import Music, PlayHistory
        total_music = Music.query.count()
        total_plays = PlayHistory.query.count()
        
        # 今日播放次数
        today_plays = PlayHistory.query.filter(
            db.func.date(PlayHistory.played_at) == today
        ).count()
        
        # 通知统计
        active_notifications = Notification.query.filter_by(is_active=True).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admin_users,
                'today_new': today_users
            },
            'wallet': {
                'total_balance': float(total_balance)
            },
            'music': {
                'total_songs': total_music,
                'total_plays': total_plays,
                'today_plays': today_plays
            },
            'notifications': {
                'active': active_notifications
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': '获取统计信息失败'}), 500

# ==================== 系统日志 ====================

@admin_bp.route('/logs', methods=['GET'])
@super_admin_required
def get_system_logs():
    """获取系统日志（仅超级管理员）"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        action_filter = request.args.get('action')
        user_id_filter = request.args.get('user_id', type=int)
        
        query = SystemLog.query
        
        if action_filter:
            query = query.filter(SystemLog.action.contains(action_filter))
        
        if user_id_filter:
            query = query.filter(SystemLog.user_id == user_id_filter)
        
        query = query.order_by(SystemLog.created_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        logs = []
        for log in pagination.items:
            log_data = {
                'id': log.id,
                'user_id': log.user_id,
                'action': log.action,
                'resource': log.resource,
                'resource_id': log.resource_id,
                'details': log.details,
                'ip_address': log.ip_address,
                'created_at': log.created_at.isoformat() if log.created_at else None
            }
            
            # 添加用户信息
            if log.user_id:
                user = User.query.get(log.user_id)
                if user:
                    log_data['user'] = {
                        'phone': user.phone,
                        'first_name': user.first_name,
                        'role': user.role.value
                    }
            
            logs.append(log_data)
        
        return jsonify({
            'logs': logs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': '获取系统日志失败'}), 500

