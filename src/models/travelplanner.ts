import { useState, useCallback } from 'react';
import moment from 'moment';

// ============ TYPES ============

export interface Destination {
	id: string;
	name: string;
	location: string;
	type: 'beach' | 'mountain' | 'city' | 'countryside' | 'island';
	image: string;
	rating: number;
	reviewCount: number;
	description: string;
	visitDuration: number; // hours
	costFood: number;
	costAccommodation: number;
	costTransport: number;
	costEntrance: number;
	highlights: string[];
	createdAt: string;
}

export interface ItineraryDay {
	date: string;
	destinations: ItineraryItem[];
}

export interface ItineraryItem {
	id: string;
	destinationId: string;
	startTime: string;
	endTime: string;
	notes: string;
	customBudget?: {
		food: number;
		accommodation: number;
		transport: number;
		entrance: number;
	};
}

export interface Itinerary {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	totalBudget: number;
	days: ItineraryDay[];
	createdAt: string;
	status: 'draft' | 'confirmed' | 'completed';
}

export interface BudgetCategory {
	category: string;
	amount: number;
	color: string;
}

// ============ SEED DATA ============

const SEED_DESTINATIONS: Destination[] = [
	{
		id: 'dest-001',
		name: 'Vịnh Hạ Long',
		location: 'Quảng Ninh',
		type: 'island',
		image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
		rating: 4.8,
		reviewCount: 2450,
		description: 'Vịnh Hạ Long là di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ, hang động tuyệt đẹp.',
		visitDuration: 8,
		costFood: 500000,
		costAccommodation: 1200000,
		costTransport: 800000,
		costEntrance: 300000,
		highlights: ['Du thuyền', 'Hang Sửng Sốt', 'Đảo Ti Tốp', 'Chèo kayak'],
		createdAt: '2025-01-15T10:00:00Z',
	},
	{
		id: 'dest-002',
		name: 'Phố cổ Hội An',
		location: 'Quảng Nam',
		type: 'city',
		image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
		rating: 4.7,
		reviewCount: 3200,
		description: 'Phố cổ Hội An mang đậm nét văn hóa lịch sử với những ngôi nhà cổ, đèn lồng lung linh.',
		visitDuration: 6,
		costFood: 300000,
		costAccommodation: 800000,
		costTransport: 200000,
		costEntrance: 120000,
		highlights: ['Chùa Cầu', 'Đèn lồng', 'Phố đi bộ', 'Ẩm thực đường phố'],
		createdAt: '2025-02-10T10:00:00Z',
	},
	{
		id: 'dest-003',
		name: 'Sapa',
		location: 'Lào Cai',
		type: 'mountain',
		image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=800&q=80',
		rating: 4.6,
		reviewCount: 1870,
		description: 'Sapa nổi tiếng với ruộng bậc thang tuyệt đẹp, văn hóa dân tộc thiểu số phong phú.',
		visitDuration: 10,
		costFood: 400000,
		costAccommodation: 900000,
		costTransport: 600000,
		costEntrance: 150000,
		highlights: ['Fansipan', 'Ruộng bậc thang', 'Bản Cát Cát', 'Chợ phiên'],
		createdAt: '2025-03-05T10:00:00Z',
	},
	{
		id: 'dest-004',
		name: 'Biển Mỹ Khê',
		location: 'Đà Nẵng',
		type: 'beach',
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
		rating: 4.5,
		reviewCount: 2100,
		description: 'Bãi biển Mỹ Khê được vinh danh là một trong những bãi biển đẹp nhất hành tinh.',
		visitDuration: 5,
		costFood: 350000,
		costAccommodation: 1000000,
		costTransport: 150000,
		costEntrance: 0,
		highlights: ['Tắm biển', 'Lướt sóng', 'Hải sản tươi sống', 'Hoàng hôn'],
		createdAt: '2025-03-20T10:00:00Z',
	},
	{
		id: 'dest-005',
		name: 'Đà Lạt',
		location: 'Lâm Đồng',
		type: 'mountain',
		image: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&q=80',
		rating: 4.7,
		reviewCount: 2800,
		description: 'Đà Lạt - thành phố ngàn hoa với khí hậu mát mẻ quanh năm, cảnh quan lãng mạn.',
		visitDuration: 8,
		costFood: 350000,
		costAccommodation: 700000,
		costTransport: 300000,
		costEntrance: 100000,
		highlights: ['Hồ Xuân Hương', 'Đồi chè', 'Thung lũng Tình Yêu', 'Cà phê view'],
		createdAt: '2025-04-01T10:00:00Z',
	},
	{
		id: 'dest-006',
		name: 'Phú Quốc',
		location: 'Kiên Giang',
		type: 'island',
		image: 'https://images.unsplash.com/photo-1559628233-100c798642d4?w=800&q=80',
		rating: 4.6,
		reviewCount: 1950,
		description: 'Đảo ngọc Phú Quốc với bãi biển trắng mịn, nước trong xanh và hệ sinh thái đa dạng.',
		visitDuration: 10,
		costFood: 450000,
		costAccommodation: 1500000,
		costTransport: 500000,
		costEntrance: 200000,
		highlights: ['Bãi Sao', 'Vinpearl Safari', 'Lặn biển', 'Sunset Town'],
		createdAt: '2025-04-15T10:00:00Z',
	},
	{
		id: 'dest-007',
		name: 'Huế',
		location: 'Thừa Thiên Huế',
		type: 'city',
		image: 'https://images.unsplash.com/photo-1581873049560-3e45a4b02a71?w=800&q=80',
		rating: 4.4,
		reviewCount: 1650,
		description: 'Cố đô Huế với hệ thống kiến trúc cung đình, lăng tẩm và ẩm thực đặc sắc.',
		visitDuration: 7,
		costFood: 250000,
		costAccommodation: 600000,
		costTransport: 250000,
		costEntrance: 200000,
		highlights: ['Đại Nội', 'Sông Hương', 'Lăng Tự Đức', 'Bún bò Huế'],
		createdAt: '2025-05-01T10:00:00Z',
	},
	{
		id: 'dest-008',
		name: 'Ninh Bình',
		location: 'Ninh Bình',
		type: 'countryside',
		image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
		rating: 4.5,
		reviewCount: 1400,
		description: 'Ninh Bình - Hạ Long trên cạn với cảnh quan núi non kỳ vĩ, sông nước hữu tình.',
		visitDuration: 6,
		costFood: 250000,
		costAccommodation: 500000,
		costTransport: 300000,
		costEntrance: 150000,
		highlights: ['Tràng An', 'Hang Múa', 'Tam Cốc', 'Cố đô Hoa Lư'],
		createdAt: '2025-05-15T10:00:00Z',
	},
	{
		id: 'dest-009',
		name: 'Nha Trang',
		location: 'Khánh Hòa',
		type: 'beach',
		image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80',
		rating: 4.4,
		reviewCount: 2300,
		description: 'Nha Trang - thành phố biển với vịnh đẹp, đảo hoang và đời sống về đêm sôi động.',
		visitDuration: 7,
		costFood: 400000,
		costAccommodation: 900000,
		costTransport: 350000,
		costEntrance: 250000,
		highlights: ['VinWonders', 'Tháp Bà Ponagar', 'Lặn san hô', 'Tắm bùn'],
		createdAt: '2025-06-01T10:00:00Z',
	},
	{
		id: 'dest-010',
		name: 'Mộc Châu',
		location: 'Sơn La',
		type: 'countryside',
		image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
		rating: 4.3,
		reviewCount: 980,
		description: 'Mộc Châu - cao nguyên xanh với đồi chè bạt ngàn, mùa hoa cải trắng tuyệt đẹp.',
		visitDuration: 6,
		costFood: 250000,
		costAccommodation: 400000,
		costTransport: 500000,
		costEntrance: 50000,
		highlights: ['Đồi chè', 'Thác Dải Yếm', 'Rừng mận', 'Homestay'],
		createdAt: '2025-06-15T10:00:00Z',
	},
];

