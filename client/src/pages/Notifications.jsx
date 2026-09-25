import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Loader2,
  Trash2,
  BookmarkCheck
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
      window.dispatchEvent(new Event('refresh-notifications'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
      window.dispatchEvent(new Event('refresh-notifications'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark all as read.');
    }
  };

  const getNotificationStyleAndIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return {
          icon: <Calendar className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-100',
        };
      case 'BOOKING_CONFIRMED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-100',
        };
      case 'BOOKING_REJECTED':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-red-50 border-red-100',
        };
      case 'BOOKING_CANCELLED':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-100',
        };
      case 'SESSION_REMINDER':
        return {
          icon: <Clock className="h-5 w-5 text-purple-600" />,
          bgColor: 'bg-purple-50 border-purple-100',
        };
      case 'SESSION_COMPLETED':
        return {
          icon: <BookmarkCheck className="h-5 w-5 text-teal-600" />,
          bgColor: 'bg-teal-50 border-teal-100',
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-slate-600" />,
          bgColor: 'bg-slate-50 border-slate-100',
        };
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notifications Feed</h2>
          <p className="text-sm text-slate-500 mt-1">Keep track of your mentorship appointments, changes, and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-55 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6">
        <button
          onClick={() => setFilter('all')}
          className={`pb-4 text-sm font-semibold transition ${
            filter === 'all'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All Messages ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-4 text-sm font-semibold transition ${
            filter === 'unread'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-205 rounded-3xl p-8 text-slate-400">
          <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">No notifications found.</p>
          <p className="text-xs text-slate-400 mt-1">When status changes occur, you will find updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((n) => {
            const { icon, bgColor } = getNotificationStyleAndIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`flex gap-4 p-5 border rounded-2xl transition shadow-sm bg-white hover:border-slate-350 cursor-pointer ${
                  n.isRead ? 'opacity-70 border-slate-200' : 'border-slate-300 ring-1 ring-slate-100'
                }`}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${bgColor}`}>
                  {icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold text-slate-950 ${!n.isRead ? 'font-extrabold' : ''}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>
                  
                  {!n.isRead && (
                    <span className="inline-flex items-center text-[9px] font-extrabold text-indigo-600 mt-2 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      New Message
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
