import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddToCartModal = ({ isOpen, onClose, onConfirm, productId}) => {
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const increase = () => setQuantity(prev => prev + 1);
  const decrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleConfirm = () => {
    onConfirm(productId, quantity);
    onClose();
    setQuantity(1);
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">
            {t('modal.addToCart')}
        </h2>

        <div className="flex items-center justify-center gap-4 text-lg font-medium mb-6">
          <button
            onClick={decrease}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xl cursor-pointer"
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            onClick={increase}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xl cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded cursor-pointer"
          >
            {t('button.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded cursor-pointer"
          >
            {t('button.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
