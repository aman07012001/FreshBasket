import React from "react";

const LoadingWrapper = ({ loading, skeleton, children }) => {
  if (loading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }

    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded" />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
