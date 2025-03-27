// src/features/payment/PaymentCards.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardNumber, CardFormState } from './types';
import { getCards, createCard, updateCard, deleteCard, addCardNumber, deleteCardNumber } from './paymentApi';
import CardForm from './CardForm';

const PaymentCards: React.FC = () => {
  // State for cards data
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [showEditCardModal, setShowEditCardModal] = useState<boolean>(false);
  const [showAddCardNumberModal, setShowAddCardNumberModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'card' | 'cardNumber', parentId?: number } | null>(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load cards on component mount
  useEffect(() => {
    loadCards();
  }, []);

  // Fetch all cards data
  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cardsData = await getCards();
      setCards(cardsData);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading cards:", error);
      setError("Failed to load payment cards. Please try again.");
      setIsLoading(false);
    }
  };

  // Show success message with auto-dismiss
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle adding a new card
  const handleAddCard = async (formData: CardFormState) => {
    try {
      setIsSubmitting(true);
      
      // Create new card
      const newCard = await createCard(formData.card_name, formData.card_type);
      
      // If card number was provided, add it to the new card
      if (formData.last_four && formData.expiration_month && formData.expiration_year) {
        await addCardNumber(
          newCard.card_id,
          formData.last_four,
          formData.expiration_month,
          formData.expiration_year,
          true // Make it the default card number
        );
      }
      
      // Refresh cards list
      await loadCards();
      
      // Close modal and show success message
      setShowAddCardModal(false);
      showSuccess("Payment card added successfully!");
      
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding card:", error);
      setError("Failed to add payment card. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle editing a card
  const handleEditCard = async (formData: CardFormState) => {
    if (!selectedCard) return;
    
    try {
      setIsSubmitting(true);
      
      // Update the card
      await updateCard(selectedCard.card_id, formData.card_name, formData.card_type);
      
      // Refresh cards list
      await loadCards();
      
      // Close modal and show success message
      setShowEditCardModal(false);
      showSuccess("Card updated successfully!");
      
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error updating card:", error);
      setError("Failed to update card. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle adding a card number
  const handleAddCardNumber = async (formData: CardFormState) => {
    if (!selectedCard) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.last_four || !formData.expiration_month || !formData.expiration_year) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }
      
      // Add card number
      await addCardNumber(
        selectedCard.card_id,
        formData.last_four,
        formData.expiration_month,
        formData.expiration_year
      );
      
      // Refresh cards list
      await loadCards();
      
      // Close modal and show success message
      setShowAddCardNumberModal(false);
      showSuccess("Card number added successfully!");
      
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding card number:", error);
      setError("Failed to add card number. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (id: number, type: 'card' | 'cardNumber', parentId?: number) => {
    setItemToDelete({ id, type, parentId });
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      if (itemToDelete.type === 'card') {
        // Delete card
        await deleteCard(itemToDelete.id);
        showSuccess("Card deleted successfully!");
      } else if (itemToDelete.type === 'cardNumber' && itemToDelete.parentId) {
        // Delete card number
        await deleteCardNumber(itemToDelete.parentId, itemToDelete.id);
        showSuccess("Card number deleted successfully!");
      }
      
      // Refresh cards list
      await loadCards();
      
      // Close modal
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Open card number modal
  const openAddCardNumberModal = (card: Card) => {
    setSelectedCard(card);
    setShowAddCardNumberModal(true);
  };

  // Open edit card modal
  const openEditCardModal = (card: Card) => {
    setSelectedCard(card);
    setShowEditCardModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format expiration date for display (MM/YYYY)
  const formatExpirationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Get card type display name
  const getCardTypeDisplay = (cardType: string | undefined): string => {
    if (!cardType) return 'Card';
    
    const cardTypes: Record<string, string> = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover'
    };
    
    return cardTypes[cardType.toLowerCase()] || cardType;
  };

  // Get card icon based on card type
  const getCardIcon = (cardType: string | undefined): JSX.Element => {
    // This could be replaced with actual card brand SVG icons
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment Cards</h1>
        <button
          onClick={() => setShowAddCardModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Card
        </button>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/30 dark:border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
            <button
              className="ml-auto pl-3"
              onClick={() => setError(null)}
            >
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 dark:bg-green-900/30 dark:border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payment Cards</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't added any payment cards yet.</p>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cards.map(card => (
            <div key={card.card_id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getCardIcon(card.card_type)}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{card.card_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {card.card_type ? getCardTypeDisplay(card.card_type) : 'Added on'} {formatDate(card.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditCardModal(card)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Edit Card"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => confirmDelete(card.card_id, 'card')}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete Card"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Numbers</h4>
                  <button
                    onClick={() => openAddCardNumberModal(card)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Number
                  </button>
                </div>
                
                {card.card_numbers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center italic">
                    No card numbers added yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {card.card_numbers.map((cardNumber: CardNumber) => (
                      <div 
                        key={cardNumber.card_number_id} 
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 dark:text-white">
                              •••• •••• •••• {cardNumber.last_four}
                            </span>
                            {cardNumber.is_default && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Expires {formatExpirationDate(cardNumber.expiration_date)} • Added {formatDate(cardNumber.added_at)}
                          </div>
                        </div>
                        <button
                          onClick={() => confirmDelete(cardNumber.card_number_id, 'cardNumber', card.card_id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete Card Number"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Add New Payment Card
                    </h3>
                    <div className="mt-4">
                      <CardForm
                        onSubmit={handleAddCard}
                        onCancel={() => setShowAddCardModal(false)}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Card Modal */}
      {showEditCardModal && selectedCard && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Edit Card: {selectedCard.card_name}
                    </h3>
                    <div className="mt-4">
                      <CardForm
                        onSubmit={handleEditCard}
                        onCancel={() => setShowEditCardModal(false)}
                        isSubmitting={isSubmitting}
                        initialData={{
                          card_name: selectedCard.card_name,
                          card_type: selectedCard.card_type || ''
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Card Number Modal */}
      {showAddCardNumberModal && selectedCard && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Add Card Number to {selectedCard.card_name}
                    </h3>
                    <div className="mt-4">
                      <CardForm
                        onSubmit={handleAddCardNumber}
                        onCancel={() => setShowAddCardNumberModal(false)}
                        isSubmitting={isSubmitting}
                        initialData={{
                          card_name: selectedCard.card_name,
                          card_type: selectedCard.card_type || ''
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Confirm Deletion
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {itemToDelete.type === 'card'
                          ? "Are you sure you want to delete this card? All associated card numbers will also be deleted."
                          : "Are you sure you want to delete this card number?"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCards;