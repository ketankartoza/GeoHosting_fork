import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package } from "../../redux/reducers/productsSlice";
import MainCheckoutPage from "./CheckoutPage";

interface LocationState {
  productName: string;
  pkg: Package;
}

const PaymentMethods = {
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const localStorageData = localStorage.getItem('selectedProduct');
  const selectedData = localStorageData ? JSON.parse(localStorageData) : state;

  useEffect(() => {
    if (!selectedData) {
      navigate('/');
    }
  }, [selectedData, navigate]);

  if (!selectedData) {
    return null;
  }

  const { product, pkg } = selectedData;

  return (
    <MainCheckoutPage
      product={product}
      pkg={pkg}
      stripeUrl={`/api/package/${pkg.id}/payment/stripe`}
      paystackUrl={`/api/package/${pkg.id}/payment/paystack`}
    />
  )
};

export default CheckoutPage;
