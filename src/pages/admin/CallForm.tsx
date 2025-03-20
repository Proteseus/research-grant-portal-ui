import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { callsApi, type CallForProposal } from '../../lib/api';

type CallFormData = {
  title: string;
  description: string;
  deadline: string;
  status: CallForProposal['status'];
  requirements: string;
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
};

function AdminCallForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CallFormData>();

  useEffect(() => {
    const fetchCall = async () => {
      if (!id) return;

      try {
        const call = await callsApi.getCall(id);
        reset({
          title: call.title,
          description: call.description,
          deadline: new Date(call.deadline).toISOString().split('T')[0],
          status: call.status,
          requirements: call.requirements.join('\n'),
          budgetMin: call.budget.min,
          budgetMax: call.budget.max,
          budgetCurrency: call.budget.currency,
        });
      } catch (err) {
        setError('Failed to load call details');
      }
    };

    fetchCall();
  }, [id, reset]);

  const onSubmit = async (data: CallFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const callData = {
        title: data.title,
        description: data.description,
        deadline: new Date(data.deadline).toISOString(),
        status: data.status,
        requirements: data.requirements.split('\n').filter(r => r.trim()),
        budget: {
          min: data.budgetMin,
          max: data.budgetMax,
          currency: data.budgetCurrency,
        },
      };

      if (id) {
        await callsApi.updateCall(id, callData);
      } else {
        await callsApi.createCall(callData);
      }

      navigate('/admin/calls');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save call');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Calls
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {id ? 'Edit Call for Proposals' : 'New Call for Proposals'}
          </h2>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 50,
                      message: 'Description must be at least 50 characters',
                    },
                  })}
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <div className="mt-1">
                <input
                  {...register('deadline', { required: 'Deadline is required' })}
                  type="date"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CLOSED">Closed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements (one per line)
              </label>
              <div className="mt-1">
                <textarea
                  {...register('requirements', { required: 'Requirements are required' })}
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="budgetCurrency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <div className="mt-1">
                  <select
                    {...register('budgetCurrency', { required: 'Currency is required' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  {errors.budgetCurrency && (
                    <p className="mt-1 text-sm text-red-600">{errors.budgetCurrency.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
                  Minimum Budget
                </label>
                <div className="mt-1">
                  <input
                    {...register('budgetMin', {
                      required: 'Minimum budget is required',
                      min: { value: 0, message: 'Minimum budget must be positive' },
                    })}
                    type="number"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.budgetMin && (
                    <p className="mt-1 text-sm text-red-600">{errors.budgetMin.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
                  Maximum Budget
                </label>
                <div className="mt-1">
                  <input
                    {...register('budgetMax', {
                      required: 'Maximum budget is required',
                      min: { value: 0, message: 'Maximum budget must be positive' },
                    })}
                    type="number"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.budgetMax && (
                    <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>
                  )}
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
                {isLoading ? 'Saving...' : 'Save Call'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCallForm;