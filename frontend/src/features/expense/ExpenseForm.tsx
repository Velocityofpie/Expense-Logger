// ExpenseForm.tsx
// Form component for adding or editing expenses
import React, { useState } from 'react';
import { formatCurrency } from './expenseHelpers';

interface Product {
  name: string;
  price: number;
  quantity: number;
  item_type?: string;
}

interface ExpenseFormProps {
  onSubmit: (formData: any) => void;
  categories: string[];
  creditCardOptions: string[];
  isLoading: boolean;
  initialData?: {
    id?: number;
    store: string;
    category: string;
    creditCard: string;
    date?: string;
    orderNumber?: string;
    total: number;
    products: Product[];
  };
  isEditing?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  categories,
  creditCardOptions,
  isLoading,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    store: initialData?.store || '',
    category: initialData?.category || (categories && categories.length > 0 ? categories[0] : ''),
    creditCard: initialData?.creditCard || (creditCardOptions && creditCardOptions.length > 0 ? creditCardOptions[0] : ''),
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    orderNumber: initialData?.orderNumber || '',
    total: initialData?.total || 0,
    products: initialData?.products || []
  });
  
  // Local state for the current product being added
  const [currentProduct, setCurrentProduct] = useState<Product>({
    name: '',
    price: 0,
    quantity: 1,
    item_type: ''
  });

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert to number if appropriate
    const parsedValue = ['total'].includes(name)
      ? parseFloat(value) || 0
      : value;
      
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  // Handle product field changes
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert to number if appropriate
    const parsedValue = ['price', 'quantity'].includes(name)
      ? parseFloat(value) || 0
      : value;
      
    setCurrentProduct(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  // Add a product to the products array
  const addProduct = () => {
    if (!currentProduct.name) {
      alert('Please enter a product name');
      return;
    }
    
    // Set item_type to category if not specified
    const productToAdd = {
      ...currentProduct,
      item_type: currentProduct.item_type || formData.category
    };
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, productToAdd],
      // Update total if it's 0
      total: prev.total === 0 
        ? productToAdd.price * productToAdd.quantity 
        : prev.total
    }));
    
    // Reset current product
    setCurrentProduct({
      name: '',
      price: 0,
      quantity: 1,
      item_type: ''
    });
  };
  
  // Remove a product
  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };
  
  // Calculate product total
  const getProductTotal = (price: number, quantity: number) => {
    return price * quantity;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.store) {
      alert('Please enter a store name');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    if (formData.products.length === 0) {
      alert('Please add at least one product');
      return;
    }
    
    // Make sure all products have item_type set
    const productsWithItemTypes = formData.products.map(product => ({
      ...product,
      item_type: product.item_type || formData.category
    }));
    
    // Call parent's onSubmit with updated products
    onSubmit({
      ...formData,
      products: productsWithItemTypes
    });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <h2 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Merchant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              name="store"
              value={formData.store}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Merchant name"
              required
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="creditCard"
              value={formData.creditCard}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a payment method</option>
              {creditCardOptions.map(card => (
                <option key={card} value={card}>{card}</option>
              ))}
            </select>
          </div>
          
          {/* Order Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Number (Optional)
            </label>
            <input
              type="text"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Order number"
            />
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (Optional)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="total"
                value={formData.total || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to auto-calculate from products
            </p>
          </div>
        </div>
        
        {/* Products Section */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Products</h3>
          
          {/* Product List */}
          {formData.products.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Item Type</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.item_type || formData.category}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-2 text-right">{product.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(getProductTotal(product.price, product.quantity))}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add Product Form */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-md">
            <div className="md:col-span-2">
              <input
                type="text"
                name="name"
                value={currentProduct.name}
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Product name"
              />
            </div>
            <div>
              <select
                name="item_type"
                value={currentProduct.item_type}
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select item type</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={currentProduct.price || ''}
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Price"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                name="quantity"
                value={currentProduct.quantity}
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={addProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;