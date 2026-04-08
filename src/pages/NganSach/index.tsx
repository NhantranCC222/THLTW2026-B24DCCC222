import { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Select, Table, Tag, Alert, Empty } from 'antd';
import {
	DollarOutlined,
	WarningOutlined,
	CheckCircleOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import ReactApexChart from 'react-apexcharts';
import type { Itinerary } from '@/models/travelplanner';
import './style.less';

const { Option } = Select;

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatShortCurrency = (value: number) => {
	if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
	if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
	return value.toString();
};

const NganSach: React.FC = () => {
	const { destinations, itineraries, loadDestinations, loadItineraries, getItineraryBudget } =
		useModel('travelplanner');
	const [selectedItinId, setSelectedItinId] = useState<string | undefined>(undefined);

	useEffect(() => {
		loadDestinations();
		loadItineraries();
	}, []);

	useEffect(() => {
		if (itineraries.length > 0 && !selectedItinId) {
			setSelectedItinId(itineraries[0].id);
		}
	}, [itineraries]);

	const selectedItin = useMemo(() => {
		return itineraries.find((i) => i.id === selectedItinId);
	}, [itineraries, selectedItinId]);

	const budgetCategories = useMemo(() => {
		if (!selectedItinId) return [];
		return getItineraryBudget(selectedItinId);
	}, [selectedItinId, getItineraryBudget]);

	const totalSpent = useMemo(() => {
		return budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
	}, [budgetCategories]);

	const budgetRemaining = useMemo(() => {
		if (!selectedItin) return 0;
		return selectedItin.totalBudget - totalSpent;
	}, [selectedItin, totalSpent]);

	const budgetPercent = useMemo(() => {
		if (!selectedItin || selectedItin.totalBudget === 0) return 0;
		return Math.round((totalSpent / selectedItin.totalBudget) * 100);
	}, [selectedItin, totalSpent]);

	// Per-day budget breakdown
	const dayBreakdown = useMemo(() => {
		if (!selectedItin) return [];
		return selectedItin.days.map((day, index) => {
			let food = 0,
				accommodation = 0,
				transport = 0,
				entrance = 0;
			day.destinations.forEach((item) => {
				const dest = destinations.find((d) => d.id === item.destinationId);
				if (item.customBudget) {
					food += item.customBudget.food;
					accommodation += item.customBudget.accommodation;
					transport += item.customBudget.transport;
					entrance += item.customBudget.entrance;
				} else if (dest) {
					food += dest.costFood;
					accommodation += dest.costAccommodation;
					transport += dest.costTransport;
					entrance += dest.costEntrance;
				}
			});
			return {
				key: index,
				day: `Ngày ${index + 1}`,
				date: day.date,
				destinations: day.destinations.length,
				food,
				accommodation,
				transport,
				entrance,
				total: food + accommodation + transport + entrance,
			};
		});
	}, [selectedItin, destinations]);

	const alerts = useMemo(() => {
		const result: { type: 'success' | 'warning' | 'danger'; icon: string; title: string; desc: string }[] = [];
		if (!selectedItin) return result;

		if (totalSpent === 0) {
			result.push({
				type: 'success',
				icon: '📋',
				title: 'Chưa có chi phí',
				desc: 'Thêm điểm đến vào lịch trình để bắt đầu tính ngân sách.',
			});
		} else if (budgetPercent > 100) {
			result.push({
				type: 'danger',
				icon: '🚨',
				title: `Vượt ngân sách ${budgetPercent - 100}%`,
				desc: `Bạn đã chi vượt ${formatCurrency(Math.abs(budgetRemaining))} so với ngân sách dự kiến.`,
			});
		} else if (budgetPercent > 80) {
			result.push({
				type: 'warning',
				icon: '⚠️',
				title: `Đã sử dụng ${budgetPercent}% ngân sách`,
				desc: `Còn lại ${formatCurrency(budgetRemaining)} - hãy cân nhắc trước khi thêm điểm đến.`,
			});
		} else {
			result.push({
				type: 'success',
				icon: '✅',
				title: 'Ngân sách ổn',
				desc: `Đã sử dụng ${budgetPercent}%. Còn dư ${formatCurrency(budgetRemaining)}.`,
			});
		}

		// Category warnings
		budgetCategories.forEach((cat) => {
			if (cat.amount > 0) {
				const percent = totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0;
				if (percent > 50) {
					result.push({
						type: 'warning',
						icon: '💡',
						title: `${cat.category} chiếm ${percent}%`,
						desc: `Chi phí ${cat.category.toLowerCase()} đang chiếm phần lớn ngân sách.`,
					});
				}
			}
		});

		return result;
	}, [selectedItin, totalSpent, budgetPercent, budgetRemaining, budgetCategories]);

	// Donut chart data
	const donutOptions: any = {
		chart: { type: 'donut' },
		labels: budgetCategories.map((c) => c.category),
		colors: budgetCategories.map((c) => c.color),
		legend: { show: false },
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: '70%',
					labels: {
						show: true,
						total: {
							show: true,
							label: 'Tổng chi phí',
							formatter: () => formatShortCurrency(totalSpent),
						},
					},
				},
			},
		},
		stroke: { width: 2, colors: ['#fff'] },
		tooltip: {
			y: {
				formatter: (val: number) => formatCurrency(val),
			},
		},
	};

	// Bar chart for daily spending
	const barOptions: any = {
		chart: {
			type: 'bar',
			stacked: true,
			toolbar: { show: false },
		},
		plotOptions: {
			bar: { borderRadius: 6, columnWidth: '60%' },
		},
		xaxis: {
			categories: dayBreakdown.map((d) => d.day),
		},
		colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
		legend: {
			position: 'top',
		},
		dataLabels: { enabled: false },
		tooltip: {
			y: {
				formatter: (val: number) => formatCurrency(val),
			},
		},
		grid: {
			borderColor: '#f0f0f0',
		},
	};

	const barSeries = [
		{ name: 'Ăn uống', data: dayBreakdown.map((d) => d.food) },
		{ name: 'Lưu trú', data: dayBreakdown.map((d) => d.accommodation) },
		{ name: 'Di chuyển', data: dayBreakdown.map((d) => d.transport) },
		{ name: 'Vé tham quan', data: dayBreakdown.map((d) => d.entrance) },
	];

	const columns = [
		{ title: 'Ngày', dataIndex: 'day', key: 'day', width: 80 },
		{ title: 'Điểm đến', dataIndex: 'destinations', key: 'destinations', width: 80, align: 'center' as const },
		{
			title: 'Ăn uống',
			dataIndex: 'food',
			key: 'food',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
		},
		{
			title: 'Lưu trú',
			dataIndex: 'accommodation',
			key: 'accommodation',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
		},
		{
			title: 'Di chuyển',
			dataIndex: 'transport',
			key: 'transport',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
		},
		{
			title: 'Vé',
			dataIndex: 'entrance',
			key: 'entrance',
			render: (val: number) => formatCurrency(val),
			align: 'right' as const,
		},
		{
			title: 'Tổng',
			dataIndex: 'total',
			key: 'total',
			render: (val: number) => <strong style={{ color: '#302b63' }}>{formatCurrency(val)}</strong>,
			align: 'right' as const,
		},
	];

	if (itineraries.length === 0) {
		return (
			<div className='nganSach-container'>
				<div className='nganSach-header'>
					<h2>💰 Quản lý ngân sách</h2>
				</div>
				<Card style={{ borderRadius: 16, textAlign: 'center', padding: 60, border: 'none' }}>
					<Empty description='Chưa có lịch trình nào để theo dõi ngân sách' />
				</Card>
			</div>
		);
	}

	return (
		<div className='nganSach-container'>
			<div className='nganSach-header'>
				<h2>💰 Quản lý ngân sách</h2>
				<p>Theo dõi chi phí và phân bổ ngân sách cho chuyến du lịch của bạn</p>
			</div>

			{/* Itinerary Selector */}
			<div className='itin-select-bar'>
				<span className='select-label'>📅 Lịch trình:</span>
				<Select
					value={selectedItinId}
					onChange={setSelectedItinId}
					size='large'
					style={{ minWidth: 300 }}
				>
					{itineraries.map((itin) => (
						<Option key={itin.id} value={itin.id}>
							{itin.name} ({formatCurrency(itin.totalBudget)})
						</Option>
					))}
				</Select>
			</div>

			{/* Overview Cards */}
			<Row gutter={[16, 16]} className='budget-overview-cards'>
				<Col xs={12} sm={12} md={6}>
					<Card className='budget-stat-card card-primary' bodyStyle={{}}>
						<div className='stat-icon'>💼</div>
						<div className='stat-label'>Ngân sách</div>
						<div className='stat-value'>{formatCurrency(selectedItin?.totalBudget || 0)}</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card className='budget-stat-card card-warning' bodyStyle={{}}>
						<div className='stat-icon'>📊</div>
						<div className='stat-label'>Đã chi</div>
						<div className='stat-value'>{formatCurrency(totalSpent)}</div>
						<div className='stat-sub'>{budgetPercent}% ngân sách</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card
						className={`budget-stat-card ${budgetRemaining >= 0 ? 'card-success' : 'card-danger'}`}
						bodyStyle={{}}
					>
						<div className='stat-icon'>{budgetRemaining >= 0 ? '✅' : '🚨'}</div>
						<div className='stat-label'>Còn lại</div>
						<div className='stat-value'>{formatCurrency(Math.abs(budgetRemaining))}</div>
						<div className='stat-sub'>{budgetRemaining >= 0 ? 'Dự phòng' : 'Vượt ngân sách'}</div>
					</Card>
				</Col>
				<Col xs={12} sm={12} md={6}>
					<Card className='budget-stat-card card-primary' bodyStyle={{}}>
						<div className='stat-icon'>📍</div>
						<div className='stat-label'>Điểm đến</div>
						<div className='stat-value'>
							{selectedItin?.days.reduce((s, d) => s + d.destinations.length, 0) || 0}
						</div>
						<div className='stat-sub'>{selectedItin?.days.length || 0} ngày</div>
					</Card>
				</Col>
			</Row>

			{/* Alerts */}
			{alerts.length > 0 && (
				<Card className='budget-alert-card' title='📢 Cảnh báo & Gợi ý'>
					{alerts.map((alert, index) => (
						<div key={index} className={`alert-item ${alert.type}`}>
							<span className='alert-icon'>{alert.icon}</span>
							<div className='alert-content'>
								<div className='alert-title'>{alert.title}</div>
								<div className='alert-desc'>{alert.desc}</div>
							</div>
						</div>
					))}
				</Card>
			)}

			{/* Charts */}
			<Row gutter={[24, 24]} className='budget-chart-section'>
				<Col xs={24} lg={12}>
					<Card className='chart-card' title='📊 Phân bổ ngân sách'>
						{budgetCategories.some((c) => c.amount > 0) ? (
							<div className='budget-donut'>
								<div className='donut-chart'>
									<ReactApexChart
										options={donutOptions}
										series={budgetCategories.map((c) => c.amount)}
										type='donut'
										height={200}
									/>
								</div>
								<div className='donut-legend'>
									{budgetCategories.map((cat) => {
										const percent =
											totalSpent > 0
												? Math.round((cat.amount / totalSpent) * 100)
												: 0;
										return (
											<div key={cat.category} className='legend-item'>
												<div
													className='legend-dot'
													style={{ background: cat.color }}
												/>
												<span className='legend-label'>{cat.category}</span>
												<span className='legend-value'>
													{formatCurrency(cat.amount)}
												</span>
												<span className='legend-percent'>{percent}%</span>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							<Empty description='Thêm điểm đến để xem phân bổ' />
						)}
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card className='chart-card' title='📈 Chi phí theo ngày'>
						{dayBreakdown.length > 0 && dayBreakdown.some((d) => d.total > 0) ? (
							<ReactApexChart options={barOptions} series={barSeries} type='bar' height={280} />
						) : (
							<Empty description='Thêm điểm đến để xem biểu đồ' />
						)}
					</Card>
				</Col>
			</Row>

			{/* Budget Progress Bars */}
			{budgetCategories.some((c) => c.amount > 0) && (
				<Card className='chart-card' title='📉 Chi tiết theo hạng mục' style={{ marginBottom: 24 }}>
					<div className='budget-bars'>
						{budgetCategories.map((cat) => {
							const maxAmount = Math.max(...budgetCategories.map((c) => c.amount));
							const fillPercent = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
							return (
								<div key={cat.category} className='bar-item'>
									<div className='bar-header'>
										<span className='bar-label'>{cat.category}</span>
										<span className='bar-value'>{formatCurrency(cat.amount)}</span>
									</div>
									<div className='bar-track'>
										<div
											className='bar-fill'
											style={{
												width: `${fillPercent}%`,
												background: `linear-gradient(90deg, ${cat.color}, ${cat.color}dd)`,
											}}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			)}

			{/* Daily Breakdown Table */}
			<Card className='budget-table-card' title='📋 Chi tiết theo ngày'>
				<Table
					dataSource={dayBreakdown}
					columns={columns}
					pagination={false}
					scroll={{ x: 700 }}
					summary={() => {
						const totalFood = dayBreakdown.reduce((s, d) => s + d.food, 0);
						const totalAcc = dayBreakdown.reduce((s, d) => s + d.accommodation, 0);
						const totalTrans = dayBreakdown.reduce((s, d) => s + d.transport, 0);
						const totalEnt = dayBreakdown.reduce((s, d) => s + d.entrance, 0);
						return (
							<Table.Summary.Row>
								<Table.Summary.Cell index={0}>
									<strong>Tổng</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={1} align='center'>
									<strong>
										{dayBreakdown.reduce((s, d) => s + d.destinations, 0)}
									</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={2} align='right'>
									<strong>{formatCurrency(totalFood)}</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={3} align='right'>
									<strong>{formatCurrency(totalAcc)}</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={4} align='right'>
									<strong>{formatCurrency(totalTrans)}</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={5} align='right'>
									<strong>{formatCurrency(totalEnt)}</strong>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={6} align='right'>
									<strong style={{ color: '#302b63', fontSize: 15 }}>
										{formatCurrency(totalSpent)}
									</strong>
								</Table.Summary.Cell>
							</Table.Summary.Row>
						);
					}}
				/>
			</Card>
		</div>
	);
};

export default NganSach;
