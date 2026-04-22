import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getTags, setTags, Tag, getPosts } from '../data';

const { Title } = Typography;

const ManageTags = () => {
  const [tags, setTagsState] = useState<Tag[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  
  // To count posts using the tag
  const allPosts = getPosts();

  useEffect(() => {
    setTagsState(getTags());
  }, []);

  const handleSave = (values: { name: string }) => {
    let updatedTags = [...tags];
    if (editingTag) {
      if (tags.some(t => t.name.toLowerCase() === values.name.toLowerCase() && t.id !== editingTag.id)) {
        message.error('Tên thẻ đã tồn tại!');
        return;
      }
      updatedTags = updatedTags.map(t => t.id === editingTag.id ? { ...t, name: values.name } : t);
      message.success('Cập nhật thẻ thành công');
    } else {
      if (tags.some(t => t.name.toLowerCase() === values.name.toLowerCase())) {
        message.error('Tên thẻ đã tồn tại!');
        return;
      }
      const newTag: Tag = { id: `tag-${Date.now()}`, name: values.name };
      updatedTags.push(newTag);
      message.success('Thêm thẻ thành công');
    }
    setTagsState(updatedTags);
    setTags(updatedTags);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    const tagToDelete = tags.find(t => t.id === id);
    if (tagToDelete && allPosts.some(p => p.tags.includes(tagToDelete.name))) {
      message.error('Không thể xóa thẻ đang được sử dụng trong bài viết!');
      return;
    }
    const updatedTags = tags.filter(t => t.id !== id);
    setTagsState(updatedTags);
    setTags(updatedTags);
    message.success('Xóa thẻ thành công');
  };

  const openModal = (tag?: Tag) => {
    setEditingTag(tag || null);
    if (tag) {
      form.setFieldsValue({ name: tag.name });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên thẻ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số bài viết sử dụng',
      key: 'usageCount',
      render: (_: any, record: Tag) => {
        const count = allPosts.filter(p => p.tags.includes(record.name)).length;
        return count;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Tag) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thẻ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            placement="left"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<Title level={3} style={{ margin: 0 }}>Quản lý Thẻ</Title>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm mới</Button>}>
        <Table dataSource={tags} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingTag ? "Sửa thẻ" : "Thêm thẻ mới"}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Tên thẻ" rules={[{ required: true, message: 'Vui lòng nhập tên thẻ!' }]}>
            <Input placeholder="Nhập tên thẻ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageTags;
