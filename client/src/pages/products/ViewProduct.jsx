import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getProduct } from "../../api/products";
import { useUser } from '../../context/UserContext';
import BackButton from '../../components/BackButton';
import Popup from "../../components/modals/Popup";
import AddToCartModal from '../../components/modals/AddToCartModal';
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ViewProduct() {
  const appUrl = import.meta.env.VITE_APP_URL;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupBackgroundColor, setPopupBackgroundColor] = useState('');
  const [popupHeader, setPopupHeader] = useState('');
  const [popupContent, setPopupContent] = useState('');
  const [popupShowCloseButton, setPopupShowCloseButton] = useState(false);
  const { roles } = useUser();
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
      const popupData = sessionStorage.getItem("popupData");
      
      if (popupData) {
        setIsPopupOpen(false);
        const parsed = JSON.parse(popupData);
        setPopupBackgroundColor(parsed.backgroundColor);
        setPopupHeader(parsed.header);
        setPopupContent(parsed.content);
        setPopupShowCloseButton(parsed.showCloseButton);
        setIsPopupOpen(true);
    
        sessionStorage.removeItem("popupData");
      }
    }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
        setSelectedImage(data.imageUrls?.[0] || "/images/No_Image_Available.jpg");
      } catch (err) {
        console.error(t('error.product.fetchProduct'), err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const nextImage = () => {
    const currentIndex = product.imageUrls.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % product.imageUrls.length;
    setSelectedImage(product.imageUrls[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = product.imageUrls.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + product.imageUrls.length) % product.imageUrls.length;
    setSelectedImage(product.imageUrls[prevIndex]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const addToCart = (_, quantity) => {
    setIsPopupOpen(false);
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const index = cart.findIndex(item => item.id === id);
      if (index !== -1) {
        cart[index].quantity += quantity;
      } else {
        cart.push({ id, quantity });
      }
    
      localStorage.setItem('cart', JSON.stringify(cart));
      setPopupBackgroundColor("#008236");
      setPopupHeader(t('status.success'));
      setPopupContent(t('product.addToCart.success'));
      setPopupShowCloseButton(false);
      setIsPopupOpen(true);
    } catch (err) {
      setPopupBackgroundColor("red");
      setPopupHeader(t('product.addToCart.failed'));
      setPopupContent(`${err}`);
      setPopupShowCloseButton(true);
      setIsPopupOpen(true);
      console.error(t('error.product.addToCart'), err);
    }
  };

  return (
    <main className="flex flex-col flex-grow">
      {loading ? <LoadingSpinner /> : (
        <div className="flex flex-col space-y-6 place-items-center">
          <div className="text-center pt-10 mt-26">
            <div className="inline-block bg-green-700 text-white text-2xl font-bold px-6 py-3 rounded-md shadow-md">
              {product.name}
            </div>
          </div>

          <div className="w-4/5 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6">
              {/* Column 1 */}
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex justify-center px-4 bg-white rounded-xl border-0 relative">
                  <img
                    src={`${appUrl}${selectedImage}`}
                    alt={product.name}
                    className="h-128 object-contain"
                  />

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-gray-700 opacity-80 z-20 flex items-center justify-center rounded-xl">
                      <span className="text-white font-bold text-xl">{t('others.outOfStock')}</span>
                    </div>
                  )}

                  {product.imageUrls?.length > 1 && (
                    <>
                      <div
                        onClick={prevImage}
                        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer hover:bg-[rgba(255,255,255,0.5)] transition-all duration-400 flex items-center justify-center group rounded-l-lg"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-gray-600 text-2xl"><FaChevronLeft /></span>
                        </div>
                      </div>

                      <div
                        onClick={nextImage}
                        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer hover:bg-[rgba(255,255,255,0.5)] transition-all duration-400 flex items-center justify-center group rounded-r-lg"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-gray-600 text-2xl"><FaChevronRight /></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 justify-center mt-4 flex-wrap">
                  {product.imageUrls?.map((img, index) => (
                    <img
                      key={index}
                      src={`${appUrl}${img}`}
                      alt={`Mini ${index}`}
                      className={`w-16 h-16 object-contain rounded cursor-pointer border-4 bg-white
                        ${selectedImage === img ? 'border-blue-600' : 'border-gray-300'}`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col h-full bg-neutral-800 p-6 rounded-lg">
                <div className="text-white pr-4 container space-y-5 flex flex-col items-start flex-grow">
                  <div className="flex justify-between w-full">
                    <p className="bg-neutral-600 p-2 rounded-md text-sm">{t('form.category')}: <span className="font-semibold">{product.category?.name?.trim() || t('others.unknown')}</span></p>
                  </div>

                  <div className="flex-grow w-full" style={{ textAlign: 'justify' }}>
                    <span className="text-lg">{product.description}</span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col h-full bg-neutral-800 p-6 rounded-lg">
                <div className="flex flex-col items-center justify-between gap-4 h-full">

                  <p className={`bg-neutral-600 text-white p-2 rounded-md text-sm ${product.stock < 20 && product.stock > 0 ? 'shadow-lg shadow-red-500/50' : ''}`}>
                    {product.stock === 0 ? (
                      <span className="">{t('others.outOfStock')}</span>
                    ) : product.stock < 20 ? (
                      <>
                        {t('others.onlyLeft1')}{' '}
                        <span className="font-semibold">{product.stock} </span>
                        {t('others.onlyLeft2')}
                      </>
                    ) : (
                      <>
                        {t('others.inStock')}{' '}
                        <span className="font-semibold">{product.stock}</span>
                      </>
                    )}
                  </p>

                  <p className="text-white text-3xl font-bold">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>

                 <div className="flex flex-col items-center justify-center gap-4">
                   <button 
                    className={`p-2 text-white rounded w-40 cursor-pointer transition-colors
                      ${product.stock === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'}
                    `}
                    onClick={() => {setIsModalOpen(true);}}
                    disabled={product.stock === 0}
                  >
                    {t('button.addToCart')}
                  </button>

                  {roles.includes("admin") && (
                    <button
                      className="px-4 w-40 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                      onClick={() => navigate(`/edit-product/${id}`)}
                    >
                      {t('button.edit')}
                    </button> 
                  )}

                  <BackButton onClick={() => { navigate(-1); }} />
                 </div>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
       <AddToCartModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={addToCart}
        />
        <Popup
          isOpen={isPopupOpen}
          onClose={closePopup}
          backgroundColor={popupBackgroundColor}
          header={popupHeader}
          content={popupContent}
          showCloseButton={popupShowCloseButton}
          autoCloseTime={3000}
        />
    </main>
  );
}
