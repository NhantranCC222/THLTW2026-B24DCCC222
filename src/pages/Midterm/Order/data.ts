import { Order, Status, Product } from './type';

export const products: Product[] = [
  { id: 'p1', name: 'Áo', price: 100000 },
  { id: 'p2', name: 'Quần', price: 200000 },
  { id: 'p3', name: 'Giày', price: 500000 },
];

export const initialOrders: Order[] = [
  {
    id: 'DH001',
    customer: 'Trần Đình Nhân',
    date: '2026-04-01',
    products: [products[0], products[1]],
    total: 300000,
    status: Status.PENDING,
  },
];