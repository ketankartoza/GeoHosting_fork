import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './redux/store';
import './assets/styles/index.css';
import TokenValidator from './components/TokenValidator/TokenValidator';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage/DashboardPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SalesOrderCheckout = lazy(() => import('./pages/CheckoutPage/SalesOrderCheckout'));
const CheckoutPayment = lazy(() => import('./pages/CheckoutPage/SalesOrderCheckout/CheckoutPayment'));
const CheckoutConfigurationPage = lazy(() => import('./pages/CheckoutPage/CheckoutConfigurationPage'));
const CheckoutDeployment = lazy(() => import('./pages/CheckoutPage/SalesOrderCheckout/CheckoutDeployment'));
const CheckoutFinish = lazy(() => import('./pages/CheckoutPage/SalesOrderCheckout/CheckoutFinish'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage/ResetPasswordPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage/OverviewPage'));

/** Global decalrations **/
declare global {
  interface Window {
    app_version: string;
  }
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<LoadingSpinner/>}>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/reset-password" element={<ResetPasswordPage/>}/>
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <DashboardPage/>
                </PrivateRoute>
              }
            />

            {/* ----------------------------- */}
            {/* ---------- CHECKOUT --------- */}
            <Route
              path="/checkout/configuration"
              element={
                <PrivateRoute>
                  <CheckoutConfigurationPage/>
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage/>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id/payment"
              element={
                <PrivateRoute>
                  <SalesOrderCheckout activeStep={0}>
                    <CheckoutPayment salesOrderDetail={null}/>
                  </SalesOrderCheckout>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id/deployment"
              element={
                <PrivateRoute>
                  <SalesOrderCheckout activeStep={2} callPeriodically={true}>
                    <CheckoutDeployment salesOrderDetail={null}/>
                  </SalesOrderCheckout>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id/finish"
              element={
                <PrivateRoute>
                  <SalesOrderCheckout activeStep={3}>
                    <CheckoutFinish salesOrderDetail={null}/>
                  </SalesOrderCheckout>
                </PrivateRoute>
              }
            />
            {/* ----------------------------- */}
            <Route path="/app/:appName" element={<OverviewPage/>}/>
          </Routes>
        </Suspense>
        <ToastContainer hideProgressBar={true} newestOnTop={true}/>
        <TokenValidator/>
      </Router>
    </Provider>
  );
};

export default App;
