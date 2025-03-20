import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { proposalsApi, type CallForProposal, type DashboardStats } from '../lib/api';

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeCalls, setActiveCalls] = useState<CallForProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, callsData] = await Promise.all([
          proposalsApi.getDashboardStats(),
          proposalsApi.getCalls(),
        ]);
        setStats(statsData);
        setActiveCalls(callsData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  const statItems = [
    { name: 'Active Calls', value: stats?.activeCalls || 0, icon: Clock },
    { name: 'Submitted Proposals', value: stats?.submittedProposals || 0, icon: FileText },
    { name: 'Accepted Proposals', value: stats?.acceptedProposals || 0, icon: CheckCircle },
    { name: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: AlertCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Calls Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Active Calls for Proposals</h2>
          <Link
            to="/proposals"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-5 grid-cols-1 sm:grid-cols-2">
          {activeCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{call.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{call.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/proposals/submit/${call.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeCalls.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No active calls for proposals at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;