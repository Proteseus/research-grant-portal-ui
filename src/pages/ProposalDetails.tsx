import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Download, Upload } from 'lucide-react';
import { proposalsApi, type Proposal, type ProposalRevision } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { useForm } from 'react-hook-form';

type RevisionForm = {
  changes: string;
  documents: FileList;
};

function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [revisions, setRevisions] = useState<ProposalRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevisionForm>();

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

  const onSubmitRevision = async (data: RevisionForm) => {
    if (!id) return;

    setIsSubmittingRevision(true);
    try {
      const revision = await proposalsApi.createRevision(id, {
        changes: data.changes,
        // TODO: Handle file uploads
      });
      setRevisions([revision, ...revisions]);
      reset();
    } catch (err) {
      setError('Failed to submit revision');
    } finally {
      setIsSubmittingRevision(false);
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
            {proposal.status === 'DRAFT' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => {/* Handle delete */}}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => {/* Handle submit */}}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Proposal
                </button>
              </div>
            )}
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
              }).format(proposal?.budget)}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            <div className="mt-2">
              {proposal.documentUrl && (
                <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                  <a href={`${import.meta.env.VITE_API_URL}${proposal.documentUrl.replace('/api/v1', '')}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">Proposal Document</p>
                    </a>
                  </div>
                  <div className="flex-shrink-0">
                    <Download className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {proposal.status === 'REVISIONS_REQUESTED' && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Submit Revision</h2>
              <form onSubmit={handleSubmit(onSubmitRevision)} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="changes" className="block text-sm font-medium text-gray-700">
                    Changes Made
                  </label>
                  <div className="mt-1">
                    <textarea
                      {...register('changes', {
                        required: 'Please describe the changes made',
                        minLength: {
                          value: 50,
                          message: 'Please provide more detail about the changes',
                        },
                      })}
                      rows={4}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.changes && (
                      <p className="mt-1 text-sm text-red-600">{errors.changes.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Updated Documents
                  </label>
                  <div className="mt-1">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="documents"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload files</span>
                            <input
                              {...register('documents')}
                              id="documents"
                              type="file"
                              multiple
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingRevision}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmittingRevision ? 'Submitting...' : 'Submit Revision'}
                  </button>
                </div>
              </form>
            </div>
          )}

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
                            href={`${import.meta.env.VITE_API_URL}${revision.documentUrl.replace('/api/v1', '')}`}
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

export default ProposalDetails;