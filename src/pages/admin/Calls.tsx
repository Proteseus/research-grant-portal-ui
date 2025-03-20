import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Plus, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { callsApi, type CallForProposal } from '../../lib/api';

function AdminCalls() {
  const [calls, setCalls] = useState<CallForProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await callsApi.getCalls();
        setCalls(data);
      } catch (err) {
        setError('Failed to load calls');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this call?')) return;

    try {
      await callsApi.deleteCall(id);
      setCalls(calls.filter(call => call.id !== id));
    } catch (err) {
      setError('Failed to delete call');
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">Calls for Proposals</h1>
        <Link
          to="/admin/calls/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Call
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {calls.data.map((call) => (
          <div
            key={call.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Megaphone className="h-5 w-5 text-gray-400" />
                    <h3 className="ml-2 text-lg font-medium text-gray-900">{call.title}</h3>
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
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>Budget: {call.budget?.currency} {call.budget?.min.toLocaleString()} - {call.budget?.max.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => handleDelete(call.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <Link
                  to={`/admin/calls/${call.id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}

        {calls.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Calls</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new call for proposals.</p>
            <div className="mt-6">
              <Link
                to="/admin/calls/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Call
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCalls;