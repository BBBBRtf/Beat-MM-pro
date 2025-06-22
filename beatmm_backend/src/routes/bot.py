from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, UserRole, WalletTransaction, TransactionType, TransactionStatus, SystemLog, Music, PlayHistory, Notification
from datetime import datetime, timedelta
from functools import wraps
import threading
import time
import json
from decimal import Decimal

bot_bp = Blueprint('bot', __name__)

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

class AccountingBot:
    """专属算账机器人 - 处理财务计算和统计报告"""
    
    def __init__(self):
        self.name = "BeatMM算账机器人"
        self.version = "1.0.0"
        self.last_run = None
        
    def calculate_daily_revenue(self, date=None):
        """计算每日收入"""
        if date is None:
            date = datetime.utcnow().date()
        
        # 计算当日所有收入交易
        revenue_transactions = WalletTransaction.query.filter(
            db.func.date(WalletTransaction.created_at) == date,
            WalletTransaction.transaction_type.in_([
                TransactionType.PURCHASE,
                TransactionType.SUBSCRIPTION,
                TransactionType.REWARD
            ]),
            WalletTransaction.status == TransactionStatus.COMPLETED
        ).all()
        
        total_revenue = sum(float(t.amount) for t in revenue_transactions if t.amount > 0)
        transaction_count = len(revenue_transactions)
        
        return {
            'date': date.isoformat(),
            'total_revenue': total_revenue,
            'transaction_count': transaction_count,
            'transactions': [t.to_dict() for t in revenue_transactions]
        }
    
    def calculate_user_statistics(self, user_id=None):
        """计算用户统计信息"""
        if user_id:
            users = [User.query.get(user_id)]
        else:
            users = User.query.all()
        
        statistics = []
        
        for user in users:
            if not user:
                continue
                
            # 计算用户数据
            total_spent = sum(
                float(abs(t.amount)) for t in user.wallet_transactions 
                if t.amount < 0 and t.status == TransactionStatus.COMPLETED
            )
            
            total_earned = sum(
                float(t.amount) for t in user.wallet_transactions 
                if t.amount > 0 and t.status == TransactionStatus.COMPLETED
            )
            
            play_count = len(user.play_history)
            favorite_count = len(user.favorites)
            
            # 计算活跃度分数 (0-100)
            activity_score = min(100, (play_count * 2 + favorite_count * 5 + user.login_count) / 10)
            
            # 计算用户价值等级
            if total_spent >= 10000:
                value_tier = "钻石用户"
            elif total_spent >= 5000:
                value_tier = "黄金用户"
            elif total_spent >= 1000:
                value_tier = "白银用户"
            else:
                value_tier = "普通用户"
            
            user_stats = {
                'user_id': user.id,
                'phone': user.phone,
                'name': f"{user.first_name} {user.last_name}",
                'role': user.role.value,
                'wallet_balance': float(user.wallet_balance),
                'total_spent': total_spent,
                'total_earned': total_earned,
                'net_balance': total_earned - total_spent,
                'play_count': play_count,
                'favorite_count': favorite_count,
                'login_count': user.login_count,
                'activity_score': round(activity_score, 2),
                'value_tier': value_tier,
                'member_since': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
            
            statistics.append(user_stats)
        
        return statistics
    
    def generate_financial_report(self, start_date=None, end_date=None):
        """生成财务报告"""
        if end_date is None:
            end_date = datetime.utcnow().date()
        if start_date is None:
            start_date = end_date - timedelta(days=30)  # 默认30天
        
        # 查询期间内的所有交易
        transactions = WalletTransaction.query.filter(
            WalletTransaction.created_at >= start_date,
            WalletTransaction.created_at <= end_date + timedelta(days=1),
            WalletTransaction.status == TransactionStatus.COMPLETED
        ).all()
        
        # 分类统计
        revenue_by_type = {}
        expense_by_type = {}
        
        for transaction in transactions:
            amount = float(transaction.amount)
            trans_type = transaction.transaction_type.value
            
            if amount > 0:  # 收入
                revenue_by_type[trans_type] = revenue_by_type.get(trans_type, 0) + amount
            else:  # 支出
                expense_by_type[trans_type] = expense_by_type.get(trans_type, 0) + abs(amount)
        
        total_revenue = sum(revenue_by_type.values())
        total_expense = sum(expense_by_type.values())
        net_profit = total_revenue - total_expense
        
        # 用户增长统计
        new_users = User.query.filter(
            User.created_at >= start_date,
            User.created_at <= end_date + timedelta(days=1)
        ).count()
        
        # 活跃用户统计
        active_users = User.query.filter(
            User.last_login >= start_date,
            User.last_login <= end_date + timedelta(days=1)
        ).count()
        
        report = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days + 1
            },
            'financial_summary': {
                'total_revenue': total_revenue,
                'total_expense': total_expense,
                'net_profit': net_profit,
                'profit_margin': round((net_profit / total_revenue * 100) if total_revenue > 0 else 0, 2)
            },
            'revenue_breakdown': revenue_by_type,
            'expense_breakdown': expense_by_type,
            'user_metrics': {
                'new_users': new_users,
                'active_users': active_users,
                'total_users': User.query.count()
            },
            'transaction_count': len(transactions),
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': self.name
        }
        
        return report
    
    def auto_reconcile_accounts(self):
        """自动对账功能"""
        # 检查所有用户的钱包余额是否与交易记录一致
        inconsistencies = []
        
        users = User.query.all()
        for user in users:
            # 计算基于交易记录的余额
            calculated_balance = 1000.0  # 初始余额
            
            for transaction in user.wallet_transactions:
                if transaction.status == TransactionStatus.COMPLETED:
                    calculated_balance += float(transaction.amount)
            
            current_balance = float(user.wallet_balance)
            
            # 检查是否有差异
            if abs(calculated_balance - current_balance) > 0.01:  # 允许0.01的浮点误差
                inconsistencies.append({
                    'user_id': user.id,
                    'phone': user.phone,
                    'current_balance': current_balance,
                    'calculated_balance': calculated_balance,
                    'difference': calculated_balance - current_balance
                })
        
        return {
            'reconciliation_date': datetime.utcnow().isoformat(),
            'total_users_checked': len(users),
            'inconsistencies_found': len(inconsistencies),
            'inconsistencies': inconsistencies
        }

class MaintenanceBot:
    """平台维护机器人 - 系统监控、自动清理、性能优化"""
    
    def __init__(self):
        self.name = "BeatMM维护机器人"
        self.version = "1.0.0"
        self.last_run = None
        
    def system_health_check(self):
        """系统健康检查"""
        health_status = {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': 'healthy',
            'checks': {}
        }
        
        try:
            # 数据库连接检查
            db.session.execute(db.text('SELECT 1'))
            health_status['checks']['database'] = {
                'status': 'healthy',
                'message': '数据库连接正常'
            }
        except Exception as e:
            health_status['checks']['database'] = {
                'status': 'error',
                'message': f'数据库连接失败: {str(e)}'
            }
            health_status['overall_status'] = 'unhealthy'
        
        # 用户数据检查
        try:
            total_users = User.query.count()
            active_users = User.query.filter_by(is_active=True).count()
            
            health_status['checks']['users'] = {
                'status': 'healthy',
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': total_users - active_users
            }
        except Exception as e:
            health_status['checks']['users'] = {
                'status': 'error',
                'message': f'用户数据检查失败: {str(e)}'
            }
            health_status['overall_status'] = 'unhealthy'
        
        # 音乐数据检查
        try:
            total_music = Music.query.count()
            total_plays = PlayHistory.query.count()
            
            health_status['checks']['music'] = {
                'status': 'healthy',
                'total_songs': total_music,
                'total_plays': total_plays
            }
        except Exception as e:
            health_status['checks']['music'] = {
                'status': 'error',
                'message': f'音乐数据检查失败: {str(e)}'
            }
            health_status['overall_status'] = 'unhealthy'
        
        # 存储空间检查（模拟）
        health_status['checks']['storage'] = {
            'status': 'healthy',
            'disk_usage': '45%',
            'available_space': '2.1GB'
        }
        
        return health_status
    
    def cleanup_expired_data(self):
        """清理过期数据"""
        cleanup_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'operations': []
        }
        
        try:
            # 清理过期通知
            expired_notifications = Notification.query.filter(
                Notification.expires_at < datetime.utcnow(),
                Notification.is_active == True
            ).all()
            
            for notification in expired_notifications:
                notification.is_active = False
            
            cleanup_results['operations'].append({
                'operation': 'expire_notifications',
                'count': len(expired_notifications),
                'status': 'success'
            })
            
            # 清理旧的系统日志（保留30天）
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            old_logs = SystemLog.query.filter(SystemLog.created_at < cutoff_date).all()
            
            for log in old_logs:
                db.session.delete(log)
            
            cleanup_results['operations'].append({
                'operation': 'cleanup_old_logs',
                'count': len(old_logs),
                'status': 'success'
            })
            
            # 清理失败的交易记录（7天前的）
            failed_cutoff = datetime.utcnow() - timedelta(days=7)
            failed_transactions = WalletTransaction.query.filter(
                WalletTransaction.status == TransactionStatus.FAILED,
                WalletTransaction.created_at < failed_cutoff
            ).all()
            
            for transaction in failed_transactions:
                db.session.delete(transaction)
            
            cleanup_results['operations'].append({
                'operation': 'cleanup_failed_transactions',
                'count': len(failed_transactions),
                'status': 'success'
            })
            
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            cleanup_results['operations'].append({
                'operation': 'cleanup_error',
                'error': str(e),
                'status': 'failed'
            })
        
        return cleanup_results
    
    def optimize_database(self):
        """数据库优化"""
        optimization_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'operations': []
        }
        
        try:
            # SQLite VACUUM 操作（清理和压缩数据库）
            db.session.execute(db.text('VACUUM'))
            optimization_results['operations'].append({
                'operation': 'vacuum_database',
                'status': 'success',
                'message': '数据库已压缩和优化'
            })
            
            # 分析表统计信息
            db.session.execute(db.text('ANALYZE'))
            optimization_results['operations'].append({
                'operation': 'analyze_tables',
                'status': 'success',
                'message': '表统计信息已更新'
            })
            
            db.session.commit()
            
        except Exception as e:
            optimization_results['operations'].append({
                'operation': 'optimization_error',
                'error': str(e),
                'status': 'failed'
            })
        
        return optimization_results
    
    def generate_performance_report(self):
        """生成性能报告"""
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'system_metrics': {},
            'database_metrics': {},
            'user_activity_metrics': {}
        }
        
        try:
            # 系统指标
            report['system_metrics'] = {
                'uptime': '99.9%',  # 模拟数据
                'response_time_avg': '120ms',
                'memory_usage': '512MB',
                'cpu_usage': '15%'
            }
            
            # 数据库指标
            total_users = User.query.count()
            total_music = Music.query.count()
            total_transactions = WalletTransaction.query.count()
            
            report['database_metrics'] = {
                'total_records': total_users + total_music + total_transactions,
                'users_count': total_users,
                'music_count': total_music,
                'transactions_count': total_transactions,
                'database_size': '45MB'  # 模拟数据
            }
            
            # 用户活动指标
            today = datetime.utcnow().date()
            today_logins = User.query.filter(
                db.func.date(User.last_login) == today
            ).count()
            
            today_plays = PlayHistory.query.filter(
                db.func.date(PlayHistory.played_at) == today
            ).count()
            
            report['user_activity_metrics'] = {
                'daily_active_users': today_logins,
                'daily_music_plays': today_plays,
                'avg_session_duration': '25分钟',  # 模拟数据
                'bounce_rate': '12%'  # 模拟数据
            }
            
        except Exception as e:
            report['error'] = str(e)
        
        return report

# 创建机器人实例
accounting_bot = AccountingBot()
maintenance_bot = MaintenanceBot()

# ==================== 算账机器人API ====================

@bot_bp.route('/accounting/daily-revenue', methods=['GET'])
@super_admin_required
def get_daily_revenue():
    """获取每日收入报告"""
    try:
        date_str = request.args.get('date')
        date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
        
        result = accounting_bot.calculate_daily_revenue(date)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'获取每日收入失败: {str(e)}'}), 500

@bot_bp.route('/accounting/user-statistics', methods=['GET'])
@super_admin_required
def get_user_statistics():
    """获取用户统计信息"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        result = accounting_bot.calculate_user_statistics(user_id)
        return jsonify({'statistics': result}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户统计失败: {str(e)}'}), 500

@bot_bp.route('/accounting/financial-report', methods=['GET'])
@super_admin_required
def get_financial_report():
    """获取财务报告"""
    try:
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
        
        result = accounting_bot.generate_financial_report(start_date, end_date)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'生成财务报告失败: {str(e)}'}), 500

@bot_bp.route('/accounting/reconcile', methods=['POST'])
@super_admin_required
def reconcile_accounts():
    """执行自动对账"""
    try:
        result = accounting_bot.auto_reconcile_accounts()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'自动对账失败: {str(e)}'}), 500

# ==================== 维护机器人API ====================

@bot_bp.route('/maintenance/health-check', methods=['GET'])
@super_admin_required
def system_health_check():
    """系统健康检查"""
    try:
        result = maintenance_bot.system_health_check()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'健康检查失败: {str(e)}'}), 500

@bot_bp.route('/maintenance/cleanup', methods=['POST'])
@super_admin_required
def cleanup_system():
    """执行系统清理"""
    try:
        result = maintenance_bot.cleanup_expired_data()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'系统清理失败: {str(e)}'}), 500

@bot_bp.route('/maintenance/optimize', methods=['POST'])
@super_admin_required
def optimize_system():
    """执行系统优化"""
    try:
        result = maintenance_bot.optimize_database()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'系统优化失败: {str(e)}'}), 500

@bot_bp.route('/maintenance/performance-report', methods=['GET'])
@super_admin_required
def get_performance_report():
    """获取性能报告"""
    try:
        result = maintenance_bot.generate_performance_report()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'获取性能报告失败: {str(e)}'}), 500

# ==================== 机器人状态API ====================

@bot_bp.route('/status', methods=['GET'])
@super_admin_required
def get_bot_status():
    """获取机器人状态"""
    try:
        status = {
            'accounting_bot': {
                'name': accounting_bot.name,
                'version': accounting_bot.version,
                'status': 'active',
                'last_run': accounting_bot.last_run
            },
            'maintenance_bot': {
                'name': maintenance_bot.name,
                'version': maintenance_bot.version,
                'status': 'active',
                'last_run': maintenance_bot.last_run
            },
            'system_time': datetime.utcnow().isoformat()
        }
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({'error': f'获取机器人状态失败: {str(e)}'}), 500

