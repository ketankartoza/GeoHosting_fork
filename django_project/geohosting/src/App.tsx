import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage/HomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import { store } from './redux/store';
import './assets/styles/index.css';
import TokenValidator from './components/TokenValidator/TokenValidator';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import OverviewPage from "./pages/OverviewPage/OverviewPage";
import { Text } from "@chakra-ui/react";
import OrderDetail from "./pages/DashboardPage/Orders/OrderDetail";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} /> 
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage>
                <Text>Welcome to the Dashboard!</Text>
              </DashboardPage>
            </PrivateRoute>
          } />
          <Route path="/dashboard/orders/:id" element={
            <PrivateRoute>
              <DashboardPage title='Order'>
                <OrderDetail />
              </DashboardPage>
            </PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
          <Route path="/app/:appName" element={<OverviewPage />} />
        </Routes>
        <ToastContainer hideProgressBar={true} newestOnTop={true} />
        <TokenValidator />
      </Router>
    </Provider>
  );
};

export default App;
