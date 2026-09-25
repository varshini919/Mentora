import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, User, Loader2, Clock } from 'lucide-react';
import { formatINR } from '../utils/formatters';

const Marketplace = () => {
  const [experts, setExperts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSkill) params.skill = selectedSkill;

      const res = await api.get('/expert', { params });
      setExperts(res.data.experts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data.skills);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchExperts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperts();
  };

  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
  };

  useEffect(() => {
    fetchExperts();
  }, [selectedSkill]);

  const sessions = [];
  experts.forEach(expert => {
    if (expert.services) {
      expert.services.forEach(service => {
        if (service.isActive !== false) {
          sessions.push({
            ...service,
            expert
          });
        }
      });
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">Expert Marketplace</h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500">
          Find and book 1-on-1 consultations, code reviews, and mentorship sessions with verified industry leaders.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-10">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, title, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-3 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedSkill}
              onChange={handleSkillChange}
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Skills / Technologies</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center items-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <p className="text-slate-400 text-lg font-medium">No mentorship sessions found matching your criteria.</p>
          <p className="text-slate-500 text-sm mt-1">Try broadening your search or choosing a different skill tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => {
            const expert = session.expert;
            const isOnline = session.meetingType === 'ONLINE';

            return (
              <div
                key={session.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
              >
                {/* Session Card Thumbnail/Gradient Header */}
                <div className="h-36 w-full relative">
                  {session.thumbnail ? (
                    <img
                      src={session.thumbnail}
                      alt={session.serviceTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
                      <span className="text-white font-extrabold text-center text-sm drop-shadow-sm leading-snug tracking-tight">
                        {session.serviceTitle}
                      </span>
                    </div>
                  )}
                  {/* Meeting Type Badge */}
                  <span className={`absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                    isOnline 
                      ? 'bg-blue-50 text-blue-705 border-blue-200' 
                      : 'bg-emerald-50 text-emerald-705 border-emerald-200'
                  }`}>
                    {session.meetingType}
                  </span>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Session Details */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1 leading-snug" title={session.serviceTitle}>
                        {session.serviceTitle}
                      </h4>
                      <span className="text-xs font-black text-slate-900 ml-2">{formatINR(session.price)}</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-4">
                      {session.description}
                    </p>

                    <div className="flex items-center text-slate-400 text-xs mb-4">
                      <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <span>{session.duration} mins</span>
                    </div>

                    {/* Mentor Info */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl mb-4">
                      {expert.profileImage ? (
                        <img
                          src={expert.profileImage}
                          alt={expert.user.name}
                          className="h-9 w-9 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-slate-100">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 text-xs block leading-none">{expert.user.name}</span>
                        <span className="text-[10px] text-slate-450 mt-1 block truncate max-w-[170px]">{expert.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Session CTA */}
                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      to={`/experts/${expert.id}?serviceId=${session.id}`}
                      className="w-full inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
