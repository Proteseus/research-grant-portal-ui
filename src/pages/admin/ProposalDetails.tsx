import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, FileText, Clock, AlertCircle, Download } from 'lucide-react';
import { proposalsApi, type Proposal, type ProposalRevision } from '../../lib/api';

type StatusUpdateForm = {
  status: Proposal['status'];
  rejectionReason?: string;
  revisionRequirements?: string;
};

function AdminProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [revisions, setRevisions] = useState<ProposalRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StatusUpdateForm>();

  const selectedStatus = watch('status');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [proposalData, revisionsData] = await Promise.all([
          proposalsApi.getProposal(id),
          proposalsApi.getRevisions(id),
        ]);
        setProposal(proposalData);
        setRevisions(revisionsData);
      } catch (err) {
        setError('Failed to load proposal details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const onSubmit = async (data: StatusUpdateForm) => {
    if (!id) return;

    setIsUpdating(true);
    setError(null);
    try {
      const updatedProposal = await proposalsApi.updateProposalStatus(id, {
        status: data.status,
        rejectionReason: data.rejectionReason,
        revisionRequirements: data.revisionRequirements,
      });
      setProposal(updatedProposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (error || !proposal) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error || 'Proposal not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Proposals
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{proposal.title}</h1>
              <div className="mt-1 flex items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                  {proposal.status.replace(/_/g, ' ')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-lg font-medium text-gray-900">Abstract</h2>
            <p className="mt-2 text-gray-500">{proposal.abstract}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Budget</h2>
            <p className="mt-2 text-gray-500">
              Requested Amount: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(proposal.budget)}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            <div className="mt-2">
              {proposal.documentUrl && (
                <a
                  href={`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${proposal.documentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Proposal Document</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Download className="h-5 w-5 text-gray-400" />
                  </div>
                </a>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Update Status</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    {...register('status', { required: 'Status is required' })}
                    defaultValue={proposal.status}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REVISIONS_REQUESTED">Revisions Requested</option>
                  </select>
                </div>
              </div>

              {selectedStatus === 'REJECTED' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                    Rejection Reason
                  </label>
                  <div className="mt-1">
                    <textarea
                      {...register('rejectionReason', {
                        required: 'Please provide a reason for rejection',
                      })}
                      rows={4}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.rejectionReason && (
                      <p className="mt-1 text-sm text-red-600">{errors.rejectionReason.message}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedStatus === 'REVISIONS_REQUESTED' && (
                <div>
                  <label htmlFor="revisionRequirements" className="block text-sm font-medium text-gray-700">
                    Revision Requirements
                  </label>
                  <div className="mt-1">
                    <textarea
                      {...register('revisionRequirements', {
                        required: 'Please specify what revisions are needed',
                      })}
                      rows={4}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.revisionRequirements && (
                      <p className="mt-1 text-sm text-red-600">{errors.revisionRequirements.message}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>

          {revisions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Revision History</h2>
              <div className="mt-4 space-y-4">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Submitted on {new Date(revision.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{revision.changes}</p>
                    {revision.documentUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Updated Document</h4>
                        <div className="mt-2">
                          <a
                            href={`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${revision.documentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProposalDetails;