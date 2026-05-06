import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Input, Select, Space, Popconfirm, message, Typography, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { loadTasks, saveTasks } from '../storage';
import { ITask, TaskStatus, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../types';
import TaskFormModal from '../components/TaskFormModal';

const { Title } = Typography;
const { Option } = Select;

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const updateTasks = (newTasks: ITask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleSubmit = (task: ITask) => {
    if (editingTask) {
      updateTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      message.success('Đã cập nhật công việc!');
    } else {
      updateTasks([...tasks, task]);
      message.success('Đã thêm công việc mới!');
    }
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
    message.success('Đã xóa công việc!');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = task.name.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchText, statusFilter]);

  const columns: ColumnsType<ITask> = [
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: ITask) => {
        const isOverdue =
          record.status !== 'done' && record.deadline && moment(record.deadline).isBefore(moment());
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOverdue && (
              <Tooltip title="Quá hạn!">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
              </Tooltip>
            )}
            <span style={{ fontWeight: 600 }}>{text}</span>
          </div>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
      render: (text: string) => (
        <span style={{ color: '#666' }}>{text || '—'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      filters: [
        { text: 'Cần làm', value: 'todo' },
        { text: 'Đang làm', value: 'in_progress' },
        { text: 'Hoàn thành', value: 'done' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: TaskStatus) => (
        <Tag
          color={STATUS_COLORS[status]}
          style={{
            borderRadius: 12,
            padding: '2px 14px',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      filters: [
        { text: 'Cao', value: 'Cao' },
        { text: 'Trung bình', value: 'Trung bình' },
        { text: 'Thấp', value: 'Thấp' },
      ],
      onFilter: (value, record) => record.priority === value,
      sorter: (a, b) => {
        const order = { 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };
        return order[a.priority] - order[b.priority];
      },
      render: (priority: string) => (
        <Tag
          color={PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}
          style={{ borderRadius: 12, padding: '2px 14px', fontWeight: 600, fontSize: 12 }}
        >
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 170,
      sorter: (a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      },
      defaultSortOrder: 'ascend',
      render: (deadline: string, record: ITask) => {
        if (!deadline) return <span style={{ color: '#ccc' }}>—</span>;
        const isOverdue = record.status !== 'done' && moment(deadline).isBefore(moment());
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : '#333', fontWeight: isOverdue ? 600 : 400 }}>
            {moment(deadline).format('DD/MM/YYYY HH:mm')}
          </span>
        );
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) =>
        tags && tags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags.map((tag) => (
              <Tag
                key={tag}
                style={{
                  borderRadius: 8,
                  fontSize: 11,
                  margin: 0,
                  background: '#f0f5ff',
                  border: '1px solid #d6e4ff',
                  color: '#2f54eb',
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        ) : (
          <span style={{ color: '#ccc' }}>—</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_: any, record: ITask) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTask(record);
                setModalVisible(true);
              }}
              style={{ color: '#667eea', borderRadius: 8 }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa công việc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          📝 Danh sách công việc
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingTask(null);
            setModalVisible(true);
          }}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            height: 44,
            paddingLeft: 24,
            paddingRight: 24,
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          }}
        >
          Thêm công việc
        </Button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          padding: '16px 20px',
          background: '#f8f9fb',
          borderRadius: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FilterOutlined style={{ color: '#667eea', fontSize: 16 }} />
        <Input
          placeholder="Tìm kiếm theo tên..."
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 10 }}
        />
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          style={{ width: 180 }}
          dropdownStyle={{ borderRadius: 10 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="todo">📋 Cần làm</Option>
          <Option value="in_progress">⚡ Đang làm</Option>
          <Option value="done">✅ Hoàn thành</Option>
        </Select>
        <span style={{ color: '#999', fontSize: 13, marginLeft: 'auto' }}>
          Hiển thị {filteredTasks.length} / {tasks.length} công việc
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} công việc`,
        }}
        scroll={{ x: 1000 }}
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
        rowClassName={(record) => {
          if (record.status !== 'done' && record.deadline && moment(record.deadline).isBefore(moment())) {
            return 'overdue-row';
          }
          return '';
        }}
      />

      <TaskFormModal
        visible={modalVisible}
        editingTask={editingTask}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
      />

      <style>{`
        .overdue-row {
          background: #fff2f0 !important;
        }
        .overdue-row:hover > td {
          background: #ffe8e6 !important;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
