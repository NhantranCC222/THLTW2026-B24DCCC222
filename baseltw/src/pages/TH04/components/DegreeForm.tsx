import React, { useState } from "react";
import { Degree } from "../types";

export default function DegreeForm({ degrees, setDegrees, books, decisions, fields, setBooks }: any) {
  const [form, setForm] = useState<any>({ extraFields: {} });

  const add = () => {
    const book = books.find((b: any) => b.id === decisions.find((d: any) => d.id === form.decisionId)?.bookId);
    const soVaoSo = book.currentNumber + 1;

    const newDegree: Degree = {
      id: Date.now().toString(),
      ...form,
      soVaoSo,
    };

    book.currentNumber += 1;
    setBooks([...books]);
    setDegrees([...degrees, newDegree]);
  };

  return (
    <div>
      <h2>Thêm văn bằng</h2>
      <input placeholder="Số hiệu" onChange={(e) => setForm({ ...form, soHieu: e.target.value })} />
      <input placeholder="MSV" onChange={(e) => setForm({ ...form, msv: e.target.value })} />
      <input placeholder="Họ tên" onChange={(e) => setForm({ ...form, hoTen: e.target.value })} />
      <input type="date" onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })} />

      <select onChange={(e) => setForm({ ...form, decisionId: e.target.value })}>
        <option>Chọn quyết định</option>
        {decisions.map((d: any) => (
          <option value={d.id}>{d.soQD}</option>
        ))}
      </select>

      {fields.map((f: any) => (
        <div key={f.id}>
          <label>{f.name}</label>
          <input
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
            onChange={(e) =>
              setForm({
                ...form,
                extraFields: { ...form.extraFields, [f.name]: e.target.value },
              })
            }
          />
        </div>
      ))}

      <button onClick={add}>Thêm</button>
    </div>
  );
}
