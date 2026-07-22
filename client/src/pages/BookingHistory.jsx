import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Search, RefreshCw, ExternalLink } from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/all');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve platform bookings history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

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

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.learner.name.toLowerCase().includes(term) ||
      b.expertProfile.user.name.toLowerCase().includes(term) ||
      b.service.serviceTitle.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Platform Bookings Control</h2>
          <p className="text-sm text-slate-500">Monitor all scheduled appointments, statuses, and links across Mentora</p>
        </div>
        <button
          onClick={fetchAllBookings}
          className="inline-flex items-center space-x-1 px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-8 flex items-center relative">
        <Search className="absolute left-8 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter bookings by learner, expert, status, or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Bookings table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 text-slate-400 text-sm">
          No matching records found.
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-205 bg-white rounded-3xl shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Expert Mentor</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service Package</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-250">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                    {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-805">
                    <span className="font-bold">{b.learner.name}</span>
                    <span className="block text-[9px] text-slate-400">{b.learner.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-805">
                    <span className="font-bold">{b.expertProfile.user.name}</span>
                    <span className="block text-[9px] text-slate-400">{b.expertProfile.user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-655 font-medium">
                    <span className="block font-semibold text-slate-700">{b.service.serviceTitle}</span>
                    <span className="text-[9px] text-slate-400">{b.service.duration} mins</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {b.service.meetingType === 'ONLINE' ? (
                      b.meetingLink ? (
                        <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-650 font-semibold hover:underline inline-flex items-center">
                          Link <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No link</span>
                      )
                    ) : (
                      <span className="text-emerald-755 font-medium truncate max-w-[150px] block" title={b.meetingLocation}>
                        {b.meetingLocation || <span className="text-slate-400 italic">No location</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-900">
                    ${b.service.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
