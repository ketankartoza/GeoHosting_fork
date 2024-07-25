import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {logout} from "../../redux/reducers/authSlice";
import {AppDispatch} from "../../redux/store";

const TokenValidator: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/validate-token/', {
            headers: { Authorization: `Token ${token}` }
          });
          if (response.status === 200) {
            toast.success("Token is valid.");
          }
        } catch (error) {
          dispatch(logout());
          toast.error("Token is invalid or has expired. Please log in again.");
        }
      }
    };

    validateToken();
  }, [dispatch]);

  return null;
};

export default TokenValidator;
