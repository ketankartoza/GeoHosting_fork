import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Provider} from 'react-redux';
import {ToastContainer} from "react-toastify";
import HomePage from './pages/HomePage/HomePage';
import { store } from './redux/store';
import './assets/styles/index.css';
import TokenValidator from "./components/TokenValidator/TokenValidator";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <ToastContainer hideProgressBar={true} newestOnTop={true} />
        <TokenValidator />
      </Router>
    </Provider>
  );
};

export default App;
