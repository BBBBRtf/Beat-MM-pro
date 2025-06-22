from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Music, PlayHistory, UserFavorite, SystemLog
from datetime import datetime

music_bp = Blueprint('music', __name__)

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

@music_bp.route('/music', methods=['GET'])
def get_music_list():
    """获取音乐列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        genre = request.args.get('genre')
        featured = request.args.get('featured', type=bool)
        
        query = Music.query
        
        if genre:
            query = query.filter(Music.genre == genre)
        
        if featured is not None:
            query = query.filter(Music.is_featured == featured)
        
        # 按播放次数排序
        query = query.order_by(Music.play_count.desc(), Music.created_at.desc())
        
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        music_list = [music.to_dict() for music in pagination.items]
        
        return jsonify({
            'music': music_list,
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
        return jsonify({'error': '获取音乐列表失败'}), 500

@music_bp.route('/music/<int:music_id>', methods=['GET'])
def get_music_detail(music_id):
    """获取音乐详情"""
    try:
        music = Music.query.get(music_id)
        if not music:
            return jsonify({'error': '音乐不存在'}), 404
        
        return jsonify({'music': music.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': '获取音乐详情失败'}), 500

@music_bp.route('/music/<int:music_id>/play', methods=['POST'])
@jwt_required()
def record_play(music_id):
    """记录音乐播放"""
    try:
        current_user_id = get_jwt_identity()
        music = Music.query.get(music_id)
        
        if not music:
            return jsonify({'error': '音乐不存在'}), 404
        
        data = request.get_json() or {}
        play_duration = data.get('play_duration', 0)
        
        # 记录播放历史
        play_record = PlayHistory(
            user_id=current_user_id,
            music_id=music_id,
            play_duration=play_duration
        )
        db.session.add(play_record)
        
        # 更新播放次数
        music.play_count += 1
        db.session.commit()
        
        # 记录日志
        log_action(current_user_id, 'music_play', f'播放音乐: {music.title}', request.remote_addr)
        
        return jsonify({
            'message': '播放记录成功',
            'play_count': music.play_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '记录播放失败'}), 500

@music_bp.route('/music/<int:music_id>/like', methods=['POST'])
@jwt_required()
def like_music(music_id):
    """收藏音乐"""
    try:
        current_user_id = get_jwt_identity()
        music = Music.query.get(music_id)
        
        if not music:
            return jsonify({'error': '音乐不存在'}), 404
        
        # 检查是否已收藏
        existing_favorite = UserFavorite.query.filter_by(
            user_id=current_user_id,
            music_id=music_id
        ).first()
        
        if existing_favorite:
            return jsonify({'error': '已经收藏过这首音乐'}), 400
        
        # 添加收藏
        favorite = UserFavorite(
            user_id=current_user_id,
            music_id=music_id
        )
        db.session.add(favorite)
        
        # 更新喜欢次数
        music.like_count += 1
        db.session.commit()
        
        # 记录日志
        log_action(current_user_id, 'music_like', f'收藏音乐: {music.title}', request.remote_addr)
        
        return jsonify({
            'message': '收藏成功',
            'like_count': music.like_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '收藏失败'}), 500

@music_bp.route('/music/<int:music_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_music(music_id):
    """取消收藏音乐"""
    try:
        current_user_id = get_jwt_identity()
        music = Music.query.get(music_id)
        
        if not music:
            return jsonify({'error': '音乐不存在'}), 404
        
        # 查找收藏记录
        favorite = UserFavorite.query.filter_by(
            user_id=current_user_id,
            music_id=music_id
        ).first()
        
        if not favorite:
            return jsonify({'error': '尚未收藏这首音乐'}), 400
        
        # 删除收藏
        db.session.delete(favorite)
        
        # 更新喜欢次数
        if music.like_count > 0:
            music.like_count -= 1
        
        db.session.commit()
        
        # 记录日志
        log_action(current_user_id, 'music_unlike', f'取消收藏音乐: {music.title}', request.remote_addr)
        
        return jsonify({
            'message': '取消收藏成功',
            'like_count': music.like_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '取消收藏失败'}), 500

@music_bp.route('/user/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    """获取用户收藏的音乐"""
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 查询用户收藏的音乐
        query = db.session.query(Music).join(UserFavorite).filter(
            UserFavorite.user_id == current_user_id
        ).order_by(UserFavorite.created_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        music_list = [music.to_dict() for music in pagination.items]
        
        return jsonify({
            'music': music_list,
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
        return jsonify({'error': '获取收藏列表失败'}), 500

@music_bp.route('/user/history', methods=['GET'])
@jwt_required()
def get_play_history():
    """获取用户播放历史"""
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 查询播放历史
        query = db.session.query(Music, PlayHistory).join(PlayHistory).filter(
            PlayHistory.user_id == current_user_id
        ).order_by(PlayHistory.played_at.desc())
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        history_list = []
        for music, play_record in pagination.items:
            music_data = music.to_dict()
            music_data['played_at'] = play_record.played_at.isoformat()
            music_data['play_duration'] = play_record.play_duration
            history_list.append(music_data)
        
        return jsonify({
            'history': history_list,
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
        return jsonify({'error': '获取播放历史失败'}), 500

# 初始化示例音乐数据
def init_sample_music():
    """初始化示例音乐数据"""
    sample_music = [
        {
            'title': 'Electronic Dreams',
            'artist': 'DJ Mixer',
            'album': 'Future Beats',
            'duration': 225,  # 3:45
            'genre': 'Electronic',
            'is_featured': True,
            'play_count': 1200,
            'like_count': 89
        },
        {
            'title': 'Myanmar Beats',
            'artist': 'Local Artist',
            'album': 'Traditional Mix',
            'duration': 180,  # 3:00
            'genre': 'Traditional',
            'is_featured': True,
            'play_count': 856,
            'like_count': 67
        },
        {
            'title': 'Love Songs Mix',
            'artist': 'Romantic',
            'album': 'Heart Beats',
            'duration': 240,  # 4:00
            'genre': 'Pop',
            'is_featured': True,
            'play_count': 2100,
            'like_count': 156
        },
        {
            'title': 'DJ Mix - Electronic Beats',
            'artist': 'Various Artists',
            'album': 'Club Mix',
            'duration': 83,  # 1:23
            'genre': 'Electronic',
            'is_featured': False,
            'play_count': 543,
            'like_count': 34
        }
    ]
    
    for music_data in sample_music:
        existing = Music.query.filter_by(title=music_data['title']).first()
        if not existing:
            music = Music(**music_data)
            db.session.add(music)
    
    db.session.commit()

