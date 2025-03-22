// src/components/payment/CardItem.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import CardNumbersList from './CardNumbersList';
import { PaymentCard } from './PaymentCards';

interface CardItemProps {
  card: PaymentCard;
  onAddCardNumber: () => void;
  formatDate: (date: string) => string;
}

const CardItem: React.FC<CardItemProps> = ({ card, onAddCardNumber, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  return (
    <Card key={card.card_id} className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            {card.card_name}
          </h3>
          <Button 
            variant="outline"
            size="sm"
            onClick={onAddCardNumber}
          >
            Add Card Number
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
          Added on {formatDate(card.created_at)}
        </p>
        
        {card.card_numbers.length === 0 ? (
          <p className="text-gray-600 dark:text-dark-text-secondary">No card numbers added yet.</p>
        ) : (
          <div>
            <div className="flex items-center mb-3">
              <h4 className="text-md font-medium mr-2">Card Numbers</h4>
              <button 
                className="text-primary-600 dark:text-primary-400 text-sm flex items-center focus:outline-none"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {isExpanded ? (
              <CardNumbersList cardNumbers={card.card_numbers} formatDate={formatDate} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {card.card_numbers.map(number => (
                  <div 
                    key={number.card_number_id} 
                    className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-sm"
                  >
                    **** {number.last_four}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CardItem;