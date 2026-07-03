import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, ShieldAlert, Award, Server } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [adminResponse, setAdminResponse] = useState('');
  const [expertResponse, setExpertResponse] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [expertLoading, setExpertLoading] = useState(false);

  const testAdminRoute = async () => {
    setAdminLoading(true);
    setAdminResponse('');
    try {
      const res = await api.get('/auth/admin-only');
      setAdminResponse({ success: true, message: res.data.message });
      toast.success('Authorized access to Admin API!');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to call API';
      setAdminResponse({ success: false, message: `${err.response?.status} ${err.response?.statusText}: ${errMsg}` });
      toast.error(`Access Denied: ${errMsg}`);
    } finally {
      setAdminLoading(false);
    }
  };

  const testExpertRoute = async () => {
    setExpertLoading(true);
    setExpertResponse('');
    try {
      const res = await api.get('/auth/expert-only');
      setExpertResponse({ success: true, message: res.data.message });
      toast.success('Authorized access to Expert API!');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to call API';
      setExpertResponse({ success: false, message: `${err.response?.status} ${err.response?.statusText}: ${errMsg}` });
      toast.error(`Access Denied: ${errMsg}`);
    } finally {
      setExpertLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EXPERT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider mb-1 ${getRoleBadgeColor(user.role)}`}>
              {user.role} Dashboard
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, {user.name}!</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Server className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">Session Secure (JWT)</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-950 mb-6">Sprint 1 Authorization Validation Tools</h3>

      {/* Auth Testing API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expert Route Testing */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 mb-4">
              <Award className="h-6 w-6" />
              <h4 className="font-extrabold text-slate-900 text-lg">Expert-Only API Endpoint</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Tests access to <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/auth/expert-only</code>. <br />
              Authorized roles: <span className="font-bold text-slate-700">EXPERT</span>, <span className="font-bold text-slate-700">ADMIN</span>.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={testExpertRoute}
              disabled={expertLoading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition disabled:opacity-50 cursor-pointer"
            >
              {expertLoading ? 'Calling API...' : 'Call Expert API'}
            </button>

            {expertResponse && (
              <div className={`p-4 rounded-xl text-sm border ${expertResponse.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="font-semibold mb-1">{expertResponse.success ? 'Success (200 OK)' : 'Error response'}</div>
                <div className="font-mono text-xs break-all">{expertResponse.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Route Testing */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 mb-4">
              <ShieldAlert className="h-6 w-6" />
              <h4 className="font-extrabold text-slate-900 text-lg">Admin-Only API Endpoint</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Tests access to <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/auth/admin-only</code>. <br />
              Authorized roles: <span className="font-bold text-slate-700">ADMIN</span>.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={testAdminRoute}
              disabled={adminLoading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer"
            >
              {adminLoading ? 'Calling API...' : 'Call Admin API'}
            </button>

            {adminResponse && (
              <div className={`p-4 rounded-xl text-sm border ${adminResponse.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="font-semibold mb-1">{adminResponse.success ? 'Success (200 OK)' : 'Error response'}</div>
                <div className="font-mono text-xs break-all">{adminResponse.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
