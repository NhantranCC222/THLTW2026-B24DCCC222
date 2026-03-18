export interface Employee {
  id: number;
  name: string;
  max: number;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export type Status = 'pending' | 'confirmed' | 'done' | 'cancelled';

export interface Appointment {
  id: number;
  customerName: string;
  employeeId: number;
  serviceId: number;
  date: string;
  time: string;
  status: Status;
}

export interface Review {
  id: number;
  appointmentId: number;
  rating: number;
  comment: string;
}