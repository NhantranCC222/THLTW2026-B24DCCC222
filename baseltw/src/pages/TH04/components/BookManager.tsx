import React, { useState } from "react";
import { Book } from "../types";

export default function BookList({ books, setBooks }: any) {
  const [year, setYear] = useState("");

  const addBook = () => {
    const newBook: Book = {
      id: Date.now().toString(),
      year: Number(year),
      currentNumber: 0,
    };
    setBooks([...books, newBook]);
    setYear("");
  };

  return (
    <div>
      <h2>Sổ văn bằng</h2>
      <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Năm" />
      <button onClick={addBook}>Thêm</button>
      <ul>
        {books.map((b: Book) => (
          <li key={b.id}>{b.year} - STT: {b.currentNumber}</li>
        ))}
      </ul>
    </div>
  );
}