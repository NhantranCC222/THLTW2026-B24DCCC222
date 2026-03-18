import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Service } from '../types';

type Props = {
  services: Service[];
  onDelete: (id: number) => void;
  onEdit: (s: Service) => void;
};

export default function ServiceList({
  services,
  onDelete,
  onEdit,
}: Props) {
  const columns = [
    {
      title: '🛠 Dịch vụ',
      dataIndex: 'name',
    },
    {
      title: '💰 Giá',
      render: (_: any, r: Service) => (
        <b style={{ color: '#52c41a' }}>
          {r.price.toLocaleString()} đ
        </b>
      ),
    },
    {
      title: '⏱',
      render: (_: any, r: Service) => (
        <Tag color="purple">{r.duration} phút</Tag>
      ),
    },
    {
      title: '⚙',
      render: (_: any, r: Service) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(r)}
          />

          <Popconfirm
            title="Xóa dịch vụ?"
            onConfirm={() => onDelete(r.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={services} />;
}