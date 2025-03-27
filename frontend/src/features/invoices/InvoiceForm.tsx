// InvoiceForm.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Select, Button, Textarea } from '../shared';
import { LineItemEditor } from './';
import { addInvoiceEntry } from './invoicesApi';
import { LineItem, InvoiceFormData } from './types';

interface InvoiceFormProps {
  onSuccess: () => void;
  availableCategories: string[];
  availableTags: string[];
  initialData?: Partial<InvoiceFormData>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  onSuccess, 
  availableCategories, 
  availableTags,
  initialData 
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    merchant_name: initialData?.merchant_name || '',
    order_number: initialData?.order_number || '',
    purchase_date: initialData?.purchase_date || '',
    payment_method: initialData?.payment_method || '',
    grand_total: initialData?.grand_total || '',
    status: initialData?.status || 'Open',
    notes: initialData?.notes || '',
    items: initialData?.items || [],
    tags: initialData?.tags || [],
    categories: initialData?.categories || [],
    shipping_handling: initialData?.shipping_handling || '',
    estimated_tax: initialData?.estimated_tax || '',
    billing_address: initialData?.billing_address || ''
  });
  
  const [items, setItems] = useState<LineItem[]>(initialData?.items || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle multiple select for tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions, 
      option => option.value
    );
    setFormData({
      ...formData,
      tags: selectedOptions
    });
  };
  
  // Handle multiple select for categories
  const handleCategoriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions, 
      option => option.value
    );
    setFormData({
      ...formData,
      categories: selectedOptions
    });
  };
  
  // Handle line items changes
  const handleItemsChange = (updatedItems: LineItem[]) => {
    setItems(updatedItems);
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.merchant_name) {
      setError('Please enter a merchant name.');
      return;
    }
    
    if (!formData.grand_total) {
      setError('Please enter an amount.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare data for submission
      const invoiceData = {
        ...formData,
        items: items
      };
      
      await addInvoiceEntry(invoiceData);
      
      // Call success callback
      onSuccess();
      
    } catch (error) {
      console.error('Error adding invoice:', error);
      setError('Failed to add invoice. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Basic Information</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant Name*
              </label>
              <Input
                type="text"
                name="merchant_name"
                value={formData.merchant_name}
                onChange={handleInputChange}
                placeholder="Enter merchant name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <Input
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleInputChange}
                placeholder="Enter order number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <Input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount*
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  name="grand_total"
                  value={formData.grand_total}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-7"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <Input
                type="text"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                placeholder="Enter payment method"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Open">Open</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter notes"
                rows={3}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Line Items</h3>
        </CardHeader>
        <CardBody>
          <LineItemEditor 
            items={items} 
            onChange={handleItemsChange} 
          />
          <div className="mt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setItems([...items, {
                product_name: '',
                quantity: 1,
                unit_price: 0
              }])}
            >
              Add Line Item
            </Button>
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Categories & Tags</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <Select
                multiple
                name="categories"
                value={formData.categories}
                onChange={handleCategoriesChange}
                className="h-32"
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple categories
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <Select
                multiple
                name="tags"
                value={formData.tags}
                onChange={handleTagsChange}
                className="h-32"
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple tags
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Saving..."
          disabled={isSubmitting}
        >
          Save Invoice
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;