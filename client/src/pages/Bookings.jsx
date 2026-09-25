import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Loader2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/formatters';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This slot will be released back to the expert.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled successfully.');
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-750 border-red-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Filter Bookings
  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const historyBookings = bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Booked Sessions</h2>
          <p className="text-sm text-slate-500">Track and manage your appointments with expert mentors</p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Upcoming Confirmed ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'pending'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Requests ({pendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'history'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Past & Archived ({historyBookings.length})
        </button>
      </div>

      {/* Render Tabs */}
      {activeTab === 'upcoming' && (
        upcomingBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            No upcoming confirmed sessions found. Once a mentor accepts your request, it will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mentor</span>
                      <h4 className="font-extrabold text-slate-900 text-md">{b.expertProfile.user.name}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{formatINR(b.service.price)}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Topic / Package</span>
                    <span className="text-sm font-bold text-slate-700">{b.service.serviceTitle}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4 text-xs text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-slate-450" />
                      <span>{new Date(b.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-slate-450" />
                      <span>{b.slot?.startTime || '--:--'} - {b.slot?.endTime || '--:--'}</span>
                    </div>
                  </div>

                  {/* Link / Location box */}
                  <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 mb-4">
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Appointment Info</span>
                    {b.service.meetingType === 'ONLINE' ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-700 font-semibold flex items-center">
                          <Video className="h-4 w-4 mr-1.5" />
                          Online meeting link available
                        </span>
                        {b.meetingLink ? (
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition cursor-pointer"
                          >
                            Join Call
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-semibold">TBD by Expert</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start text-xs text-slate-600">
                        <MapPin className="h-4 w-4 mr-1.5 text-emerald-500 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-emerald-800 block">In-Person Meeting Location:</span>
                          <span className="font-medium text-slate-600">{b.meetingLocation || 'To be shared by expert.'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {b.notes && (
                    <div className="mb-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 block mb-0.5">My Notes:</span>
                      <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{b.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex gap-3">
                  <Link
                    to={`/bookings/${b.id}`}
                    className="flex-grow inline-flex justify-center items-center rounded-xl border border-slate-200 hover:border-slate-350 px-4 py-2.5 text-xs font-bold text-slate-700 transition shadow-sm bg-white"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    disabled={actionLoading}
                    className="inline-flex justify-center items-center rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-650 px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'pending' && (
        pendingBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            You don't have any pending requests. Search for experts in the marketplace to book sessions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingBookings.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mentor</span>
                      <h4 className="font-extrabold text-slate-900 text-md">{b.expertProfile.user.name}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{formatINR(b.service.price)}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Requested</span>
                    <span className="text-sm font-bold text-slate-700">{b.service.serviceTitle}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4 text-xs text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-slate-450" />
                      <span>{new Date(b.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-slate-450" />
                      <span>{b.slot?.startTime || '--:--'} - {b.slot?.endTime || '--:--'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 font-semibold mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Awaiting approval from mentor</span>
                  </div>

                  {b.notes && (
                    <div className="mb-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 block mb-0.5">My Notes:</span>
                      <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{b.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex gap-3">
                  <Link
                    to={`/bookings/${b.id}`}
                    className="flex-grow inline-flex justify-center items-center rounded-xl border border-slate-200 hover:border-slate-350 px-4 py-2.5 text-xs font-bold text-slate-700 transition shadow-sm bg-white"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    disabled={actionLoading}
                    className="inline-flex justify-center items-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-450 px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    Retract
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        historyBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            No past or archived sessions found.
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 bg-white rounded-3xl shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mentor</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {historyBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                      {b.expertProfile.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {b.service.serviceTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {b.service.meetingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                      {formatINR(b.service.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <Link to={`/bookings/${b.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Bookings;
