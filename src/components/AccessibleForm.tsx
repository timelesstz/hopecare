import React, { useState, useRef, useEffect } from 'react';
import './AccessibleForm.css';

interface FormField {
  /**
   * Unique identifier for the field
   */
  id: string;
  
  /**
   * Field label
   */
  label: string;
  
  /**
   * Field type (text, email, password, etc.)
   */
  type: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Field placeholder
   */
  placeholder?: string;
  
  /**
   * Field validation pattern
   */
  pattern?: string;
  
  /**
   * Field validation message
   */
  validationMessage?: string;
  
  /**
   * Field help text
   */
  helpText?: string;
  
  /**
   * Field options (for select, radio, checkbox)
   */
  options?: Array<{ value: string; label: string }>;
  
  /**
   * Field autocomplete attribute
   */
  autocomplete?: string;
}

interface AccessibleFormProps {
  /**
   * Form title
   */
  title: string;
  
  /**
   * Form fields
   */
  fields: FormField[];
  
  /**
   * Form submit handler
   */
  onSubmit: (data: Record<string, any>) => void;
  
  /**
   * Submit button text
   */
  submitText?: string;
  
  /**
   * Cancel button text
   */
  cancelText?: string;
  
  /**
   * Cancel button handler
   */
  onCancel?: () => void;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Whether to show validation errors on submit only
   */
  validateOnSubmitOnly?: boolean;
  
  /**
   * Initial form values
   */
  initialValues?: Record<string, any>;
}

/**
 * AccessibleForm component that follows accessibility best practices
 * 
 * Features:
 * - Proper label associations
 * - Error messages with aria-live regions
 * - Required field indicators
 * - Help text with aria-describedby
 * - Keyboard navigation
 * - Focus management
 * - Live validation feedback
 */
