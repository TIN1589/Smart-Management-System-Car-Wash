// ==========================================
// MOCK DATA - FE-SmartWashCar
// ==========================================

// --- VEHICLES ---
export interface Vehicle {
    id: string;
    plate: string;
    model: string;
}

// --- SERVICES ---
export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    points: number;
    iconName: string;
}

// --- LOYALTY ---
export interface LoyaltyHistoryItem {
    id: string;
    title: string;
    date: string;
    points: number;
    type: 'earn' | 'redeem' | 'expire';
}

// --- BOOKINGS ---
export interface Booking {
    id: string;
    customerName: string;
    customerTier: 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM';
    customerPhone?: string;
    carPlate: string;
    carModel: string;
    serviceName: string;
    timeStr: string;
    dateStr: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
    priority: number | string;
    notes?: string;
    durationMin?: number;
    technician?: string;
    carImgUrl?: string;
}

export const vehiclesData: Vehicle[] = [
    { id: 'v1', plate: '51G-123.45', model: 'Mercedes-Benz C200' },
    { id: 'v2', plate: '51H-999.99', model: 'VinFast VF8' }
];

export const servicesData: ServiceItem[] = [
    {
        id: 's1',
        name: 'Gói Cơ bản',
        description: 'Rửa xe, hút bụi, làm sạch thảm.',
        price: 150000,
        points: 30,
        iconName: 'droplet'
    },
    {
        id: 's2',
        name: 'Gói Cao cấp',
        description: 'Gói Cơ bản + Đánh bóng lốp, làm sạch khoang máy.',
        price: 350000,
        points: 70,
        iconName: 'sparkles'
    },
    {
        id: 's3',
        name: 'Chăm sóc Toàn diện',
        description: 'Detailing toàn diện, phủ Ceramic bảo vệ sơn.',
        price: 1250000,
        points: 250,
        iconName: 'gem'
    }
];

export const loyaltyHistory: LoyaltyHistoryItem[] = [
    {
        id: 'h1',
        title: 'Rửa xe cao cấp - 51G-123.45',
        date: '25/10/2023',
        points: 70,
        type: 'earn'
    },
    {
        id: 'h2',
        title: 'Đổi voucher Giảm 20%',
        date: '15/10/2023',
        points: -500,
        type: 'redeem'
    },
    {
        id: 'h3',
        title: 'Điểm tích lũy hết hạn',
        date: '01/10/2023',
        points: -120,
        type: 'expire'
    }
];

export const bookingsData: Booking[] = [
    {
        id: 'BK-9482',
        customerName: 'Nguyễn An',
        customerTier: 'GOLD',
        customerPhone: '090 123 4567',
        carPlate: '30A-123.45',
        carModel: 'Mercedes C300',
        serviceName: 'Phủ Ceramic Pro',
        timeStr: '14:30',
        dateStr: 'Hôm nay',
        status: 'PENDING',
        priority: 98,
        notes: 'Vui lòng kiểm tra kỹ vết xước ở cửa sau bên lái giúp mình nhé.',
        durationMin: 120,
        technician: 'Tùng Dương (Lead)',
        carImgUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'BK-9483',
        customerName: 'Trần Minh',
        customerTier: 'SILVER',
        customerPhone: '091 222 3333',
        carPlate: '51G-888.88',
        carModel: 'BMW X5',
        serviceName: 'Rửa xe tiêu chuẩn',
        timeStr: '09:00',
        dateStr: '15/10/2023',
        status: 'CONFIRMED',
        priority: 45,
        notes: 'Khách yêu cầu dọn sạch cốp xe.',
        durationMin: 45,
        technician: 'Trọng Nghĩa',
        carImgUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'BK-9484',
        customerName: 'Lê Hoàng',
        customerTier: 'PLATINUM',
        customerPhone: '098 888 9999',
        carPlate: '29L-555.55',
        carModel: 'Porsche Cayenne',
        serviceName: 'Đánh bóng & Hiệu chỉnh sơn',
        timeStr: '10:15',
        dateStr: '15/10/2023',
        status: 'IN_PROGRESS',
        priority: 82,
        notes: 'Kiểm tra độ dày bề mặt sơn trước khi đánh bóng.',
        durationMin: 180,
        technician: 'Phạm Hải (Senior Detailing)',
        carImgUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'BK-9485',
        customerName: 'Phạm Tuyết',
        customerTier: 'MEMBER',
        customerPhone: '093 456 7890',
        carPlate: '30H-999.01',
        carModel: 'Mazda CX-5',
        serviceName: 'Rửa gầm nâng cấp',
        timeStr: '08:00',
        dateStr: 'Hôm qua',
        status: 'DONE',
        priority: 12,
        notes: 'Sịt rửa bùn đất sạch sẽ ở hốc bánh.',
        durationMin: 35,
        technician: 'Thế Anh',
        carImgUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'BK-9486',
        customerName: 'Bùi Tùng',
        customerTier: 'GOLD',
        customerPhone: '096 999 8888',
        carPlate: '43A-667.89',
        carModel: 'Toyota Fortuner',
        serviceName: 'Combo Chăm sóc Nội thất',
        timeStr: '16:45',
        dateStr: '14/10/2023',
        status: 'CANCELLED',
        priority: '--',
        notes: 'Khách báo bận chuyển sang tuần sau.',
        durationMin: 90,
        technician: 'Chưa phân công',
        carImgUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'
    }
];