const STORAGE_KEYS = {
	DESTINATIONS: 'travel_destinations',
	ITINERARIES: 'travel_itineraries',
};

// ============ MODEL ============

export default () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [itineraries, setItineraries] = useState<Itinerary[]>([]);
	const [loading, setLoading] = useState(false);

	// ---- Destinations ----

	const loadDestinations = useCallback(() => {
		setLoading(true);
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
			if (stored) {
				setDestinations(JSON.parse(stored));
			} else {
				localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(SEED_DESTINATIONS));
				setDestinations(SEED_DESTINATIONS);
			}
		} catch {
			setDestinations(SEED_DESTINATIONS);
		}
		setLoading(false);
	}, []);

	const saveDestinations = useCallback((data: Destination[]) => {
		localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(data));
		setDestinations(data);
	}, []);

	const addDestination = useCallback(
		(dest: Omit<Destination, 'id' | 'createdAt'>) => {
			const newDest: Destination = {
				...dest,
				id: `dest-${Date.now()}`,
				createdAt: new Date().toISOString(),
			};
			const updated = [...destinations, newDest];
			saveDestinations(updated);
			return newDest;
		},
		[destinations, saveDestinations],
	);

	const updateDestination = useCallback(
		(id: string, data: Partial<Destination>) => {
			const updated = destinations.map((d) => (d.id === id ? { ...d, ...data } : d));
			saveDestinations(updated);
		},
		[destinations, saveDestinations],
	);

	const deleteDestination = useCallback(
		(id: string) => {
			const updated = destinations.filter((d) => d.id !== id);
			saveDestinations(updated);
		},
		[destinations, saveDestinations],
	);

	// ---- Itineraries ----

	const loadItineraries = useCallback(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.ITINERARIES);
			if (stored) {
				setItineraries(JSON.parse(stored));
			} else {
				setItineraries([]);
			}
		} catch {
			setItineraries([]);
		}
	}, []);

	const saveItineraries = useCallback((data: Itinerary[]) => {
		localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(data));
		setItineraries(data);
	}, []);

	const addItinerary = useCallback(
		(itin: Omit<Itinerary, 'id' | 'createdAt'>) => {
			const newItin: Itinerary = {
				...itin,
				id: `itin-${Date.now()}`,
				createdAt: new Date().toISOString(),
			};
			const updated = [...itineraries, newItin];
			saveItineraries(updated);
			return newItin;
		},
		[itineraries, saveItineraries],
	);

	const updateItinerary = useCallback(
		(id: string, data: Partial<Itinerary>) => {
			const updated = itineraries.map((i) => (i.id === id ? { ...i, ...data } : i));
			saveItineraries(updated);
		},
		[itineraries, saveItineraries],
	);

	const deleteItinerary = useCallback(
		(id: string) => {
			const updated = itineraries.filter((i) => i.id !== id);
			saveItineraries(updated);
		},
		[itineraries, saveItineraries],
	);

	// ---- Budget Helpers ----

	const getItineraryBudget = useCallback(
		(itineraryId: string): BudgetCategory[] => {
			const itin = itineraries.find((i) => i.id === itineraryId);
			if (!itin) return [];

			let food = 0,
				accommodation = 0,
				transport = 0,
				entrance = 0;

			itin.days.forEach((day) => {
				day.destinations.forEach((item) => {
					if (item.customBudget) {
						food += item.customBudget.food;
						accommodation += item.customBudget.accommodation;
						transport += item.customBudget.transport;
						entrance += item.customBudget.entrance;
					} else {
						const dest = destinations.find((d) => d.id === item.destinationId);
						if (dest) {
							food += dest.costFood;
							accommodation += dest.costAccommodation;
							transport += dest.costTransport;
							entrance += dest.costEntrance;
						}
					}
				});
			});

			return [
				{ category: 'Ăn uống', amount: food, color: '#FF6B6B' },
				{ category: 'Lưu trú', amount: accommodation, color: '#4ECDC4' },
				{ category: 'Di chuyển', amount: transport, color: '#45B7D1' },
				{ category: 'Vé tham quan', amount: entrance, color: '#96CEB4' },
			];
		},
		[itineraries, destinations],
	);

	// ---- Stats ----

	const getMonthlyStats = useCallback(() => {
		const monthMap: Record<string, number> = {};
		itineraries.forEach((i) => {
			const month = moment(i.createdAt).format('MM/YYYY');
			monthMap[month] = (monthMap[month] || 0) + 1;
		});
		return Object.entries(monthMap).map(([month, count]) => ({ month, count }));
	}, [itineraries]);

	const getPopularDestinations = useCallback(() => {
		const countMap: Record<string, number> = {};
		itineraries.forEach((itin) => {
			itin.days.forEach((day) => {
				day.destinations.forEach((item) => {
					countMap[item.destinationId] = (countMap[item.destinationId] || 0) + 1;
				});
			});
		});

		return Object.entries(countMap)
			.map(([destId, count]) => {
				const dest = destinations.find((d) => d.id === destId);
				return { destination: dest, count };
			})
			.filter((item) => item.destination)
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
	}, [itineraries, destinations]);

	const getTotalRevenue = useCallback(() => {
		return itineraries.reduce((sum, itin) => sum + itin.totalBudget, 0);
	}, [itineraries]);

	return {
		destinations,
		itineraries,
		loading,
		loadDestinations,
		addDestination,
		updateDestination,
		deleteDestination,
		loadItineraries,
		addItinerary,
		updateItinerary,
		deleteItinerary,
		getItineraryBudget,
		getMonthlyStats,
		getPopularDestinations,
		getTotalRevenue,
	};
};
