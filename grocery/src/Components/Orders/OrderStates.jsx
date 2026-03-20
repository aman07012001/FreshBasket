import React from 'react';
import { Link } from 'react-router-dom';

export const OrderLoadingState = ({ message = "Loading your orders..." }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="animate-pulse">
        {}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>

        {}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="bg-gray-50 rounded-lg p-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="mt-6 flex items-center justify-center gap-3 text-gray-600">
        <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export const OrderEmptyState = ({ 
  title = "No orders yet", 
  message = "Start shopping to see your orders here. Your order history will be saved and easily accessible.",
  showActions = true,
  actions = [
    { label: "Browse Products", to: "/products", icon: "shopping" },
    { label: "View Categories", to: "/categories", icon: "categories" }
  ]
}) => {
  const getIcon = (iconType) => {
    switch(iconType) {
      case "shopping":
        return (
          <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case "categories":
        return (
          <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          {getIcon()}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">{message}</p>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {getIcon(action.icon)}
                {action.label}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500">
          Orders are automatically saved and will appear here once placed.
        </div>
      </div>
    </div>
  );
};

export const OrderErrorState = ({ 
  error = "Something went wrong",
  message = "Please try refreshing the page or contact support if the problem persists.",
  onRetry,
  showRetry = true
}) => {
  return (
    <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-1">{error}</h3>
          <p className="text-red-600 text-sm">{message}</p>
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export const OrderItemSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {}
        <div className="border-t border-gray-200 pt-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};