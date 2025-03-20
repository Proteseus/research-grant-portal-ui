import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertCircle, Plus, Filter } from 'lucide-react';
import { callsApi, proposalsApi, type CallForProposal, type Proposal } from '../lib/api';
import { useAuthStore } from '../store/auth';

function Proposals() {
  const { user } = useAuthStore();
  const [calls, setCalls] = useState<CallForProposal[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'calls' | 'proposals'>('calls');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [callsData, proposalsData] = await Promise.all([
          callsApi.getCalls(),
          proposalsApi.getProposals(),
        ]);
        setCalls(callsData);
        setProposals(proposalsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: Proposal['status']) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REVISIONS_REQUESTED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Research Proposals</h1>
        <div className="flex space-x-4">
          {user?.role === 'ADMIN' && (
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/calls/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Call
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'calls'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calls for Proposals
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'proposals'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Proposals
          </button>
        </nav>
      </div>

      {activeTab === 'calls' ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {calls.data.map((call) => (
            <div
              key={call.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{call.title}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        call.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        call.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{call.description}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Budget: {call.budget?.currency} {call.budget?.min.toLocaleString()} - {call.budget?.max.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/proposals/submit/${call.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Proposal
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {calls.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Calls</h3>
              <p className="mt-1 text-sm text-gray-500">There are no active calls for proposals at the moment.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.data.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{proposal.abstract}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-500">
                    Budget: ${proposal.budget?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-4">
                  {proposal.status === 'DRAFT' && (
                    <button
                      onClick={() => {/* Handle delete */}}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  )}
                  <Link
                    to={`/proposals/${proposal.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Proposals</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't submitted any proposals yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Proposals;