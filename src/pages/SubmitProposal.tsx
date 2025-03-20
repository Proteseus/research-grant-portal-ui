import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { proposalsApi, callsApi, type CallForProposal } from '../lib/api';

type SubmitProposalForm = {
  title: string;
  abstract: string;
  budget: number;
  document: FileList;
};

function SubmitProposal() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallForProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmitProposalForm>();

  const budget = watch('budget');

  useEffect(() => {
    const fetchCall = async () => {
      if (!callId) return;
      try {
        const data = await callsApi.getCall(callId);
        setCall(data);
      } catch (err) {
        setError('Failed to load call details');
      }
    };

    fetchCall();
  }, [callId]);

  const onSubmit = async (data: SubmitProposalForm) => {
    if (!callId) return;
  
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Add all fields as strings
      formData.append('title', String(data.title));
      formData.append('abstract', String(data.abstract));
      formData.append('callId', String(callId));
      formData.append('status', 'DRAFT');
  
      // Add the file last
      if (data.document?.[0]) {
        formData.append('document', data.document[0]);
      }
  
      // Debug log
      console.log('Sending FormData:');
      for (const [key, value] of formData.entries()) {
        console.log(key, ':', value instanceof File ? value.name : value);
      }
  
      const proposal = await proposalsApi.createProposal(formData);
      navigate(`/proposals/${proposal.id}`);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit proposal');
    } finally {
      setIsLoading(false);
    }
  };

  if (!call) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
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
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Proposal</h2>

          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">{call.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{call.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Budget Range: {call.budget?.currency} {call.budget?.min.toLocaleString()} - {call.budget?.max.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Deadline: {new Date(call.deadline).toLocaleDateString()}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Proposal Title
              </label>
              <div className="mt-1">
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                Abstract
              </label>
              <div className="mt-1">
                <textarea
                  {...register('abstract', {
                    required: 'Abstract is required',
                    minLength: {
                      value: 100,
                      message: 'Abstract must be at least 100 characters',
                    },
                  })}
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.abstract && (
                  <p className="mt-1 text-sm text-red-600">{errors.abstract.message}</p>
                )}
              </div>
            </div>
{/* 
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Requested Budget ({call.budget?.currency})
              </label>
              <div className="mt-1">
                <input
                  {...register('budget', {
                    required: 'Budget is required',
                    min: {
                      value: call.budget.min,
                      message: `Minimum budget is ${call.budget.currency} ${call.budget.min.toLocaleString()}`,
                    },
                    max: {
                      value: call.budget.max,
                      message: `Maximum budget is ${call.budget.currency} ${call.budget.max.toLocaleString()}`,
                    },
                  })}
                  type="number"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
                {budget && (
                  <p className="mt-1 text-sm text-gray-500">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: call.budget?.currency,
                    }).format(budget)}
                  </p>
                )}
              </div>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Documents
              </label>
              <div className="mt-1">
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="document"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload file</span>
                        <input
                          {...register('document', { required: 'At least one file is required' })}
                          id="document"
                          type="file"
                          accept='.pdf'
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF up to 5MB
                    </p>
                    {watch('document')?.length > 0 && (
                      <div className="mt-2 text-sm text-gray-700">
                        {Array.from(watch('document')).map((file, index) => (
                          <div key={index} className="flex items-center">
                            <span>{file.name}</span>
                            <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.document && (
                      <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitProposal;