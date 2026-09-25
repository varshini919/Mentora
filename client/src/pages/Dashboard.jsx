import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Search,
  ChevronRight,
  Bell,
  Award,
  Video,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect experts to their workspace
  useEffect(() => {
    if (user && user.role === 'EXPERT') {
      navigate('/expert/dashboard');
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user || user.role === 'EXPERT') return;
    try {
      setLoading(true);
      const [bookingsRes, notificationsRes] = await Promise.all([
        api.get('/bookings/my'),
        api.get('/notifications')
      ]);
      setBookings(bookingsRes.data.bookings);
      setNotifications(notificationsRes.data.notifications);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Calculate statistics
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

  // Filter next upcoming sessions (confirmed)
  const upcomingSessions = confirmedBookings
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
    .slice(0, 2);

  // Take top 3 unread notifications
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Welcome Card Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-200 backdrop-blur-sm">
            Learner Portal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Welcome back, <span className="text-indigo-300 font-black">{user?.name}</span>!
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed">
            Connect with industry leaders, schedule 1-on-1 calls, mock interviews, or get your code reviewed directly.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 transition"
            >
              <Search className="h-4 w-4" />
              <span>Browse Sessions</span>
            </Link>
            <Link
              to="/bookings"
              className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 text-slate-100 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition backdrop-blur-sm"
            >
              <span>My Appointments</span>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden md:block">
          <svg className="h-full w-full object-cover text-white" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
            <polygon points="50,0 100,0 100,100 0,100" />
          </svg>
        </div>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-800">{bookings.length}</span>
            <span className="text-xs text-slate-450 font-semibold">Scheduled calls</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Upcoming Sessions</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-indigo-600">{confirmedBookings.length}</span>
            <span className="text-xs text-indigo-500 font-semibold">Confirmed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-500">{pendingBookings.length}</span>
            <span className="text-xs text-amber-500 font-semibold">Awaiting Expert</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Sessions</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-600">{completedBookings.length}</span>
            <span className="text-xs text-emerald-500 font-semibold">Success logs</span>
          </div>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Middle: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <span>Next Scheduled Sessions</span>
              </h3>
              <Link to="/bookings" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                <span>View all</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 text-xs">
                <p className="font-semibold text-slate-500">No upcoming confirmed sessions.</p>
                <p className="text-slate-400 mt-1">Book an open slot with an expert mentor to get started.</p>
                <Link to="/marketplace" className="inline-flex mt-4 text-indigo-600 hover:underline font-bold">
                  Browse Marketplace &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((booking) => {
                  const isOnline = booking.service.meetingType === 'ONLINE';
                  return (
                    <div
                      key={booking.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-slate-350 transition bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 w-max">
                          {booking.service.serviceTitle}
                        </span>
                        <div className="text-sm font-extrabold text-slate-900">
                          with Mentor {booking.expertProfile.user.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                            {new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                            {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'No slot'}
                          </span>
                          <span className="flex items-center">
                            {isOnline ? <Video className="h-4 w-4 mr-1 text-indigo-505" /> : <MapPin className="h-4 w-4 mr-1 text-emerald-505" />}
                            {booking.service.meetingType}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="inline-flex justify-center items-center rounded-xl bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition shadow-sm cursor-pointer"
                      >
                        Timeline Details
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Notifications feed */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  <span>Recent Alerts</span>
                </h3>
                <Link to="/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                  <span>View feed</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {recentNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs leading-relaxed p-4">
                  No notifications recorded. Log booking requests to see notifications here.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 border rounded-2xl text-xs space-y-1.5 transition ${
                        n.isRead ? 'bg-slate-50/50 border-slate-200' : 'bg-indigo-50/10 border-indigo-200/60 ring-1 ring-indigo-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold text-slate-900 ${!n.isRead ? 'font-extrabold' : ''}`}>{n.title}</span>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-relaxed truncate">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
