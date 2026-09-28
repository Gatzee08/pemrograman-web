/**
 * Data Service & LocalStorage State Management
 * Toko Cat Mobil & Cat Berkualitas - AutoGloss Paint Hub
 */

const STORAGE_KEYS = {
    PRODUCTS: 'autogloss_products',
    ORDERS: 'autogloss_orders',
    CUSTOMERS: 'autogloss_customers',
    SETTINGS: 'autogloss_settings',
    CART: 'autogloss_cart',
    ADMIN_AUTH: 'autogloss_admin_auth',
    ADMIN_SESSION: 'autogloss_admin_session'
};

// Initial Admin Credentials (Default: admin / admin123)
const INITIAL_ADMIN_AUTH = {
    username: 'admin',
    password: 'admin123',
    name: 'Admin Toko AutoGloss',
    role: 'Kepala Gudang & Kasir',
    avatar: 'AD'
};


// Initial Seed Products
const INITIAL_PRODUCTS = [
    // CAT MOBIL (Automotive & Coating)
    {
        id: 'PRD-001',
        name: 'SuperGloss Candy Red Metallic (Cat Mobil PU)',
        category: 'Cat Mobil',
        subCategory: 'Body Paint',
        price: 185000,
        originalPrice: 220000,
        isPromo: true,
        discountPercent: 16,
        stock: 35,
        unit: '1 Liter',
        rating: 4.9,
        soldCount: 142,
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
        badge: 'FLASH SALE',
        description: 'Cat mobil polyurethane premium dengan partikel pearl metallic murni. Memberikan efek candy red mendalam dan tahan paparan sinar UV hingga 5 tahun.',
        features: ['Efek Candy Deep Gloss', 'Formula Anti-Kuning (UV Resistant)', 'Cepat Kering & Daya Tutup Tinggi']
    },
    {
        id: 'PRD-002',
        name: 'AutoPro 2K Clear Coat High Solid + Hardener',
        category: 'Cat Mobil',
        subCategory: 'Clear Coat',
        price: 145000,
        originalPrice: 175000,
        isPromo: true,
        discountPercent: 17,
        stock: 28,
        unit: '1 Liter Set',
        rating: 4.9,
        soldCount: 230,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
        badge: 'BEST SELLER',
        description: 'Pernis pelindung cat mobil kualitas High Solid 2 komponen. Menghasilkan lapisan kaca wet-look tahan gores, tahan bensin, dan kilau abadi.',
        features: ['Kilau Ekstrem Wet Look', 'Anti Gores & Tahan Bensin', 'Termasuk Hardener 250ml']
    },
    {
        id: 'PRD-003',
        name: 'Epoxy Primer Surfacer 2K Grey (Anti Karat)',
        category: 'Cat Mobil',
        subCategory: 'Primer Epoxy',
        price: 110000,
        originalPrice: 125000,
        isPromo: false,
        discountPercent: 0,
        stock: 40,
        unit: '1 Kg Set',
        rating: 4.8,
        soldCount: 185,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
        badge: 'STANDARD',
        description: 'Dasaran cat mobil anti karat dengan daya rekat sangat kuat pada plat besi, plat galvanis, dan bodi aluminium kendaraan.',
        features: ['Daya Rekat Tinggi ke Plat Besi', 'Mudah Diamplas (Sanding)', 'Mencegah Karat Menjalar']
    },
    {
        id: 'PRD-004',
        name: 'Midnight Black Pearl Polyurethane',
        category: 'Cat Mobil',
        subCategory: 'Body Paint',
        price: 165000,
        originalPrice: 195000,
        isPromo: true,
        discountPercent: 15,
        stock: 22,
        unit: '1 Liter',
        rating: 4.9,
        soldCount: 98,
        image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Cat mobil hitam pekat dengan glitter mutiara biru & silver elegan. Sangat cocok untuk repaint mobil sedan, SUV, dan velg.',
        features: ['Warna Hitam Pekat Elegan', 'Butiran Mutiara Halus', 'Formula Oplos Pabrikan']
    },
    {
        id: 'PRD-005',
        name: 'Chameleon Holographic Color Shift Paint',
        category: 'Cat Mobil',
        subCategory: 'Custom Paint',
        price: 295000,
        originalPrice: 350000,
        isPromo: true,
        discountPercent: 16,
        stock: 8,
        unit: '500 ml',
        rating: 5.0,
        soldCount: 45,
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
        badge: 'LIMITED',
        description: 'Cat bunglon langka bergradasi 3 warna (Ungu, Biru, Emas) yang berubah tergantung sudut cahaya. Favorit kontes modifikasi.',
        features: ['Gradasi 3 Warna Bunglon', 'Khusus Kontes & Modifikasi', 'Performa Gloss Maksimal']
    },

    // CAT TEMBOK
    {
        id: 'PRD-006',
        name: 'Dulux EasyClean Interior Silk White',
        category: 'Cat Tembok',
        subCategory: 'Interior',
        price: 175000,
        originalPrice: 200000,
        isPromo: true,
        discountPercent: 12,
        stock: 50,
        unit: '2.5 Liter',
        rating: 4.8,
        soldCount: 160,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Cat tembok interior premium berbahan dasar air yang mudah dibersihkan dari noda kopi, krayon, dan debu tanpa merusak warna.',
        features: ['Teknologi Anti Noda (KidProof)', 'Aroma Tidak Menyengat', 'Halus & Tahan Jamur']
    },
    {
        id: 'PRD-007',
        name: 'Nippon Paint Spot-less Cream Ivory',
        category: 'Cat Tembok',
        subCategory: 'Interior',
        price: 155000,
        originalPrice: 155000,
        isPromo: false,
        discountPercent: 0,
        stock: 30,
        unit: '2.5 Liter',
        rating: 4.7,
        soldCount: 110,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        badge: 'STANDARD',
        description: 'Cat dinding interior bermutu tinggi dengan formula penolak noda cair. Warna awet dan tidak mudah pudar.',
        features: ['Anti Noda Cair', 'Rendah VOC (Ramah Lingkungan)', 'Daya Sebar Luas']
    },
    {
        id: 'PRD-008',
        name: 'Cat Tembok Propan Decorshield Pastel Mint',
        category: 'Cat Tembok',
        subCategory: 'Interior / Eksterior',
        price: 215000,
        originalPrice: 245000,
        isPromo: true,
        discountPercent: 12,
        stock: 15,
        unit: '2.5 Liter',
        rating: 4.8,
        soldCount: 75,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Cat tembok dengan 100% akrilik murni berdaya tahan tinggi terhadap cuaca tropis, debu, dan jamur.',
        features: ['100% Full Akrilik', 'Warna Dingin & Elegan', 'Tahan Sinar Matahari']
    },

    // CAT KAYU
    {
        id: 'PRD-009',
        name: 'Ultralite Wood Stain Teak Brown (Politur Kayu)',
        category: 'Cat Kayu',
        subCategory: 'Wood Coating',
        price: 85000,
        originalPrice: 95000,
        isPromo: true,
        discountPercent: 10,
        stock: 45,
        unit: '1 Liter',
        rating: 4.7,
        soldCount: 130,
        image: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Pewarna kayu transparan yang menonjolkan serat kayu alami jati, mahoni, dan kamper dengan perlindungan anti rayap.',
        features: ['Menonjolkan Serat Kayu Alami', 'Anti Rayap & Jamur Kayu', 'Kilau Semi-Gloss Mewah']
    },
    {
        id: 'PRD-010',
        name: 'Propan Melamic Clear Gloss Kayu Interior',
        category: 'Cat Kayu',
        subCategory: 'Melamic Finish',
        price: 98000,
        originalPrice: 98000,
        isPromo: false,
        discountPercent: 0,
        stock: 25,
        unit: '1 Kg Set',
        rating: 4.8,
        soldCount: 88,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        badge: 'STANDARD',
        description: 'Lapisan akhir kayu jenis melamic 2 komponen untuk furnitur, meja, kusen, dan lemari dengan kekerasan tinggi.',
        features: ['Keras Tahan Goresan', 'Tahan Panas Cangkir & Air', 'Lapisan Rata Sempurna']
    },

    // CAT BESI
    {
        id: 'PRD-011',
        name: 'Seiv Cat Besi Anti Karat Wrought Iron Black',
        category: 'Cat Besi',
        subCategory: 'Anti-Rust Paint',
        price: 92000,
        originalPrice: 110000,
        isPromo: true,
        discountPercent: 16,
        stock: 32,
        unit: '1 Liter',
        rating: 4.9,
        soldCount: 174,
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Cat besi tempa dengan efek tekstur mewah sekaligus fungsi primer anti karat langsung tanpa perlu meni.',
        features: ['2 in 1: Primer & Cat Finishing', 'Tahan Hujan & Karat Ekstrem', 'Efek Besi Tempa Elegan']
    },
    {
        id: 'PRD-012',
        name: 'Avian Cat Minyak Kayu & Besi Gloss Silver',
        category: 'Cat Besi',
        subCategory: 'Synthetic Enamel',
        price: 68000,
        originalPrice: 68000,
        isPromo: false,
        discountPercent: 0,
        stock: 60,
        unit: '1 Kg',
        rating: 4.7,
        soldCount: 290,
        image: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80',
        badge: 'STANDARD',
        description: 'Cat sintetis bermutu tinggi dengan kilap sempurna, daya tutup luar biasa untuk pagar, teralis, dan konstruksi besi.',
        features: ['Kilap Tinggi Tahan Lama', 'Daya Tutup Mantap', 'Cepat Mengering']
    },

    // CAT EKSTERIOR
    {
        id: 'PRD-013',
        name: 'Jotun Jotashield Extreme Weather Charcoal Grey',
        category: 'Cat Eksterior',
        subCategory: 'Weatherproof',
        price: 260000,
        originalPrice: 295000,
        isPromo: true,
        discountPercent: 12,
        stock: 18,
        unit: '2.5 Liter',
        rating: 4.9,
        soldCount: 115,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Cat pelindung dinding luar rumah dengan teknologi peredam panas temperatur hingga 5°C dan ketahanan cuaca 8 tahun.',
        features: ['Menurunkan Suhu Ruangan', 'Anti Lumut & Alga Ekstrem', 'Garansi Ketahanan Cuaca']
    },
    {
        id: 'PRD-014',
        name: 'No Drop Pelapis Anti Bocor Waterproofing Abu-Abu',
        category: 'Cat Eksterior',
        subCategory: 'Waterproofing',
        price: 135000,
        originalPrice: 150000,
        isPromo: true,
        discountPercent: 10,
        stock: 40,
        unit: '4 Kg Galon',
        rating: 4.9,
        soldCount: 420,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        badge: 'BEST SELLER',
        description: 'Cat pelapis membran elastis kedap air untuk atap dak beton, talang, dinding samping, dan seng.',
        features: ['100% Elastis & Kedap Air', 'Menutup Retak Rambut', 'Tahan Cuaca Panas & Hujan']
    },

    // AKSESORIS
    {
        id: 'PRD-015',
        name: 'HVLP Spray Gun Professional Nozzle 1.4mm',
        category: 'Aksesoris',
        subCategory: 'Spray Tool',
        price: 245000,
        originalPrice: 299000,
        isPromo: true,
        discountPercent: 18,
        stock: 14,
        unit: '1 Set Box',
        rating: 4.9,
        soldCount: 88,
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Spray gun HVLP presisi tinggi dengan tabung atas 600ml. Menghasilkan atomisasi cat mobil sangat halus tanpa belang.',
        features: ['Atomisasi Partikel Super Halus', 'Kapasitas Tabung 600ml', 'Hemat Cat hingga 30%']
    },
    {
        id: 'PRD-016',
        name: 'Thinner Super High Gloss PU Slow Dry',
        category: 'Aksesoris',
        subCategory: 'Thinner',
        price: 45000,
        originalPrice: 45000,
        isPromo: false,
        discountPercent: 0,
        stock: 55,
        unit: '1 Liter Kaleng',
        rating: 4.8,
        soldCount: 310,
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
        badge: 'STANDARD',
        description: 'Thinner kualitas PU Slow Dry untuk pengencer cat mobil dan pernis agar hasil semprotan tidak berkabut atau kulit jeruk.',
        features: ['Cegah Efek Kulit Jeruk', 'Tingkat Kilap Bertambah', 'Cocok untuk Clear Coat']
    },
    {
        id: 'PRD-017',
        name: '3M Automotive Masking Tape 24mm x 50m',
        category: 'Aksesoris',
        subCategory: 'Pengecatan Masking',
        price: 22000,
        originalPrice: 25000,
        isPromo: true,
        discountPercent: 12,
        stock: 90,
        unit: '1 Roll',
        rating: 4.9,
        soldCount: 560,
        image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Lakban kertas isolasi cat khusus otomotif tahan panas oven pengecatan, tidak meninggalkan sisa lem saat dikelupas.',
        features: ['Tidak Meninggalkan Bekas Lem', 'Tahan Panas Ruang Oven', 'Garis Batas Sangat Presisi']
    },
    {
        id: 'PRD-018',
        name: 'Compound Polish Pasta Step 1 & Step 2 (Rubbing)',
        category: 'Aksesoris',
        subCategory: 'Finishing Polish',
        price: 65000,
        originalPrice: 75000,
        isPromo: true,
        discountPercent: 13,
        stock: 38,
        unit: '500 Gram',
        rating: 4.8,
        soldCount: 140,
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
        badge: 'PROMO',
        description: 'Pasta kompon penghilang baret halus, bekas amplas 2000, dan kotoran jamur cat sebelum proses waxing kilap.',
        features: ['Menghilangkan Baret Halus', 'Meratakan Tekstur Cat', 'Aman untuk Clear Coat']
    }
];

