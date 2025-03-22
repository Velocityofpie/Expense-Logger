// src/components/common/Form/Form.tsx
import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Type for form values (could be any object structure)
 */
export type FormValues = Record<string, any>;

/**
 * Type for field errors mapping field names to error messages
 */
export type FieldErrors<T extends FormValues = FormValues> = Partial<Record<keyof T, string>>;

/**
 * Type for form submission handler
 */
export type SubmitHandler<T extends FormValues = FormValues> = (
  values: T,
  event?: React.FormEvent<HTMLFormElement>
) => void | Promise<void>;

/**
 * Interface for form context
 */
interface FormContextType<T extends FormValues = FormValues> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, isTouched: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FieldErrors<T>) => void;
  resetForm: () => void;
  submitForm: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Form props interface
 */
interface FormProps<T extends FormValues = FormValues> {
  /** Initial form values */
  initialValues: T;
  /** Form submission handler */
  onSubmit: SubmitHandler<T>;
  /** Form validation function */
  validate?: (values: T) => FieldErrors<T>;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Form children */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Form HTML attributes */
  [key: string]: any;
}

// Create context with default values (type assertion needed for initial undefined values)
const FormContext = createContext<FormContextType<any> | undefined>(undefined);

/**
 * Hook to access form context
 */
export function useFormContext<T extends FormValues = FormValues>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context as FormContextType<T>;
}

/**
 * Form component for handling form state and validation
 */
function Form<T extends FormValues>({
  initialValues,
  onSubmit,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  children,
  className = '',
  ...props
}: FormProps<T>) {
  // State for form values, errors, touched fields, and submission state
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<FieldErrors<T>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Validate form values
  const validateForm = React.useCallback(() => {
    if (!validate) return {};
    return validate(values);
  }, [validate, values]);

  // Handle form submission
  const submitForm = React.useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);

      // Validate form
      const validationErrors = validateForm();
      setErrors(validationErrors);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>);
      
      setTouched(allTouched);

      // If no errors, submit form
      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values, e);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [onSubmit, validateForm, values]
  );

  // Handle input change
  const handleChange = React.useCallback(
    (name: keyof T, value: any) => {
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));

      // Validate on change if enabled
      if (validateOnChange && validate) {
        const validationErrors = validate({
          ...values,
          [name]: value,
        });
        
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validationErrors[name],
        }));
      }
    },
    [validate, validateOnChange, values]
  );

  // Handle input blur
  const handleBlur = React.useCallback(
    (name: keyof T) => {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur && validate) {
        const validationErrors = validate(values);
        
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validationErrors[name],
        }));
      }
    },
    [validate, validateOnBlur, values]
  );

  // Set field value
  const setFieldValue = React.useCallback(
    (name: keyof T, value: any) => {
      handleChange(name, value);
    },
    [handleChange]
  );

  // Set field error
  const setFieldError = React.useCallback(
    (name: keyof T, error: string) => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = React.useCallback(
    (name: keyof T, isTouched: boolean) => {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: isTouched,
      }));
    },
    []
  );

  // Set multiple values at once
  const setMultipleValues = React.useCallback(
    (newValues: Partial<T>) => {
      setValues((prevValues) => ({
        ...prevValues,
        ...newValues,
      }));
    },
    []
  );

  // Set multiple errors at once
  const setMultipleErrors = React.useCallback(
    (newErrors: FieldErrors<T>) => {
      setErrors(newErrors);
    },
    []
  );

  // Reset form to initial values
  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Form context value
  const formContextValue = React.useMemo(
    () => ({
      values,
      errors,
      touched,
      isSubmitting,
      handleChange,
      handleBlur,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setValues: setMultipleValues,
      setErrors: setMultipleErrors,
      resetForm,
      submitForm,
    }),
    [
      values,
      errors,
      touched,
      isSubmitting,
      handleChange,
      handleBlur,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setMultipleValues,
      setMultipleErrors,
      resetForm,
      submitForm,
    ]
  );

  return (
    <FormContext.Provider value={formContextValue}>
      <form
        onSubmit={submitForm}
        className={className}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export default Form;