import React, { useState } from "react";
import { Button, Table, Modal, Input } from "antd";

interface Category {
  id: number;
  name: string;
}

export default () => {
  const [data, setData] = useState<Category[]>([]);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");

  const addCategory = () => {
    setData([...data, { id: Date.now(), name }]);
    setName("");
    setVisible(false);
  };

  const columns = [
    { title: "Tên khối kiến thức", dataIndex: "name" },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>Thêm</Button>

      <Table rowKey="id" dataSource={data} columns={columns} />

      <Modal
        title="Thêm khối kiến thức"
        visible={visible}
        onOk={addCategory}
        onCancel={() => setVisible(false)}
      >
        <Input
          placeholder="Tên khối"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </div>
  );
};