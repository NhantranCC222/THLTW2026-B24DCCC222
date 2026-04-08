import { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Tag, Rate, Input, Select, Drawer, Typography, Divider, Button, Tooltip, Empty } from 'antd';
import {
	EnvironmentOutlined,
	SearchOutlined,
	StarFilled,
	ClockCircleOutlined,
	DollarOutlined,
	HeartOutlined,
	HeartFilled,
	CompassOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import './style.less';

const { Option } = Select;
const { Paragraph } = Typography;

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

const KhamPha: React.FC = () => {
	const { destinations, loadDestinations } = useModel('travelplanner');
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
	const [sortBy, setSortBy] = useState<string>('rating');
	const [selectedDest, setSelectedDest] = useState<any>(null);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [favorites, setFavorites] = useState<string[]>(() => {
		try {
			return JSON.parse(localStorage.getItem('travel_favorites') || '[]');
		} catch {
			return [];
		}
	});

	useEffect(() => {
		loadDestinations();
	}, []);

	const toggleFavorite = (id: string) => {
		const updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
		setFavorites(updated);
		localStorage.setItem('travel_favorites', JSON.stringify(updated));
	};

	const filtered = useMemo(() => {
		let result = [...destinations];

		if (search) {
			const s = search.toLowerCase();
			result = result.filter(
				(d) => d.name.toLowerCase().includes(s) || d.location.toLowerCase().includes(s),
			);
		}

		if (typeFilter) {
			result = result.filter((d) => d.type === typeFilter);
		}

		switch (sortBy) {
			case 'rating':
				result.sort((a, b) => b.rating - a.rating);
				break;
			case 'price_low':
				result.sort(
					(a, b) =>
						a.costFood + a.costAccommodation + a.costTransport + a.costEntrance -
						(b.costFood + b.costAccommodation + b.costTransport + b.costEntrance),
				);
				break;
			case 'price_high':
				result.sort(
					(a, b) =>
						b.costFood + b.costAccommodation + b.costTransport + b.costEntrance -
						(a.costFood + a.costAccommodation + a.costTransport + a.costEntrance),
				);
				break;
			case 'reviews':
				result.sort((a, b) => b.reviewCount - a.reviewCount);
				break;
			default:
				break;
		}

		return result;
	}, [destinations, search, typeFilter, sortBy]);

	const totalCost = (d: any) => d.costFood + d.costAccommodation + d.costTransport + d.costEntrance;

	const showDetail = (dest: any) => {
		setSelectedDest(dest);
		setDrawerVisible(true);
	};

	return (
		<div>
			{/* Hero Section */}
			<div className='khampha-hero'>
				<div className='hero-content'>
					<span className='hero-emoji'>✈️</span>
					<h1>Khám phá Việt Nam</h1>
					<p>Hàng trăm điểm đến tuyệt vời đang chờ bạn khám phá</p>
				</div>
			</div>

			{/* Stats */}
			<div className='khampha-stats'>
				<div className='stat-item'>
					<div className='stat-number'>{destinations.length}</div>
					<div className='stat-label'>Điểm đến</div>
				</div>
				<div className='stat-item'>
					<div className='stat-number'>
						{destinations.length > 0
							? (destinations.reduce((s, d) => s + d.rating, 0) / destinations.length).toFixed(1)
							: 0}
					</div>
					<div className='stat-label'>Đánh giá TB</div>
				</div>
				<div className='stat-item'>
					<div className='stat-number'>{favorites.length}</div>
					<div className='stat-label'>Yêu thích</div>
				</div>
			</div>

			{/* Filter Bar */}
			<div className='khampha-filters'>
				<span className='filter-label'>🔍</span>
				<Input.Search
					placeholder='Tìm điểm đến...'
					allowClear
					onChange={(e) => setSearch(e.target.value)}
					style={{ flex: 1, minWidth: 200 }}
				/>
				<Select
					placeholder='Loại hình'
					allowClear
					onChange={(val) => setTypeFilter(val)}
					style={{ minWidth: 160 }}
				>
					{Object.entries(TYPE_MAP).map(([key, val]) => (
						<Option key={key} value={key}>
							{val.emoji} {val.label}
						</Option>
					))}
				</Select>
				<Select defaultValue='rating' onChange={(val) => setSortBy(val)} style={{ minWidth: 180 }}>
					<Option value='rating'>⭐ Đánh giá cao nhất</Option>
					<Option value='price_low'>💰 Giá thấp → cao</Option>
					<Option value='price_high'>💎 Giá cao → thấp</Option>
					<Option value='reviews'>💬 Nhiều đánh giá</Option>
				</Select>
			</div>

			{/* Destination Grid */}
			{filtered.length === 0 ? (
				<div className='khampha-empty'>
					<Empty description={<h3>Không tìm thấy điểm đến phù hợp</h3>} />
				</div>
			) : (
				<Row gutter={[20, 20]}>
					{filtered.map((dest) => (
						<Col xs={24} sm={12} lg={8} xl={6} key={dest.id}>
							<Card
								className='dest-card'
								hoverable
								onClick={() => showDetail(dest)}
								bodyStyle={{ padding: 0 }}
							>
								<div className='dest-card-image'>
									<img src={dest.image} alt={dest.name} loading='lazy' />
									<Tag
										className='dest-type-tag'
										color={TYPE_MAP[dest.type]?.color}
										style={{ color: '#333' }}
									>
										{TYPE_MAP[dest.type]?.emoji} {TYPE_MAP[dest.type]?.label}
									</Tag>
									<div className='dest-card-overlay'>
										<Tooltip title='Yêu thích'>
											<Button
												type='text'
												shape='circle'
												size='large'
												onClick={(e) => {
													e.stopPropagation();
													toggleFavorite(dest.id);
												}}
												icon={
													favorites.includes(dest.id) ? (
														<HeartFilled style={{ color: '#ff4d4f', fontSize: 22 }} />
													) : (
														<HeartOutlined style={{ color: '#fff', fontSize: 22 }} />
													)
												}
											/>
										</Tooltip>
									</div>
								</div>

								<div className='dest-card-info'>
									<div className='dest-name'>{dest.name}</div>
									<div className='dest-location'>
										<EnvironmentOutlined /> {dest.location}
									</div>
									<div className='dest-meta'>
										<div className='dest-rating'>
											<StarFilled style={{ color: '#f5a623' }} />
											<span className='rating-value'>{dest.rating}</span>
											<span className='review-count'>({dest.reviewCount})</span>
										</div>
										<div className='dest-price'>
											{formatCurrency(totalCost(dest))}
											<span>/người</span>
										</div>
									</div>
								</div>

								<div className='dest-card-highlights'>
									{dest.highlights.slice(0, 3).map((h: string, i: number) => (
										<Tag key={i}>{h}</Tag>
									))}
								</div>
							</Card>
						</Col>
					))}
				</Row>
			)}

			{/* Detail Drawer */}
			<Drawer
				title={null}
				placement='right'
				width={520}
				visible={drawerVisible}
				onClose={() => setDrawerVisible(false)}
				bodyStyle={{ padding: 24 }}
				headerStyle={{ display: 'none' }}
			>
				{selectedDest && (
					<div className='dest-detail'>
						<img className='detail-image' src={selectedDest.image} alt={selectedDest.name} />

						<div className='detail-header'>
							<h2>{selectedDest.name}</h2>
							<div className='detail-location'>
								<EnvironmentOutlined />
								{selectedDest.location}
							</div>
						</div>

						<div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
							<Tag
								color={TYPE_MAP[selectedDest.type]?.color}
								style={{ borderRadius: 20, padding: '4px 16px', fontSize: 14 }}
							>
								{TYPE_MAP[selectedDest.type]?.emoji} {TYPE_MAP[selectedDest.type]?.label}
							</Tag>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								<Rate disabled defaultValue={selectedDest.rating} allowHalf style={{ fontSize: 16 }} />
								<span style={{ fontWeight: 600 }}>{selectedDest.rating}</span>
								<span style={{ color: '#999' }}>({selectedDest.reviewCount} đánh giá)</span>
							</div>
						</div>

						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
							<ClockCircleOutlined style={{ color: '#302b63' }} />
							<span>
								Thời gian tham quan: <strong>{selectedDest.visitDuration} giờ</strong>
							</span>
						</div>

						<Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#555' }}>
							{selectedDest.description}
						</Paragraph>

						<Divider>💡 Điểm nổi bật</Divider>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
							{selectedDest.highlights.map((h: string, i: number) => (
								<Tag
									key={i}
									style={{
										borderRadius: 20,
										padding: '4px 14px',
										background: '#f0f5ff',
										border: 'none',
										color: '#302b63',
									}}
								>
									{h}
								</Tag>
							))}
						</div>

						<Divider>💰 Chi phí ước tính</Divider>
						<div className='detail-costs'>
							<div className='cost-item'>
								<span className='cost-label'>🍜 Ăn uống</span>
								<span className='cost-value'>{formatCurrency(selectedDest.costFood)}</span>
							</div>
							<div className='cost-item'>
								<span className='cost-label'>🏨 Lưu trú</span>
								<span className='cost-value'>{formatCurrency(selectedDest.costAccommodation)}</span>
							</div>
							<div className='cost-item'>
								<span className='cost-label'>🚗 Di chuyển</span>
								<span className='cost-value'>{formatCurrency(selectedDest.costTransport)}</span>
							</div>
							<div className='cost-item'>
								<span className='cost-label'>🎫 Vé tham quan</span>
								<span className='cost-value'>{formatCurrency(selectedDest.costEntrance)}</span>
							</div>
							<div
								className='cost-item'
								style={{ background: 'linear-gradient(135deg, #302b63, #24243e)', marginTop: 8 }}
							>
								<span className='cost-label' style={{ color: '#fff', fontWeight: 700 }}>
									Tổng cộng
								</span>
								<span className='cost-value' style={{ color: '#F7DC6F', fontSize: 18 }}>
									{formatCurrency(totalCost(selectedDest))}
								</span>
							</div>
						</div>
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default KhamPha;
