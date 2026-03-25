import React, { useState } from "react";
import { Decision } from "../types";

export default function DecisionList({ decisions, setDecisions, books }: any) {
  const [form, setForm] = useState<any>({});

  const add = () => {
    const d: Decision = {
      id: Date.now().toString(),
      ...form,
      searchCount: 0,
    };
    setDecisions([...decisions, d]);
  };

  return (
    <div>
      <h2>Quyết định</h2>
      <input placeholder="Số QĐ" onChange={(e) => setForm({ ...form, soQD: e.target.value })} />
      <input type="date" onChange={(e) => setForm({ ...form, ngayBanHanh: e.target.value })} />
      <input placeholder="Trích yếu" onChange={(e) => setForm({ ...form, trichYeu: e.target.value })} />
      <select onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
        <option>Chọn sổ</option>
        {books.map((b: any) => (
          <option value={b.id}>{b.year}</option>
        ))}
      </select>
       <button onClick={add}>Thêm</button>
    </div>
  );
}