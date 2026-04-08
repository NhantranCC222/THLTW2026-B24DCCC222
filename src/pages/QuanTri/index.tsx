import { useEffect, useState, useMemo } from 'react';
import {
	Card,
	Col,
	Row,
	Table,
	Button,
	Modal,
	Form,
	Input,
	InputNumber,
	Select,
	Rate,
	Tag,
	Popconfirm,
	message,
	Tabs,
	Empty,
	Tooltip,
} from 'antd';
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	EnvironmentOutlined,
	PictureOutlined,
	BarChartOutlined,
	AppstoreOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import type { Destination } from '@/models/travelplanner';
import './style.less';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TYPE_MAP: Record<string, { label: string; color: string; emoji: string }> = {
	beach: { label: 'Biển', color: '#45B7D1', emoji: '🏖️' },
	mountain: { label: 'Núi', color: '#96CEB4', emoji: '⛰️' },
	city: { label: 'Thành phố', color: '#DDA0DD', emoji: '🏙️' },
	countryside: { label: 'Nông thôn', color: '#98D8C8', emoji: '🌾' },
	island: { label: 'Đảo', color: '#F7DC6F', emoji: '🏝️' },
};

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const QuanTri: React.FC = () => {
	const {
		destinations,
		itineraries,
		loadDestinations,
		loadItineraries,
		addDestination,
		updateDestination,
		deleteDestination,
		getMonthlyStats,
		getPopularDestinations,
		getTotalRevenue,
		getItineraryBudget,
	} = useModel('travelplanner');

	const [formVisible, setFormVisible] = useState(false);
	const [editingDest, setEditingDest] = useState<Destination | null>(null);
	const [searchText, setSearchText] = useState('');
	const [form] = Form.useForm();

	useEffect(() => {
		loadDestinations();
		loadItineraries();
	}, []);

	// Stats
	const monthlyStats = useMemo(() => getMonthlyStats(), [itineraries]);
	const popularDests = useMemo(() => getPopularDestinations(), [itineraries, destinations]);
	const totalRevenue = useMemo(() => getTotalRevenue(), [itineraries]);

	const totalCategoryRevenue = useMemo(() => {
		let food = 0,
			accommodation = 0,
			transport = 0,
			entrance = 0;
		itineraries.forEach((itin) => {
			const budget = getItineraryBudget(itin.id);
			budget.forEach((cat) => {
				if (cat.category === 'Ăn uống') food += cat.amount;
				if (cat.category === 'Lưu trú') accommodation += cat.amount;
				if (cat.category === 'Di chuyển') transport += cat.amount;
				if (cat.category === 'Vé tham quan') entrance += cat.amount;
			});
		});
		return { food, accommodation, transport, entrance, total: food + accommodation + transport + entrance };
	}, [itineraries, getItineraryBudget]);

	const filteredDests = useMemo(() => {
		if (!searchText) return destinations;
		const s = searchText.toLowerCase();
		return destinations.filter(
			(d) => d.name.toLowerCase().includes(s) || d.location.toLowerCase().includes(s),
		);
	}, [destinations, searchText]);

	const handleFormSubmit = (values: any) => {
		const highlights = values.highlights
			? values.highlights.split(',').map((h: string) => h.trim())
			: [];

		if (editingDest) {
			updateDestination(editingDest.id, {
				...values,
				highlights,
			});
			message.success('Cập nhật điểm đến thành công!');
		} else {
			addDestination({
				...values,
				highlights,
				reviewCount: Math.floor(Math.random() * 2000) + 500,
			});
			message.success('Thêm điểm đến thành công!');
		}

		setFormVisible(false);
		setEditingDest(null);
		form.resetFields();
	};

	const handleEdit = (record: Destination) => {
		setEditingDest(record);
		form.setFieldsValue({
			...record,
			highlights: record.highlights.join(', '),
		});
		setFormVisible(true);
	};

	const handleDelete = (id: string) => {
		deleteDestination(id);
		message.success('Đã xóa điểm đến');
	};

	// Monthly chart
	const monthlyChartOptions: any = {
		chart: { type: 'area', toolbar: { show: false } },
		xaxis: { categories: monthlyStats.map((s) => s.month) },
		colors: ['#302b63'],
		stroke: { curve: 'smooth', width: 3 },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5,
				opacityTo: 0.1,
			},
		},
		dataLabels: { enabled: true },
		grid: { borderColor: '#f0f0f0' },
		tooltip: { theme: 'dark' },
	};

	// Type distribution chart
	const typeDistribution = useMemo(() => {
		const typeCount: Record<string, number> = {};
		destinations.forEach((d) => {
			typeCount[d.type] = (typeCount[d.type] || 0) + 1;
		});
		return Object.entries(typeCount).map(([type, count]) => ({
			type,
			label: TYPE_MAP[type]?.label || type,
			count,
			color: TYPE_MAP[type]?.color || '#999',
		}));
	}, [destinations]);

	const typeChartOptions: any = {
		chart: { type: 'pie' },
		labels: typeDistribution.map((t) => `${TYPE_MAP[t.type]?.emoji || ''} ${t.label}`),
		colors: typeDistribution.map((t) => t.color),
		legend: { position: 'bottom' },
		dataLabels: { enabled: true },
		stroke: { width: 2, colors: ['#fff'] },
	};

	// Revenue by category
	const revenuePieOptions: any = {
		chart: { type: 'donut' },
		labels: ['Ăn uống', 'Lưu trú', 'Di chuyển', 'Vé tham quan'],
		colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
		legend: { show: false },
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: '65%',
				},
			},
		},
		stroke: { width: 2, colors: ['#fff'] },
		tooltip: {
			y: { formatter: (val: number) => formatCurrency(val) },
		},
	};

	const columns: any[] = [
		{
			title: 'Hình ảnh',
			dataIndex: 'image',
			key: 'image',
			width: 80,
			render: (img: string) => (
				<img src={img} alt='' className='dest-table-image' />
			),
		},
		{
			title: 'Tên điểm đến',
			dataIndex: 'name',
			key: 'name',
			render: (name: string, record: Destination) => (
				<div>
					<div style={{ fontWeight: 600 }}>{name}</div>
					<div style={{ fontSize: 12, color: '#999' }}>
						<EnvironmentOutlined /> {record.location}
					</div>
				</div>
			),
		},
		{
			title: 'Loại',
			dataIndex: 'type',
			key: 'type',
			width: 100,
			render: (type: string) => (
				<Tag color={TYPE_MAP[type]?.color} style={{ borderRadius: 12 }}>
					{TYPE_MAP[type]?.emoji} {TYPE_MAP[type]?.label}
				</Tag>
			),
			filters: Object.entries(TYPE_MAP).map(([key, val]) => ({ text: val.label, value: key })),
			onFilter: (value: string, record: Destination) => record.type === value,
		},
		{
			title: 'Rating',
			dataIndex: 'rating',
			key: 'rating',
			width: 100,
			render: (val: number) => (
				<span>
					⭐ <strong>{val}</strong>
				</span>
			),
			sorter: (a: Destination, b: Destination) => a.rating - b.rating,
		},
		{
			title: 'Thời gian (h)',
			dataIndex: 'visitDuration',
			key: 'visitDuration',
			width: 100,
			align: 'center' as const,
		},
		{
			title: 'Ăn uống',
			dataIndex: 'costFood',
			key: 'costFood',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
			responsive: ['lg'],
		},
		{
			title: 'Lưu trú',
			dataIndex: 'costAccommodation',
			key: 'costAccommodation',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
			responsive: ['lg'],
		},
		{
			title: 'Tổng chi phí',
			key: 'totalCost',
			render: (_: any, record: Destination) =>
				formatCurrency(
					record.costFood + record.costAccommodation + record.costTransport + record.costEntrance,
				),
			align: 'right' as const,
			sorter: (a: Destination, b: Destination) =>
				a.costFood + a.costAccommodation + a.costTransport + a.costEntrance -
				(b.costFood + b.costAccommodation + b.costTransport + b.costEntrance),
		},
		{
			title: 'Hành động',
			key: 'actions',
			width: 120,
			render: (_: any, record: Destination) => (
				<div style={{ display: 'flex', gap: 4 }}>
					<Tooltip title='Sửa'>
						<Button
							type='primary'
							ghost
							size='small'
							icon={<EditOutlined />}
							onClick={() => handleEdit(record)}
						/>
					</Tooltip>
					<Popconfirm
						title='Xóa điểm đến này?'
						onConfirm={() => handleDelete(record.id)}
					>
						<Tooltip title='Xóa'>
							<Button danger size='small' icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<div className='quanTri-container'>
			<div className='quanTri-header'>
				<h2>⚙️ Trang quản trị</h2>
				<p>Quản lý điểm đến và xem thống kê chi tiết</p>
			</div>

			{/* Admin Stats */}
			<Row gutter={[16, 16]} className='admin-stats-row'>
				<Col xs={12} sm={12} md={6}>
					<Card className='admin-stat-card'>
						<div className='stat-icon-box purple'>📍</div>
						<div className='stat-content'>
							<div className='stat-label'>Điểm đến</div>
							<div className='stat-value'>{destinations.length}</div>
						</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card className='admin-stat-card'>
						<div className='stat-icon-box blue'>📅</div>
						<div className='stat-content'>
							<div className='stat-label'>Lịch trình</div>
							<div className='stat-value'>{itineraries.length}</div>
						</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card className='admin-stat-card'>
						<div className='stat-icon-box green'>💰</div>
						<div className='stat-content'>
							<div className='stat-label'>Tổng thu</div>
							<div className='stat-value' style={{ fontSize: 18 }}>
								{formatCurrency(totalRevenue)}
							</div>
						</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card className='admin-stat-card'>
						<div className='stat-icon-box orange'>⭐</div>
						<div className='stat-content'>
							<div className='stat-label'>Rating TB</div>
							<div className='stat-value'>
								{destinations.length > 0
									? (destinations.reduce((s, d) => s + d.rating, 0) / destinations.length).toFixed(1)
									: 0}
							</div>
						</div>
					</Card>
				</Col>
			</Row>

			<Tabs defaultActiveKey='1' className='admin-tabs' size='large'>
				{/* ====== TAB 1: Destination Management ====== */}
				<TabPane
					tab={
						<span>
							<AppstoreOutlined /> Quản lý điểm đến
						</span>
					}
					key='1'
				>
					<Card className='admin-table-card'>
						<div className='table-header'>
							<Input
								className='table-search'
								placeholder='Tìm kiếm điểm đến...'
								prefix={<SearchOutlined />}
								allowClear
								onChange={(e) => setSearchText(e.target.value)}
								size='large'
							/>
							<Button
								type='primary'
								icon={<PlusOutlined />}
								size='large'
								onClick={() => {
									setEditingDest(null);
									form.resetFields();
									setFormVisible(true);
								}}
								style={{
									borderRadius: 12,
									height: 44,
									fontWeight: 600,
									background: '#302b63',
									borderColor: '#302b63',
								}}
							>
								Thêm điểm đến
							</Button>
						</div>

						<Table
							dataSource={filteredDests}
							columns={columns}
							rowKey='id'
							pagination={{ pageSize: 8, showSizeChanger: false }}
							scroll={{ x: 900 }}
						/>
					</Card>
				</TabPane>

				{/* ====== TAB 2: Statistics ====== */}
				<TabPane
					tab={
						<span>
							<BarChartOutlined /> Thống kê
						</span>
					}
					key='2'
				>
					<Row gutter={[24, 24]}>
						{/* Monthly itineraries */}
						<Col xs={24} lg={12}>
							<Card className='stats-chart-card' title='📈 Lịch trình tạo theo tháng'>
								{monthlyStats.length > 0 ? (
									<ReactApexChart
										options={monthlyChartOptions}
										series={[{ name: 'Lịch trình', data: monthlyStats.map((s) => s.count) }]}
										type='area'
										height={300}
									/>
								) : (
									<Empty description='Chưa có dữ liệu' />
								)}
							</Card>
						</Col>

						{/* Type distribution */}
						<Col xs={24} lg={12}>
							<Card className='stats-chart-card' title='📊 Phân bổ loại hình'>
								{typeDistribution.length > 0 ? (
									<ReactApexChart
										options={typeChartOptions}
										series={typeDistribution.map((t) => t.count)}
										type='pie'
										height={300}
									/>
								) : (
									<Empty description='Chưa có dữ liệu' />
								)}
							</Card>
						</Col>

						{/* Popular destinations */}
						<Col xs={24} lg={12}>
							<Card className='stats-chart-card' title='🔥 Điểm đến phổ biến'>
								{popularDests.length > 0 ? (
									<div className='popular-list'>
										{popularDests.map((item, index) => (
											<div key={item.destination?.id} className='popular-item'>
												<div
													className={`popular-rank ${
														index === 0
															? 'rank-1'
															: index === 1
															? 'rank-2'
															: index === 2
															? 'rank-3'
															: 'rank-other'
													}`}
												>
													{index + 1}
												</div>
												{item.destination?.image && (
													<img
														src={item.destination.image}
														alt=''
														className='popular-image'
													/>
												)}
												<div className='popular-info'>
													<div className='popular-name'>
														{item.destination?.name}
													</div>
													<div className='popular-location'>
														{item.destination?.location}
													</div>
												</div>
												<div className='popular-count'>
													{item.count} <span>lượt</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<Empty description='Chưa có dữ liệu' />
								)}
							</Card>
						</Col>

						{/* Revenue breakdown */}
						<Col xs={24} lg={12}>
							<Card className='stats-chart-card' title='💰 Doanh thu theo hạng mục'>
								{totalCategoryRevenue.total > 0 ? (
									<>
										<ReactApexChart
											options={revenuePieOptions}
											series={[
												totalCategoryRevenue.food,
												totalCategoryRevenue.accommodation,
												totalCategoryRevenue.transport,
												totalCategoryRevenue.entrance,
											]}
											type='donut'
											height={200}
										/>
										<div className='revenue-breakdown'>
											<div className='revenue-item'>
												<div className='revenue-label'>
													<div className='revenue-dot' style={{ background: '#FF6B6B' }} />
													🍜 Ăn uống
												</div>
												<div className='revenue-value'>
													{formatCurrency(totalCategoryRevenue.food)}
												</div>
											</div>
											<div className='revenue-item'>
												<div className='revenue-label'>
													<div className='revenue-dot' style={{ background: '#4ECDC4' }} />
													🏨 Lưu trú
												</div>
												<div className='revenue-value'>
													{formatCurrency(totalCategoryRevenue.accommodation)}
												</div>
											</div>
											<div className='revenue-item'>
												<div className='revenue-label'>
													<div className='revenue-dot' style={{ background: '#45B7D1' }} />
													🚗 Di chuyển
												</div>
												<div className='revenue-value'>
													{formatCurrency(totalCategoryRevenue.transport)}
												</div>
											</div>
											<div className='revenue-item'>
												<div className='revenue-label'>
													<div className='revenue-dot' style={{ background: '#96CEB4' }} />
													🎫 Vé tham quan
												</div>
												<div className='revenue-value'>
													{formatCurrency(totalCategoryRevenue.entrance)}
												</div>
											</div>
										</div>
									</>
								) : (
									<Empty description='Chưa có dữ liệu doanh thu' />
								)}
							</Card>
						</Col>
					</Row>
				</TabPane>
			</Tabs>

			{/* Add/Edit Modal */}
			<Modal
				title={editingDest ? '✏️ Chỉnh sửa điểm đến' : '➕ Thêm điểm đến mới'}
				visible={formVisible}
				onCancel={() => {
					setFormVisible(false);
					setEditingDest(null);
					form.resetFields();
				}}
				footer={null}
				destroyOnClose
				width={700}
				className='dest-form-modal'
			>
				<Form
					form={form}
					layout='vertical'
					onFinish={handleFormSubmit}
					initialValues={{ rating: 4.0, visitDuration: 6, costFood: 300000, costAccommodation: 800000, costTransport: 300000, costEntrance: 100000 }}
				>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name='name'
								label='Tên điểm đến'
								rules={[{ required: true, message: 'Nhập tên' }]}
							>
								<Input placeholder='VD: Vịnh Hạ Long' size='large' />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item
								name='location'
								label='Địa điểm'
								rules={[{ required: true, message: 'Nhập địa điểm' }]}
							>
								<Input placeholder='VD: Quảng Ninh' size='large' />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} md={8}>
							<Form.Item
								name='type'
								label='Loại hình'
								rules={[{ required: true, message: 'Chọn loại' }]}
							>
								<Select placeholder='Chọn loại hình' size='large'>
									{Object.entries(TYPE_MAP).map(([key, val]) => (
										<Option key={key} value={key}>
											{val.emoji} {val.label}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} md={8}>
							<Form.Item name='rating' label='Đánh giá'>
								<Rate allowHalf />
							</Form.Item>
						</Col>
						<Col xs={24} md={8}>
							<Form.Item name='visitDuration' label='Thời gian tham quan (giờ)'>
								<InputNumber min={1} max={24} style={{ width: '100%' }} size='large' />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name='image'
						label='URL hình ảnh'
						rules={[{ required: true, message: 'Nhập URL ảnh' }]}
					>
						<Input placeholder='https://images.unsplash.com/...' size='large' />
					</Form.Item>

					<Form.Item name='description' label='Mô tả'>
						<TextArea rows={3} placeholder='Mô tả chi tiết về điểm đến' />
					</Form.Item>

					<Form.Item name='highlights' label='Điểm nổi bật (phân cách bằng dấu phẩy)'>
						<Input placeholder='VD: Bãi biển đẹp, Hải sản, Lặn biển' size='large' />
					</Form.Item>

					<Row gutter={16}>
						<Col xs={12} md={6}>
							<Form.Item name='costFood' label='🍜 Ăn uống'>
								<InputNumber
									style={{ width: '100%' }}
									min={0}
									step={50000}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
									parser={(value: any) => value.replace(/,/g, '')}
								/>
							</Form.Item>
						</Col>
						<Col xs={12} md={6}>
							<Form.Item name='costAccommodation' label='🏨 Lưu trú'>
								<InputNumber
									style={{ width: '100%' }}
									min={0}
									step={50000}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
									parser={(value: any) => value.replace(/,/g, '')}
								/>
							</Form.Item>
						</Col>
						<Col xs={12} md={6}>
							<Form.Item name='costTransport' label='🚗 Di chuyển'>
								<InputNumber
									style={{ width: '100%' }}
									min={0}
									step={50000}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
									parser={(value: any) => value.replace(/,/g, '')}
								/>
							</Form.Item>
						</Col>
						<Col xs={12} md={6}>
							<Form.Item name='costEntrance' label='🎫 Vé tham quan'>
								<InputNumber
									style={{ width: '100%' }}
									min={0}
									step={50000}
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
									parser={(value: any) => value.replace(/,/g, '')}
								/>
							</Form.Item>
						</Col>
					</Row>

					<div style={{ textAlign: 'right', marginTop: 16 }}>
						<Button
							onClick={() => {
								setFormVisible(false);
								setEditingDest(null);
								form.resetFields();
							}}
							style={{ marginRight: 8 }}
						>
							Hủy
						</Button>
						<Button
							type='primary'
							htmlType='submit'
							style={{ background: '#302b63', borderColor: '#302b63' }}
						>
							{editingDest ? 'Cập nhật' : 'Thêm mới'}
						</Button>
					</div>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanTri;
