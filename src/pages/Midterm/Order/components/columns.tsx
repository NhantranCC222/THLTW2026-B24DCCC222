import { Tag, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Order, Status } from '../type';

export const getColumns = (
  onEdit: (record: Order) => void,
  onCancel: (record: Order) => void,
): ColumnsType<Order> => [
  { title: 'Mã đơn', dataIndex: 'id' },
  { title: 'Khách hàng', dataIndex: 'customer' },
  { title: 'Ngày', dataIndex: 'date', sorter: true },
  { title: 'Tổng tiền', dataIndex: 'total', sorter: true },

  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (status: Status) => {
      const colorMap = {
        pending: 'orange',
        shipping: 'blue',
        done: 'green',
        cancel: 'red',
      };
      return <Tag color={colorMap[status]}>{status}</Tag>;
    },
  },

  {
    title: 'Hành động',
    render: (_, record) => (
      <>
        <Button onClick={() => onEdit(record)}>Sửa</Button>
        <Button danger onClick={() => onCancel(record)}>
          Hủy
        </Button>
      </>
    ),
  },
];