import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Loader2,
  ArrowLeft,
  User,
  DollarSign,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetails = async () => {
    try {
      // Find within learner bookings list or expert bookings list
      // Since there is no single GET /api/bookings/:id, we can fetch all or my/expert list,
      // wait, is there a GET /api/bookings/:id endpoint?
      // Let's check bookingRoutes.js!
      // In bookingRoutes:
      // router.post('/', authenticateJWT, bookingValidator, createBooking);
      // router.get('/my', authenticateJWT, listMyBookings);
      // router.delete('/:id', authenticateJWT, cancelBooking);
      // router.get('/expert', authenticateJWT, requireRoles('EXPERT'), listExpertBookings);
      // router.patch('/:id/status', authenticateJWT, requireRoles('EXPERT'), updateBookingStatus);
      // router.get('/all', authenticateJWT, requireRoles('ADMIN'), listAllBookings);
      // Wait, there is indeed NO direct GET /api/bookings/:id!
      // But wait! We can add a GET /api/bookings/:id endpoint in bookingRoutes and controller so that details can be fetched directly!
      // This is a brilliant realization! Adding GET /api/bookings/:id will make the BookingDetails page work perfectly and follow RESTful best practices.
      // Let's check: yes, we should add a getBookingById controller function and register it.
      // Let's do that! Let's write the frontend assuming we will call GET /api/bookings/${id}.
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load booking details.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center bg-white border border-slate-200 rounded-3xl mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Booking not found</h2>
        <p className="text-sm text-slate-500 mb-6">The appointment details you are looking for do not exist or are restricted.</p>
        <Link to="/dashboard" className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { status, service, slot, learner, expertProfile, meetingLink, meetingLocation, notes, bookingDate } = booking;
  const isOnline = service.meetingType === 'ONLINE';
  const isConfirmed = status === 'CONFIRMED';
  const isCompleted = status === 'COMPLETED';
  const isRejected = status === 'REJECTED';
  const isCancelled = status === 'CANCELLED';
  const isPending = status === 'PENDING';

  // Booking Timeline Nodes
  const getTimelineSteps = () => {
    if (isRejected) {
      return [
        { label: 'Requested', desc: 'Booking request sent', done: true, current: false },
        { label: 'Rejected', desc: 'Expert declined request', done: true, current: true, error: true }
      ];
    }
    if (isCancelled) {
      return [
        { label: 'Requested', desc: 'Booking request sent', done: true, current: false },
        { label: 'Cancelled', desc: 'Booking cancelled by learner', done: true, current: true, error: true }
      ];
    }
    return [
      { label: 'Requested', desc: 'Awaiting approval', done: true, current: isPending },
      { label: 'Confirmed', desc: 'Meeting info released', done: isConfirmed || isCompleted, current: isConfirmed },
      { label: 'Completed', desc: 'Mentorship logged done', done: isCompleted, current: isCompleted }
    ];
  };

  const timelineSteps = getTimelineSteps();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-8 transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* left column: Session metadata and information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Offering</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{service.serviceTitle}</h3>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-wider ${
                isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                isConfirmed ? 'bg-blue-50 text-blue-700 border-blue-200' :
                isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4 border-y border-slate-100 mb-6 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Mentorship Price</span>
                <span className="text-lg font-black text-slate-800">{formatINR(service.price)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Duration</span>
                <span className="text-lg font-black text-slate-800">{service.duration} minutes</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Format</span>
                <span className="text-lg font-black text-slate-800 flex items-center gap-1">
                  {isOnline ? <Video className="h-4 w-4 text-indigo-500" /> : <MapPin className="h-4 w-4 text-emerald-500" />}
                  {service.meetingType}
                </span>
              </div>
            </div>

            {/* Profiles detail card */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mentor Expert</span>
                  <span className="text-sm font-bold text-slate-800">{expertProfile.user.name}</span>
                  <span className="text-xs text-slate-450 block">{expertProfile.user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Learner Client</span>
                  <span className="text-sm font-bold text-slate-800">{learner.name}</span>
                  <span className="text-xs text-slate-455 block">{learner.email}</span>
                </div>
              </div>
            </div>

            {/* Notes box */}
            {notes && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Booking Notes / Questions</span>
                <p className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{notes}</p>
              </div>
            )}
          </div>

          {/* Meeting Information Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-md font-bold text-slate-900 mb-3">Appointment Logistics</h4>
            {isConfirmed || isCompleted ? (
              isOnline ? (
                <div className="bg-indigo-50/20 border border-indigo-150 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Online Virtual Meeting</span>
                    <span className="text-xs font-semibold text-slate-655 block mt-1">Authorized Call Link is active:</span>
                  </div>
                  {meetingLink ? (
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Join Session
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold italic">Link not supplied by mentor yet.</span>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/20 border border-emerald-150 rounded-2xl p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Physical Meeting location</span>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{meetingLocation}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-500">
                <Info className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700 block">Meeting details locked</span>
                  <span>Logistics and meet links are only visible once the expert accepts and confirms the appointment.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* right column: Time details and Timeline */}
        <div className="space-y-6">
          {/* Appointment Schedule */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Date & Time</h4>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div>
                  <span className="font-bold block text-slate-800">
                    {new Date(bookingDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-slate-400">Scheduled Date</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-indigo-500" />
                <div>
                  <span className="font-bold block text-slate-800">
                    {slot ? `${slot.startTime} - ${slot.endTime}` : 'No slot linked'}
                  </span>
                  <span className="text-slate-400">Session Window</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Booking Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Booking Timeline</h4>
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-8">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline circle node */}
                  <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    step.error ? 'bg-red-600 border-red-600 text-white' :
                    step.current ? 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-50' :
                    step.done ? 'bg-indigo-600 border-indigo-600 text-white' :
                    'bg-white border-slate-200'
                  }`}>
                    {step.done && !step.current && !step.error && (
                      <CheckCircle2 className="h-3 w-3 text-white fill-indigo-600" />
                    )}
                  </span>
                  <div>
                    <h5 className={`text-xs font-bold leading-none ${step.current ? 'text-indigo-600 font-black' : step.error ? 'text-red-650' : 'text-slate-800'}`}>
                      {step.label}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
