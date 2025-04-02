// src/features/invoices/invoiceDetail/components/InvoiceLineItems.tsx
import React from 'react';
import { LineItem } from '../../invoices/types';

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({ items, onChange }) => {
  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Handle changes to line items
  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    onChange(updatedItems);
  };

  // Add a new line item
  const addItem = () => {
    onChange([...items, {
      product_name: "",
      quantity: 1,
      unit_price: 0,
      product_link: "",
      documentation: "",
      condition: "New",
      paid_by: "",
    }]);
  };

  // Remove a line item
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = item.quantity !== null && item.quantity !== undefined ? item.quantity : 0;
      const unitPrice = item.unit_price !== null && item.unit_price !== undefined ? item.unit_price : 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Line Items</h3>
          <button 
            className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            onClick={addItem}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                  Unit Price ($)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                  Product Link
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                  Condition
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.product_name || ""}
                        onChange={(e) => handleItemChange(index, "product_name", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 focus:outline-none dark:text-white"
                        placeholder="Product name"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity !== null && item.quantity !== undefined ? item.quantity : ""}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? null : parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 focus:outline-none dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price !== null && item.unit_price !== undefined ? item.unit_price : ""}
                          onChange={(e) => handleItemChange(index, "unit_price", e.target.value === "" ? null : parseFloat(e.target.value))}
                          className="w-full px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 focus:outline-none dark:text-white"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                      {item.quantity !== null && item.unit_price !== null 
                        ? formatCurrency((item.quantity || 0) * (item.unit_price || 0))
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.product_link || ""}
                        onChange={(e) => handleItemChange(index, "product_link", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 focus:outline-none dark:text-white"
                        placeholder="Product URL"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.condition || "New"}
                        onChange={(e) => handleItemChange(index, "condition", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 focus:outline-none dark:text-white"
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Refurbished">Refurbished</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none"
                        onClick={() => removeItem(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-lg text-gray-500 dark:text-gray-400">No line items found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add Item" to add products</p>
                  </td>
                </tr>
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">Subtotal:</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                    {formatCurrency(calculateSubtotal())}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineItems;