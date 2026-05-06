import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Typography, Timeline, Empty } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  FireOutlined,
  RiseOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { loadTasks } from '../storage';
import { ITask, STATUS_LABELS, PRIORITY_COLORS } from '../types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdue = tasks.filter(
      (t) => t.status !== 'done' && t.deadline && moment(t.deadline).isBefore(moment()),
    ).length;
    const highPriority = tasks.filter((t) => t.priority === 'Cao' && t.status !== 'done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, todo, overdue, highPriority, completionRate };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done' && t.deadline)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [tasks]);

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: 'none',
    height: '100%',
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        📊 Tổng quan công việc
      </Title>

      {/* Main Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            bodyStyle={{ padding: '24px 20px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Tổng công việc</span>}
              value={stats.total}
              prefix={<UnorderedListOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 36 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            }}
            bodyStyle={{ padding: '24px 20px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Hoàn thành</span>}
              value={stats.done}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 36 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
            bodyStyle={{ padding: '24px 20px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Quá hạn</span>}
              value={stats.overdue}
              prefix={<WarningOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 36 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            }}
            bodyStyle={{ padding: '24px 20px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Ưu tiên cao</span>}
              value={stats.highPriority}
              prefix={<FireOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 36 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress & Details */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <Card title="📈 Tiến độ hoàn thành" style={cardStyle} bodyStyle={{ textAlign: 'center', padding: 32 }}>
            <Progress
              type="dashboard"
              percent={stats.completionRate}
              strokeColor={{
                '0%': '#667eea',
                '100%': '#52c41a',
              }}
              width={180}
              format={(p) => (
                <div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{p}%</div>
                  <div style={{ fontSize: 13, color: '#999' }}>hoàn thành</div>
                </div>
              )}
            />
            <div style={{ marginTop: 20 }}>
              <Row gutter={8} justify="center">
                <Col>
                  <Tag color="blue" style={{ borderRadius: 12, padding: '2px 12px' }}>
                    Cần làm: {stats.todo}
                  </Tag>
                </Col>
                <Col>
                  <Tag color="orange" style={{ borderRadius: 12, padding: '2px 12px' }}>
                    Đang làm: {stats.inProgress}
                  </Tag>
                </Col>
                <Col>
                  <Tag color="green" style={{ borderRadius: 12, padding: '2px 12px' }}>
                    Xong: {stats.done}
                  </Tag>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="⏰ Deadline sắp tới" style={cardStyle}>
            {upcomingDeadlines.length === 0 ? (
              <Empty description="Không có deadline sắp tới" />
            ) : (
              <Timeline>
                {upcomingDeadlines.map((task) => {
                  const isOverdue = moment(task.deadline).isBefore(moment());
                  return (
                    <Timeline.Item
                      key={task.id}
                      color={isOverdue ? 'red' : 'blue'}
                      dot={isOverdue ? <WarningOutlined style={{ color: '#ff4d4f' }} /> : <ClockCircleOutlined />}
                    >
                      <div>
                        <Text strong style={{ fontSize: 13 }}>
                          {task.name}
                        </Text>
                        <br />
                        <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                          {moment(task.deadline).format('DD/MM/YYYY HH:mm')}
                          {isOverdue && ' (Quá hạn!)'}
                        </Text>
                        <br />
                        <Tag color={PRIORITY_COLORS[task.priority]} style={{ marginTop: 4, borderRadius: 8, fontSize: 11 }}>
                          {task.priority}
                        </Tag>
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="🕐 Công việc gần đây" style={cardStyle}>
            {recentTasks.length === 0 ? (
              <Empty description="Chưa có công việc nào" />
            ) : (
              <div>
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 12px',
                      marginBottom: 8,
                      borderRadius: 10,
                      background: '#f9fafb',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: 13 }}>{task.name}</Text>
                      <Tag
                        color={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'orange' : 'blue'}
                        style={{ borderRadius: 8, fontSize: 11 }}
                      >
                        {STATUS_LABELS[task.status]}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {moment(task.createdAt).fromNow()}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
