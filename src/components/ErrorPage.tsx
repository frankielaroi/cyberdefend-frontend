import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as unknown;

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <span className="text-2xl font-bold text-red-600">{error.status}</span>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {error.statusText || 'Something went wrong'}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error.data?.message || 'An unexpected error occurred while trying to display this page.'}
              </p>
              <div className="mt-6 space-y-4">
                <Link
                  to="/"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-route error
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <span className="text-2xl font-bold text-red-600">Error</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Unexpected Error</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{String((error as Error)?.message || 'An unexpected error occurred.')}</p>
            <div className="mt-6 space-y-4">
              <Link
                to="/"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
