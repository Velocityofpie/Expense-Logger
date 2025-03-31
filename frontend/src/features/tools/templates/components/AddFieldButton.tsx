// src/features/tools/templates/components/AddFieldButton.tsx
import React from 'react';
import { Button } from 'react-bootstrap';

interface AddFieldButtonProps {
  onClick: () => void;
  className?: string;
}

const AddFieldButton: React.FC<AddFieldButtonProps> = ({ onClick, className = '' }) => {
  return (
    <div className={`add-field-footer d-flex justify-content-center ${className}`}>
      <Button
        variant="outline-primary"
        onClick={onClick}
        className="px-4"
      >
        <i className="bi bi-plus-circle me-2"></i>
        Add Field
      </Button>
    </div>
  );
};

export default AddFieldButton;