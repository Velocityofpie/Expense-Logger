// src/components/payment/CardNumbersList.tsx
import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../common/Table';
import { CardNumber } from './PaymentCards';

interface CardNumbersListProps {
  cardNumbers: CardNumber[];
  formatDate: (date: string) => string;
}

const CardNumbersList: React.FC<CardNumbersListProps> = ({ cardNumbers, formatDate }) => {
  // Format expiration date for display
  const formatExpirationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Last Four</TableHeader>
          <TableHeader>Expiration</TableHeader>
          <TableHeader>Added On</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {cardNumbers.map(number => (
          <TableRow key={number.card_number_id}>
            <TableCell>
              <span className="font-medium">**** **** **** {number.last_four}</span>
            </TableCell>
            <TableCell>{formatExpirationDate(number.expiration_date)}</TableCell>
            <TableCell>{formatDate(number.added_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CardNumbersList;