import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Navbar from './Navbar';

// Mock the LoginForm component
jest.mock('../LoginForm/LoginForm', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
      isOpen ? <div data-testid="login-form">Login Form</div> : null,
  };
});

test('renders Navbar with About us link and My account link', () => {
  render(<Navbar />);

  // Check if the About us link is present
  expect(screen.getByText(/About us/i)).toBeInTheDocument();

  // Check if the My account link is present
  expect(screen.getByText(/My account/i)).toBeInTheDocument();
});

test('opens LoginForm when My account link is clicked', () => {
  render(<Navbar />);

  const myAccountLink = screen.getByText(/My account/i);

  fireEvent.click(myAccountLink);

  expect(screen.getByTestId('login-form')).toBeInTheDocument();
});
