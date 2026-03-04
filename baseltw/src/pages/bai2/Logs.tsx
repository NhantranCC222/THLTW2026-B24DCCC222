import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Table,
  Select,
  DatePicker,
  Popconfirm,
  message,
} from 'antd';
import dayjs from 'dayjs';

interface Subject {
  id: string;
  name: string;
}

interface StudyLog {
  id: string;
  subjectId: string;
  datetime: string;
  duration: number;
  content: string;
  note?: string;
}

const SUBJECT_KEY = 'bai2_subjects';
const LOG_KEY = 'bai2_logs';

export default function Logs() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudyLog | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setSubjects(JSON.parse(localStorage.getItem(SUBJECT_KEY) || '[]'));
    setLogs(JSON.parse(localStorage.getItem(LOG_KEY) || '[]'));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }, [logs]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: StudyLog) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      datetime: dayjs(record.datetime),
    });
    setOpen(true);
  };

  const submit = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        datetime: values.datetime.toISOString(),
      };

      if (editing) {
        setLogs(logs.map(l => (l.id === editing.id ? { ...editing, ...data } : l)));
        message.success('Cập nhật lịch học thành công');
      } else {
        setLogs([...logs, { id: Date.now().toString(), ...data }]);
        message.success('Thêm lịch học thành công');
      }
      setOpen(false);
    });
  };

  const remove = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
    message.success('Đã xóa lịch học');
  };

  const columns = [
    {
      title: 'Môn học',
      render: (_: any, r: StudyLog) =>
        subjects.find(s => s.id === r.subjectId)?.name,
    },
    {
      title: 'Thời gian',
      render: (_: any, r: StudyLog) =>
        dayjs(r.datetime).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
    },
    {
      title: 'Hành động',
      render: (_: any, r: StudyLog) => (
        <>
          <Button type="link" onClick={() => openEdit(r)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa?" onConfirm={() => remove(r.id)}>
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>🕒 Quản lý lịch học</h2>

      <Button type="primary" onClick={openAdd} style={{ marginBottom: 16 }}>
        Thêm lịch học
      </Button>

      <Table rowKey="id" dataSource={logs} columns={columns} />

      <Modal
        title={editing ? 'Sửa lịch học' : 'Thêm lịch học'}
        visible={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
            <Select>
              {subjects.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="datetime" label="Thời gian học" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="content" label="Nội dung học" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}