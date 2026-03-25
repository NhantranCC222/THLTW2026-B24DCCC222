import React from "react";
import { Table, Tag } from "antd";
import { Degree, Decision } from "../types";

interface Props {
  degrees: Degree[];
  decisions: Decision[];
}

export default function DegreeList({ degrees, decisions }: Props) {
  const getDecision = (id: string) => {
    return decisions.find((d) => d.id === id);
  };

  const columns = [
    {
      title: "Số vào sổ",
      dataIndex: "soVaoSo",
      key: "soVaoSo",
    },
    {
      title: "Số hiệu",
      dataIndex: "soHieu",
      key: "soHieu",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "MSV",
      dataIndex: "msv",
      key: "msv",
    },
    {
      title: "Họ tên",
      dataIndex: "hoTen",
      key: "hoTen",
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
    },
    {
      title: "Quyết định",
      key: "decision",
      render: (_: any, record: Degree) => {
        const decision = getDecision(record.decisionId);
        return <Tag color="green">{decision?.soQD || "Không có"}</Tag>;
      },
    },
    {
      title: "Thông tin thêm",
      key: "extra",
      render: (_: any, record: Degree) => (
        <div>
          {Object.entries(record.extraFields || {}).map(([k, v]) => (
            <div key={k}>
              <b>{k}:</b> {v}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Danh sách văn bằng</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={degrees}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}