import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ConfirmDialogContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    itemName: '',
    itemBadge: '',
    closeOnBgClick: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setIsLoading(false);
      setDialogState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'This action cannot be undone. Please confirm to proceed.',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
        itemName: options.itemName || '',
        itemBadge: options.itemBadge || '',
        closeOnBgClick: options.closeOnBgClick ?? false
      });
    });
  }, []);

  const handleClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const handleConfirm = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <ConfirmationModal
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        type={dialogState.type}
        itemName={dialogState.itemName}
        itemBadge={dialogState.itemBadge}
        isLoading={isLoading}
        closeOnBgClick={dialogState.closeOnBgClick}
      />
    </ConfirmDialogContext.Provider>
  );
};

export default ConfirmDialogContext;
