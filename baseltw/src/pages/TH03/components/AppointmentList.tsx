import { Table, Button, Tag, Space } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import { Appointment, Status } from '../types';

type Props = {
  appointments: Appointment[];
  updateStatus: (id: number, status: Status) => void;
  addReview: (id: number) => void;
};

export default function AppointmentList({
  appointments,
  updateStatus,
  addReview,
}: Props) {
  const getColor = (status: Status) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'confirmed':
        return 'processing'; // xanh dương đẹp hơn
      case 'done':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getText = (status: Status) => {
    switch (status) {
      case 'pending':
        return 'Chờ';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'done':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: '👤 Khách hàng',
      dataIndex: 'customerName',
    },
    {
      title: '📅 Ngày',
      dataIndex: 'date',
    },
    {
      title: '⏰ Giờ',
      dataIndex: 'time',
    },
    {
      title: '📌 Trạng thái',
      render: (_: any, record: Appointment) => (
        <Tag color={getColor(record.status)} style={{ fontWeight: 500 }}>
          {getText(record.status)}
        </Tag>
      ),
    },
    {
      title: '⚙ Hành động',
      render: (_: any, record: Appointment) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => updateStatus(record.id, 'confirmed')}
          />

          <Button
            size="small"
            style={{ background: '#52c41a', color: 'white' }}
            icon={<CheckCircleOutlined />}
            onClick={() => updateStatus(record.id, 'done')}
          />

          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => updateStatus(record.id, 'cancelled')}
          />

          {record.status === 'done' && (
            <Button
              size="small"
              style={{ background: '#faad14', color: 'white' }}
              icon={<StarOutlined />}
              onClick={() => addReview(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={appointments}
      pagination={{ pageSize: 5 }}
      bordered
      style={{
        background: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    />
  );
}