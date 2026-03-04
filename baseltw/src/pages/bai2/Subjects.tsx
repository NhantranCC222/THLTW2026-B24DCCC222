import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table, Popconfirm, message } from 'antd';

interface Subject {
	id: string;
	name: string;
}

const STORAGE_KEY = 'bai2_subjects';

export default function Subjects() {
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Subject | null>(null);
	const [form] = Form.useForm();

	// Load localStorage
	useEffect(() => {
		const data = localStorage.getItem(STORAGE_KEY);
		if (data) {
			setSubjects(JSON.parse(data));
		}
	}, []);

	// Save localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
	}, [subjects]);

	const openAddModal = () => {
		setEditing(null);
		form.resetFields();
		setOpen(true);
	};

	const openEditModal = (record: Subject) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleSubmit = () => {
		form.validateFields().then(values => {
			if (editing) {
				setSubjects(subjects.map(s =>
					s.id === editing.id ? { ...s, ...values } : s
				));
				message.success('Cập nhật môn học thành công');
			} else {
				setSubjects([
					...subjects,
					{ id: Date.now().toString(), ...values },
				]);
				message.success('Thêm môn học thành công');
			}
			setOpen(false);
		});
	};

	const deleteSubject = (id: string) => {
		setSubjects(subjects.filter(s => s.id !== id));
		message.success('Đã xóa môn học');
	};

	const columns = [
		{
			title: 'Tên môn học',
			dataIndex: 'name',
		},
		{
			title: 'Hành động',
			render: (_: any, record: Subject) => (
				<>
					<Button type="link" onClick={() => openEditModal(record)}>
						Sửa
					</Button>
					<Popconfirm
						title="Xóa môn học?"
						onConfirm={() => deleteSubject(record.id)}
					>
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
			<h2>📚 Quản lý môn học</h2>

			<Button type="primary" onClick={openAddModal} style={{ marginBottom: 16 }}>
				Thêm môn học
			</Button>

			<Table
				rowKey="id"
				columns={columns}
				dataSource={subjects}
				pagination={false}
			/>

			<Modal
				title={editing ? 'Sửa môn học' : 'Thêm môn học'}
				visible={open}
				onOk={handleSubmit}
				onCancel={() => setOpen(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Tên môn học"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên môn' }]}
					>
						<Input placeholder="Ví dụ: Toán, Văn, Anh..." />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}