// Initial Seed Orders
const INITIAL_ORDERS = [
    {
        orderId: 'ORD-20260928-01',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        customerEmail: 'budi.s@gmail.com',
        fulfillmentType: 'pickup', // 'pickup' atau 'delivery'
        pickupLocation: 'Outlet Pusat - Jl. Raya Otomotif No. 88 (Jakarta)',
        pickupDateTime: '2026-09-29 10:00 WIB',
        deliveryAddress: '',
        deliveryCourier: '',
        shippingFee: 0,
        paymentMethod: 'Transfer Bank BCA',
        paymentStatus: 'Menunggu Konfirmasi Admin',
        orderStatus: 'Pending', // Menunggu konfirmasi pembayaran oleh admin
        items: [
            { productId: 'PRD-001', name: 'SuperGloss Candy Red Metallic (Cat Mobil PU)', price: 185000, qty: 2, total: 370000 },
            { productId: 'PRD-002', name: 'AutoPro 2K Clear Coat High Solid + Hardener', price: 145000, qty: 1, total: 145000 }
        ],
        subtotal: 515000,
        discount: 25000,
        grandTotal: 490000,
        createdAt: '2026-09-28 14:20:00',
        notes: 'Akan diambil siang oleh adik saya membawa bukti nota'
    },
    {
        orderId: 'ORD-20260928-02',
        customerName: 'Rian Pradana (Bengkel Body Repair Rian)',
        customerPhone: '085712349988',
        customerEmail: 'rianrepair@gmail.com',
        fulfillmentType: 'delivery',
        pickupLocation: '',
        pickupDateTime: '',
        deliveryAddress: 'Jl. Merdeka Barat No. 42, RT 03/05, Kebayoran Baru, Jakarta Selatan (12160)',
        deliveryCourier: 'Kurir Truk Toko (Same Day)',
        shippingFee: 25000,
        paymentMethod: 'QRIS / E-Wallet',
        paymentStatus: 'Sudah Bayar',
        orderStatus: 'Sedang Dikirim',
        items: [
            { productId: 'PRD-011', name: 'Seiv Cat Besi Anti Karat Wrought Iron Black', price: 92000, qty: 4, total: 368000 },
            { productId: 'PRD-015', name: 'HVLP Spray Gun Professional Nozzle 1.4mm', price: 245000, qty: 1, total: 245000 }
        ],
        subtotal: 613000,
        discount: 0,
        grandTotal: 638000,
        createdAt: '2026-09-28 11:05:00',
        notes: 'Tolong packing kayu spray gun agar aman di perjalanan'
    },
    {
        orderId: 'ORD-20260927-03',
        customerName: 'Siti Rahmawati',
        customerPhone: '082198765432',
        customerEmail: 'siti.rahma@yahoo.com',
        fulfillmentType: 'pickup',
        pickupLocation: 'Cabang Barat - Ruko Sentra Niaga Blok B3 (Tangerang)',
        pickupDateTime: '2026-09-27 16:30 WIB',
        deliveryAddress: '',
        deliveryCourier: '',
        shippingFee: 0,
        paymentMethod: 'Bayar di Kasir (Pick Up)',
        paymentStatus: 'Sudah Bayar',
        orderStatus: 'Selesai',
        items: [
            { productId: 'PRD-006', name: 'Dulux EasyClean Interior Silk White', price: 175000, qty: 2, total: 350000 }
        ],
        subtotal: 350000,
        discount: 0,
        grandTotal: 350000,
        createdAt: '2026-09-27 09:15:00',
        notes: 'Sudah selesai diambil dan lunas di kasir'
    }
];

// Initial Seed Customers
const INITIAL_CUSTOMERS = [
    {
        id: 'CUST-001',
        name: 'Budi Santoso',
        phone: '081234567890',
        email: 'budi.s@gmail.com',
        totalOrders: 3,
        totalSpent: 1250000,
        lastOrder: '2026-09-28'
    },
    {
        id: 'CUST-002',
        name: 'Rian Pradana (Bengkel Rian)',
        phone: '085712349988',
        email: 'rianrepair@gmail.com',
        totalOrders: 5,
        totalSpent: 3420000,
        lastOrder: '2026-09-28'
    },
    {
        id: 'CUST-003',
        name: 'Siti Rahmawati',
        phone: '082198765432',
        email: 'siti.rahma@yahoo.com',
        totalOrders: 1,
        totalSpent: 350000,
        lastOrder: '2026-09-27'
    }
];

// Initial Store Settings
const INITIAL_SETTINGS = {
    storeName: 'AUTOGLOSS & COATING HUB',
    storeTagline: 'Pusat Cat Mobil & Cat Bangunan Profesional Bergaransi',
    phone: '0812-8899-7700',
    email: 'info@autoglosspaint.id',
    operatingHours: 'Senin - Sabtu: 08.00 - 18.00 WIB | Minggu: 09.00 - 15.00 WIB',
    address: 'Jl. Raya Industri Otomotif No. 88, Kawasan Niaga Utama, Jakarta',
    pickupOutlets: [
        { id: 'OUT-01', name: 'Outlet Pusat - Jl. Raya Otomotif No. 88 (Jakarta)', hours: '08:00 - 18:00 WIB' },
        { id: 'OUT-02', name: 'Cabang Barat - Ruko Sentra Niaga Blok B3 (Tangerang)', hours: '08:30 - 17:30 WIB' },
        { id: 'OUT-03', name: 'Cabang Timur - Komp. Otomotif Harapan Indah (Bekasi)', hours: '08:30 - 17:30 WIB' }
    ],
    deliveryOptions: [
        { id: 'DEL-INSTANT', name: 'Kurir Instant Motor (Cat < 5kg)', fee: 20000, est: '1 - 3 Jam' },
        { id: 'DEL-TRUCK', name: 'Kurir Armada Toko (Aman untuk Pail/Galon)', fee: 25000, est: 'Hari Ini (Same Day)' },
        { id: 'DEL-CARGO', name: 'Ekspedisi Cargo Nasional (JNE/J&T Cargo)', fee: 40000, est: '1 - 3 Hari Kerja' }
    ],
    promoVouchers: [
        { code: 'AUTOGLOSS10', discount: 10000, minSpend: 100000, desc: 'Diskon Rp 10.000 (Min. Belanja Rp 100.000)' },
        { code: 'PROMOCHAT25', discount: 25000, minSpend: 250000, desc: 'Diskon Rp 25.000 (Min. Belanja Rp 250.000)' },
        { code: 'GRATISCAT', discount: 50000, minSpend: 500000, desc: 'Diskon Spesial Rp 50.000' }
    ]
};

