import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Space,
  Badge,
  List,
} from 'antd';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const initialData: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [searchText, setSearchText] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  /* ================= THÊM ================= */
  const handleAddProduct = (values: any) => {
    const newProduct: Product = {
      id: Date.now(),
      name: values.name,
      price: values.price,
      quantity: values.quantity,
    };
    setProducts([...products, newProduct]);
    message.success('Thêm sản phẩm thành công');
    form.resetFields();
    setOpenAdd(false);
  };

  /* ================= XÓA ================= */
  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  /* ================= SỬA ================= */
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setOpenEdit(true);
  };

  const handleUpdateProduct = (values: any) => {
    if (!editingProduct) return;

    const updatedProducts = products.map(p =>
      p.id === editingProduct.id ? { ...p, ...values } : p,
    );

    setProducts(updatedProducts);
    message.success('Cập nhật sản phẩm thành công');
    setOpenEdit(false);
    setEditingProduct(null);
    form.resetFields();
  };

  /* ================= GIỎ HÀNG ================= */
  const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  /* ================= TÌM KIẾM ================= */
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  /* ================= CỘT TABLE ================= */
  const columns = [
    {
      title: 'STT',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (value: number) => value.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      render: (_: any, record: Product) => (
        <Space>
          <Button type="primary" onClick={() => handleAddToCart(record)}>
            Thêm vào giỏ
          </Button>

          <Button onClick={() => handleOpenEdit(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm sản phẩm"
          allowClear
          onChange={e => setSearchText(e.target.value)}
        />

        <Button type="primary" onClick={() => setOpenAdd(true)}>
          Thêm sản phẩm
        </Button>

        <Badge count={cart.length}>
          <Button onClick={() => setOpenCart(true)}>🛒 Giỏ hàng</Button>
        </Badge>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        pagination={{ pageSize: 5 }}
      />

      {/* ================= MODAL THÊM ================= */}
      <Modal
        title="Thêm sản phẩm"
        visible={openAdd}
        footer={null}
        onCancel={() => setOpenAdd(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Thêm
          </Button>
        </Form>
      </Modal>

      {/* ================= MODAL SỬA ================= */}
      <Modal
        title="Sửa sản phẩm"
        visible={openEdit}
        footer={null}
        onCancel={() => setOpenEdit(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProduct}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Cập nhật
          </Button>
        </Form>
      </Modal>

      {/* ================= MODAL GIỎ HÀNG ================= */}
      <Modal
        title="Giỏ hàng"
        visible={openCart}
        footer={null}
        onCancel={() => setOpenCart(false)}
      >
        <List
          dataSource={cart}
          locale={{ emptyText: 'Giỏ hàng trống' }}
          renderItem={(item, index) => (
            <List.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>{item.name}</span>
                <Space>
                  <strong>{item.price.toLocaleString('vi-VN')} đ</strong>
                  <Button
                    danger
                    size="small"
                    onClick={() => {
                      setCart(cart.filter((_, i) => i !== index));
                      message.success('Đã xóa khỏi giỏ hàng');
                    }}
                  >
                    Xóa
                  </Button>
                </Space>
              </Space>
            </List.Item>
          )}
        />
        {cart.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <strong>
              Tổng tiền: {totalPrice.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductManager;
