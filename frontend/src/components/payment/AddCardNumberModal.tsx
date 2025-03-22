// src/components/payment/AddCardModal.tsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface AddCardModalProps {
  show: boolean;
  onClose: () => void;
  onAddCard: (cardName: string) => Promise<void>;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ show, onClose, onAddCard }) => {
  const [cardName, setCardName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!cardName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAddCard(cardName);
      setCardName('');
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = (): void => {
    setCardName('');
    onClose();
  };
  
  return (
    <Modal
      title="Add New Card"
      isOpen={show}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
            Card Name
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g., Chase Freedom, Amex Gold"
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-card dark:text-dark-text-primary"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-muted">
            Enter a descriptive name for this card.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            disabled={!cardName.trim() || isSubmitting}
          >
            Add Card
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCardModal;