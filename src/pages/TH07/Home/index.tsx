import React, { useState, useMemo, useEffect } from 'react';
import { Card, Tag, Input, Pagination, Row, Col, Typography, Avatar, Select } from 'antd';
import { UserOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import { getPosts, getTags, Post, Tag as TagType } from '../data';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    setPosts(getPosts().filter((p) => p.status === 'Published'));
    setTags(getTags());
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTag ? post.tags.includes(selectedTag) : true;
      return matchSearch && matchTag;
    });
  }, [posts, searchTerm, selectedTag]);

  const currentPosts = filteredPosts.slice((currentPage - 1) * 9, currentPage * 9);

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Input
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined />}
            onChange={(e) => {
              const val = e.target.value;
              // Debounce 300ms
              clearTimeout((window as any).searchTimeout);
              (window as any).searchTimeout = setTimeout(() => {
                setSearchTerm(val);
                setCurrentPage(1);
              }, 300);
            }}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Select
            allowClear
            placeholder="Lọc theo thẻ"
            style={{ width: 200 }}
            onChange={(val) => {
              setSelectedTag(val);
              setCurrentPage(1);
            }}
          >
            {tags.map((t) => (
              <Option key={t.name} value={t.name}>{t.name}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {currentPosts.map((post) => (
          <Col xs={24} sm={12} md={8} key={post.id}>
            <Card
              hoverable
              cover={<img alt={post.title} src={post.thumbnail} style={{ height: 200, objectFit: 'cover' }} />}
              onClick={() => history.push(`/th07/post/${post.id}`)}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <Title level={4} style={{ marginBottom: 8 }}>{post.title}</Title>
              <div style={{ marginBottom: 16 }}>
                {post.tags.map((tag) => (
                  <Tag color="blue" key={tag}>{tag}</Tag>
                ))}
              </div>
              <Paragraph ellipsis={{ rows: 3 }} style={{ flex: 1 }}>{post.summary}</Paragraph>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <div>
                  <Avatar src={post.author.avatar} icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
                  <Text type="secondary">{post.author.name}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredPosts.length > 0 ? (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination
            current={currentPage}
            total={filteredPosts.length}
            pageSize={9}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Text type="secondary">Không tìm thấy bài viết nào phù hợp.</Text>
        </div>
      )}
    </div>
  );
};

export default Home;
