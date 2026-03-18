import { Table, Tag, Avatar, Button, Space, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Employee } from '../types';

type Props = {
  employees: Employee[];
  getAvg: (employeeId: number) => number | string;
  onDelete: (id: number) => void;
  onEdit: (emp: Employee) => void;
};

export default function EmployeeList({
  employees,
  getAvg,
  onDelete,
  onEdit,
}: Props) {
  const columns = [
    {
      title: '👤 Nhân viên',
      render: (_: any, record: Employee) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <b>{record.name}</b>
        </Space>
      ),
    },
    {
      title: '📊 Giới hạn',
      render: (_: any, record: Employee) => (
        <Tag color="blue">{record.max} khách</Tag>
      ),
    },
    {
      title: '⭐ Rating',
      render: (_: any, record: Employee) => (
        <span style={{ color: '#faad14' }}>
          {getAvg(record.id)} ⭐
        </span>
      ),
    },
    {
      title: '⚙',
      render: (_: any, record: Employee) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />

          <Popconfirm
            title="Xóa nhân viên?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={employees} />;
}