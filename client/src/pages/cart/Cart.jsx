import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProduct } from "../../api/products";
import { useUser } from '../../context/UserContext';
import { useOrderContext } from '../../context/OrderContext';
import { useNavigate } from "react-router-dom";
import BackButton from '../../components/BackButton';
import DeleteModal from '../../components/modals/DeleteModal'
import QuantitySelector from '../../components/QuantitySelector';
import OrderProgress from '../../components/OrderProgress';
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const { currentStep, setCurrentStep } = useOrderContext();
  const { userData } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const appUrl = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const getCartFromCookie = async () => {
      try {
        setCart(JSON.parse(localStorage.getItem('cart'))) || [];
      } catch (error) {
        setCart([]);
      } finally {
        setLoading(false);
      }
    }

    setCurrentStep(1);
    getCartFromCookie();
  }, []);

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!Array.isArray(cart) || cart.length === 0) {
        setCartItems([]);
        return;
      }

      const productPromises = cart.map(item => getProduct(item.id));
      const products = await Promise.all(productPromises);

      const merged = cart.map(item => {
        const product = products.find(p => p._id === item.id);
        return product ? { ...product, quantity: item.quantity } : null;
      }).filter(Boolean);

      setCartItems(merged);
    };

    fetchCartDetails();
  }, [cart]);

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleDeleteProduct = (productId) => {
    const productToDelete = cartItems.find(item => item._id === productId);
    setProductToDelete(productToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setIsDeleteModalOpen(false);
  };

  const handleClose = () => {
    setIsDeleteModalOpen(false)
  };

  const total = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <div className="flex flex-col flex-grow justify-center items-center w-full text-white mt-21 pt-8">
      {loading ? <LoadingSpinner /> : (

        <div className="flex flex-grow gap-4 items-center w-full">
          <div className="w-24 mb-8 mx-12">
            <OrderProgress currentStep={currentStep}/>
          </div>
    
          <div className="flex flex-col items-center justify-center w-full">
            <div className="inline-block bg-green-700 text-white text-2xl font-bold px-6 py-3 rounded-md shadow-md text-center w-60">
              {t('header.cart')}
            </div>
            <div className="mt-8">
              <ul className="space-y-4 text-black">
                {cartItems.map((item) => (
                  <li key={item._id} className="flex gap-6">

                      <div className="flex justify-start items-center p-4 rounded-lg bg-white w-26">
                        <img
                          src={`${appUrl}${item.imageUrls?.[0] || "/images/No_Image_Available.jpg"}`}
                          alt={item.name}
                          className="h-22 object-contain"
                        />
                      </div>

                      <div className="flex justify-start items-center p-4 rounded-lg bg-white w-80">
                        <h3 className="font-semibold">{item.name}</h3>
                      </div>

                      <div className="flex justify-center items-center">
                        <QuantitySelector productId={item._id} initialQuantity={item.quantity} stock={item.stock} onChange={handleQuantityChange} onValueZero={handleDeleteProduct}/>
                      </div>

                      <div className="flex justify-center items-center p-4 rounded-lg bg-white w-30">
                        <span className="font-semibold">${(item.quantity * item.price).toFixed(2)}</span>
                      </div>

                  </li>
                ))}
              </ul>
            </div>
    
            {cart?.length === 0 || cart == null ? (
              <div className="flex justify-center items-center bg-white text-black rounded-lg p-4 w-64">
                <p className="text-center font-bold">{t('others.emptyCart')}</p>
              </div>
            ) : (
              <div className="flex flex-col my-8 space-y-4 justify-center items-center">
                <div className="flex gap-8 justify-between items-center mt-8 p-4 w-80 text-xl font-semibold">
                  <h3 className="font-bold">{t('form.total')}</h3>
                  <div className="flex justify-center items-center bg-white text-black rounded-lg p-4 w-40">
                    <p className="text-center">${total.toFixed(2)}</p>
                  </div>
                </div>
                {userData ? (
                 <button className="bg-green-600 hover:bg-green-700 font-semibold text-white px-2 py-4 rounded-lg w-70 disabled:bg-gray-700"
                    disabled={cart?.length === 0 || cart === null}
                    onClick={() => 
                      navigate('/shipment', { state: { fromCart: true } })
                    }
                   >
                    {t('button.next')}
                  </button>
                ) : (
                  <div className="flex flex-col justify-between items-center mt-8 p-4 w-80 text-md font-semibold">
                    <p className="font-semibold mb-2">{t('others.pleaseLogIn')}</p>
                  <button 
                    className="bg-gray-700 font-semibold text-white px-2 py-4 rounded-lg w-70"
                    disabled={true}
                  >
                    {t('button.next')}
                  </button>
                </div>
                )}
                <BackButton onClick={() => navigate('/')} />
              </div>
            )}

          </div>
        </div>
      )} 
          <DeleteModal 
            isOpen={isDeleteModalOpen} 
            onClose={handleClose} 
            onDelete={handleDelete} 
            item={productToDelete}
            titleItem={t('modal.deleteProductFromCart')}
            itemLabel={productToDelete?.name}
          />
    </div>
  );
}