// Data Service APIs
const DataService = {
    // Initializer
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CART)) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH)) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(INITIAL_ADMIN_AUTH));
        }
    },

    // Products
    getProducts() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    },
    saveProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },
    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },
    addProduct(newProduct) {
        const products = this.getProducts();
        newProduct.id = 'PRD-' + Date.now().toString().slice(-4);
        products.unshift(newProduct);
        this.saveProducts(products);
        return newProduct;
    },
    updateProduct(updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            this.saveProducts(products);
            return true;
        }
        return false;
    },
    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
    },

    // Stock quick update
    updateStock(id, newStock) {
        const products = this.getProducts();
        const product = products.find(p => p.id === id);
        if (product) {
            product.stock = Math.max(0, parseInt(newStock) || 0);
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Orders
    getOrders() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    },
    saveOrders(orders) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },
    addOrder(orderData) {
        const orders = this.getOrders();
        orders.unshift(orderData);
        this.saveOrders(orders);

        // Update product stock automatically
        const products = this.getProducts();
        orderData.items.forEach(item => {
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                prod.stock = Math.max(0, prod.stock - item.qty);
                prod.soldCount = (prod.soldCount || 0) + item.qty;
            }
        });
        this.saveProducts(products);

        // Register or update customer
        this.updateCustomerFromOrder(orderData);

        return orderData;
    },
    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.orderStatus = newStatus;
            this.saveOrders(orders);
            return true;
        }
        return false;
    },
    updatePaymentStatus(orderId, newPaymentStatus, newOrderStatus = null) {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.paymentStatus = newPaymentStatus;
            if (newPaymentStatus === 'Lunas' || newPaymentStatus === 'Sudah Bayar') {
                order.paymentConfirmedAt = new Date().toLocaleString('id-ID');
                // Automatically advance Pending order to Diproses once payment is confirmed
                if (order.orderStatus === 'Pending' || order.orderStatus === 'Menunggu Konfirmasi') {
                    order.orderStatus = newOrderStatus || 'Diproses';
                } else if (newOrderStatus) {
                    order.orderStatus = newOrderStatus;
                }
            } else if (newPaymentStatus.includes('Ditolak') || newPaymentStatus.includes('Belum Masuk')) {
                order.paymentConfirmedAt = null;
                if (newOrderStatus) {
                    order.orderStatus = newOrderStatus;
                }
            } else {
                order.paymentConfirmedAt = null;
                if (newOrderStatus) {
                    order.orderStatus = newOrderStatus;
                }
            }
            this.saveOrders(orders);
            return true;
        }
        return false;
    },
    updateOrderPaymentProof(orderId, proofDataUrl) {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.paymentProof = proofDataUrl;
            order.paymentProofUploadedAt = new Date().toLocaleString('id-ID');
            this.saveOrders(orders);
            return true;
        }
        return false;
    },

    // Customers
    getCustomers() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
    },
    updateCustomerFromOrder(order) {
        const customers = this.getCustomers();
        let customer = customers.find(c => c.phone === order.customerPhone || c.email === order.customerEmail);
        if (customer) {
            customer.totalOrders = (customer.totalOrders || 1) + 1;
            customer.totalSpent = (customer.totalSpent || 0) + order.grandTotal;
            customer.lastOrder = new Date().toISOString().split('T')[0];
            if (!customer.name && order.customerName) customer.name = order.customerName;
        } else {
            customers.unshift({
                id: 'CUST-' + Date.now().toString().slice(-4),
                name: order.customerName,
                phone: order.customerPhone,
                email: order.customerEmail,
                totalOrders: 1,
                totalSpent: order.grandTotal,
                lastOrder: new Date().toISOString().split('T')[0]
            });
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    // Settings
    getSettings() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_SETTINGS));
    },
    saveSettings(newSettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    },

    // Cart
    getCart() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
    },
    saveCart(cart) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },
    addToCart(productId, qty = 1) {
        const product = this.getProductById(productId);
        if (!product || product.stock <= 0) return { success: false, message: 'Stok produk tidak mencukupi!' };

        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.qty + qty > product.stock) {
                return { success: false, message: `Maksimal pembelian ${product.stock} kaleng/unit!` };
            }
            existingItem.qty += qty;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                unit: product.unit,
                qty: qty
            });
        }
        this.saveCart(cart);
        return { success: true, message: 'Produk berhasil ditambahkan ke keranjang!' };
    },
    updateCartQty(productId, qty) {
        const cart = this.getCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            const product = this.getProductById(productId);
            if (qty <= 0) {
                this.removeFromCart(productId);
                return;
            }
            if (product && qty > product.stock) {
                item.qty = product.stock;
            } else {
                item.qty = qty;
            }
            this.saveCart(cart);
        }
    },
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(i => i.productId !== productId);
        this.saveCart(cart);
    },
    clearCart() {
        this.saveCart([]);
    },

    // Admin Authentication APIs
    getAdminAuth() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) || JSON.stringify(INITIAL_ADMIN_AUTH));
    },
    saveAdminAuth(authData) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(authData));
    },
    getAdminSession() {
        const sessionStr = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
        if (!sessionStr) return null;
        try {
            return JSON.parse(sessionStr);
        } catch (e) {
            return null;
        }
    },
    setAdminSession(userData, remember = false) {
        const sessionData = {
            username: userData.username,
            name: userData.name || 'Admin Toko',
            role: userData.role || 'Kepala Gudang & Kasir',
            avatar: userData.avatar || 'AD',
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));
        if (remember) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));
        } else {
            localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
        return sessionData;
    },
    clearAdminSession() {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    },
    verifyAdminLogin(username, password) {
        const auth = this.getAdminAuth();
        if (!username || !password) {
            return { success: false, message: 'Username dan kata sandi wajib diisi!' };
        }
        if (username.trim().toLowerCase() === auth.username.toLowerCase() && password === auth.password) {
            return {
                success: true,
                user: {
                    username: auth.username,
                    name: auth.name,
                    role: auth.role,
                    avatar: auth.avatar || 'AD'
                }
            };
        }
        return { success: false, message: 'Username atau kata sandi yang Anda masukkan salah!' };
    },
    updateAdminPassword(currentPassword, newUsername, newPassword) {
        const auth = this.getAdminAuth();
        if (currentPassword !== auth.password) {
            return { success: false, message: 'Kata sandi saat ini tidak cocok!' };
        }
        if (!newUsername || newUsername.trim().length < 3) {
            return { success: false, message: 'Username baru minimal terdiri dari 3 karakter!' };
        }
        if (!newPassword || newPassword.length < 5) {
            return { success: false, message: 'Kata sandi baru minimal terdiri dari 5 karakter!' };
        }
        auth.username = newUsername.trim();
        auth.password = newPassword;
        this.saveAdminAuth(auth);
        
        // Update active session if exists
        const currentSession = this.getAdminSession();
        if (currentSession) {
            currentSession.username = auth.username;
            if (sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)) {
                sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(currentSession));
            }
            if (localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)) {
                localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(currentSession));
            }
        }
        return { success: true, message: 'Username & kata sandi admin berhasil diperbarui!' };
    },

    // Reset all data to default
    resetToDefault() {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(INITIAL_ADMIN_AUTH));
        this.clearAdminSession();
    }
};

// Initialize immediately
DataService.init();

// Currency formatter utility
function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}
