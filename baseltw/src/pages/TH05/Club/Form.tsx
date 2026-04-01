import { Modal, Form, Input, Switch } from 'antd';
import { addClub } from '@/services/th05';

export default ({ open, onCancel, reload }: any) => {
  const [form] = Form.useForm();

  const submit = async () => {
    const values = await form.validateFields();
    await addClub(values);
    reload();
    onCancel();
  };

  return (
    <Modal visible={open} onOk={submit} onCancel={onCancel}>
      <Form form={form}>
        <Form.Item name="name" label="Tên CLB" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="leader" label="Chủ nhiệm">
          <Input />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};