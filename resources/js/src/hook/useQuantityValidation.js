import { useState } from 'react';
import toast from "react-hot-toast";

const useQuantityValidation = (initialQuantity, maxQuantity) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleQuantityChange = (value) => {
    setQuantity(value);
    setIsQuantityConfirmed(true);
  };

  const handleBlur = () => {
    if (quantity > maxQuantity) {
      toast.error('Số lượng vượt quá số lượng tồn');
      setQuantity(1);
      setIsQuantityConfirmed(false);
    }
  };

  return [quantity, handleQuantityChange, handleBlur];
};

export default useQuantityValidation;