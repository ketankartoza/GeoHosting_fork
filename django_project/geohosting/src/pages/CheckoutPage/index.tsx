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

// @ts-ignore
const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const localStorageData = localStorage.getItem('selectedProduct');
  const appName = localStorage.getItem('appName');
  const companyName = localStorage.getItem('companyName');
  const selectedData = localStorageData ? JSON.parse(localStorageData) : state;

  useEffect(() => {
    if (!selectedData) {
      navigate('/');
    }
  }, [selectedData, navigate]);

  useEffect(() => {
    if (!appName) {
      navigate('/checkout/configuration');
    }
  }, [appName]);

  if (!selectedData) {
    return null;
  }

  if (!appName) {
    return
  }

  const { product, pkg } = selectedData;

  return (
    <MainCheckoutPage
      appName={appName}
      companyName={companyName}
      activeStep={1}
      product={product}
      pkg={pkg}
      stripeUrl={`/api/package/${pkg.id}/payment/stripe`}
      paystackUrl={`/api/package/${pkg.id}/payment/paystack`}
    />
  )
};

export default CheckoutPage;
