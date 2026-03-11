import React, { useState } from "react";
import { Table, Button, Modal, Input, Select } from "antd";

interface Question {
  id: number;
  subject: string;
  content: string;
  difficulty: string;
  category: string;
}

export default () => {
  const [data, setData] = useState<Question[]>([]);
  const [visible, setVisible] = useState(false);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");

  const addQuestion = () => {
    setData([
      ...data,
      { id: Date.now(), subject, content, difficulty, category },
    ]);
    setVisible(false);
  };

  const columns = [
    { title: "Môn học", dataIndex: "subject" },
    { title: "Nội dung", dataIndex: "content" },
    { title: "Độ khó", dataIndex: "difficulty" },
    { title: "Khối", dataIndex: "category" },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>Thêm</Button>

      <Table rowKey="id" dataSource={data} columns={columns} />

      <Modal
        title="Thêm câu hỏi"
        visible={visible}
        onOk={addQuestion}
        onCancel={() => setVisible(false)}
      >
        <Input placeholder="Môn học" onChange={(e) => setSubject(e.target.value)} />
        <Input placeholder="Nội dung câu hỏi" onChange={(e) => setContent(e.target.value)} />

        <Select
          style={{ width: "100%" }}
          placeholder="Độ khó"
          onChange={(v) => setDifficulty(v)}
        >
          <Select.Option value="Dễ">Dễ</Select.Option>
          <Select.Option value="Trung bình">Trung bình</Select.Option>
          <Select.Option value="Khó">Khó</Select.Option>
          <Select.Option value="Rất khó">Rất khó</Select.Option>
        </Select>

        <Input placeholder="Khối kiến thức" onChange={(e) => setCategory(e.target.value)} />
      </Modal>
    </div>
  );
};