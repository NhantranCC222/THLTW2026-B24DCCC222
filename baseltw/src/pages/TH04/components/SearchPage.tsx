import React, { useState } from "react";

export default function SearchForm({ degrees, decisions, setDecisions }: any) {
  const [filters, setFilters] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);

  const search = () => {
    const count = Object.values(filters).filter(Boolean).length;
    if (count < 2) return alert("Nhập ít nhất 2 điều kiện");

    const res = degrees.filter((d: any) =>
      Object.entries(filters).every(([k, v]) => !v || d[k]?.toString().includes(v))
    );

    res.forEach((r: any) => {
      const dec = decisions.find((d: any) => d.id === r.decisionId);
      if (dec) dec.searchCount += 1;
    });

    setDecisions([...decisions]);
    setResults(res);
  };

  return (
    <div>
      <h2>Tra cứu</h2>
      <input placeholder="Số hiệu" onChange={(e) => setFilters({ ...filters, soHieu: e.target.value })} />
      <input placeholder="MSV" onChange={(e) => setFilters({ ...filters, msv: e.target.value })} />
      <input placeholder="Họ tên" onChange={(e) => setFilters({ ...filters, hoTen: e.target.value })} />
      <button onClick={search}>Tìm</button>

      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.hoTen} - {r.soHieu}</li>
        ))}
      </ul>
    </div>
  );
}
