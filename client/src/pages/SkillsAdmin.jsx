import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

const SkillsAdmin = () => {
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await api.get('/skills');
      setSkills(response.data.skills);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load skills list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error('Skill name cannot be empty.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post('/skills', { name: newSkillName.trim() });
      toast.success(response.data.message || 'Skill added successfully!');
      setNewSkillName('');
      fetchSkills(); // Reload list
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to add skill.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill? It will be removed from all associated expert profiles.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.delete(`/skills/${id}`);
      toast.success(response.data.message || 'Skill deleted successfully!');
      fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to delete skill.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Skills Management</h2>
            <p className="text-sm text-slate-500">Add, edit, or remove skills tags available on the platform</p>
          </div>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex gap-4">
          <input
            type="text"
            placeholder="e.g. React, Node.js, AWS Cloud, System Design"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            disabled={actionLoading}
            className="block w-full rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
          >
            {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 mr-1" />}
            Add
          </button>
        </form>
      </div>

      {/* Skills list */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950 mb-4">Existing Skills ({skills.length})</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No skills tags have been defined yet. Define one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-slate-300 transition"
              >
                <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  disabled={actionLoading}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Delete Skill"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsAdmin;
