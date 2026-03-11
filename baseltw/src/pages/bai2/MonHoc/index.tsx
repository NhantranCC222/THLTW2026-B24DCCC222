import React, { useState } from "react";
import { Table, Button, Modal, Input } from "antd";

interface Subject {
  id: number;
  code: string;
  name: string;
  credit: number;
}

export default () => {
  const [data, setData] = useState<Subject[]>([]);
  const [visible, setVisible] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credit, setCredit] = useState("");

  const addSubject = () => {
    setData([
      ...data,
      { id: Date.now(), code, name, credit: Number(credit) },
    ]);
    setVisible(false);
  };

  const columns = [
    { title: "Mã môn", dataIndex: "code" },
    { title: "Tên môn", dataIndex: "name" },
    { title: "Tín chỉ", dataIndex: "credit" },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>Thêm</Button>

      <Table rowKey="id" dataSource={data} columns={columns} />

      <Modal
        title="Thêm môn học"
        visible={visible}
        onOk={addSubject}
        onCancel={() => setVisible(false)}
      >
        <Input placeholder="Mã môn" onChange={(e) => setCode(e.target.value)} />
        <Input placeholder="Tên môn" onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Tín chỉ" onChange={(e) => setCredit(e.target.value)} />
      </Modal>
    </div>
  );
};