// frontend/src/components/expense/ExpenseForm.js
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/expenseHelpers';

const ExpenseForm = ({ onSubmit, categories, creditCardOptions, isLoading }) => {
  const [formData, setFormData] = useState({
    store: '',
    category: '',
    creditCard: '',
    total: 0,
    products: []
  });
  
  // Local state for the current product being added
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    price: 0,
    quantity: 1
  });

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert to number if appropriate
    const parsedValue = ['total', 'price', 'quantity'].includes(name)
      ? parseFloat(value) || 0
      : value;
      
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  // Handle product field changes
  const handleProductChange = (e) => {
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
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...currentProduct }],
      // Update total if it's 0
      total: prev.total === 0 
        ? currentProduct.price * currentProduct.quantity 
        : prev.total
    }));
    
    // Reset current product
    setCurrentProduct({
      name: '',
      price: 0,
      quantity: 1
    });
  };
  
  // Remove a product
  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };
  
  // Calculate product total
  const getProductTotal = (price, quantity) => {
    return price * quantity;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
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
    
    // Call parent's onSubmit
    onSubmit(formData);
    
    // Reset form
    setFormData({
      store: '',
      category: '',
      creditCard: '',
      total: 0,
      products: []
    });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <h2 className="text-lg font-medium mb-4">Add New Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="total"
              value={formData.total || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
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
            {isLoading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;