import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, User, Loader2 } from 'lucide-react';

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
      ) : experts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <p className="text-slate-400 text-lg font-medium">No experts found matching your criteria.</p>
          <p className="text-slate-500 text-sm mt-1">Try broadening your search or choosing a different skill tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
            >
              <div>
                {/* Upper Card Header */}
                <div className="flex items-center space-x-4 mb-4">
                  {expert.profileImage ? (
                    <img
                      src={expert.profileImage}
                      alt={expert.user.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-slate-100">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{expert.user.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 leading-tight">{expert.title}</p>
                    <p className="text-xs text-indigo-600 font-bold">{expert.company}</p>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6">{expert.bio}</p>

                {/* Experience & Rate Stats */}
                <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-slate-50 rounded-2xl mb-6 border border-slate-250">
                  <div className="text-center border-r border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
                    <span className="text-sm font-extrabold text-slate-700">{expert.yearsOfExperience} yrs</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rate</span>
                    <span className="text-sm font-extrabold text-slate-700">${expert.hourlyRate}/hr</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {expert.skills.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200"
                      >
                        {item.skill.name}
                      </span>
                    ))}
                    {expert.skills.length > 3 && (
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                        +{expert.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View Profile CTA */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/experts/${expert.id}`}
                  className="w-full inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  View Profile & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
