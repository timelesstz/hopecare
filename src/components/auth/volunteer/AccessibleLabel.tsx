import React from 'react';

interface AccessibleLabelProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
}

const AccessibleLabel: React.FC<AccessibleLabelProps> = ({
  id,
  label,
  required = false,
  description,
  error
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-rose-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {description && (
        <span
          id={`${id}-description`}
          className="text-sm text-gray-500 mt-1"
        >
          {description}
        </span>
      )}
      {error && (
        <span
          id={`${id}-error`}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default AccessibleLabel;