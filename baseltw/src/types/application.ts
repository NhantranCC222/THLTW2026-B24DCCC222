export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface Application {
  id: number;
  name: string;
  email: string;
  clubId: number;
  status: Status;
  note?: string;
}