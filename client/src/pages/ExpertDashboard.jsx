import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Settings,
  Calendar,
  Layers,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  ExternalLink,
  BookOpen,
  DollarSign,
  Clock,
  Briefcase
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

const ExpertDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Global skills list
  const [globalSkills, setGlobalSkills] = useState([]);

  // Profile Form States
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [profileImage, setProfileImage] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]); // Array of skill IDs

  // Services States
  const [services, setServices] = useState([]);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDuration, setServiceDuration] = useState(60);
  const [servicePrice, setServicePrice] = useState(0);
  const [serviceMeetingType, setServiceMeetingType] = useState('ONLINE');
  const [serviceIsActive, setServiceIsActive] = useState(true);
  const [serviceThumbnail, setServiceThumbnail] = useState('');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Slots States
  const [slots, setSlots] = useState([]);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotEndTime, setSlotEndTime] = useState('');
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Load basic data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch expert profile
      try {
        const profileRes = await api.get('/expert/profile/me');
        setProfile(profileRes.data.profile);
        setHasProfile(true);
        // Populate profile form states
        const p = profileRes.data.profile;
        setTitle(p.title);
        setBio(p.bio);
        setYearsOfExperience(p.yearsOfExperience);
        setCompany(p.company);
        setLocation(p.location);
        setHourlyRate(p.hourlyRate);
        setProfileImage(p.profileImage || '');
        setLinkedinUrl(p.linkedinUrl || '');
        setGithubUrl(p.githubUrl || '');
        setPortfolioUrl(p.portfolioUrl || '');
        setSelectedSkills(p.skills.map(s => s.skillId));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setHasProfile(false);
          toast.success('Welcome! Please complete your profile onboarding.');
        } else {
          toast.error('Failed to load expert profile.');
        }
      }

      // 2. Fetch global skills list
      const skillsRes = await api.get('/skills');
      setGlobalSkills(skillsRes.data.skills);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch Services
  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.services);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch services.');
    }
  };

  // Fetch Slots
  const fetchSlots = async () => {
    try {
      const res = await api.get('/slots/my-slots');
      setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch availability slots.');
    }
  };

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'services' && hasProfile) {
      fetchServices();
    } else if (tab === 'slots' && hasProfile) {
      fetchSlots();
    }
  };

  // Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (hourlyRate < 0 || yearsOfExperience < 0) {
      toast.error('Values cannot be negative.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title,
        bio,
        yearsOfExperience: parseInt(yearsOfExperience),
        company,
        location,
        hourlyRate: parseFloat(hourlyRate),
        profileImage,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        skills: selectedSkills,
      };

      const res = await api.post('/expert/profile', payload);
      setProfile(res.data.profile);
      setHasProfile(true);
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setActionLoading(false);
    }
  };

  // Skill checkbox toggler
  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  // Service CRUD handlers
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (servicePrice < 0 || serviceDuration <= 0) {
      toast.error('Invalid service pricing or duration.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        serviceTitle,
        description: serviceDesc,
        duration: parseInt(serviceDuration),
        price: parseFloat(servicePrice),
        meetingType: serviceMeetingType,
        isActive: serviceIsActive,
        thumbnail: serviceThumbnail || null,
      };

      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
        toast.success('Service updated successfully.');
      } else {
        await api.post('/services', payload);
        toast.success('Service created successfully.');
      }

      // Reset
      setServiceTitle('');
      setServiceDesc('');
      setServiceDuration(60);
      setServicePrice(0);
      setServiceMeetingType('ONLINE');
      setServiceIsActive(true);
      setServiceThumbnail('');
      setEditingServiceId(null);
      setShowServiceForm(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save service.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceTitle(service.serviceTitle);
    setServiceDesc(service.description);
    setServiceDuration(service.duration);
    setServicePrice(service.price);
    setServiceMeetingType(service.meetingType);
    setServiceIsActive(service.isActive !== false);
    setServiceThumbnail(service.thumbnail || '');
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service offering?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted.');
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete service.');
    } finally {
      setActionLoading(false);
    }
  };

  // Slots CRUD handlers
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    if (!slotDate || !slotStartTime || !slotEndTime) {
      toast.error('All fields are required.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
      };

      await api.post('/slots', payload);
      toast.success('Availability slot added.');
      setSlotDate('');
      setSlotStartTime('');
      setSlotEndTime('');
      setShowSlotForm(false);
      fetchSlots();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create slot.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Remove this availability slot?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/slots/${id}`);
      toast.success('Slot removed.');
      fetchSlots();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete slot.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-200 backdrop-blur-sm">
            Expert Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Welcome back, <span className="text-indigo-300 font-black">{user?.name}</span>!
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed">
            Manage your mentorship offerings, schedule availability slots, and review incoming session bookings.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden md:block">
          <svg className="h-full w-full object-cover text-white" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
            <polygon points="50,0 100,0 100,100 0,100" />
          </svg>
        </div>
      </div>

      {/* Upper Brand / Profile Alert */}
      {!hasProfile && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <h2 className="text-xl font-bold text-amber-900 tracking-tight mb-1">Create Your Profile</h2>
          <p className="text-sm text-amber-700">
            Before setting up your calendar slots or service packages, you must establish your basic expert profile. 
            This makes you visible to students in the Expert Marketplace.
          </p>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation Menu */}
        <div className="space-y-2">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => handleTabChange('services')}
            disabled={!hasProfile}
            className={`flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-5 w-5" />
            <span>Services & Pricing</span>
          </button>

          <button
            onClick={() => handleTabChange('slots')}
            disabled={!hasProfile}
            className={`flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
              activeTab === 'slots'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Availability Slots</span>
          </button>

          <button
            onClick={() => handleTabChange('stats')}
            disabled={!hasProfile}
            className={`flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Metrics & Stats</span>
          </button>
        </div>

        {/* Right Tab Content Panels */}
        <div className="lg:col-span-3">
          {/* PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Expert Profile Settings</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Professional Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Software Architect"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google, Stripe"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Base Rate (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. San Francisco, CA / Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Professional Bio</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Describe your background, matching methodology, and project expertise..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Skills Tags (Select all that apply)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {globalSkills.map((skill) => (
                      <label
                        key={skill.id}
                        className={`flex items-center space-x-2 p-2.5 border rounded-xl cursor-pointer text-xs font-semibold select-none transition ${
                          selectedSkills.includes(skill.id)
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={() => handleSkillToggle(skill.id)}
                        />
                        <span>{skill.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">External Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                      <input
                        type="text"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Portfolio URL</label>
                      <input
                        type="text"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 px-3 py-2 sm:text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SERVICE MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">My Consultation Offerings</h3>
                  <p className="text-sm text-slate-500">Define booking packages, durations, and pricing</p>
                </div>
                <button
                  onClick={() => {
                    setShowServiceForm(!showServiceForm);
                    setEditingServiceId(null);
                    setServiceTitle('');
                    setServiceDesc('');
                    setServiceDuration(60);
                    setServicePrice(0);
                    setServiceMeetingType('ONLINE');
                  }}
                  className="inline-flex items-center space-x-1 px-4 py-2 border border-indigo-600 text-indigo-605 rounded-xl text-xs font-bold hover:bg-indigo-50 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Offering</span>
                </button>
              </div>

              {/* Service Form Toggle */}
              {showServiceForm && (
                <div className="mb-8 border border-indigo-100 bg-indigo-50/20 p-6 rounded-2xl">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-4">
                    {editingServiceId ? 'Edit Package Offering' : 'New Package Offering'}
                  </h4>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mock System Design Interview"
                          value={serviceTitle}
                          onChange={(e) => setServiceTitle(e.target.value)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Mode</label>
                        <select
                          value={serviceMeetingType}
                          onChange={(e) => setServiceMeetingType(e.target.value)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                        >
                          <option value="ONLINE">ONLINE (Video Conference)</option>
                          <option value="OFFLINE">OFFLINE (In-Person)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={serviceDuration}
                          onChange={(e) => setServiceDuration(e.target.value)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Session Price (₹ INR)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={servicePrice}
                          onChange={(e) => setServicePrice(e.target.value)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={serviceThumbnail}
                          onChange={(e) => setServiceThumbnail(e.target.value)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-750 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={serviceIsActive}
                            onChange={(e) => setServiceIsActive(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Active / Visible in Marketplace</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Detail what is included (e.g. prep docs, follow-up feedback report, recording)..."
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 sm:text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowServiceForm(false)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        Save Service
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Service Cards List */}
              {services.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  You haven't defined any consultation packages. Create your first offering!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`flex flex-col justify-between p-5 border rounded-2xl transition ${
                        service.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-md flex items-center gap-1.5">
                              {service.serviceTitle}
                              {!service.isActive && (
                                <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                  Inactive
                                </span>
                              )}
                            </h4>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                            {service.meetingType}
                          </span>
                        </div>
                        {service.thumbnail && (
                          <img
                            src={service.thumbnail}
                            alt=""
                            className="h-20 w-full object-cover rounded-xl mb-3 border border-slate-200"
                          />
                        )}
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{service.description}</p>
                      </div>
 
                      <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-slate-400 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {service.duration} mins
                          </span>
                          <span className="text-sm font-bold text-slate-900">{formatINR(service.price)}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={async () => {
                              try {
                                setActionLoading(true);
                                await api.put(`/services/${service.id}`, {
                                  serviceTitle: service.serviceTitle,
                                  description: service.description,
                                  duration: service.duration,
                                  price: service.price,
                                  meetingType: service.meetingType,
                                  isActive: !service.isActive,
                                  thumbnail: service.thumbnail
                                });
                                toast.success(`Service set to ${!service.isActive ? 'Active' : 'Inactive'}`);
                                fetchServices();
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to toggle active status.');
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            className={`px-2 py-1.5 border border-slate-200 hover:border-slate-350 rounded-xl hover:bg-slate-100 text-[10px] font-bold text-slate-600 cursor-pointer`}
                            title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                          >
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => startEditService(service)}
                            className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AVAILABILITY CALENDAR SLOTS */}
          {activeTab === 'slots' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Manage Availability Calendar</h3>
                  <p className="text-sm text-slate-500">Define date/time slots where you are open for bookings</p>
                </div>
                <button
                  onClick={() => setShowSlotForm(!showSlotForm)}
                  className="inline-flex items-center space-x-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Slots</span>
                </button>
              </div>

              {/* Slot Add Form */}
              {showSlotForm && (
                <div className="mb-8 border border-indigo-100 bg-indigo-50/20 p-6 rounded-2xl">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-4">Add Availability Window</h4>
                  <form onSubmit={handleSlotSubmit} className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="block rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        required
                        value={slotStartTime}
                        onChange={(e) => setSlotStartTime(e.target.value)}
                        className="block rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 sm:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        required
                        value={slotEndTime}
                        onChange={(e) => setSlotEndTime(e.target.value)}
                        className="block rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 sm:text-xs"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSlotForm(false)}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        Add Slot
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Slots calendar listing */}
              {slots.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  No availability slots listed on your calendar. Create availability windows above.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-250 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time Window</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Status</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-250">
                      {slots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {slot.startTime} - {slot.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              slot.isBooked
                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            }`}>
                              {slot.isBooked ? 'Booked' : 'Available'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={actionLoading}
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Delete Slot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STATISTICS */}
          {activeTab === 'stats' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Expert Dashboard Metrics</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Consultation Packages</span>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                    <span className="text-2xl font-black text-slate-900">{services.length} active</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Time Slots</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-black text-slate-900">{slots.length} created</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Base Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-slate-900">{formatINR(hourlyRate || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                <h4 className="font-extrabold text-slate-900 mb-4 text-md flex items-center">
                  <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
                  Sprint 2 Progress Notes
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>Your biography and skills tags are listed in the public directory list.</li>
                  <li>Mentees can view details of all your created consultation packages.</li>
                  <li>Students see real-time calendar grids matching your configured availability.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;
