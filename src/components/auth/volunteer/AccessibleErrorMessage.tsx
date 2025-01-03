import React from 'react';

interface AccessibleErrorMessageProps {
  id: string;
  message: string;
}

const AccessibleErrorMessage: React.FC<AccessibleErrorMessageProps> = ({
  id,
  message
}) => {
  return (
    <div
      id={`${id}-error`}
      role="alert"
      aria-live="polite"
      className="mt-1 text-sm text-red-600"
    >
      {message}
    </div>
  );
};

export default AccessibleErrorMessage;