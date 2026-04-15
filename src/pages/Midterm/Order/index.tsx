import React, { useState } from 'react';
import { Table, Input, Select, Button, Modal, message } from 'antd';
import { initialOrders, products } from './data';
import { Order, Status } from './type';
import { getColumns } from './components/columns';
import OrderForm from './components/OrderForm';

const { Option } = Select;

const OrderPage: React.FC = () => {
  const [data, setData] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  // 🔥 FIX CHÍNH Ở ĐÂY
  const handleSubmit = (values: any) => {
    // values.products = [{ productId, quantity }]
    const orderProducts = values.products.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...product,
        quantity: item.quantity,
      };
    });

    // tính tổng tiền
    const total = orderProducts.reduce(
      (sum: number, p: any) => sum + p.price * p.quantity,
      0,
    );

    const newOrder = {
      ...values,
      products: orderProducts,
      total,
      date: new Date().toISOString().slice(0, 10),
    };

    if (editing) {
      // EDIT
      setData(
        data.map((d) => (d.id === editing.id ? newOrder : d)),
      );
    } else {
      // ADD
      if (data.find((d) => d.id === values.id)) {
        message.error('Trùng mã!');
        return;
      }

      setData([...data, newOrder]);
    }

    setOpen(false);
    setEditing(null);
  };

  // HỦY ĐƠN
  const handleCancelOrder = (record: Order) => {
    if (record.status !== Status.PENDING) {
      message.warning('Chỉ hủy khi chờ!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận hủy?',
      onOk: () => {
        setData(
          data.map((d) =>
            d.id === record.id ? { ...d, status: Status.CANCEL } : d,
          ),
        );
      },
    });
  };

  // SEARCH + FILTER
  const filtered = data.filter(
    (d) =>
      (d.id.includes(search) ||
        d.customer.toLowerCase().includes(search.toLowerCase())) &&
      (!filter || d.status === filter),
  );

  return (
    <div>
      <h2>Quản lý đơn hàng</h2>

      <Input
        placeholder="Tìm kiếm..."
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 200, marginRight: 10 }}
      />

      <Select
        placeholder="Trạng thái"
        allowClear
        onChange={setFilter}
        style={{ width: 200 }}
      >
        <Option value={Status.PENDING}>Chờ</Option>
        <Option value={Status.SHIPPING}>Đang giao</Option>
        <Option value={Status.DONE}>Hoàn thành</Option>
        <Option value={Status.CANCEL}>Hủy</Option>
      </Select>

      <Button
        type="primary"
        onClick={() => {
          setEditing(null); // 🔥 fix bug khi add sau khi edit
          setOpen(true);
        }}
        style={{ marginLeft: 10 }}
      >
        Thêm
      </Button>

      <Table
        rowKey="id"
        columns={getColumns(
          (record) => {
            setEditing(record);
            setOpen(true);
          },
          handleCancelOrder,
        )}
        dataSource={filtered}
      />

      <OrderForm
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editing}
      />
    </div>
  );
};

export default OrderPage;