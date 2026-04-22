import React from 'react';
import { Card, Avatar, Typography, Row, Col, Divider, Tag, Space, Button } from 'antd';
import { GithubOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const About = () => {
  return (
    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '800px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar size={160} src="https://i.pravatar.cc/300?u=a042581f4e29026024d" />
          </Col>
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginBottom: 4 }}>Nguyễn Văn A</Title>
            <Text type="secondary" style={{ fontSize: '18px' }}>Fullstack Developer</Text>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <Title level={4}>Tiểu sử</Title>
            <Paragraph>
              Chào các bạn! Mình là một lập trình viên đam mê công nghệ web. 
              Trang web này được xây dựng trong khuôn khổ bài thực hành số 07, nhằm mục đích hoàn thiện kỹ năng React và Ant Design.
            </Paragraph>

            <Title level={4}>Kỹ năng</Title>
            <div style={{ marginBottom: '16px' }}>
              {['React', 'Node.js', 'TypeScript', 'Ant Design', 'UmiJS'].map(skill => (
                <Tag color="purple" key={skill}>{skill}</Tag>
              ))}
            </div>

            <Title level={4}>Liên kết mạng xã hội</Title>
            <Space>
              <Button type="primary" style={{ background: '#333', borderColor: '#333' }} icon={<GithubOutlined />} href="https://github.com" target="_blank">GitHub</Button>
              <Button type="primary" style={{ backgroundColor: '#0077b5', borderColor: '#0077b5' }} icon={<LinkedinOutlined />} href="https://linkedin.com" target="_blank">LinkedIn</Button>
              <Button type="primary" style={{ backgroundColor: '#1da1f2', borderColor: '#1da1f2' }} icon={<TwitterOutlined />} href="https://twitter.com" target="_blank">Twitter</Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default About;
