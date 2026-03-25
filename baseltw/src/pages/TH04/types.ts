export type FieldType = "string" | "number" | "date";

export interface DynamicField {
  id: string;
  name: string;
  type: FieldType;
}

export interface Book {
  id: string;
  year: number;
  currentNumber: number; // số vào sổ
}

export interface Decision {
  id: string;
  soQD: string;
  ngayBanHanh: string;
  trichYeu: string;
  bookId: string;
  searchCount: number;
}

export interface Degree {
  id: string;
  soVaoSo: number;
  soHieu: string;
  msv: string;
  hoTen: string;
  ngaySinh: string;
  decisionId: string;
  extraFields: Record<string, any>;
}