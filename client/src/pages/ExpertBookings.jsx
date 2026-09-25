import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

const ExpertBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [actionLoading, setActionLoading] = useState(false);

  // States for Accept Prompt Overlay
  const [acceptingBookingId, setAcceptingBookingId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/expert');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load expert booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, status, extra = {}) => {
    setActionLoading(true);
    try {
      const payload = { status, ...extra };
      const res = await api.patch(`/bookings/${id}/status`, payload);
      toast.success(res.data.message || 'Booking updated successfully!');
      
      // Close forms
      setAcceptingBookingId(null);
      setMeetingLink('');
      setMeetingLocation('');
      
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update booking status.');
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
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const upcomingConfirmed = bookings.filter((b) => b.status === 'CONFIRMED');
  const historySessions = bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Expert Appointment Requests</h2>
          <p className="text-sm text-slate-500">Manage client requests, configure meet details, and log completions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'requests'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Incoming Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Confirmed Appointments ({upcomingConfirmed.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-semibold transition ${
            activeTab === 'history'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Completed & Archived ({historySessions.length})
        </button>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}

      {activeTab === 'requests' && (
        pendingRequests.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            No incoming booking requests found. When learners request slots, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map((b) => {
              const isAccepting = acceptingBookingId === b.id;
              const isOnline = b.service.meetingType === 'ONLINE';

              return (
                <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-slate-100">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Learner</span>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-none mt-0.5">{b.learner.name}</h4>
                          <span className="text-[10px] text-slate-550">{b.learner.email}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900">{formatINR(b.service.price)}</span>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Requested</span>
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

                    {b.notes && (
                      <div className="mb-4 text-xs text-slate-500">
                        <span className="font-bold text-slate-700 block mb-1 flex items-center">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Learner Notes:
                        </span>
                        <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{b.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Accept form overlay */}
                  {isAccepting ? (
                    <div className="mt-4 border-t border-slate-200 pt-4 space-y-4">
                      <h5 className="font-extrabold text-xs text-slate-800">
                        Confirm details for {isOnline ? 'Online' : 'In-Person'} booking:
                      </h5>
                      {isOnline ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Google Meet / Zoom URL</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. https://meet.google.com/abc-defg-hij"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Physical Meetup Location</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Starbucks on 5th Ave, Seattle"
                            value={meetingLocation}
                            onChange={(e) => setMeetingLocation(e.target.value)}
                            className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setAcceptingBookingId(null)}
                          className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(b.id, 'CONFIRMED', { meetingLink, meetingLocation })}
                          disabled={actionLoading}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer"
                        >
                          {actionLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Confirm Accept
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-4 mt-2 flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                        disabled={actionLoading}
                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-slate-200 hover:bg-red-50 text-slate-550 hover:text-red-650 px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setAcceptingBookingId(b.id);
                          setMeetingLink('');
                          setMeetingLocation('');
                        }}
                        disabled={actionLoading}
                        className="flex-1 inline-flex justify-center items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        Accept Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'upcoming' && (
        upcomingConfirmed.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            No upcoming confirmed appointments scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingConfirmed.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-350 transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-slate-100">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Learner</span>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-none mt-0.5">{b.learner.name}</h4>
                        <span className="text-[10px] text-slate-550">{b.learner.email}</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{formatINR(b.service.price)}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
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
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Appointment Info</span>
                    {b.service.meetingType === 'ONLINE' ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-700 font-semibold flex items-center">
                          <Video className="h-4 w-4 mr-1.5" />
                          Online Video Link
                        </span>
                        {b.meetingLink && (
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
                          >
                            Go to Zoom / Meet
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start text-xs text-slate-600">
                        <MapPin className="h-4 w-4 mr-1.5 text-emerald-500 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-emerald-800 block">Meeting Location:</span>
                          <span className="font-medium text-slate-600">{b.meetingLocation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {b.notes && (
                    <div className="mb-4 text-xs text-slate-500">
                      <span className="font-bold text-slate-700 block mb-0.5">Learner Notes:</span>
                      <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{b.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex gap-2">
                  <Link
                    to={`/bookings/${b.id}`}
                    className="inline-flex justify-center items-center rounded-xl border border-slate-200 hover:border-slate-350 px-3 py-2 text-xs font-bold text-slate-700 transition shadow-sm bg-white"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                    disabled={actionLoading}
                    className="flex-1 inline-flex justify-center items-center rounded-xl border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-650 px-3 py-2 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                    disabled={actionLoading}
                    className="flex-1 inline-flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        historySessions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
            No completed or past appointments found.
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 bg-white rounded-3xl shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Learner</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-250">
                {historySessions.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                      {b.learner.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-650 font-medium">
                      {b.service.serviceTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {b.service.meetingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-850">
                      {formatINR(b.service.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
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

export default ExpertBookings;
