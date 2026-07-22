import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Clock,
  Video,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Loader2,
  Calendar,
  ArrowLeft,
  Check
} from 'lucide-react';
import BookingModal from '../components/BookingModal';

const ExpertDetails = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Flow States
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchExpertDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/expert/${id}`);
      setExpert(res.data.expert);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expert details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertDetails();
  }, [id]);

  const handleBookSlotClick = (slot) => {
    if (!selectedService) {
      toast.error('Please select a consultation offering package first!');
      // Scroll to consultation offerings section
      const element = document.getElementById('offerings-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    setSelectedService(null);
    // Reload expert details to refresh active available slots list
    fetchExpertDetails();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Expert not found</h2>
        <p className="text-sm text-slate-500 mb-6">The expert profile you are looking for does not exist or has been deleted.</p>
        <Link to="/marketplace" className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link to="/marketplace" className="inline-flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-8 transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Header Profile Hero */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex items-center space-x-6">
          {expert.profileImage ? (
            <img
              src={expert.profileImage}
              alt={expert.user.name}
              className="h-24 w-24 rounded-3xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 border border-slate-100 shadow-sm">
              <User className="h-12 w-12" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{expert.user.name}</h1>
            <p className="text-md font-semibold text-slate-500 leading-snug">{expert.title}</p>
            <p className="text-sm text-indigo-600 font-extrabold mb-3">{expert.company}</p>
            
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                {expert.location}
              </span>
              <span>&bull;</span>
              <span>{expert.yearsOfExperience} years experience</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 self-stretch md:self-auto border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Consultation Fee</span>
            <span className="text-3xl font-black text-slate-900">${expert.hourlyRate}<span className="text-sm font-semibold text-slate-400">/hr</span></span>
          </div>

          {/* Social links */}
          <div className="flex space-x-2">
            {expert.linkedinUrl && (
              <a
                href={expert.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-slate-500 transition"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {expert.githubUrl && (
              <a
                href={expert.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-200 hover:border-slate-355 rounded-xl text-slate-500 transition"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {expert.portfolioUrl && (
              <a
                href={expert.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-200 hover:border-slate-360 rounded-xl text-slate-500 transition"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Bio and services details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biography */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About Mentor</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{expert.bio}</p>
            
            <div className="mt-6 border-t border-slate-100 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Expertise Tags</span>
              <div className="flex flex-wrap gap-2">
                {expert.skills.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    {item.skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Consultation Services offerings */}
          <div id="offerings-section" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Consultation Offerings</h3>
            <p className="text-xs text-slate-400 mb-6 mt-1">Select one of the packages below before picking a time slot</p>

            {expert.services.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No specific package offerings defined by this mentor. Standard hourly rates apply.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {expert.services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`flex flex-col justify-between p-5 border rounded-2xl cursor-pointer group hover:border-indigo-300 transition ${
                        isSelected
                          ? 'bg-indigo-50/20 border-indigo-500 ring-2 ring-indigo-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-extrabold text-slate-900 text-md flex items-center gap-1.5">
                            {service.serviceTitle}
                            {isSelected && <Check className="h-4.5 w-4.5 text-indigo-600 stroke-[3]" />}
                          </h4>
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          }`}>
                            {service.meetingType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-505 leading-relaxed line-clamp-3 mb-4">{service.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-200/80 pt-3 mt-3">
                        <span className="text-xs text-slate-400 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {service.duration} mins
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">${service.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right availability scheduling column */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              Available Time Slots
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Select a date/time slot below to book your 1-on-1 session directly on the mentor's calendar.
            </p>

            {expert.slots.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs leading-relaxed px-4">
                No active availability slots listed at the moment. Try contacting the expert or check back later!
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {expert.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3.5 border border-slate-200 rounded-2xl hover:border-indigo-300 bg-slate-50 hover:bg-white transition"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookSlotClick(slot)}
                      className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal Overlay */}
      {showBookingModal && (
        <BookingModal
          expert={expert}
          service={selectedService}
          slot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ExpertDetails;
