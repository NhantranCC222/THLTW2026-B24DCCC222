import React, { useState, useEffect } from 'react';
import { Button, Tag, Typography, Popconfirm, message, Empty, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import moment from 'moment';
import { loadTasks, saveTasks } from '../storage';
import { ITask, TaskStatus, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../types';
import TaskFormModal from '../components/TaskFormModal';

const { Title, Text, Paragraph } = Typography;

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done'];

const COLUMN_ICONS: Record<TaskStatus, string> = {
  todo: '📋',
  in_progress: '⚡',
  done: '✅',
};

const COLUMN_GRADIENTS: Record<TaskStatus, string> = {
  todo: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  in_progress: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  done: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
};

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const updateTasks = (newTasks: ITask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    const taskId = result.draggableId;

    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    updateTasks(updatedTasks);
    if (source.droppableId !== destination.droppableId) {
      message.success(`Đã chuyển sang "${STATUS_LABELS[newStatus]}"`);
    }
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

  const getColumnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          📌 Kanban Board
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16 }}>
          {COLUMNS.map((status) => {
            const columnTasks = getColumnTasks(status);
            return (
              <div
                key={status}
                style={{
                  flex: 1,
                  minWidth: 300,
                  background: '#f8f9fb',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    background: COLUMN_GRADIENTS[status],
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    {COLUMN_ICONS[status]} {STATUS_LABELS[status]}
                  </span>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.25)',
                      color: '#fff',
                      borderRadius: 20,
                      padding: '2px 12px',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: 12,
                        minHeight: 400,
                        background: snapshot.isDraggingOver ? 'rgba(102,126,234,0.06)' : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<Text type="secondary">Kéo thả task vào đây</Text>}
                          style={{ marginTop: 40 }}
                        />
                      )}
                      {columnTasks.map((task, index) => {
                        const isOverdue = task.status !== 'done' && task.deadline && moment(task.deadline).isBefore(moment());
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  marginBottom: 10,
                                  borderRadius: 12,
                                  background: '#fff',
                                  padding: '14px 16px',
                                  boxShadow: snapshot.isDragging
                                    ? '0 8px 32px rgba(102,126,234,0.3)'
                                    : '0 2px 8px rgba(0,0,0,0.06)',
                                  border: isOverdue ? '1px solid #ff4d4f' : '1px solid #f0f0f0',
                                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
                                  cursor: 'grab',
                                }}
                              >
                                {/* Task Name */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                  <Text strong style={{ fontSize: 14, flex: 1, paddingRight: 8 }}>
                                    {task.name}
                                  </Text>
                                  <Tag
                                    color={PRIORITY_COLORS[task.priority]}
                                    style={{ borderRadius: 8, fontSize: 11, margin: 0, lineHeight: '20px' }}
                                  >
                                    {task.priority}
                                  </Tag>
                                </div>

                                {/* Description */}
                                {task.description && (
                                  <Paragraph
                                    type="secondary"
                                    ellipsis={{ rows: 2 }}
                                    style={{ fontSize: 12, marginBottom: 8 }}
                                  >
                                    {task.description}
                                  </Paragraph>
                                )}

                                {/* Deadline */}
                                {task.deadline && (
                                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {isOverdue ? (
                                      <WarningOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                                    ) : (
                                      <ClockCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                                    )}
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: isOverdue ? '#ff4d4f' : '#999',
                                        fontWeight: isOverdue ? 600 : 400,
                                      }}
                                    >
                                      {moment(task.deadline).format('DD/MM/YYYY HH:mm')}
                                      {isOverdue && ' (Quá hạn)'}
                                    </Text>
                                  </div>
                                )}

                                {/* Tags */}
                                {task.tags.length > 0 && (
                                  <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {task.tags.map((tag) => (
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
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                  <Tooltip title="Chỉnh sửa">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTask(task);
                                        setModalVisible(true);
                                      }}
                                      style={{ color: '#667eea', borderRadius: 8 }}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Xóa công việc này?"
                                    onConfirm={(e) => {
                                      e?.stopPropagation();
                                      handleDelete(task.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                  >
                                    <Tooltip title="Xóa">
                                      <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ borderRadius: 8 }}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskFormModal
        visible={modalVisible}
        editingTask={editingTask}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default KanbanBoard;