const AccessibleForm: React.FC<AccessibleFormProps> = ({
  title,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  className = '',
  validateOnSubmitOnly = false,
  initialValues = {},
}) => {
  // State for form values
  const [values, setValues] = useState<Record<string, any>>(() => {
    // Initialize with provided initial values
    const initialState: Record<string, any> = {};
    fields.forEach(field => {
      initialState[field.id] = initialValues[field.id] || '';
    });
    return initialState;
  });
  
  // State for touched fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Ref for the first input field
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the first input field on mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);
  
  // Handle input change
  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
    
    // Validate field if it's already been touched
    if (touched[id] && !validateOnSubmitOnly) {
      validateField(id, value);
    }
  };
  
  // Handle input blur
  const handleBlur = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
    
    // Validate field on blur
    if (!validateOnSubmitOnly) {
      validateField(id, values[id]);
    }
  };
  
  // Validate a single field
  const validateField = (id: string, value: any): boolean => {
    const field = fields.find(f => f.id === id);
    if (!field) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (field.required && (value === '' || value === null || value === undefined)) {
      isValid = false;
      errorMessage = `${field.label} is required`;
    }
    
    // Pattern validation
    if (isValid && field.pattern && typeof value === 'string' && !new RegExp(field.pattern).test(value)) {
      isValid = false;
      errorMessage = field.validationMessage || `${field.label} is invalid`;
    }
    
    // Email validation
    if (isValid && field.type === 'email' && typeof value === 'string' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [id]: isValid ? '' : errorMessage,
    }));
    
    return isValid;
  };
  
  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    fields.forEach(field => {
      newTouched[field.id] = true;
      const fieldIsValid = validateField(field.id, values[field.id]);
      if (!fieldIsValid) {
        isValid = false;
        newErrors[field.id] = errors[field.id] || `${field.label} is invalid`;
      }
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      onSubmit(values);
    } else {
      // Focus the first field with an error
      const firstErrorField = fields.find(field => errors[field.id]);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField.id);
        if (errorElement) {
          errorElement.focus();
        }
      }
    }
  };
  
  // Render a form field
  const renderField = (field: FormField, index: number) => {
    const {
      id,
      label,
      type,
      required = false,
      placeholder = '',
      helpText,
      options,
      autocomplete,
    } = field;
    
    const value = values[id];
    const error = touched[id] ? errors[id] : '';
    const hasError = !!error;
    
    // Generate unique IDs for accessibility
    const fieldId = `field-${id}`;
    const helpId = helpText ? `help-${id}` : undefined;
    const errorId = `error-${id}`;
    
    // Determine aria-describedby value
    const describedBy = [
      helpId,
      hasError ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined;
    
    // Common props for input elements
    const inputProps = {
      id: fieldId,
      name: id,
      required,
      'aria-required': required,
      'aria-invalid': hasError,
      'aria-describedby': describedBy,
      placeholder,
      autoComplete: autocomplete,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleChange(id, e.target.value),
      onBlur: () => handleBlur(id),
      ref: index === 0 ? firstInputRef : undefined,
    };
    
    // Render different field types
    switch (type) {
      case 'select':
        return (
          <div className={`form-field ${hasError ? 'has-error' : ''}`} key={id}>
            <label htmlFor={fieldId}>
              {label}
              {required && <span className="required-indicator" aria-hidden="true"> *</span>}
            </label>
            
            <select
              {...inputProps}
              value={value}
            >
              <option value="">Select an option</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {helpText && (
              <div id={helpId} className="help-text">
                {helpText}
              </div>
            )}
            
            {hasError && (
              <div id={errorId} className="error-message" aria-live="polite">
                {error}
              </div>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className={`form-field ${hasError ? 'has-error' : ''}`} key={id}>
            <label htmlFor={fieldId}>
              {label}
              {required && <span className="required-indicator" aria-hidden="true"> *</span>}
            </label>
            
            <textarea
              {...inputProps}
              value={value}
            />
            
            {helpText && (
              <div id={helpId} className="help-text">
                {helpText}
              </div>
            )}
            
            {hasError && (
              <div id={errorId} className="error-message" aria-live="polite">
                {error}
              </div>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className={`form-field ${hasError ? 'has-error' : ''}`} key={id}>
            <fieldset>
              <legend>
                {label}
                {required && <span className="required-indicator" aria-hidden="true"> *</span>}
              </legend>
              
              <div className="radio-group">
                {options?.map(option => (
                  <div className="radio-option" key={option.value}>
                    <input
                      type="radio"
                      id={`${fieldId}-${option.value}`}
                      name={id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => handleChange(id, option.value)}
                      onBlur={() => handleBlur(id)}
                      required={required}
                      aria-describedby={describedBy}
                    />
                    <label htmlFor={`${fieldId}-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              
              {helpText && (
                <div id={helpId} className="help-text">
                  {helpText}
                </div>
              )}
              
              {hasError && (
                <div id={errorId} className="error-message" aria-live="polite">
                  {error}
                </div>
              )}
            </fieldset>
          </div>
        );
        
      case 'checkbox':
        if (options) {
          // Multiple checkboxes
          return (
            <div className={`form-field ${hasError ? 'has-error' : ''}`} key={id}>
              <fieldset>
                <legend>
                  {label}
                  {required && <span className="required-indicator" aria-hidden="true"> *</span>}
                </legend>
                
                <div className="checkbox-group">
                  {options.map(option => (
                    <div className="checkbox-option" key={option.value}>
                      <input
                        type="checkbox"
                        id={`${fieldId}-${option.value}`}
                        name={id}
                        value={option.value}
                        checked={Array.isArray(value) && value.includes(option.value)}
                        onChange={(e) => {
                          const newValue = Array.isArray(value) ? [...value] : [];
                          if (e.target.checked) {
                            newValue.push(option.value);
                          } else {
                            const index = newValue.indexOf(option.value);
                            if (index !== -1) {
                              newValue.splice(index, 1);
                            }
                          }
                          handleChange(id, newValue);
                        }}
                        onBlur={() => handleBlur(id)}
                        aria-describedby={describedBy}
                      />
                      <label htmlFor={`${fieldId}-${option.value}`}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                {helpText && (
                  <div id={helpId} className="help-text">
                    {helpText}
                  </div>
                )}
                
                {hasError && (
                  <div id={errorId} className="error-message" aria-live="polite">
                    {error}
                  </div>
                )}
              </fieldset>
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className={`form-field checkbox-field ${hasError ? 'has-error' : ''}`} key={id}>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id={fieldId}
                  name={id}
                  checked={!!value}
                  onChange={(e) => handleChange(id, e.target.checked)}
                  onBlur={() => handleBlur(id)}
                  required={required}
                  aria-describedby={describedBy}
                  aria-invalid={hasError}
                />
                <label htmlFor={fieldId}>
                  {label}
                  {required && <span className="required-indicator" aria-hidden="true"> *</span>}
                </label>
              </div>
              
              {helpText && (
                <div id={helpId} className="help-text">
                  {helpText}
                </div>
              )}
              
              {hasError && (
                <div id={errorId} className="error-message" aria-live="polite">
                  {error}
                </div>
              )}
            </div>
          );
        }
        
      default:
        // Default to text input
        return (
          <div className={`form-field ${hasError ? 'has-error' : ''}`} key={id}>
            <label htmlFor={fieldId}>
              {label}
              {required && <span className="required-indicator" aria-hidden="true"> *</span>}
            </label>
            
            <input
              {...inputProps}
              type={type}
              value={value}
              pattern={field.pattern}
            />
            
            {helpText && (
              <div id={helpId} className="help-text">
                {helpText}
              </div>
            )}
            
            {hasError && (
              <div id={errorId} className="error-message" aria-live="polite">
                {error}
              </div>
            )}
          </div>
        );
    }
  };
  
  return (
    <div className={`accessible-form-container ${className}`}>
      <form className="accessible-form" onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">{title}</h2>
        
        <div className="form-fields">
          {fields.map(renderField)}
        </div>
        
        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          
          <button 
            type="submit" 
            className="submit-button"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccessibleForm; 