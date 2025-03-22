// src/components/invoice/entry/ManualEntryForm.tsx
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CategorySelector } from './CategorySelector';
import { TagsSelector } from './TagsSelector';
import { LineItemsEditor } from './LineItemsEditor';
import Button from '../../../components/common/Button';
import { Invoice, InvoiceItem } from '../../../types/invoice.types';

interface ManualEntryFormProps {
  onSubmit: (invoice: Partial<Invoice>) => Promise<void>;
  availableCategories: string[];
  availableTags: string[];
  isSubmitting: boolean;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  merchant_name: Yup.string().required('Merchant name is required'),
  grand_total: Yup.number().required('Total amount is required').min(0, 'Amount must be positive'),
  purchase_date: Yup.date().nullable(),
  order_number: Yup.string(),
  payment_method: Yup.string(),
  status: Yup.string().required('Status is required')
});

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  onSubmit,
  availableCategories,
  availableTags,
  isSubmitting
}) => {
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  
  // Initial values
  const initialValues: Partial<Invoice> = {
    merchant_name: '',
    order_number: '',
    purchase_date: '',
    payment_method: '',
    grand_total: 0,
    status: 'Open',
    notes: '',
    categories: [],
    tags: []
  };
  
  // Handle form submission
  const handleSubmit = async (values: Partial<Invoice>) => {
    // Combine form values with line items
    const invoiceData = {
      ...values,
      items: lineItems
    };
    
    await onSubmit(invoiceData);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Invoice Manually</h2>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="merchant_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Merchant Name *
                </label>
                <Field
                  type="text"
                  id="merchant_name"
                  name="merchant_name"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter merchant name"
                />
                <ErrorMessage name="merchant_name" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
              </div>
              
              <div>
                <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Number
                </label>
                <Field
                  type="text"
                  id="order_number"
                  name="order_number"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter order number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Date
                </label>
                <Field
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="grand_total" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <Field
                    type="number"
                    id="grand_total"
                    name="grand_total"
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <ErrorMessage name="grand_total" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>
                <Field
                  type="text"
                  id="payment_method"
                  name="payment_method"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter payment method"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status *
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Resolved">Resolved</option>
                </Field>
                <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <Field
                as="textarea"
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter notes"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategorySelector
                selectedCategories={values.categories || []}
                availableCategories={availableCategories}
                onChange={(categories) => setFieldValue('categories', categories)}
              />
              
              <TagsSelector
                selectedTags={values.tags || []}
                availableTags={availableTags}
                onChange={(tags) => setFieldValue('tags', tags)}
              />
            </div>
            
            <LineItemsEditor
              items={lineItems}
              onChange={setLineItems}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Add Invoice
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};