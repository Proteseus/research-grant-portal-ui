import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { authApi } from '../lib/api';

function VerifyUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = new URLSearchParams(window.location.search).get('token');

  React.useEffect(() => {
    const verifyUser = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError(null);
      try {
        await authApi.verifyUser(token);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify user');
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Verifying your account...
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="mt-4 text-sm text-red-600">{error}</div>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-4 text-sm text-green-600">Account verified successfully!</div>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default VerifyUser;