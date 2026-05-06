import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Tag } from 'antd';
import moment from 'moment';
import type { ITask, Priority, TaskStatus } from '../types';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormModalProps {
  visible: boolean;
  editingTask: ITask | null;
  onCancel: () => void;
  onSubmit: (task: ITask) => void;
}

const TAG_OPTIONS = ['Frontend', 'Backend', 'Design', 'Bug', 'Feature', 'Urgent', 'Research', 'Meeting'];

const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, editingTask, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        form.setFieldsValue({
          ...editingTask,
          deadline: editingTask.deadline ? moment(editingTask.deadline) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingTask]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const task: ITask = {
        id: editingTask?.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: values.name,
        description: values.description || '',
        deadline: values.deadline ? values.deadline.toISOString() : '',
        priority: values.priority,
        tags: values.tags || [],
        status: editingTask?.status || ('todo' as TaskStatus),
        createdAt: editingTask?.createdAt || new Date().toISOString(),
      };
      onSubmit(task);
      form.resetFields();
    } catch (err) {
      // validation failed
    }
  };

  return (
    <Modal
      title={editingTask ? '✏️ Chỉnh sửa công việc' : '➕ Thêm công việc mới'}
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText={editingTask ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'Trung bình' as Priority,
          tags: [],
        }}
      >
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
        >
          <Input placeholder="Nhập tên công việc..." />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả chi tiết công việc..." />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Hạn hoàn thành"
          rules={[{ required: true, message: 'Vui lòng chọn hạn hoàn thành!' }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Chọn ngày giờ"
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Mức độ ưu tiên"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
        >
          <Select placeholder="Chọn mức độ ưu tiên">
            <Option value="Cao">
              <Tag color="red">Cao</Tag>
            </Option>
            <Option value="Trung bình">
              <Tag color="orange">Trung bình</Tag>
            </Option>
            <Option value="Thấp">
              <Tag color="green">Thấp</Tag>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select mode="multiple" placeholder="Chọn hoặc nhập tag..." allowClear>
            {TAG_OPTIONS.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
