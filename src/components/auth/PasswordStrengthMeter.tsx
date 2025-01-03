import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthText = () => {
    const strength = calculateStrength();
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Very Weak', color: 'bg-red-500' };
      case 2:
        return { text: 'Weak', color: 'bg-orange-500' };
      case 3:
        return { text: 'Medium', color: 'bg-yellow-500' };
      case 4:
        return { text: 'Strong', color: 'bg-green-500' };
      case 5:
        return { text: 'Very Strong', color: 'bg-green-600' };
      default:
        return { text: 'Very Weak', color: 'bg-red-500' };
    }
  };

  const strength = getStrengthText();
  const percentage = (calculateStrength() / 5) * 100;

  return (
    <div className="mt-1">
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full ${strength.color} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs">
        <span className="text-gray-500">{strength.text}</span>
        <span className="text-gray-500">
          {password && 'Requirements: 8+ chars, uppercase, lowercase, number, special char'}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;