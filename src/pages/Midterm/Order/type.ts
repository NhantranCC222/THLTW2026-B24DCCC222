export enum Status {
  PENDING = 'pending',
  SHIPPING = 'shipping',
  DONE = 'done',
  CANCEL = 'cancel',
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  products: Product[];
  total: number;
  status: Status;
}