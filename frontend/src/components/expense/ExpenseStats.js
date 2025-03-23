// frontend/src/components/expense/ExpenseStats.js
import React from 'react';
import _ from 'lodash';

const ExpenseStats = ({ filteredData, formatCurrency }) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-2">Spending Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">By Item Type</h4>
          <ul className="mt-2 space-y-2">
            {_.chain(filteredData)
              .groupBy(item => {
                // Map product names to appropriate item types
                const productName = item.products[0]?.name || '';
                if (productName.includes('Camera') || productName.includes('Alpha')) {
                  return 'Cameras';
                } else if (productName.includes('Lens') || productName.includes('SONY E')) {
                  return 'Lenses';
                } else if (productName.includes('Storage') || productName.includes('SDXC') || productName.includes('SSD')) {
                  return 'Storage';
                } else {
                  // Try to match with categories as fallback
                  const category = item.category;
                  return category !== 'All' ? category : 'Other';
                }
              })
              .map((items, itemType) => ({
                name: itemType,
                total: _.sumBy(items, 'total')
              }))
              .orderBy(['total'], ['desc'])
              .take(3)
              .value()
              .map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.total)}</span>
                </li>
              ))
            }
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">By Merchant</h4>
          <ul className="mt-2 space-y-2">
            {_.chain(filteredData)
              .groupBy('store')
              .map((items, store) => ({
                name: store,
                total: _.sumBy(items, 'total')
              }))
              .orderBy(['total'], ['desc'])
              .take(3)
              .value()
              .map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.total)}</span>
                </li>
              ))
            }
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">By Credit Card</h4>
          <ul className="mt-2 space-y-2">
            {_.chain(filteredData)
              .groupBy('creditCard')
              .map((items, card) => ({
                name: card,
                total: _.sumBy(items, 'total')
              }))
              .orderBy(['total'], ['desc'])
              .take(3)
              .value()
              .map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name.split(" ").slice(0, 2).join(" ")}</span>
                  <span>{formatCurrency(item.total)}</span>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;