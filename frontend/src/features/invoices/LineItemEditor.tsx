// LineItemEditor.tsx
import React from 'react';
import { Table, Input, Button } from '../../shared';
import { LineItem } from './types';

interface LineItemEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const LineItemEditor: React.FC<LineItemEditorProps> = ({ items, onChange }) => {
  // Format currency for display
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Handle changes to line item fields
  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    };
    onChange(updatedItems);
  };
  
  // Remove a line item
  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
  };
  
  // Calculate line item total
  const calculateItemTotal = (item: LineItem): number => {
    return (item.quantity || 0) * (item.unit_price || 0);
  };
  
  // Calculate subtotal of all items
  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No line items added yet</p>
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Product</Table.Header>
              <Table.Header className="w-20">Quantity</Table.Header>
              <Table.Header className="w-28">Unit Price</Table.Header>
              <Table.Header className="w-28 text-right">Total</Table.Header>
              <Table.Header className="w-16">Actions</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {items.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Input
                    type="text"
                    value={item.product_name || ''}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    placeholder="Product name"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity !== undefined ? item.quantity : ''}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    placeholder="1"
                  />
                </Table.Cell>
                <Table.Cell>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price !== undefined ? item.unit_price : ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </Table.Cell>
                <Table.Cell className="text-right">
                  {formatCurrency(calculateItemTotal(item))}
                </Table.Cell>
                <Table.Cell>
                <Button
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  aria-label="Remove item"
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell colSpan={3} className="text-right font-medium">Subtotal:</Table.Cell>
              <Table.Cell className="text-right font-medium">
                {formatCurrency(calculateSubtotal())}
              </Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>
      )}
    </div>
  );
};

export default LineItemEditor;