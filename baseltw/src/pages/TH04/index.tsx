import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Card,
  Tabs,
  Space,
  message,
} from "antd";
import moment from "moment";

const { TabPane } = Tabs;

// ===== LOCAL STORAGE =====
function useLocalStorage(key: string, initial: any) {
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });

  const set = (val: any) => {
    setData(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return [data, set];
}

export default function TH04() {
  const [books, setBooks] = useLocalStorage("books", []);
  const [decisions, setDecisions] = useLocalStorage("decisions", []);
  const [fields, setFields] = useLocalStorage("fields", []);
  const [degrees, setDegrees] = useLocalStorage("degrees", []);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const [searchResult, setSearchResult] = useState<any[]>([]);

  // ===== ADD DEGREE =====
  const addDegree = (values: any) => {
    const decision = decisions.find((d: any) => d.id === values.decisionId);
    if (!decision) return message.error("Chưa có quyết định");

    const book = books.find((b: any) => b.id === decision.bookId);
    if (!book) return message.error("Chưa có sổ");

    const soVaoSo = (book.currentNumber || 0) + 1;
    book.currentNumber = soVaoSo;
    setBooks([...books]);

    const extraData: any = {};
    fields.forEach((f: any) => {
      extraData[f.name] = values[f.name];
    });

    const newDegree = {
      id: Date.now().toString(),
      soVaoSo,
      ...values,
      ngaySinh: values.ngaySinh.format("YYYY-MM-DD"),
      extraData,
    };

    setDegrees([...degrees, newDegree]);
    message.success("Đã thêm văn bằng");
    setOpen(false);
    form.resetFields();
  };

  // ===== SEARCH =====
  const handleSearch = (values: any) => {
    const filled = Object.values(values).filter((v) => v);
    if (filled.length < 2) {
      return message.warning("Nhập ít nhất 2 điều kiện");
    }

    const result = degrees.filter((d: any) => {
      return (
        (!values.msv || d.msv.includes(values.msv)) &&
        (!values.soHieu || d.soHieu.includes(values.soHieu)) &&
        (!values.hoTen || d.hoTen.includes(values.hoTen))
      );
    });

    // tăng lượt tra cứu
    result.forEach((r: any) => {
      const dec = decisions.find((d: any) => d.id === r.decisionId);
      if (dec) dec.searchCount = (dec.searchCount || 0) + 1;
    });
    setDecisions([...decisions]);

    setSearchResult(result);
  };

  // ===== TABLE =====
  const columns = [
    { title: "Số vào sổ", dataIndex: "soVaoSo" },
    { title: "Số hiệu", dataIndex: "soHieu" },
    { title: "MSV", dataIndex: "msv" },
    { title: "Họ tên", dataIndex: "hoTen" },
  ];

  return (
    <Card style={{ margin: 20 }}>
      <h1>🎓 QUẢN LÝ VĂN BẰNG FULL</h1>

      <Tabs>

        {/* ===== SỔ ===== */}
        <TabPane tab="Sổ văn bằng" key="1">
          <Button
            onClick={() => {
              const year = new Date().getFullYear();
              setBooks([
                ...books,
                { id: Date.now().toString(), year, currentNumber: 0 },
              ]);
            }}
          >
            + Tạo sổ năm
          </Button>

          <Table
            rowKey="id"
            dataSource={books}
            columns={[
              { title: "Năm", dataIndex: "year" },
              { title: "Số hiện tại", dataIndex: "currentNumber" },
            ]}
          />
        </TabPane>

        {/* ===== QUYẾT ĐỊNH ===== */}
        <TabPane tab="Quyết định" key="2">
          <Button
            onClick={() => {
              if (!books.length) return message.error("Chưa có sổ");
              setDecisions([
                ...decisions,
                {
                  id: Date.now().toString(),
                  soQD: "QD-" + Date.now(),
                  bookId: books[0].id,
                  searchCount: 0,
                },
              ]);
            }}
          >
            + Thêm QĐ
          </Button>

          <Table
            rowKey="id"
            dataSource={decisions}
            columns={[
              { title: "Số QĐ", dataIndex: "soQD" },
              { title: "Lượt tra cứu", dataIndex: "searchCount" },
            ]}
          />
        </TabPane>

        {/* ===== FIELD ===== */}
        <TabPane tab="Cấu hình" key="3">
          <Button
            onClick={() => {
              setFields([
                ...fields,
                { name: "danToc", type: "string" },
              ]);
            }}
          >
            + Thêm field
          </Button>

          <Table
            rowKey="name"
            dataSource={fields}
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Kiểu", dataIndex: "type" },
            ]}
          />
        </TabPane>

        {/* ===== VĂN BẰNG ===== */}
        <TabPane tab="Văn bằng" key="4">
          <Button type="primary" onClick={() => setOpen(true)}>
            + Thêm văn bằng
          </Button>

          <Table rowKey="id" dataSource={degrees} columns={columns} />

          <Modal visible={open} onCancel={() => setOpen(false)} footer={null}>
            <Form form={form} onFinish={addDegree} layout="vertical">
              <Form.Item name="soHieu" label="Số hiệu" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="msv" label="MSV" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="ngaySinh" label="Ngày sinh" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="decisionId" label="Quyết định">
                <Select>
                  {decisions.map((d: any) => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.soQD}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* FIELD ĐỘNG */}
              {fields.map((f: any) => (
                <Form.Item key={f.name} name={f.name} label={f.name}>
                  {f.type === "number" ? <Input type="number" /> : <Input />}
                </Form.Item>
              ))}

              <Button htmlType="submit" type="primary" block>
                Lưu
              </Button>
            </Form>
          </Modal>
        </TabPane>

        {/* ===== SEARCH ===== */}
        <TabPane tab="Tra cứu" key="5">
          <Form onFinish={handleSearch} layout="inline">
            <Form.Item name="msv"><Input placeholder="MSV" /></Form.Item>
            <Form.Item name="soHieu"><Input placeholder="Số hiệu" /></Form.Item>
            <Form.Item name="hoTen"><Input placeholder="Họ tên" /></Form.Item>
            <Button htmlType="submit">Tìm</Button>
          </Form>

          <Table dataSource={searchResult} columns={columns} rowKey="id" />
        </TabPane>

      </Tabs>
    </Card>
  );
}