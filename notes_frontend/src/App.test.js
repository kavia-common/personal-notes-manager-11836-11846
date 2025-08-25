import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders sidebar and create button', () => {
  render(<App />);
  expect(screen.getByText(/Personal Manager/i)).toBeInTheDocument();
  const btn = screen.getByRole('button', { name: /\+ New Note/i });
  expect(btn).toBeInTheDocument();
});

test('can create a new note and see editor', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /\+ New Note/i });
  fireEvent.click(btn);
  expect(screen.getByPlaceholderText(/Note title/i)).toBeInTheDocument();
});
