import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, DollarSign, Video, MapPin, X, Loader2 } from 'lucide-react';

const BookingModal = ({ expert, service, slot, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        serviceId: service.id,
        slotId: slot.id,
        notes: notes.trim(),
      };
      const res = await api.post('/bookings', payload);
      toast.success(res.data.message || 'Booking request sent successfully!');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to request booking.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(slot.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Confirm Appointment Request</h3>

        {/* Session details card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mentor</span>
              <span className="text-sm font-extrabold text-slate-700">{expert.user?.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900">${service.price}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
            <span className="text-sm font-bold text-slate-800">{service.serviceTitle}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-slate-400" />
              <span>{slot.startTime} - {slot.endTime} ({service.duration}m)</span>
            </div>
            <div className="col-span-2 flex items-center">
              {service.meetingType === 'ONLINE' ? (
                <>
                  <Video className="h-4 w-4 mr-1 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">Online Consultation</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">In-Person Meetup</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-700 mb-1">
              Add Notes for Mentor (Optional)
            </label>
            <textarea
              id="notes"
              rows="3"
              placeholder="e.g. Please share your project details, resume goals, or topics you want to prioritize..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
