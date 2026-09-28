/**
 * Admin Panel JavaScript Controller
 * Toko Cat Mobil & Cat Berkualitas - AutoGloss Paint Hub
 */

const AdminApp = {
    currentTab: 'dashboard',
    editingProductId: null,
    clockInterval: null,
    initialized: false,

    init() {
        if (!this.initialized) {
            this.setupNavigation();
            this.updateClock();
            this.clockInterval = setInterval(() => this.updateClock(), 1000);
            this.initialized = true;
        }
        this.renderAll();
    },

    renderAll() {
        this.renderDashboard();
        this.renderProductsTable();
        this.renderStockTable();
        this.renderOrdersTable();
        this.renderCustomersTable();
        this.loadSettings();
    },

    updateClock() {
        const clockEl = document.getElementById('adminClock');
        if (clockEl) {
            const now = new Date();
            clockEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('id-ID')} WIB`;
        }
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                if (tab) this.switchTab(tab);
            });
        });
    },

    switchTab(tabName) {
        this.currentTab = tabName;

        // Nav items
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            if (item.getAttribute('data-tab') === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Content panels
        document.querySelectorAll('.tab-content').forEach(panel => {
            if (panel.id === `tab-${tabName}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update Title
        const titleEl = document.getElementById('adminPageTitle');
        const titles = {
            dashboard: 'Dashboard Ringkasan Bisnis',
            produk: 'Manajemen Katalog Produk & Promo',
            stok: 'Pengawasan Stok & Inventaris',
            pesanan: 'Kelola Pesanan (Pick Up & Delivery)',
            pelanggan: 'Database Pelanggan',
            pengaturan: 'Pengaturan Toko & Layanan'
        };
        if (titleEl && titles[tabName]) {
            titleEl.innerText = titles[tabName];
        }

        // Re-render target data
        if (tabName === 'dashboard') this.renderDashboard();
        if (tabName === 'produk') this.renderProductsTable();
        if (tabName === 'stok') this.renderStockTable();
        if (tabName === 'pesanan') this.renderOrdersTable();
        if (tabName === 'pelanggan') this.renderCustomersTable();
    },

    // ----------------------------------------------------
    // Dashboard Stats & Visual Charts
    // ----------------------------------------------------
    renderDashboard() {
        const products = DataService.getProducts();
        const orders = DataService.getOrders();
        const customers = DataService.getCustomers();

        const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const lowStockCount = products.filter(p => p.stock <= 10).length;

        // Count Pending Payments needing admin confirmation
        const pendingPaymentOrders = orders.filter(o => 
            o.paymentStatus === 'Menunggu Konfirmasi Admin' || 
            (o.orderStatus === 'Pending' && o.paymentStatus !== 'Lunas' && !o.paymentStatus?.includes('Kasir'))
        );

        // Update Alert Banner on Dashboard
        const alertBanner = document.getElementById('adminPendingPaymentAlert');
        const alertText = document.getElementById('pendingAlertText');
        if (alertBanner) {
            if (pendingPaymentOrders.length > 0) {
                alertBanner.style.display = 'flex';
                if (alertText) {
                    alertText.innerHTML = `Ada <strong>${pendingPaymentOrders.length} pesanan baru</strong> yang menunggu konfirmasi admin agar pembayaran berhasil masuk ke sistem!`;
                }
            } else {
                alertBanner.style.display = 'none';
            }
        }

        // Update Stats KPI
        const revEl = document.getElementById('statTotalRevenue');
        const ordEl = document.getElementById('statTotalOrders');
        const stockEl = document.getElementById('statLowStock');
        const custEl = document.getElementById('statTotalCustomers');

        if (revEl) revEl.innerText = formatRupiah(totalRevenue);
        if (ordEl) ordEl.innerText = orders.length + ' Pesanan';
        if (stockEl) stockEl.innerText = lowStockCount + ' Produk Kritis';
        if (custEl) custEl.innerText = customers.length + ' Terdaftar';

        // Render Recent Orders in Dashboard
        const recentOrdersContainer = document.getElementById('dashboardRecentOrders');
        if (recentOrdersContainer) {
            const recent = orders.slice(0, 5);
            recentOrdersContainer.innerHTML = recent.map(o => {
                const isPickup = o.fulfillmentType === 'pickup';
                const isPaid = o.paymentStatus === 'Lunas' || o.paymentStatus === 'Sudah Bayar';
                const isPendingVerify = o.paymentStatus === 'Menunggu Konfirmasi Admin' || o.paymentStatus === 'Belum Bayar';

                return `
                    <tr>
                        <td>
                            <strong>${o.orderId}</strong>
                            <div style="font-size: 0.7rem; color: var(--text-faint);">${o.createdAt}</div>
                        </td>
                        <td>
                            <div><strong>${o.customerName}</strong></div>
                            <div style="font-size: 0.72rem; color: var(--text-faint);">${o.customerPhone}</div>
                        </td>
                        <td>
                            <span class="fulfillment-badge ${isPickup ? 'fulfillment-pickup' : 'fulfillment-delivery'}">
                                <i class="fa-solid ${isPickup ? 'fa-store' : 'fa-truck-fast'}"></i> ${isPickup ? 'Pick Up' : 'Delivery'}
                            </span>
                        </td>
                        <td>
                            <strong>${formatRupiah(o.grandTotal)}</strong>
                            <div style="font-size: 0.72rem; color: var(--text-faint);">${o.paymentMethod}</div>
                        </td>
                        <td>
                            ${isPaid ? `
                                <span class="badge-payment-success"><i class="fa-solid fa-circle-check"></i> Lunas</span>
                            ` : isPendingVerify ? `
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span class="badge-payment-pending"><i class="fa-solid fa-hourglass-half"></i> Menunggu Konfirmasi</span>
                                    <div style="display: flex; gap: 4px;">
                                        <button class="btn-xs-verify-success" onclick="AdminApp.confirmPayment('${o.orderId}')" title="Konfirmasi Lunas"><i class="fa-solid fa-check"></i> Terima</button>
                                        <button class="btn-xs-verify-danger" onclick="AdminApp.rejectPayment('${o.orderId}')" title="Tolak / Belum Masuk"><i class="fa-solid fa-xmark"></i></button>
                                        ${o.paymentProof ? `
                                        <button class="btn-sm-view-proof" style="padding: 2px 6px; font-size: 0.68rem;" onclick="AdminApp.openPaymentProofModal('${o.orderId}')" title="Lihat Bukti Bayar"><i class="fa-solid fa-image"></i></button>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : `
                                <span class="badge-payment-cash">${o.paymentStatus}</span>
                            `}
                        </td>
                        <td>
                            <select class="order-status-select" onchange="AdminApp.handleStatusChange('${o.orderId}', this.value)">
                                <option value="Pending" ${o.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Diproses" ${o.orderStatus === 'Diproses' ? 'selected' : ''}>Diproses</option>
                                <option value="${isPickup ? 'Siap Diambil' : 'Sedang Dikirim'}" ${o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim') ? 'selected' : ''}>${isPickup ? 'Siap Diambil' : 'Sedang Dikirim'}</option>
                                <option value="Selesai" ${o.orderStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
                                <option value="Dibatalkan" ${o.orderStatus === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-icon-action" onclick="AdminApp.viewOrderInvoice('${o.orderId}')" title="Lihat Nota">
                                <i class="fa-solid fa-file-invoice"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render Top Selling Products in Dashboard
        const topProductsContainer = document.getElementById('dashboardTopProducts');
        if (topProductsContainer) {
            const sortedBySales = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4);
            topProductsContainer.innerHTML = sortedBySales.map((p, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 800; font-size: 0.9rem; color: var(--primary-light); width: 20px;">#${idx + 1}</span>
                        <div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: #fff;">${p.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-faint);">${p.category} &bull; ${formatRupiah(p.price)}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: #34d399;">${p.soldCount || 0}</span>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">terjual</div>
                    </div>
                </div>
            `).join('');
        }
    },

    // ----------------------------------------------------
    // Products Management (CRUD + Promo)
    // ----------------------------------------------------
    renderProductsTable(searchQuery = '', filterCategory = 'Semua') {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        let products = DataService.getProducts();

        if (filterCategory !== 'Semua') {
            products = products.filter(p => p.category === filterCategory);
        }

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
        }

        tbody.innerHTML = products.map(p => {
            const promoTag = p.isPromo 
                ? `<span class="badge-promo-tag"><i class="fa-solid fa-tag"></i> Diskon ${p.discountPercent}%</span>` 
                : `<span style="color: var(--text-faint); font-size: 0.75rem;">Reguler</span>`;

            return `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>
                        <div class="table-product-cell">
                            <img src="${p.image}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'">
                            <div class="table-product-info">
                                <h4>${p.name}</h4>
                                <span>${p.subCategory || p.category} &bull; ${p.unit}</span>
                            </div>
                        </div>
                    </td>
                    <td><span style="color: #60a5fa; font-weight: 600;">${p.category}</span></td>
                    <td>
                        <strong>${formatRupiah(p.price)}</strong>
                        ${p.isPromo ? `<div style="font-size: 0.7rem; color: var(--text-faint); text-decoration: line-through;">${formatRupiah(p.originalPrice)}</div>` : ''}
                    </td>
                    <td>${promoTag}</td>
                    <td>
                        <span style="font-weight: 700; color: ${p.stock <= 5 ? '#f87171' : p.stock <= 10 ? '#fbbf24' : '#34d399'};">
                            ${p.stock}
                        </span>
                    </td>
                    <td>
                        <div class="action-btn-group">
                            <button class="btn-icon-action" onclick="AdminApp.openEditProductModal('${p.id}')" title="Edit Produk">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-icon-action delete" onclick="AdminApp.confirmDeleteProduct('${p.id}')" title="Hapus Produk">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddProductModal() {
        this.editingProductId = null;
        const modal = document.getElementById('productFormModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');

        if (title) title.innerText = 'Tambah Produk Baru';
        if (form) form.reset();

        const promoCheckbox = document.getElementById('formIsPromo');
        if (promoCheckbox) promoCheckbox.checked = false;

        modal.classList.add('active');
    },

    openEditProductModal(productId) {
        const product = DataService.getProductById(productId);
        if (!product) return;

        this.editingProductId = productId;
        const modal = document.getElementById('productFormModal');
        const title = document.getElementById('productModalTitle');

        if (title) title.innerText = 'Edit Produk: ' + product.name;

        document.getElementById('formProdName').value = product.name;
        document.getElementById('formProdCategory').value = product.category;
        document.getElementById('formProdSub').value = product.subCategory || '';
        document.getElementById('formProdPrice').value = product.price;
        document.getElementById('formProdOriginalPrice').value = product.originalPrice || product.price;
        document.getElementById('formProdStock').value = product.stock;
        document.getElementById('formProdUnit').value = product.unit;
        document.getElementById('formProdImage').value = product.image;
        document.getElementById('formProdDesc').value = product.description || '';
        document.getElementById('formIsPromo').checked = !!product.isPromo;
        document.getElementById('formProdDiscount').value = product.discountPercent || 0;

        modal.classList.add('active');
    },

    closeProductModal() {
        const modal = document.getElementById('productFormModal');
        if (modal) modal.classList.remove('active');
        this.editingProductId = null;
    },

    saveProductForm() {
        const name = document.getElementById('formProdName').value.trim();
        const category = document.getElementById('formProdCategory').value;
        const subCategory = document.getElementById('formProdSub').value.trim();
        const price = parseInt(document.getElementById('formProdPrice').value) || 0;
        const originalPrice = parseInt(document.getElementById('formProdOriginalPrice').value) || price;
        const stock = parseInt(document.getElementById('formProdStock').value) || 0;
        const unit = document.getElementById('formProdUnit').value.trim() || '1 Liter';
        let image = document.getElementById('formProdImage').value.trim();
        const description = document.getElementById('formProdDesc').value.trim();
        const isPromo = document.getElementById('formIsPromo').checked;
        const discountPercent = parseInt(document.getElementById('formProdDiscount').value) || 0;

        if (!name || price <= 0) {
            alert('Mohon masukkan nama produk dan harga yang valid!');
            return;
        }

        if (!image) {
            image = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80';
        }

        if (this.editingProductId) {
            // Update
            const updated = {
                id: this.editingProductId,
                name,
                category,
                subCategory,
                price,
                originalPrice,
                stock,
                unit,
                image,
                description,
                isPromo,
                discountPercent,
                badge: isPromo ? 'PROMO' : 'STANDARD'
            };
            DataService.updateProduct(updated);
        } else {
            // New
            const newProd = {
                name,
                category,
                subCategory: subCategory || category,
                price,
                originalPrice: originalPrice > price ? originalPrice : price,
                stock,
                unit,
                image,
                description,
                isPromo,
                discountPercent,
                rating: 4.8,
                soldCount: 0,
                badge: isPromo ? 'PROMO' : 'NEW',
                features: ['Kualitas Teruji', 'Formula Tahan Lama']
            };
            DataService.addProduct(newProd);
        }

        this.closeProductModal();
        this.renderProductsTable();
        this.renderStockTable();
        this.renderDashboard();
    },

    confirmDeleteProduct(productId) {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
            DataService.deleteProduct(productId);
            this.renderProductsTable();
            this.renderStockTable();
            this.renderDashboard();
        }
    },

    // ----------------------------------------------------
    // Stock / Inventory Management
    // ----------------------------------------------------
    renderStockTable(filter = 'all') {
        const tbody = document.getElementById('stockTableBody');
        if (!tbody) return;

        let products = DataService.getProducts();

        if (filter === 'low') {
            products = products.filter(p => p.stock > 0 && p.stock <= 10);
        } else if (filter === 'empty') {
            products = products.filter(p => p.stock <= 0);
        }

        tbody.innerHTML = products.map(p => {
            let statusBadge = '<span class="stock-val-pill safe"><i class="fa-solid fa-check"></i> Aman</span>';
            if (p.stock <= 0) {
                statusBadge = '<span class="stock-val-pill empty"><i class="fa-solid fa-circle-xmark"></i> Habis</span>';
            } else if (p.stock <= 10) {
                statusBadge = '<span class="stock-val-pill low"><i class="fa-solid fa-triangle-exclamation"></i> Menipis</span>';
            }

            return `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.unit}</td>
                    <td>
                        <div class="stock-adjust-cell">
                            <button class="btn-quick-stock" onclick="AdminApp.quickAdjustStock('${p.id}', -1)" title="Kurangi 1">-</button>
                            <span style="font-weight: 800; min-width: 32px; text-align: center; color: #fff;">${p.stock}</span>
                            <button class="btn-quick-stock" onclick="AdminApp.quickAdjustStock('${p.id}', 1)" title="Tambah 1">+</button>
                            <button class="btn-quick-stock" style="width: auto; padding: 0 6px;" onclick="AdminApp.quickAdjustStock('${p.id}', 10)" title="Tambah 10">+10</button>
                        </div>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-icon-action" onclick="AdminApp.promptCustomStock('${p.id}', ${p.stock})" title="Ubah Stok Manual">
                            <i class="fa-solid fa-calculator"></i> Set Stok
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    quickAdjustStock(productId, delta) {
        const product = DataService.getProductById(productId);
        if (product) {
            const newStock = Math.max(0, product.stock + delta);
            DataService.updateStock(productId, newStock);
            this.renderStockTable();
            this.renderProductsTable();
            this.renderDashboard();
        }
    },

    promptCustomStock(productId, currentStock) {
        const val = prompt(`Masukkan jumlah stok baru untuk produk ini (Stok sekarang: ${currentStock}):`, currentStock);
        if (val !== null && !isNaN(val)) {
            DataService.updateStock(productId, parseInt(val));
            this.renderStockTable();
            this.renderProductsTable();
            this.renderDashboard();
        }
    },

    // ----------------------------------------------------
    // Orders Management & Payment Verification
    // ----------------------------------------------------
    currentOrderQuickFilter: 'all',

    setQuickFilter(filterKey) {
        this.currentOrderQuickFilter = filterKey;
        document.querySelectorAll('.order-pill-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
        });
        this.renderOrdersTable();
    },

    filterPendingPayments() {
        this.switchTab('pesanan');
        this.setQuickFilter('pending_payment');
    },

    renderOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        let orders = DataService.getOrders();

        // Update Pill Counts
        const countAll = orders.length;
        const countPending = orders.filter(o => 
            o.paymentStatus === 'Menunggu Konfirmasi Admin' || 
            (o.orderStatus === 'Pending' && o.paymentStatus !== 'Lunas' && !o.paymentStatus?.includes('Kasir'))
        ).length;
        const countProcessing = orders.filter(o => o.orderStatus === 'Diproses').length;
        const countShipping = orders.filter(o => o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim')).length;
        const countCompleted = orders.filter(o => o.orderStatus === 'Selesai').length;

        const elAll = document.getElementById('pillCountAll');
        const elPending = document.getElementById('pillCountPending');
        const elProcessing = document.getElementById('pillCountProcessing');
        const elShipping = document.getElementById('pillCountShipping');
        const elCompleted = document.getElementById('pillCountCompleted');

        if (elAll) elAll.innerText = countAll;
        if (elPending) elPending.innerText = countPending;
        if (elProcessing) elProcessing.innerText = countProcessing;
        if (elShipping) elShipping.innerText = countShipping;
        if (elCompleted) elCompleted.innerText = countCompleted;

        // Apply Quick Filter
        const quick = this.currentOrderQuickFilter || 'all';
        if (quick === 'pending_payment') {
            orders = orders.filter(o => 
                o.paymentStatus === 'Menunggu Konfirmasi Admin' || 
                (o.orderStatus === 'Pending' && o.paymentStatus !== 'Lunas' && !o.paymentStatus?.includes('Kasir'))
            );
        } else if (quick === 'Diproses') {
            orders = orders.filter(o => o.orderStatus === 'Diproses');
        } else if (quick === 'shipping') {
            orders = orders.filter(o => o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim'));
        } else if (quick === 'Selesai') {
            orders = orders.filter(o => o.orderStatus === 'Selesai');
        }

        // Apply Search Filter
        const searchInput = document.getElementById('adminOrderSearch');
        if (searchInput && searchInput.value.trim() !== '') {
            const q = searchInput.value.toLowerCase().trim();
            orders = orders.filter(o => 
                o.orderId.toLowerCase().includes(q) || 
                o.customerName.toLowerCase().includes(q) || 
                o.customerPhone.includes(q)
            );
        }

        // Apply Dropdown Filters
        const typeSelect = document.getElementById('orderFilterType');
        const filterType = typeSelect ? typeSelect.value : 'all';
        if (filterType !== 'all') {
            orders = orders.filter(o => o.fulfillmentType === filterType);
        }

        const paySelect = document.getElementById('orderFilterPayment');
        const filterPay = paySelect ? paySelect.value : 'all';
        if (filterPay === 'pending_verify') {
            orders = orders.filter(o => o.paymentStatus === 'Menunggu Konfirmasi Admin' || o.paymentStatus === 'Belum Bayar');
        } else if (filterPay === 'lunas') {
            orders = orders.filter(o => o.paymentStatus === 'Lunas' || o.paymentStatus === 'Sudah Bayar');
        } else if (filterPay === 'rejected') {
            orders = orders.filter(o => o.paymentStatus?.includes('Ditolak') || o.paymentStatus?.includes('Belum Masuk'));
        } else if (filterPay === 'cash') {
            orders = orders.filter(o => o.paymentStatus?.includes('Kasir') || o.paymentStatus?.includes('COD'));
        }

        const statusSelect = document.getElementById('orderFilterStatus');
        const filterStatus = statusSelect ? statusSelect.value : 'all';
        if (filterStatus !== 'all') {
            orders = orders.filter(o => o.orderStatus === filterStatus);
        }

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-receipt" style="font-size: 2rem; margin-bottom: 8px; color: rgba(255,255,255,0.1);"></i>
                        <div>Tidak ada data pesanan yang sesuai dengan filter pencarian.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const isPickup = o.fulfillmentType === 'pickup';
            const locationText = isPickup 
                ? `<div style="font-size: 0.72rem; color: var(--text-faint); margin-top: 4px;">${o.pickupLocation}</div>`
                : `<div style="font-size: 0.72rem; color: var(--text-faint); margin-top: 4px;">${o.deliveryAddress} (${o.deliveryCourier})</div>`;

            const isPaid = o.paymentStatus === 'Lunas' || o.paymentStatus === 'Sudah Bayar';
            const isPendingVerify = o.paymentStatus === 'Menunggu Konfirmasi Admin' || o.paymentStatus === 'Belum Bayar';
            const isRejected = o.paymentStatus?.includes('Ditolak') || o.paymentStatus?.includes('Belum Masuk');

            let paymentCellHtml = '';
            if (isPaid) {
                paymentCellHtml = `
                    <div class="admin-payment-action-block">
                        <span class="badge-payment-success"><i class="fa-solid fa-circle-check"></i> Lunas (Berhasil Masuk)</span>
                        ${o.paymentConfirmedAt ? `<div class="payment-confirmed-time"><i class="fa-solid fa-clock-check"></i> ${o.paymentConfirmedAt}</div>` : ''}
                        <div style="display: flex; gap: 6px; margin-top: 4px; align-items: center;">
                            ${o.paymentProof ? `
                                <button type="button" class="btn-sm-view-proof" onclick="AdminApp.openPaymentProofModal('${o.orderId}')">
                                    <i class="fa-solid fa-image"></i> Bukti
                                </button>
                            ` : ''}
                            <button type="button" class="btn-sm-revert" onclick="AdminApp.revertPaymentStatus('${o.orderId}')" title="Ubah kembali status jika salah klik">
                                <i class="fa-solid fa-rotate-left"></i> Batal Lunas
                            </button>
                        </div>
                    </div>
                `;
            } else if (isPendingVerify) {
                paymentCellHtml = `
                    <div class="admin-payment-action-block">
                        <span class="badge-payment-pending"><i class="fa-solid fa-hourglass-half"></i> Menunggu Konfirmasi</span>
                        ${o.paymentProof ? `
                            <button type="button" class="btn-sm-view-proof" onclick="AdminApp.openPaymentProofModal('${o.orderId}')">
                                <i class="fa-solid fa-image"></i> Lihat Bukti Transfer
                            </button>
                        ` : `
                            <span class="no-proof-note"><i class="fa-solid fa-circle-info"></i> Tanpa Upload Foto</span>
                        `}
                        <div class="admin-verify-btn-group">
                            <button type="button" class="btn-verify-success" onclick="AdminApp.confirmPayment('${o.orderId}')" title="Konfirmasi bahwa dana telah berhasil masuk ke rekening / QRIS">
                                <i class="fa-solid fa-check"></i> Konfirmasi Masuk
                            </button>
                            <button type="button" class="btn-verify-danger" onclick="AdminApp.rejectPayment('${o.orderId}')" title="Tolak pembayaran karena dana belum masuk">
                                <i class="fa-solid fa-xmark"></i> Tolak
                            </button>
                        </div>
                    </div>
                `;
            } else if (isRejected) {
                paymentCellHtml = `
                    <div class="admin-payment-action-block">
                        <span class="badge-payment-danger"><i class="fa-solid fa-circle-xmark"></i> Belum Masuk / Ditolak</span>
                        <div style="display: flex; gap: 6px; margin-top: 4px;">
                            <button type="button" class="btn-verify-success" onclick="AdminApp.confirmPayment('${o.orderId}')" title="Konfirmasi jika pelanggan sudah transfer ulang">
                                <i class="fa-solid fa-check"></i> Konfirmasi Ulang
                            </button>
                            ${o.paymentProof ? `
                                <button type="button" class="btn-sm-view-proof" onclick="AdminApp.openPaymentProofModal('${o.orderId}')">
                                    <i class="fa-solid fa-image"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                paymentCellHtml = `
                    <div class="admin-payment-action-block">
                        <span class="badge-payment-cash"><i class="fa-solid fa-money-bill-wave"></i> ${o.paymentStatus}</span>
                        <button type="button" class="btn-verify-success" style="margin-top: 4px;" onclick="AdminApp.confirmPayment('${o.orderId}')" title="Tandai pembayaran telah dilunasi di kasir / kurir">
                            <i class="fa-solid fa-check"></i> Tandai Lunas
                        </button>
                    </div>
                `;
            }

            return `
                <tr>
                    <td>
                        <strong>${o.orderId}</strong>
                        <div style="font-size: 0.7rem; color: var(--text-faint); margin-top: 2px;">${o.createdAt}</div>
                    </td>
                    <td>
                        <div><strong>${o.customerName}</strong></div>
                        <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">
                            <a href="https://wa.me/${o.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #34d399;">
                                <i class="fa-brands fa-whatsapp"></i> ${o.customerPhone}
                            </a>
                        </div>
                    </td>
                    <td>
                        <span class="fulfillment-badge ${isPickup ? 'fulfillment-pickup' : 'fulfillment-delivery'}">
                            <i class="fa-solid ${isPickup ? 'fa-store' : 'fa-truck-fast'}"></i> ${isPickup ? 'Ambil di Toko' : 'Pengantaran'}
                        </span>
                        ${locationText}
                    </td>
                    <td>
                        <strong>${formatRupiah(o.grandTotal)}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-faint); margin-top: 2px;">
                            ${o.paymentMethod}
                        </div>
                    </td>
                    <td>
                        ${paymentCellHtml}
                    </td>
                    <td>
                        <select class="order-status-select" onchange="AdminApp.handleStatusChange('${o.orderId}', this.value)">
                            <option value="Pending" ${o.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Diproses" ${o.orderStatus === 'Diproses' ? 'selected' : ''}>Diproses</option>
                            <option value="${isPickup ? 'Siap Diambil' : 'Sedang Dikirim'}" ${o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim') ? 'selected' : ''}>${isPickup ? 'Siap Diambil' : 'Sedang Dikirim'}</option>
                            <option value="Selesai" ${o.orderStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
                            <option value="Dibatalkan" ${o.orderStatus === 'Dibatalkan' ? 'selected' : ''}>Dibatalkan</option>
                        </select>
                    </td>
                    <td>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-icon-action" onclick="AdminApp.viewOrderInvoice('${o.orderId}')" title="Cetak / Lihat Surat Jalan & Nota">
                                <i class="fa-solid fa-print"></i>
                            </button>
                            ${o.paymentProof ? `
                            <button class="btn-icon-action" onclick="AdminApp.openPaymentProofModal('${o.orderId}')" title="Lihat Bukti Transfer">
                                <i class="fa-solid fa-image"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    confirmPayment(orderId) {
        if (!confirm(`Konfirmasi bahwa pembayaran untuk pesanan ${orderId} telah BERHASIL MASUK ke rekening / QRIS?`)) return;
        DataService.updatePaymentStatus(orderId, 'Lunas', 'Diproses');
        this.showToast(`✅ Pembayaran pesanan ${orderId} berhasil dikonfirmasi LUNAS! Status diubah ke Diproses.`, 'success');
        this.renderOrdersTable();
        this.renderDashboard();
        this.closePaymentProofModal();

        const invModal = document.getElementById('adminInvoiceModal');
        if (invModal && invModal.classList.contains('active')) {
            this.viewOrderInvoice(orderId);
        }
    },

    rejectPayment(orderId) {
        if (!confirm(`Tandai pembayaran pesanan ${orderId} sebagai BELUM MASUK / DITOLAK?`)) return;
        DataService.updatePaymentStatus(orderId, 'Ditolak / Belum Masuk');
        this.showToast(`⚠️ Pembayaran pesanan ${orderId} ditandai belum masuk.`, 'error');
        this.renderOrdersTable();
        this.renderDashboard();
        this.closePaymentProofModal();

        const invModal = document.getElementById('adminInvoiceModal');
        if (invModal && invModal.classList.contains('active')) {
            this.viewOrderInvoice(orderId);
        }
    },

    revertPaymentStatus(orderId) {
        if (!confirm(`Kembalikan status pembayaran pesanan ${orderId} menjadi Menunggu Konfirmasi Admin?`)) return;
        DataService.updatePaymentStatus(orderId, 'Menunggu Konfirmasi Admin', 'Pending');
        this.showToast(`Status pembayaran ${orderId} dikembalikan ke Menunggu Konfirmasi.`, 'info');
        this.renderOrdersTable();
        this.renderDashboard();
    },

    openPaymentProofModal(orderId) {
        const orders = DataService.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return;

        const modal = document.getElementById('adminPaymentProofModal');
        const body = document.getElementById('adminPaymentProofBody');
        const footer = document.getElementById('adminPaymentProofFooter');
        if (!modal || !body || !footer) return;

        const isPaid = order.paymentStatus === 'Lunas' || order.paymentStatus === 'Sudah Bayar';
        const waLink = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`;

        body.innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
                    <div>
                        <span style="color: var(--text-faint);">Nomor Pesanan:</span>
                        <div style="font-weight: 700; color: #fff;">${order.orderId}</div>
                    </div>
                    <div>
                        <span style="color: var(--text-faint);">Total Tagihan:</span>
                        <div style="font-weight: 800; color: #fb7185; font-size: 1.05rem;">${formatRupiah(order.grandTotal)}</div>
                    </div>
                    <div>
                        <span style="color: var(--text-faint);">Nama Pelanggan:</span>
                        <div style="font-weight: 600; color: #fff;">${order.customerName}</div>
                    </div>
                    <div>
                        <span style="color: var(--text-faint);">WhatsApp:</span>
                        <div><a href="${waLink}" target="_blank" style="color: #34d399; font-weight: 600;"><i class="fa-brands fa-whatsapp"></i> ${order.customerPhone}</a></div>
                    </div>
                    <div>
                        <span style="color: var(--text-faint);">Metode Pembayaran:</span>
                        <div style="font-weight: 600; color: #60a5fa;">${order.paymentMethod}</div>
                    </div>
                    <div>
                        <span style="color: var(--text-faint);">Status Sekarang:</span>
                        <div><span class="${isPaid ? 'badge-payment-success' : 'badge-payment-pending'}">${order.paymentStatus}</span></div>
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <h4 style="font-size: 0.88rem; color: #fff; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-file-invoice"></i> Foto Bukti Transfer / Struk QRIS
                </h4>
                ${order.paymentProof ? `
                    <div style="background: #000; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); display: inline-block; max-width: 100%;">
                        <img src="${order.paymentProof}" alt="Bukti Transfer" style="max-height: 360px; max-width: 100%; object-fit: contain; border-radius: 4px;">
                    </div>
                    ${order.paymentProofUploadedAt ? `<div style="font-size: 0.72rem; color: var(--text-faint); margin-top: 6px;">Diupload pada: ${order.paymentProofUploadedAt}</div>` : ''}
                ` : `
                    <div style="padding: 30px 20px; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-muted);">
                        <i class="fa-solid fa-image-slash" style="font-size: 2.2rem; margin-bottom: 8px; color: rgba(255,255,255,0.2);"></i>
                        <p style="margin: 0; font-size: 0.85rem;">Pelanggan belum mengunggah foto struk bukti bayar.</p>
                        <p style="margin: 4px 0 0 0; font-size: 0.75rem;">Silakan periksa mutasi rekening / QRIS bank Anda atau hubungi pelanggan via WhatsApp.</p>
                    </div>
                `}
            </div>
        `;

        footer.innerHTML = `
            <button type="button" class="btn-secondary" onclick="AdminApp.closePaymentProofModal()">Tutup</button>
            <a href="${waLink}" target="_blank" class="btn-icon-action" style="width: auto; padding: 8px 14px; gap: 6px; color: #34d399; border-color: rgba(52, 211, 153, 0.4);" title="Hubungi Pelanggan via WA">
                <i class="fa-brands fa-whatsapp"></i> Chat WA
            </a>
            ${!isPaid ? `
                <button type="button" class="btn-verify-danger" style="padding: 8px 14px;" onclick="AdminApp.rejectPayment('${order.orderId}')">
                    <i class="fa-solid fa-xmark"></i> Tolak (Belum Masuk)
                </button>
                <button type="button" class="btn-verify-success" style="padding: 8px 16px;" onclick="AdminApp.confirmPayment('${order.orderId}')">
                    <i class="fa-solid fa-check"></i> Konfirmasi Berhasil Masuk (Lunas)
                </button>
            ` : `
                <button type="button" class="btn-sm-revert" style="padding: 8px 14px;" onclick="AdminApp.revertPaymentStatus('${order.orderId}')">
                    <i class="fa-solid fa-rotate-left"></i> Batal Lunas
                </button>
            `}
        `;

        modal.classList.add('active');
    },

    closePaymentProofModal() {
        const modal = document.getElementById('adminPaymentProofModal');
        if (modal) modal.classList.remove('active');
    },

    handleStatusChange(orderId, newStatus) {
        DataService.updateOrderStatus(orderId, newStatus);
        this.renderOrdersTable();
        this.renderDashboard();
    },

    viewOrderInvoice(orderId) {
        // We can open the invoice modal
        const orders = DataService.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return;

        const isPickup = order.fulfillmentType === 'pickup';
        const isPaid = order.paymentStatus === 'Lunas' || order.paymentStatus === 'Sudah Bayar';
        const isPendingVerify = order.paymentStatus === 'Menunggu Konfirmasi Admin' || order.paymentStatus === 'Belum Bayar';

        const fulfillmentInfo = isPickup ? `
            <div>
                <strong>Metode:</strong> AMBIL DI TOKO (PICK UP)<br>
                <strong>Cabang Ambil:</strong> ${order.pickupLocation}<br>
                <strong>Jadwal:</strong> ${order.pickupDateTime}
            </div>
        ` : `
            <div>
                <strong>Metode:</strong> PENGANTARAN (DELIVERY)<br>
                <strong>Alamat:</strong> ${order.deliveryAddress}<br>
                <strong>Kurir:</strong> ${order.deliveryCourier}
            </div>
        `;

        const itemsRows = order.items.map((it, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${it.name}</td>
                <td>${it.qty}</td>
                <td class="text-right">${formatRupiah(it.price)}</td>
                <td class="text-right">${formatRupiah(it.total)}</td>
            </tr>
        `).join('');

        const container = document.getElementById('adminInvoiceContent');
        if (!container) return;

        container.innerHTML = `
            <div class="invoice-paper" id="adminInvoicePrintArea">
                <div class="invoice-header">
                    <div class="invoice-logo">
                        <h2>AUTOGLOSS & COATING HUB</h2>
                        <p>Pusat Cat Mobil & Bangunan Profesional</p>
                    </div>
                    <div class="invoice-meta">
                        <strong>SURAT JALAN & NOTA KASIR</strong><br>
                        <span>No: ${order.orderId}</span><br>
                        <span>Tgl: ${order.createdAt}</span><br>
                        ${isPaid ? `
                            <span style="color: #15803d; font-weight: 700; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">Status: ${order.orderStatus} (LUNAS)</span>
                        ` : isPendingVerify ? `
                            <span style="color: #b45309; font-weight: 700; background: #fef3c7; padding: 2px 8px; border-radius: 4px;">Status: Menunggu Konfirmasi Admin</span>
                        ` : `
                            <span style="color: #b91c1c; font-weight: 700; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">Status: ${order.orderStatus} (${order.paymentStatus})</span>
                        `}
                    </div>
                </div>

                <!-- Admin Action Banner on Invoice -->
                ${!isPaid ? `
                <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div style="font-size: 0.82rem; color: #78350f;">
                        <strong><i class="fa-solid fa-hourglass-half"></i> Pembayaran Belum Dikonfirmasi Admin</strong>
                        <div>Pastikan dana telah masuk ke rekening / QRIS sebelum pesanan diproses.</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn-verify-success" onclick="AdminApp.confirmPayment('${order.orderId}')">
                            <i class="fa-solid fa-check"></i> Konfirmasi Lunas Sekarang
                        </button>
                        <button type="button" class="btn-verify-danger" onclick="AdminApp.rejectPayment('${order.orderId}')">
                            <i class="fa-solid fa-xmark"></i> Tolak
                        </button>
                    </div>
                </div>
                ` : `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-size: 0.82rem; color: #14532d;">
                        <strong><i class="fa-solid fa-circle-check"></i> Pembayaran Telah Dikonfirmasi Lunas</strong>
                        ${order.paymentConfirmedAt ? `<div>Dikonfirmasi pada: ${order.paymentConfirmedAt}</div>` : ''}
                    </div>
                    <button type="button" class="btn-sm-revert" onclick="AdminApp.revertPaymentStatus('${order.orderId}')">
                        <i class="fa-solid fa-rotate-left"></i> Batal Lunas
                    </button>
                </div>
                `}

                <div class="invoice-details-grid">
                    <div>
                        <strong>Data Pelanggan:</strong><br>
                        ${order.customerName}<br>
                        Telp: ${order.customerPhone}<br>
                        Bayar: ${order.paymentMethod} (<strong>${order.paymentStatus}</strong>)
                    </div>
                    ${fulfillmentInfo}
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Item Produk</th>
                            <th style="width: 60px;">Qty</th>
                            <th class="text-right">Harga</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="invoice-total-section">
                    <div class="line">
                        <span>Subtotal:</span>
                        <span>${formatRupiah(order.subtotal)}</span>
                    </div>
                    <div class="line">
                        <span>Ongkir:</span>
                        <span>${formatRupiah(order.shippingFee)}</span>
                    </div>
                    ${order.discount > 0 ? `
                    <div class="line" style="color: #16a34a;">
                        <span>Diskon:</span>
                        <span>-${formatRupiah(order.discount)}</span>
                    </div>
                    ` : ''}
                    <div class="line grand">
                        <span>TOTAL:</span>
                        <span>${formatRupiah(order.grandTotal)}</span>
                    </div>
                </div>
            </div>
        `;

        const modal = document.getElementById('adminInvoiceModal');
        if (modal) modal.classList.add('active');
    },

    closeAdminInvoiceModal() {
        const modal = document.getElementById('adminInvoiceModal');
        if (modal) modal.classList.remove('active');
    },

    // ----------------------------------------------------
    // Customers Table
    // ----------------------------------------------------
    renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        const customers = DataService.getCustomers();

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td><strong>${c.name}</strong></td>
                <td>
                    <a href="https://wa.me/${c.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #34d399; font-weight: 600;">
                        <i class="fa-brands fa-whatsapp"></i> ${c.phone}
                    </a>
                </td>
                <td>${c.email || '-'}</td>
                <td><span style="font-weight: 700; color: #60a5fa;">${c.totalOrders} Transaksi</span></td>
                <td><strong>${formatRupiah(c.totalSpent)}</strong></td>
                <td>${c.lastOrder}</td>
            </tr>
        `).join('');
    },

    // ----------------------------------------------------
    // Settings
    // ----------------------------------------------------
    loadSettings() {
        const settings = DataService.getSettings();

        const nameEl = document.getElementById('settingStoreName');
        const taglineEl = document.getElementById('settingStoreTagline');
        const phoneEl = document.getElementById('settingStorePhone');
        const emailEl = document.getElementById('settingStoreEmail');
        const addressEl = document.getElementById('settingStoreAddress');
        const hoursEl = document.getElementById('settingStoreHours');

        if (nameEl) nameEl.value = settings.storeName || '';
        if (taglineEl) taglineEl.value = settings.storeTagline || '';
        if (phoneEl) phoneEl.value = settings.phone || '';
        if (emailEl) emailEl.value = settings.email || '';
        if (addressEl) addressEl.value = settings.address || '';
        if (hoursEl) hoursEl.value = settings.operatingHours || '';

        const auth = DataService.getAdminAuth();
        const userSettingEl = document.getElementById('settingNewUsername');
        if (userSettingEl && auth) {
            userSettingEl.value = auth.username;
        }
    },

    saveSettings() {
        const settings = DataService.getSettings();

        settings.storeName = document.getElementById('settingStoreName').value;
        settings.storeTagline = document.getElementById('settingStoreTagline').value;
        settings.phone = document.getElementById('settingStorePhone').value;
        settings.email = document.getElementById('settingStoreEmail').value;
        settings.address = document.getElementById('settingStoreAddress').value;
        settings.operatingHours = document.getElementById('settingStoreHours').value;

        DataService.saveSettings(settings);
        alert('Pengaturan toko berhasil disimpan!');
    },

    resetAllData() {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal (default)? Data pesanan, produk, dan kredensial admin akan dikembalikan ke data bawaan pabrik.')) {
            DataService.resetToDefault();
            AdminAuth.applyUnauthenticatedState();
            alert('Semua data toko berhasil di-reset ke kondisi awal! Silakan login kembali dengan username: admin dan sandi: admin123.');
        }
    }
};

/**
 * Admin Authentication & Security Controller
 */
const AdminAuth = {
    toastTimeout: null,

    init() {
        const session = DataService.getAdminSession();
        if (session) {
            this.applyAuthenticatedState(session);
            AdminApp.init();
        } else {
            this.applyUnauthenticatedState();
        }
    },

    applyAuthenticatedState(session) {
        document.body.classList.remove('auth-locked');
        const loginScreen = document.getElementById('adminLoginScreen');
        if (loginScreen) {
            loginScreen.classList.add('hidden');
            setTimeout(() => {
                loginScreen.style.display = 'none';
            }, 350);
        }

        // Update profile in topbar
        const nameEl = document.getElementById('adminProfileName');
        const roleEl = document.getElementById('adminProfileRole');
        const avatarEl = document.getElementById('adminTopAvatar');

        if (nameEl) nameEl.textContent = session.name || 'Admin Toko';
        if (roleEl) roleEl.textContent = (session.role || 'Kepala Gudang & Kasir') + ` (@${session.username})`;
        if (avatarEl && session.username) {
            avatarEl.textContent = session.username.substring(0, 2).toUpperCase();
        }

        const usernameSettingEl = document.getElementById('settingNewUsername');
        if (usernameSettingEl) {
            usernameSettingEl.value = session.username;
        }
    },

    applyUnauthenticatedState() {
        document.body.classList.add('auth-locked');
        const loginScreen = document.getElementById('adminLoginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.classList.remove('hidden');
        }

        // Reset login inputs
        const passInput = document.getElementById('adminPasswordInput');
        if (passInput) passInput.value = '';
        
        const alertBox = document.getElementById('loginAlertBox');
        if (alertBox) alertBox.style.display = 'none';

        // Auto focus on username input
        setTimeout(() => {
            const userInput = document.getElementById('adminUsernameInput');
            if (userInput) userInput.focus();
        }, 150);
    },

    handleLogin(e) {
        if (e) e.preventDefault();

        const userInput = document.getElementById('adminUsernameInput');
        const passInput = document.getElementById('adminPasswordInput');
        const rememberCheckbox = document.getElementById('adminRememberMe');
        const submitBtn = document.getElementById('btnLoginSubmit');
        const btnText = document.getElementById('loginBtnText');
        const btnSpinner = document.getElementById('loginBtnSpinner');
        const alertBox = document.getElementById('loginAlertBox');
        const alertMsg = document.getElementById('loginAlertMsg');
        const loginCard = document.getElementById('adminLoginCard');

        const username = userInput ? userInput.value.trim() : '';
        const password = passInput ? passInput.value : '';
        const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

        // Loading state
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnSpinner) btnSpinner.style.display = 'inline-flex';
        if (alertBox) alertBox.style.display = 'none';

        setTimeout(() => {
            const res = DataService.verifyAdminLogin(username, password);

            if (res.success) {
                const session = DataService.setAdminSession(res.user, rememberMe);
                this.applyAuthenticatedState(session);
                AdminApp.init();

                this.showToast(`Login berhasil! Selamat datang kembali, ${res.user.name}.`, 'success');

                // Reset button state
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline-flex';
                if (btnSpinner) btnSpinner.style.display = 'none';
            } else {
                // Restore button
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline-flex';
                if (btnSpinner) btnSpinner.style.display = 'none';

                // Show error alert
                if (alertMsg) alertMsg.textContent = res.message || 'Username atau sandi salah!';
                if (alertBox) alertBox.style.display = 'flex';

                // Shake card
                if (loginCard) {
                    loginCard.classList.remove('shake');
                    void loginCard.offsetWidth; // trigger reflow
                    loginCard.classList.add('shake');
                }

                if (passInput) {
                    passInput.focus();
                    passInput.select();
                }
            }
        }, 350);
    },

    fillDemoCredentials() {
        const userInput = document.getElementById('adminUsernameInput');
        const passInput = document.getElementById('adminPasswordInput');
        const alertBox = document.getElementById('loginAlertBox');

        if (userInput) userInput.value = 'admin';
        if (passInput) passInput.value = 'admin123';
        if (alertBox) alertBox.style.display = 'none';

        this.showToast('Kredensial demo diisi otomatis: admin / admin123', 'success');

        const submitBtn = document.getElementById('btnLoginSubmit');
        if (submitBtn) submitBtn.focus();
    },

    togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        if (btn) {
            btn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            btn.title = isPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi';
        }
    },

    logout() {
        if (!confirm('Apakah Anda yakin ingin keluar (logout) dari panel administrator AutoGloss?')) {
            return;
        }

        DataService.clearAdminSession();
        this.applyUnauthenticatedState();
        this.showToast('Anda telah berhasil logout dari panel admin.', 'success');
    },

    handleUpdateCredentials(e) {
        if (e) e.preventDefault();

        const newUsername = document.getElementById('settingNewUsername').value.trim();
        const currentPassword = document.getElementById('settingCurrentPassword').value;
        const newPassword = document.getElementById('settingNewPassword').value;
        const confirmPassword = document.getElementById('settingConfirmPassword').value;
        const alertBox = document.getElementById('credentialAlertBox');

        const showAlert = (msg, isError = true) => {
            if (!alertBox) return;
            alertBox.style.display = 'block';
            alertBox.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
            alertBox.style.border = isError ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)';
            alertBox.style.color = isError ? '#fca5a5' : '#6ee7b7';
            alertBox.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
        };

        if (newPassword !== confirmPassword) {
            showAlert('Konfirmasi kata sandi baru tidak sama dengan kata sandi baru!');
            return;
        }

        const res = DataService.updateAdminPassword(currentPassword, newUsername, newPassword);
        if (res.success) {
            showAlert(res.message, false);
            this.showToast(res.message, 'success');

            // Clear password fields
            document.getElementById('settingCurrentPassword').value = '';
            document.getElementById('settingNewPassword').value = '';
            document.getElementById('settingConfirmPassword').value = '';

            // Update topbar display
            const session = DataService.getAdminSession();
            if (session) {
                const roleEl = document.getElementById('adminProfileRole');
                if (roleEl) roleEl.textContent = (session.role || 'Kepala Gudang & Kasir') + ` (@${newUsername})`;
            }
        } else {
            showAlert(res.message, true);
        }
    },

    showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        const toastMsg = document.getElementById('adminToastMsg');
        const toastIcon = document.getElementById('adminToastIcon');

        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.className = `admin-toast ${type} show`;

        if (toastIcon) {
            toastIcon.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
        }

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
};

// Initialize Admin Auth on load
document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.init();
});
