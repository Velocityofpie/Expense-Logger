// src/features/payment/CardForm.tsx
import React, { useState } from 'react';
import { CardFormState } from './types';

interface CardFormProps {
  onSubmit: (formData: CardFormState) => void;
  onCancel?: () => void;
  initialData?: Partial<CardFormState>;
  isSubmitting?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  // Initialize form state with initial data or defaults
  const [formData, setFormData] = useState<CardFormState>({
    card_name: initialData?.card_name || '',
    card_type: initialData?.card_type || '',
    last_four: initialData?.last_four || '',
    expiration_month: initialData?.expiration_month || '',
    expiration_year: initialData?.expiration_year || ''
  });

  // Form validation state
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormState, string>>>({});

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name as keyof CardFormState]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // Validate the form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CardFormState, string>> = {};
    
    // Validate card name
    if (!formData.card_name.trim()) {
      newErrors.card_name = 'Card name is required';
    }
    
    // Validate last four digits
    if (formData.last_four) {
      if (formData.last_four.length !== 4 || !/^\d{4}$/.test(formData.last_four)) {
        newErrors.last_four = 'Last four digits must be exactly 4 numbers';
      }
    }
    
    // Validate expiration date if either field is filled
    if (formData.expiration_month || formData.expiration_year) {
      if (!formData.expiration_month) {
        newErrors.expiration_month = 'Expiration month is required';
      }
      
      if (!formData.expiration_year) {
        newErrors.expiration_year = 'Expiration year is required';
      }
    }
    
    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Generate options for months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const value = String(month).padStart(2, '0');
    return (
      <option key={value} value={value}>
        {value}
      </option>
    );
  });

  // Generate options for years (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Name
        </label>
        <input
          type="text"
          id="card_name"
          name="card_name"
          value={formData.card_name}
          onChange={handleChange}
          placeholder="e.g., Chase Freedom, Amex Gold"
          className={`w-full px-3 py-2 border ${
            errors.card_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.card_name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.card_name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter a descriptive name for this card.
        </p>
      </div>

      <div>
        <label htmlFor="card_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Type
        </label>
        <select
          id="card_type"
          name="card_type"
          value={formData.card_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select card type</option>
          <option value="visa">Visa</option>
          <option value="mastercard">Mastercard</option>
          <option value="amex">American Express</option>
          <option value="discover">Discover</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="last_four" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Last Four Digits
        </label>
        <input
          type="text"
          id="last_four"
          name="last_four"
          value={formData.last_four}
          onChange={handleChange}
          placeholder="1234"
          maxLength={4}
          className={`w-full px-3 py-2 border ${
            errors.last_four ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.last_four && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_four}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter only the last 4 digits of your card.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiration_month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Month
          </label>
          <select
            id="expiration_month"
            name="expiration_month"
            value={formData.expiration_month}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.expiration_month ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
          >
            <option value="">Month</option>
            {monthOptions}
          </select>
          {errors.expiration_month && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiration_month}</p>
          )}
        </div>

        <div>
          <label htmlFor="expiration_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Year
          </label>
          <select
            id="expiration_year"
            name="expiration_year"
            value={formData.expiration_year}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.expiration_year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
          >
            <option value="">Year</option>
            {yearOptions}
          </select>
          {errors.expiration_year && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiration_year}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Card'}
        </button>
      </div>
    </form>
  );
};

export default CardForm;