import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { products } from '../data';
import { Order, Status } from '../type';

const { Option } = Select;

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Order | null;
}

const OrderForm: React.FC<Props> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    form.setFieldsValue(initialValues || {});
  }, [initialValues]);

  // 🔥 TÍNH TIỀN
  const calculateTotal = () => {
    const values = form.getFieldsValue();
    const list = values.products || [];

    let sum = 0;

    list.forEach((item: any) => {
      const product = products.find((p) => p.id === item?.productId);
      if (product) {
        sum += product.price * (item.quantity || 0);
      }
    });

    setTotal(sum);
  };

  return (
    <Modal
      title="Đơn hàng"
      visible={open}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onSubmit({ ...values, total });
        });
      }}
    >
      <Form form={form} layout="vertical" onValuesChange={calculateTotal}>
        
        {/* MÃ ĐƠN */}
        <Form.Item
          name="id"
          label="Mã đơn"
          rules={[{ required: true, message: 'Không được để trống!' }]}
        >
          <Input />
        </Form.Item>

        {/* KHÁCH HÀNG */}
        <Form.Item
          name="customer"
          label="Khách hàng"
          rules={[
            { required: true, message: 'Không được để trống!' },
          ]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>

        {/* 🔥 DANH SÁCH SẢN PHẨM */}
        <Form.List name="products">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  {/* CHỌN SẢN PHẨM */}
                  <Form.Item
                    name={[name, 'productId']}
                    rules={[{ required: true, message: 'Chọn sản phẩm!' }]}
                  >
                    <Select placeholder="Sản phẩm" style={{ width: 200 }}>
                      {products.map((p) => (
                        <Option key={p.id} value={p.id}>
                          {p.name} - {p.price.toLocaleString()}đ
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* SỐ LƯỢNG */}
                  <Form.Item
                    name={[name, 'quantity']}
                    rules={[{ required: true, message: 'Nhập số lượng!' }]}
                  >
                    <Input
                      type="number"
                      placeholder="SL"
                      min={1}
                      style={{ width: 80 }}
                    />
                  </Form.Item>

                  {/* XÓA */}
                  <Button danger onClick={() => remove(name)}>
                    Xóa
                  </Button>
                </div>
              ))}

              <Button type="dashed" onClick={() => add()}>
                + Thêm sản phẩm
              </Button>
            </>
          )}
        </Form.List>

        {/* TRẠNG THÁI */}
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value={Status.PENDING}>Chờ</Option>
            <Option value={Status.SHIPPING}>Đang giao</Option>
            <Option value={Status.DONE}>Hoàn thành</Option>
          </Select>
        </Form.Item>

        {/* 🔥 HIỂN THỊ TỔNG TIỀN */}
        <div style={{ marginTop: 20, fontWeight: 'bold' }}>
          Tổng tiền: {total.toLocaleString()}đ
        </div>
      </Form>
    </Modal>
  );
};

export default OrderForm;