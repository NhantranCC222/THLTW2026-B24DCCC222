import React, { useEffect, useState } from 'react';
import { Typography, Tag, Avatar, Space, Button, Divider, Row, Col, Card } from 'antd';
import { UserOutlined, CalendarOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'umi';
import ReactMarkdown from 'react-markdown';
import { getPosts, setPosts, Post } from '../data';

const { Title, Text } = Typography;

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const allPosts = getPosts();
    const currentPostIndex = allPosts.findIndex((p) => p.id === id);

    if (currentPostIndex > -1) {
      // Tăng view count
      const updatedPost = { ...allPosts[currentPostIndex], views: allPosts[currentPostIndex].views + 1 };
      allPosts[currentPostIndex] = updatedPost;
      setPosts(allPosts);
      setPost(updatedPost);

      // Tìm bài viết liên quan (cùng thẻ, khác ID, max 3)
      const related = allPosts
        .filter((p) => p.id !== id && p.status === 'Published' && p.tags.some(tag => updatedPost.tags.includes(tag)))
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [id]);

  if (!post) {
    return <div style={{ padding: '24px' }}>Bài viết không tồn tại.</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '8px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => history.goBack()} style={{ marginBottom: 24 }}>
        Quay lại
      </Button>

      <Title>{post.title}</Title>
      
      <Space split={<Divider type="vertical" />} style={{ marginBottom: 24 }}>
        <Space>
          <Avatar src={post.author.avatar} icon={<UserOutlined />} />
          <Text strong>{post.author.name}</Text>
        </Space>
        <Space>
          <CalendarOutlined />
          <Text type="secondary">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</Text>
        </Space>
        <Space>
          <EyeOutlined />
          <Text type="secondary">{post.views} lượt xem</Text>
        </Space>
      </Space>

      <div style={{ marginBottom: 24 }}>
        {post.tags.map((tag) => (
          <Tag color="cyan" key={tag}>{tag}</Tag>
        ))}
      </div>

      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt={post.title}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: 24 }}
        />
      )}

      <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <Divider />

      <Title level={4}>Bài viết liên quan</Title>
      <Row gutter={[16, 16]}>
        {relatedPosts.map((relatedPost) => (
          <Col xs={24} sm={8} key={relatedPost.id}>
            <Card
              hoverable
              cover={<img alt={relatedPost.title} src={relatedPost.thumbnail} style={{ height: 120, objectFit: 'cover' }} />}
              onClick={() => {
                history.push(`/th07/post/${relatedPost.id}`);
                window.scrollTo(0, 0);
              }}
              style={{ height: '100%' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Card.Meta title={relatedPost.title} description={<Text type="secondary" style={{fontSize: 12}}>{new Date(relatedPost.createdAt).toLocaleDateString('vi-VN')}</Text>} />
            </Card>
          </Col>
        ))}
        {relatedPosts.length === 0 && <Col><Text type="secondary">Không có bài viết liên quan.</Text></Col>}
      </Row>
    </div>
  );
};

export default PostDetail;
