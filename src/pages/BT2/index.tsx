import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Tabs,
  Space,
  Card,
  Statistic,
  message,
} from 'antd';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;

/* ================== TYPES ================== */
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface OrderProduct {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  products: OrderProduct[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

/* ================== INIT DATA ================== */
const initProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initOrders: Order[] = [
  {
    id: 'DH001',
    customerName: 'Trần Đình Nhân',
    phone: '0977635903',
    address: 'Hà Nội',
    products: [
      { productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 },
    ],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15',
  },
];

const getProductStatus = (q: number) => {
  if (q === 0) return <Tag color="red">Hết hàng</Tag>;
  if (q <= 10) return <Tag color="orange">Sắp hết</Tag>;
  return <Tag color="green">Còn hàng</Tag>;
};

export default function IndexPage() {
  const [products, setProducts] = useState<Product[]>(() =>
    JSON.parse(localStorage.getItem('products') || 'null') || initProducts,
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    JSON.parse(localStorage.getItem('orders') || 'null') || initOrders,
  );

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openDetail, setOpenDetail] = useState<Order | null>(null);

  const [productForm] = Form.useForm();
  const [orderForm] = Form.useForm();

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const dashboard = useMemo(() => {
    return {
      totalProducts: products.length,
      totalStockValue: products.reduce((s, p) => s + p.price * p.quantity, 0),
      totalOrders: orders.length,
      revenue: orders.filter(o => o.status === 'Hoàn thành').reduce((s, o) => s + o.totalAmount, 0),
    };
  }, [products, orders]);

  const productColumns = [
    { title: 'STT', render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Danh mục', dataIndex: 'category' },
    {
      title: 'Giá',
      dataIndex: 'price',
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      sorter: (a: Product, b: Product) => a.quantity - b.quantity,
    },
    {
      title: 'Trạng thái',
      render: (_: any, r: Product) => getProductStatus(r.quantity),
    },
    {
      title: 'Thao tác',
      render: (_: any, r: Product) => (
        <Button
          onClick={() => {
            setEditProduct(r);
            productForm.setFieldsValue(r);
            setOpenProductModal(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const handleCreateOrder = (values: any) => {
    const selected: OrderProduct[] = values.products.map((p: any) => {
      const prod = products.find(pr => pr.id === p.productId)!;
      if (p.quantity > prod.quantity) {
        message.error('Số lượng vượt tồn kho');
        throw new Error();
      }
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: p.quantity,
        price: prod.price,
      };
    });

    const total = selected.reduce((s, p) => s + p.price * p.quantity, 0);

    setOrders([
      ...orders,
      {
        id: 'DH' + Date.now(),
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        products: selected,
        totalAmount: total,
        status: 'Chờ xử lý',
        createdAt: dayjs().format('YYYY-MM-DD'),
      },
    ]);

    setOpenOrderModal(false);
    orderForm.resetFields();
    message.success('Tạo đơn hàng thành công');
  };

  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Số SP', render: (_: any, r: Order) => r.products.length },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      render: (_: any, r: Order) => (
        <Select
          value={r.status}
          style={{ width: 150 }}
          onChange={st => {
            setOrders(os =>
              os.map(o => {
                if (o.id === r.id && st === 'Hoàn thành') {
                  setProducts(ps =>
                    ps.map(p => {
                      const it = o.products.find(op => op.productId === p.id);
                      return it ? { ...p, quantity: p.quantity - it.quantity } : p;
                    }),
                  );
                }
                return o.id === r.id ? { ...o, status: st } : o;
              }),
            );
          }}
        >
          <Option value="Chờ xử lý">Chờ xử lý</Option>
          <Option value="Đang giao">Đang giao</Option>
          <Option value="Hoàn thành">Hoàn thành</Option>
          <Option value="Đã hủy">Đã hủy</Option>
        </Select>
      ),
    },
    { title: 'Ngày', dataIndex: 'createdAt' },
    { title: 'Thao tác', render: (_: any, r: Order) => <Button onClick={() => setOpenDetail(r)}>Chi tiết</Button> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Statistic title="Sản phẩm" value={dashboard.totalProducts} />
          <Statistic title="Giá trị kho" value={dashboard.totalStockValue} />
          <Statistic title="Đơn hàng" value={dashboard.totalOrders} />
          <Statistic title="Doanh thu" value={dashboard.revenue} />
        </Space>
      </Card>

      <Tabs defaultActiveKey="product">
        <TabPane tab="Quản lý sản phẩm" key="product">
          <Table rowKey="id" columns={productColumns} dataSource={products} pagination={{ pageSize: 5 }} />
        </TabPane>
        <TabPane tab="Quản lý đơn hàng" key="order">
          <Button type="primary" onClick={() => setOpenOrderModal(true)} style={{ marginBottom: 16 }}>
            Tạo đơn hàng
          </Button>
          <Table rowKey="id" columns={orderColumns} dataSource={orders} />
        </TabPane>
      </Tabs>

      <Modal
        visible={openProductModal}
        title="Sửa sản phẩm"
        onCancel={() => setOpenProductModal(false)}
        onOk={() => {
          productForm.validateFields().then(v => {
            setProducts(ps => ps.map(p => (p.id === editProduct!.id ? { ...p, ...v } : p)));
            setOpenProductModal(false);
          });
        }}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal visible={openOrderModal} title="Tạo đơn hàng" onCancel={() => setOpenOrderModal(false)} onOk={() => orderForm.submit()}>
        <Form form={orderForm} layout="vertical" onFinish={handleCreateOrder}>
          <Form.Item name="customerName" label="Khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ required: true, pattern: /^[0-9]{10,11}$/ }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline">
                    <Form.Item name={[name, 'productId']} rules={[{ required: true }]}>
                      <Select style={{ width: 200 }} placeholder="Sản phẩm">
                        {products.map(p => (
                          <Option key={p.id} value={p.id}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name={[name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber min={1} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>Xóa</Button>
                  </Space>
                ))}
                <Button onClick={() => add()} type="dashed" block>Thêm sản phẩm</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal visible={!!openDetail} title="Chi tiết đơn hàng" footer={null} onCancel={() => setOpenDetail(null)}>
        {openDetail && (
          <>
            <p><b>Khách:</b> {openDetail.customerName}</p>
            <p><b>SĐT:</b> {openDetail.phone}</p>
            <p><b>Địa chỉ:</b> {openDetail.address}</p>
            {openDetail.products.map(p => (
              <p key={p.productId}>{p.productName} x {p.quantity} = {(p.price * p.quantity).toLocaleString('vi-VN')} đ</p>
            ))}
            <b>Tổng: {openDetail.totalAmount.toLocaleString('vi-VN')} đ</b>
          </>
        )}
      </Modal>
    </div>
  );
}


