import { useEffect, useState, useMemo } from 'react';
import {
	Button,
	Card,
	Col,
	Row,
	Modal,
	Form,
	Input,
	DatePicker,
	InputNumber,
	Select,
	Tag,
	Popconfirm,
	message,
	Tooltip,
	Empty,
} from 'antd';
import {
	PlusOutlined,
	DeleteOutlined,
	CalendarOutlined,
	DollarOutlined,
	EnvironmentOutlined,
	EditOutlined,
	MenuOutlined,
	CarOutlined,
	ClockCircleOutlined,
	SwapOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import type { Itinerary, ItineraryDay, ItineraryItem, Destination } from '@/models/travelplanner';
import './style.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
	draft: { label: 'Nháp', color: 'orange' },
	confirmed: { label: 'Đã xác nhận', color: 'green' },
	completed: { label: 'Hoàn thành', color: 'blue' },
};

const LichTrinh: React.FC = () => {
	const {
		destinations,
		itineraries,
		loadDestinations,
		loadItineraries,
		addItinerary,
		updateItinerary,
		deleteItinerary,
		getItineraryBudget,
	} = useModel('travelplanner');

	const [createModal, setCreateModal] = useState(false);
	const [editingItin, setEditingItin] = useState<Itinerary | null>(null);
	const [selectedItin, setSelectedItin] = useState<Itinerary | null>(null);
	const [addDestModal, setAddDestModal] = useState<{ dayIndex: number } | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		loadDestinations();
		loadItineraries();
	}, []);

	// When itineraries updates, refresh selectedItin
	useEffect(() => {
		if (selectedItin) {
			const updated = itineraries.find((i) => i.id === selectedItin.id);
			if (updated) setSelectedItin(updated);
		}
	}, [itineraries]);

	const generateDays = (start: string, end: string): ItineraryDay[] => {
		const days: ItineraryDay[] = [];
		const startDate = moment(start);
		const endDate = moment(end);
		const diff = endDate.diff(startDate, 'days') + 1;
		for (let i = 0; i < diff; i++) {
			days.push({
				date: startDate.clone().add(i, 'days').format('YYYY-MM-DD'),
				destinations: [],
			});
		}
		return days;
	};

	const handleCreate = (values: any) => {
		const [startDate, endDate] = values.dateRange;
		const start = startDate.format('YYYY-MM-DD');
		const end = endDate.format('YYYY-MM-DD');
		const days = generateDays(start, end);

		const newItin = addItinerary({
			name: values.name,
			startDate: start,
			endDate: end,
			totalBudget: values.totalBudget || 0,
			days,
			status: 'draft',
		});

		setSelectedItin(newItin);
		setCreateModal(false);
		form.resetFields();
		message.success('Tạo lịch trình thành công!');
	};

	const handleAddDest = (dayIndex: number, destinationId: string) => {
		if (!selectedItin) return;

		const dest = destinations.find((d) => d.id === destinationId);
		if (!dest) return;

		const newItem: ItineraryItem = {
			id: `item-${Date.now()}`,
			destinationId,
			startTime: '08:00',
			endTime: `${8 + dest.visitDuration}:00`,
			notes: '',
		};

		const updatedDays = [...selectedItin.days];
		updatedDays[dayIndex] = {
			...updatedDays[dayIndex],
			destinations: [...updatedDays[dayIndex].destinations, newItem],
		};

		updateItinerary(selectedItin.id, { days: updatedDays });
		setAddDestModal(null);
		message.success(`Đã thêm ${dest.name}`);
	};

	const handleRemoveItem = (dayIndex: number, itemId: string) => {
		if (!selectedItin) return;

		const updatedDays = [...selectedItin.days];
		updatedDays[dayIndex] = {
			...updatedDays[dayIndex],
			destinations: updatedDays[dayIndex].destinations.filter((d) => d.id !== itemId),
		};

		updateItinerary(selectedItin.id, { days: updatedDays });
	};

	const moveItem = (dayIndex: number, itemIndex: number, direction: 'up' | 'down') => {
		if (!selectedItin) return;

		const updatedDays = [...selectedItin.days];
		const items = [...updatedDays[dayIndex].destinations];
		const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

		if (newIndex < 0 || newIndex >= items.length) return;

		[items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
		updatedDays[dayIndex] = { ...updatedDays[dayIndex], destinations: items };

		updateItinerary(selectedItin.id, { days: updatedDays });
	};

	const getDestById = (id: string) => destinations.find((d) => d.id === id);

	const getItemCost = (item: ItineraryItem) => {
		if (item.customBudget) {
			return item.customBudget.food + item.customBudget.accommodation + item.customBudget.transport + item.customBudget.entrance;
		}
		const dest = getDestById(item.destinationId);
		if (dest) return dest.costFood + dest.costAccommodation + dest.costTransport + dest.costEntrance;
		return 0;
	};

	const budgetCategories = useMemo(() => {
		if (!selectedItin) return [];
		return getItineraryBudget(selectedItin.id);
	}, [selectedItin, getItineraryBudget]);

	const totalSpent = useMemo(() => {
		return budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
	}, [budgetCategories]);

	const getTravelTime = (from: Destination | undefined, to: Destination | undefined) => {
		if (!from || !to) return null;
		// Simulate travel time based on locations
		const sameCity = from.location === to.location;
		const time = sameCity ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 120) + 60;
		return time;
	};

	return (
		<div className='lichTrinh-container'>
			<div className='lichTrinh-header'>
				<h2>📅 Lịch trình du lịch</h2>
				<Button
					type='primary'
					icon={<PlusOutlined />}
					size='large'
					onClick={() => setCreateModal(true)}
					style={{ borderRadius: 12, height: 44, fontWeight: 600, background: '#302b63', borderColor: '#302b63' }}
				>
					Tạo lịch trình mới
				</Button>
			</div>

			<Row gutter={[24, 24]}>
				{/* Left: Itinerary List */}
				<Col xs={24} lg={8}>
					<div className='itin-list'>
						{itineraries.length === 0 ? (
							<Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
								<Empty description='Chưa có lịch trình nào' />
								<Button
									type='primary'
									onClick={() => setCreateModal(true)}
									style={{ marginTop: 16, borderRadius: 8, background: '#302b63', borderColor: '#302b63' }}
								>
									Tạo lịch trình đầu tiên
								</Button>
							</Card>
						) : (
							itineraries.map((itin) => (
								<Card
									key={itin.id}
									className={`itin-card ${selectedItin?.id === itin.id ? 'active' : ''}`}
									onClick={() => setSelectedItin(itin)}
								>
									<div className='itin-card-header'>
										<div className='itin-name'>{itin.name}</div>
										<Tag className={`itin-status ${itin.status}`}>
											{STATUS_MAP[itin.status]?.label}
										</Tag>
									</div>
									<div className='itin-card-meta'>
										<div className='meta-item'>
											<CalendarOutlined />
											{moment(itin.startDate).format('DD/MM')} - {moment(itin.endDate).format('DD/MM/YYYY')}
										</div>
										<div className='meta-item'>
											<DollarOutlined />
											{formatCurrency(itin.totalBudget)}
										</div>
									</div>
									<div className='itin-card-meta'>
										<div className='meta-item'>
											<EnvironmentOutlined />
											{itin.days.reduce((sum, d) => sum + d.destinations.length, 0)} điểm đến
										</div>
										<div className='meta-item'>
											<ClockCircleOutlined />
											{itin.days.length} ngày
										</div>
									</div>
									<div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
										<Popconfirm
											title='Xóa lịch trình này?'
											onConfirm={(e) => {
												e?.stopPropagation();
												deleteItinerary(itin.id);
												if (selectedItin?.id === itin.id) setSelectedItin(null);
												message.success('Đã xóa lịch trình');
											}}
											onCancel={(e) => e?.stopPropagation()}
										>
											<Button
												size='small'
												danger
												icon={<DeleteOutlined />}
												onClick={(e) => e.stopPropagation()}
											>
												Xóa
											</Button>
										</Popconfirm>
									</div>
								</Card>
							))
						)}
					</div>
				</Col>

				{/* Right: Editor */}
				<Col xs={24} lg={16}>
					{selectedItin ? (
						<div className='itin-editor'>
							<div className='editor-header'>
								<div>
									<h3>{selectedItin.name}</h3>
									<span style={{ opacity: 0.8, fontSize: 14 }}>
										{moment(selectedItin.startDate).format('DD/MM/YYYY')} →{' '}
										{moment(selectedItin.endDate).format('DD/MM/YYYY')}
									</span>
								</div>
								<div style={{ textAlign: 'right' }}>
									<div style={{ fontSize: 13, opacity: 0.8 }}>Ngân sách</div>
									<div className='editor-budget-total'>{formatCurrency(selectedItin.totalBudget)}</div>
								</div>
							</div>

							<div className='editor-body'>
								{/* Budget Warning */}
								{selectedItin.totalBudget > 0 && totalSpent > selectedItin.totalBudget && (
									<div
										style={{
											background: 'linear-gradient(135deg, #fff1f0, #fff7e6)',
											padding: '12px 16px',
											borderRadius: 12,
											marginBottom: 16,
											display: 'flex',
											alignItems: 'center',
											gap: 8,
										}}
									>
										<span style={{ fontSize: 20 }}>⚠️</span>
										<div>
											<strong style={{ color: '#cf1322' }}>Vượt ngân sách!</strong>
											<div style={{ color: '#666', fontSize: 13 }}>
												Đã chi {formatCurrency(totalSpent)} / {formatCurrency(selectedItin.totalBudget)} (vượt{' '}
												{formatCurrency(totalSpent - selectedItin.totalBudget)})
											</div>
										</div>
									</div>
								)}

								{/* Days */}
								{selectedItin.days.map((day, dayIndex) => (
									<div key={dayIndex} className='day-section'>
										<div className='day-header'>
											<div>
												<span className='day-title'>Ngày {dayIndex + 1}</span>
												<span className='day-date' style={{ marginLeft: 12 }}>
													{moment(day.date).format('dddd, DD/MM/YYYY')}
												</span>
											</div>
											<Button
												type='primary'
												ghost
												size='small'
												icon={<PlusOutlined />}
												onClick={() => setAddDestModal({ dayIndex })}
												style={{ borderRadius: 8 }}
											>
												Thêm
											</Button>
										</div>

										<div className='day-items'>
											{day.destinations.length === 0 ? (
												<div className='empty-day'>
													<EnvironmentOutlined />
													<span>Chưa có điểm đến</span>
													<Button
														type='link'
														size='small'
														onClick={() => setAddDestModal({ dayIndex })}
													>
														+ Thêm điểm đến
													</Button>
												</div>
											) : (
												day.destinations.map((item, itemIndex) => {
													const dest = getDestById(item.destinationId);
													const prevDest =
														itemIndex > 0
															? getDestById(day.destinations[itemIndex - 1].destinationId)
															: undefined;
													const travelTime =
														itemIndex > 0 ? getTravelTime(prevDest, dest) : null;

													return (
														<div key={item.id}>
															{travelTime !== null && (
																<div className='travel-info'>
																	<CarOutlined />
																	<span>~{travelTime} phút di chuyển</span>
																</div>
															)}
															<div className='day-item'>
																<div className='drag-handle'>
																	<MenuOutlined />
																</div>
																{dest?.image && (
																	<img
																		src={dest.image}
																		alt={dest?.name}
																		className='item-image'
																	/>
																)}
																<div className='item-info'>
																	<div className='item-name'>
																		{dest?.name || 'Không xác định'}
																	</div>
																	<div className='item-time'>
																		<ClockCircleOutlined style={{ marginRight: 4 }} />
																		{dest?.visitDuration || 0}h tham quan
																	</div>
																</div>
																<div className='item-cost'>
																	{formatCurrency(getItemCost(item))}
																</div>
																<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
																	<Button
																		type='text'
																		size='small'
																		icon={<SwapOutlined rotate={90} />}
																		disabled={itemIndex === 0}
																		onClick={() => moveItem(dayIndex, itemIndex, 'up')}
																	/>
																	<Button
																		type='text'
																		size='small'
																		icon={<SwapOutlined rotate={90} />}
																		disabled={
																			itemIndex === day.destinations.length - 1
																		}
																		onClick={() =>
																			moveItem(dayIndex, itemIndex, 'down')
																		}
																		style={{ transform: 'scaleY(-1)' }}
																	/>
																</div>
																<Tooltip title='Xóa'>
																	<Button
																		type='text'
																		danger
																		size='small'
																		icon={<DeleteOutlined />}
																		onClick={() =>
																			handleRemoveItem(dayIndex, item.id)
																		}
																	/>
																</Tooltip>
															</div>
														</div>
													);
												})
											)}
										</div>
									</div>
								))}

								{/* Budget Summary */}
								{budgetCategories.length > 0 && budgetCategories.some((c) => c.amount > 0) && (
									<div className='budget-summary-inline'>
										<h4 style={{ marginBottom: 12, fontWeight: 700, color: '#302b63' }}>
											💰 Tổng chi phí ước tính
										</h4>
										{budgetCategories.map((cat) => (
											<div key={cat.category} className='budget-row'>
												<span>
													<span
														style={{
															display: 'inline-block',
															width: 10,
															height: 10,
															borderRadius: '50%',
															background: cat.color,
															marginRight: 8,
														}}
													/>
													{cat.category}
												</span>
												<span style={{ fontWeight: 600 }}>{formatCurrency(cat.amount)}</span>
											</div>
										))}
										<div className='budget-row total'>
											<span>Tổng cộng</span>
											<span>{formatCurrency(totalSpent)}</span>
										</div>
									</div>
								)}
							</div>
						</div>
					) : (
						<Card
							style={{
								borderRadius: 16,
								textAlign: 'center',
								padding: '60px 20px',
								background: 'linear-gradient(135deg, #f8f9ff, #f0f5ff)',
								border: 'none',
							}}
						>
							<div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
							<h3 style={{ color: '#302b63', fontWeight: 700 }}>Chọn hoặc tạo lịch trình</h3>
							<p style={{ color: '#666' }}>
								Chọn một lịch trình từ danh sách bên trái hoặc tạo mới để bắt đầu
							</p>
						</Card>
					)}
				</Col>
			</Row>

			{/* Create Modal */}
			<Modal
				title='Tạo lịch trình mới'
				visible={createModal}
				onCancel={() => {
					setCreateModal(false);
					form.resetFields();
				}}
				footer={null}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleCreate}>
					<Form.Item
						name='name'
						label='Tên lịch trình'
						rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
					>
						<Input placeholder='VD: Du lịch Đà Nẵng - Hội An' size='large' />
					</Form.Item>
					<Form.Item
						name='dateRange'
						label='Thời gian'
						rules={[{ required: true, message: 'Chọn ngày' }]}
					>
						<RangePicker style={{ width: '100%' }} size='large' format='DD/MM/YYYY' />
					</Form.Item>
					<Form.Item
						name='totalBudget'
						label='Ngân sách dự kiến (VNĐ)'
						rules={[{ required: true, message: 'Nhập ngân sách' }]}
					>
						<InputNumber
							style={{ width: '100%' }}
							size='large'
							formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={(value: any) => value.replace(/,/g, '')}
							min={0}
							step={500000}
							placeholder='VD: 10,000,000'
						/>
					</Form.Item>
					<div style={{ textAlign: 'right' }}>
						<Button onClick={() => setCreateModal(false)} style={{ marginRight: 8 }}>
							Hủy
						</Button>
						<Button
							type='primary'
							htmlType='submit'
							style={{ background: '#302b63', borderColor: '#302b63' }}
						>
							Tạo lịch trình
						</Button>
					</div>
				</Form>
			</Modal>

			{/* Add Destination Modal */}
			<Modal
				title={`Thêm điểm đến - Ngày ${addDestModal ? addDestModal.dayIndex + 1 : ''}`}
				visible={!!addDestModal}
				onCancel={() => setAddDestModal(null)}
				footer={null}
				destroyOnClose
				width={600}
			>
				<div className='dest-selector'>
					<Input.Search
						placeholder='Tìm điểm đến...'
						style={{ marginBottom: 16 }}
						size='large'
					/>
					<div style={{ maxHeight: 400, overflow: 'auto' }}>
						{destinations.map((dest) => {
							const totalCost = dest.costFood + dest.costAccommodation + dest.costTransport + dest.costEntrance;
							return (
								<div
									key={dest.id}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 12,
										padding: '12px 16px',
										borderRadius: 12,
										marginBottom: 8,
										cursor: 'pointer',
										border: '1px solid #f0f0f0',
										transition: 'all 0.2s',
									}}
									onClick={() => addDestModal && handleAddDest(addDestModal.dayIndex, dest.id)}
									onMouseEnter={(e) => {
										(e.currentTarget as HTMLElement).style.background = '#f0f5ff';
										(e.currentTarget as HTMLElement).style.borderColor = '#d6d0f0';
									}}
									onMouseLeave={(e) => {
										(e.currentTarget as HTMLElement).style.background = 'transparent';
										(e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
									}}
								>
									<img
										src={dest.image}
										alt={dest.name}
										style={{
											width: 56,
											height: 56,
											borderRadius: 12,
											objectFit: 'cover',
										}}
									/>
									<div style={{ flex: 1 }}>
										<div style={{ fontWeight: 600, color: '#1a1a2e' }}>{dest.name}</div>
										<div style={{ fontSize: 13, color: '#999' }}>
											<EnvironmentOutlined /> {dest.location} · ⭐ {dest.rating}
										</div>
									</div>
									<div style={{ fontWeight: 700, color: '#302b63' }}>{formatCurrency(totalCost)}</div>
								</div>
							);
						})}
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default LichTrinh;
