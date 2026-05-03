import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import '@testing-library/jest-dom';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  stock: 10,
  category: 'electronics',
  imageUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} onDelete={() => {}} deleting={false} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('renders stock status correctly', () => {
    render(<ProductCard product={mockProduct} onDelete={() => {}} deleting={false} />);
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });

  it('shows deleting state when deleting is true', () => {
    render(<ProductCard product={mockProduct} onDelete={() => {}} deleting={true} />);
    expect(screen.getByText(/Deleting/i)).toBeInTheDocument();
  });
});
