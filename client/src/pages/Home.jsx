import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Zap } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-6">
            Sprint 1 Active Foundation
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-tight">
            Connect with Experts. <br />
            <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Elevate Your Career.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 sm:text-xl">
            Mentora is the premier platform matching learners with industry-leading mentors. Get personalized advice, structured learning, and mock interviews.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Join as Mentee / Expert
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Authentication</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              JWT-based secure login, encrypted password storage with bcrypt, and secure middleware routing.
            </p>
          </div>
          <div className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Role-Based Access</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tailored workspaces for Mentees (USER), Experts (EXPERT), and Administrators (ADMIN) with route guards.
            </p>
          </div>
          <div className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Neon PostgreSQL Storage</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              High-performance serverless SQL database with automated connection pools, migration tracking, and Prisma types.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
