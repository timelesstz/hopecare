import React from 'react';

interface AccessibleCheckboxProps {
  id: string;
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  name,
  checked,
  onChange,
  description
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
          aria-describedby={description ? `${id}-description` : undefined}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p
            id={`${id}-description`}
            className="text-gray-500"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccessibleCheckbox;