import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography, Card, Select, Row, Col, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getPosts, setPosts, Post, getTags, Tag as TagType } from '../data';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManagePosts = () => {
  const [posts, setPostsState] = useState<Post[]>([]);
  const [tags, setTagsState] = useState<TagType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Published'>('All');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setPostsState(getPosts());
    setTagsState(getTags());
  }, []);

  const handleSave = (values: any) => {
    let updatedPosts = [...posts];
    if (editingPost) {
      updatedPosts = updatedPosts.map(p => p.id === editingPost.id ? { ...p, ...values } : p);
      message.success('Cập nhật bài viết thành công');
    } else {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        ...values,
        views: 0,
        createdAt: new Date().toISOString(),
        author: {
          name: 'Nguyễn Văn A',
          avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        }
      };
      // For slug if empty, simplistic generation:
      if (!newPost.slug) {
        newPost.slug = newPost.title.toLowerCase().replace(/ /g, '-');
      }
      updatedPosts.unshift(newPost);
      message.success('Thêm bài viết mới thành công');
    }
    setPostsState(updatedPosts);
    setPosts(updatedPosts);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    const updatedPosts = posts.filter(p => p.id !== id);
    setPostsState(updatedPosts);
    setPosts(updatedPosts);
    message.success('Xóa bài viết thành công');
  };

  const openModal = (post?: Post) => {
    setEditingPost(post || null);
    if (post) {
      form.setFieldsValue(post);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'Draft' });
    }
    setIsModalVisible(true);
  };

  const filteredPosts = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' ? true : p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'green' : 'orange'}>
          {status === 'Published' ? 'Đã đăng' : 'Nháp'}
        </Tag>
      )
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag color="blue" key={tag}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Post) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            placement="topRight"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<Title level={3} style={{ margin: 0 }}>Quản lý Bài viết</Title>}>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Space>
              <Input
                placeholder="Tìm kiếm theo tiêu đề..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                style={{ width: 150 }}
              >
                <Option value="All">Tất cả trạng thái</Option>
                <Option value="Published">Đã đăng</Option>
                <Option value="Draft">Nháp</Option>
              </Select>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm bài viết mới</Button>
          </Col>
        </Row>
        <Table dataSource={filteredPosts} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingPost ? "Sửa bài viết" : "Thêm bài viết mới"}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
             <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                        <Input placeholder="Nhập tiêu đề..." />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="slug" label="Slug">
                        <Input placeholder="bai-viet-moi (tự động tạo nếu để trống)" />
                    </Form.Item>
                </Col>
             </Row>

             <Row gutter={16}>
                 <Col span={12}>
                    <Form.Item name="thumbnail" label="URL Ảnh đại diện" rules={[{ required: true, message: 'Vui lòng nhập URL ảnh!' }]}>
                        <Input placeholder="https://..." />
                    </Form.Item>
                 </Col>
                 <Col span={12}>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Draft">Nháp</Option>
                            <Option value="Published">Đã đăng</Option>
                        </Select>
                    </Form.Item>
                 </Col>
             </Row>

             <Form.Item name="tags" label="Thẻ (Tags)" rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thẻ!' }]}>
                <Select mode="multiple" placeholder="Chọn thẻ">
                    {tags.map(t => <Option key={t.name} value={t.name}>{t.name}</Option>)}
                </Select>
             </Form.Item>

             <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true, message: 'Vui lòng nhập tóm tắt!' }]}>
                <TextArea rows={2} placeholder="Nhập nội dung tóm tắt..." />
             </Form.Item>

             <Form.Item name="content" label="Nội dung (hỗ trợ Markdown)" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
                <TextArea rows={10} placeholder="Nhập nội dung bài viết..." style={{ fontFamily: 'monospace' }} />
             </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePosts;
