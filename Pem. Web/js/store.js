/**
 * Storefront JavaScript Controller
 * Toko Cat Mobil & Cat Berkualitas - AutoGloss Paint Hub
 */

// Application State
const StoreApp = {
    currentCategory: 'Semua',
    onlyPromo: false,
    sortBy: 'default',
    searchQuery: '',
    selectedFulfillment: 'pickup', // 'pickup' | 'delivery'
    selectedDeliveryOption: null,
    appliedVoucher: null,
    selectedProduct: null,

    init() {
        this.renderAll();
        this.setupEventListeners();
        this.startPromoCountdown();
        this.updateCartUI();
    },

    renderAll() {
        this.renderFlashSale();
        this.renderCategoryTiles();
        this.renderProducts();
        this.renderOrders();
        this.renderBranches();
    },

    // ----------------------------------------------------
    // Promo Flash Sale Carousel / Grid
    // ----------------------------------------------------
    renderFlashSale() {
        const container = document.getElementById('flashSaleGrid');
        if (!container) return;

        const products = DataService.getProducts();
        const promoProducts = products.filter(p => p.isPromo).slice(0, 4);

        container.innerHTML = promoProducts.map(p => this.createProductCardHTML(p)).join('');
    },

    // ----------------------------------------------------
    // Category Quick Tiles
    // ----------------------------------------------------
    renderCategoryTiles() {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;

        const categories = [
            { name: 'Cat Mobil', icon: 'fa-car-side', count: '5 Produk' },
            { name: 'Cat Tembok', icon: 'fa-paint-roller', count: '3 Produk' },
            { name: 'Cat Kayu', icon: 'fa-tree', count: '2 Produk' },
            { name: 'Cat Besi', icon: 'fa-shield-halved', count: '2 Produk' },
            { name: 'Cat Eksterior', icon: 'fa-house-chimney-crack', count: '2 Produk' },
            { name: 'Aksesoris', icon: 'fa-spray-can-sparkles', count: '4 Produk' }
        ];

        container.innerHTML = categories.map(cat => `
            <div class="cat-tile ${this.currentCategory === cat.name ? 'active' : ''}" onclick="StoreApp.filterByCategory('${cat.name}')">
                <div class="cat-tile-icon">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="cat-tile-name">${cat.name}</div>
                <div class="cat-tile-count">${cat.count}</div>
            </div>
        `).join('');
    },

    // ----------------------------------------------------
    // Product Catalog Rendering & Filtering
    // ----------------------------------------------------
    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        let products = DataService.getProducts();

        // Filter by Category
        if (this.currentCategory !== 'Semua') {
            products = products.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
        }

        // Filter by Promo Only
        if (this.onlyPromo) {
            products = products.filter(p => p.isPromo);
        }

        // Filter by Search Query (if searching in catalog)
        if (this.searchQuery.trim() !== '') {
            const q = this.searchQuery.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.category.toLowerCase().includes(q) || 
                p.subCategory.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
        }

        // Sorting
        if (this.sortBy === 'price-low') {
            products.sort((a, b) => a.price - b.price);
        } else if (this.sortBy === 'price-high') {
            products.sort((a, b) => b.price - a.price);
        } else if (this.sortBy === 'discount') {
            products.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        } else if (this.sortBy === 'popular') {
            products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        }

        if (products.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 12px; color: rgba(255,255,255,0.1);"></i>
                    <h3 style="color: #fff; margin-bottom: 6px;">Tidak ada produk yang sesuai kriteria</h3>
                    <p>Silakan coba ubah filter kategori atau kata kunci pencarian Anda.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(p => this.createProductCardHTML(p)).join('');
    },

    createProductCardHTML(p) {
        let badgeHtml = '';
        if (p.badge === 'FLASH SALE') {
            badgeHtml = `<span class="badge-tag badge-flash"><i class="fa-solid fa-bolt"></i> ${p.badge}</span>`;
        } else if (p.badge === 'BEST SELLER') {
            badgeHtml = `<span class="badge-tag badge-best"><i class="fa-solid fa-crown"></i> ${p.badge}</span>`;
        } else if (p.isPromo) {
            badgeHtml = `<span class="badge-tag badge-promo"><i class="fa-solid fa-tag"></i> PROMO</span>`;
        }

        const discountBadge = p.isPromo && p.discountPercent > 0 
            ? `<span class="badge-discount-percent">-${p.discountPercent}%</span>` 
            : '';

        const origPriceHtml = p.isPromo && p.originalPrice > p.price 
            ? `<div class="orig-price">${formatRupiah(p.originalPrice)}</div>` 
            : '';

        let stockLabel = `Stok: ${p.stock}`;
        let stockClass = '';
        if (p.stock <= 0) {
            stockLabel = 'Habis';
            stockClass = 'out';
        } else if (p.stock <= 10) {
            stockLabel = `Tersisa ${p.stock}`;
            stockClass = 'low';
        }

        return `
            <div class="product-card" data-id="${p.id}">
                <div class="product-card-top">
                    <img src="${p.image}" alt="${p.name}" class="product-card-img" onerror="this.src='https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'">
                    ${badgeHtml}
                    ${discountBadge}
                    <div class="quick-view-overlay">
                        <button class="btn-quick-view" onclick="StoreApp.openProductModal('${p.id}')">
                            <i class="fa-solid fa-eye"></i> Detail Produk
                        </button>
                    </div>
                </div>
                <div class="product-card-body">
                    <div class="product-category-row">
                        <span class="product-category-badge">${p.category}</span>
                        <div class="product-rating">
                            <i class="fa-solid fa-star"></i>
                            <span>${p.rating || '4.8'}</span>
                        </div>
                    </div>
                    <h3 class="product-card-title" title="${p.name}">${p.name}</h3>
                    <div class="product-unit-info">Ukuran/Kemasan: ${p.unit}</div>
                    <div class="product-card-price-row">
                        <div class="price-box">
                            ${origPriceHtml}
                            <div class="final-price">${formatRupiah(p.price)}</div>
                        </div>
                        <div class="stock-indicator ${stockClass}">${stockLabel}</div>
                    </div>
                    <div class="product-card-actions">
                        <button class="btn-add-cart" onclick="StoreApp.handleAddToCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-plus"></i> ${p.stock <= 0 ? 'Stok Habis' : '+ Keranjang'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ----------------------------------------------------
    // Navigation & Tabs
    // ----------------------------------------------------
    filterByCategory(categoryName) {
        this.currentCategory = categoryName;

        // Update active tab buttons in catalog
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-category') === categoryName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.renderCategoryTiles();
        this.renderProducts();

        // Switch to produk view
        this.switchView('produk');
        const catalogSec = document.getElementById('produk');
        if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
    },

    switchView(viewName) {
        // Views: 'beranda' | 'produk' | 'cari' | 'pesanan' | 'tentang'
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide/Show Sections
        const berandaSec = document.getElementById('berandaSection');
        const promoSec = document.getElementById('promoSection');
        const catSec = document.getElementById('categoriesSection');
        const produkSec = document.getElementById('produk');
        const cariSec = document.getElementById('cari');
        const pesananSec = document.getElementById('pesanan');
        const tentangSec = document.getElementById('tentang');

        if (viewName === 'beranda') {
            if (berandaSec) berandaSec.style.display = 'block';
            if (promoSec) promoSec.style.display = 'block';
            if (catSec) catSec.style.display = 'block';
            if (produkSec) produkSec.style.display = 'block';
            if (cariSec) cariSec.classList.remove('active');
            if (pesananSec) pesananSec.classList.remove('active');
            if (tentangSec) tentangSec.classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (viewName === 'produk') {
            if (berandaSec) berandaSec.style.display = 'none';
            if (promoSec) promoSec.style.display = 'none';
            if (catSec) catSec.style.display = 'block';
            if (produkSec) produkSec.style.display = 'block';
            if (cariSec) cariSec.classList.remove('active');
            if (pesananSec) pesananSec.classList.remove('active');
            if (tentangSec) tentangSec.classList.remove('active');
            if (produkSec) produkSec.scrollIntoView({ behavior: 'smooth' });
        } else if (viewName === 'cari') {
            if (berandaSec) berandaSec.style.display = 'none';
            if (promoSec) promoSec.style.display = 'none';
            if (catSec) catSec.style.display = 'none';
            if (produkSec) produkSec.style.display = 'none';
            if (cariSec) cariSec.classList.add('active');
            if (pesananSec) pesananSec.classList.remove('active');
            if (tentangSec) tentangSec.classList.remove('active');
            const searchInput = document.getElementById('mainSearchInput');
            if (searchInput) searchInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (viewName === 'pesanan') {
            if (berandaSec) berandaSec.style.display = 'none';
            if (promoSec) promoSec.style.display = 'none';
            if (catSec) catSec.style.display = 'none';
            if (produkSec) produkSec.style.display = 'none';
            if (cariSec) cariSec.classList.remove('active');
            if (pesananSec) pesananSec.classList.add('active');
            if (tentangSec) tentangSec.classList.remove('active');
            this.renderOrders();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (viewName === 'tentang') {
            if (berandaSec) berandaSec.style.display = 'none';
            if (promoSec) promoSec.style.display = 'none';
            if (catSec) catSec.style.display = 'none';
            if (produkSec) produkSec.style.display = 'none';
            if (cariSec) cariSec.classList.remove('active');
            if (pesananSec) pesananSec.classList.remove('active');
            if (tentangSec) tentangSec.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // ----------------------------------------------------
    // Product Quick View Modal
    // ----------------------------------------------------
    openProductModal(productId) {
        const product = DataService.getProductById(productId);
        if (!product) return;

        this.selectedProduct = product;
        const modal = document.getElementById('productDetailModal');
        const container = document.getElementById('productDetailContent');
        if (!modal || !container) return;

        const origPriceHtml = product.isPromo && product.originalPrice > product.price 
            ? `<span class="orig">${formatRupiah(product.originalPrice)}</span>` 
            : '';

        const featuresHtml = (product.features || []).map(f => `
            <li><i class="fa-solid fa-circle-check"></i> ${f}</li>
        `).join('');

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="detail-img-box">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'">
                </div>
                <div class="detail-info-box">
                    <span class="product-category-badge" style="font-size: 0.85rem;">${product.category} &bull; ${product.subCategory}</span>
                    <h2>${product.name}</h2>
                    <div class="product-rating" style="margin-bottom: 12px;">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 8px;">(${product.soldCount} terjual)</span>
                    </div>

                    <div class="detail-price-box">
                        <span class="curr">${formatRupiah(product.price)}</span>
                        ${origPriceHtml}
                        ${product.isPromo ? `<span class="badge-discount-percent" style="margin-left: 10px;">-${product.discountPercent}%</span>` : ''}
                    </div>

                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 14px;">
                        ${product.description}
                    </p>

                    <div style="background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Kemasan: <strong>${product.unit}</strong></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Ketersediaan: <strong style="color: ${product.stock > 0 ? '#34d399' : '#f87171'};">${product.stock > 0 ? `Tersedia (${product.stock} kaleng)` : 'Stok Kosong'}</strong></div>
                    </div>

                    <ul class="detail-features-list">
                        ${featuresHtml}
                    </ul>

                    <div style="display: flex; align-items: center; gap: 14px; margin-top: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-surface); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                            <button class="qty-btn" onclick="StoreApp.changeModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
                            <span id="modalQtyVal" class="qty-val" style="min-width: 30px;">1</span>
                            <button class="qty-btn" onclick="StoreApp.changeModalQty(1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <button class="btn-primary" style="flex: 1;" onclick="StoreApp.addToCartFromModal()" ${product.stock <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-plus"></i> Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    closeProductModal() {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.classList.remove('active');
        this.selectedProduct = null;
    },

    changeModalQty(delta) {
        const qtyEl = document.getElementById('modalQtyVal');
        if (!qtyEl || !this.selectedProduct) return;
        let cur = parseInt(qtyEl.innerText) || 1;
        cur += delta;
        if (cur < 1) cur = 1;
        if (cur > this.selectedProduct.stock) {
            this.showToast(`Maksimal pembelian ${this.selectedProduct.stock} unit!`, 'info');
            cur = this.selectedProduct.stock;
        }
        qtyEl.innerText = cur;
    },

    addToCartFromModal() {
        if (!this.selectedProduct) return;
        const qtyEl = document.getElementById('modalQtyVal');
        const qty = parseInt(qtyEl.innerText) || 1;
        const res = DataService.addToCart(this.selectedProduct.id, qty);
        if (res.success) {
            this.showToast(res.message, 'success');
            this.updateCartUI();
            this.closeProductModal();
        } else {
            this.showToast(res.message, 'error');
        }
    },

    // ----------------------------------------------------
    // Cart Drawer Management
    // ----------------------------------------------------
    handleAddToCart(productId) {
        const res = DataService.addToCart(productId, 1);
        if (res.success) {
            this.showToast(res.message, 'success');
            this.updateCartUI();
        } else {
            this.showToast(res.message, 'error');
        }
    },

    openCartDrawer() {
        const overlay = document.getElementById('cartDrawerOverlay');
        const drawer = document.getElementById('cartDrawer');
        if (overlay && drawer) {
            overlay.classList.add('active');
            drawer.classList.add('active');
        }
    },

    closeCartDrawer() {
        const overlay = document.getElementById('cartDrawerOverlay');
        const drawer = document.getElementById('cartDrawer');
        if (overlay && drawer) {
            overlay.classList.remove('active');
            drawer.classList.remove('active');
        }
    },

    updateCartUI() {
        const cart = DataService.getCart();
        const countElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

        countElements.forEach(el => el.innerText = totalItems);

        const container = document.getElementById('cartDrawerItems');
        const subtotalEl = document.getElementById('cartDrawerSubtotal');
        const totalEl = document.getElementById('cartDrawerTotal');

        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <h4>Keranjang Anda Masih Kosong</h4>
                    <p style="font-size: 0.85rem; margin-top: 6px;">Pilih cat mobil atau perlengkapan terbaik kami untuk memulai pesanan.</p>
                </div>
            `;
            if (subtotalEl) subtotalEl.innerText = formatRupiah(0);
            if (totalEl) totalEl.innerText = formatRupiah(0);
            return;
        }

        let subtotal = 0;
        container.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${formatRupiah(item.price)}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="StoreApp.changeCartQty('${item.productId}', -1)"><i class="fa-solid fa-minus"></i></button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="StoreApp.changeCartQty('${item.productId}', 1)"><i class="fa-solid fa-plus"></i></button>
                            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">${item.unit}</span>
                        </div>
                    </div>
                    <button class="btn-remove-item" onclick="StoreApp.removeCartItem('${item.productId}')" title="Hapus Item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join('');

        if (subtotalEl) subtotalEl.innerText = formatRupiah(subtotal);
        if (totalEl) totalEl.innerText = formatRupiah(subtotal);
    },

    changeCartQty(productId, delta) {
        const cart = DataService.getCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            DataService.updateCartQty(productId, item.qty + delta);
            this.updateCartUI();
        }
    },

    removeCartItem(productId) {
        DataService.removeFromCart(productId);
        this.updateCartUI();
        this.showToast('Item dihapus dari keranjang', 'info');
    },

    // ----------------------------------------------------
    // Checkout Modal & Pick Up / Delivery System
    // ----------------------------------------------------
    openCheckoutModal() {
        const cart = DataService.getCart();
        if (cart.length === 0) {
            this.showToast('Keranjang belanja Anda masih kosong!', 'error');
            return;
        }

        this.closeCartDrawer();
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        // Populate Pick Up Outlets
        const settings = DataService.getSettings();
        const outletSelect = document.getElementById('checkoutPickupOutlet');
        if (outletSelect) {
            outletSelect.innerHTML = settings.pickupOutlets.map(o => `
                <option value="${o.name}">${o.name} (${o.hours})</option>
            `).join('');
        }

        // Populate Delivery Options
        const deliverySelect = document.getElementById('checkoutDeliveryCourier');
        if (deliverySelect) {
            deliverySelect.innerHTML = settings.deliveryOptions.map(d => `
                <option value="${d.id}" data-fee="${d.fee}">${d.name} (+${formatRupiah(d.fee)}) - Est. ${d.est}</option>
            `).join('');
        }

        // Set default fulfillment to pickup
        this.setFulfillmentType('pickup');
        this.clearProofFile();
        this.handlePaymentMethodChange();
        this.updateCheckoutSummary();

        modal.classList.add('active');
    },

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.remove('active');
    },

    handlePaymentMethodChange() {
        const select = document.getElementById('checkoutPaymentMethod');
        const box = document.getElementById('checkoutPaymentInstructionBox');
        const proofSection = document.getElementById('checkoutProofUploadSection');
        if (!select || !box) return;

        const val = select.value;
        const cart = DataService.getCart();
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        let shippingFee = 0;
        if (this.selectedFulfillment === 'delivery') {
            const courierEl = document.getElementById('checkoutDeliveryCourier');
            if (courierEl) {
                const opt = courierEl.options[courierEl.selectedIndex];
                shippingFee = parseInt(opt?.getAttribute('data-fee')) || 25000;
            }
        }
        const discount = this.appliedVoucher ? this.appliedVoucher.discount : 0;
        const grandTotal = Math.max(0, subtotal + shippingFee - discount);

        if (val.includes('QRIS')) {
            box.style.display = 'block';
            if (proofSection) proofSection.style.display = 'block';
            box.innerHTML = `
                <div class="pay-instruction-card">
                    <div class="pay-instruction-header">
                        <h5><i class="fa-solid fa-qrcode" style="color: #38bdf8;"></i> QRIS Instant (Semua Bank & E-Wallet)</h5>
                        <span style="font-size: 0.72rem; color: #34d399; font-weight: 700; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px;">NMID: ID1020349882348</span>
                    </div>
                    <div class="qris-preview-block">
                        <div class="qris-qr-box">
                            <i class="fa-solid fa-qrcode"></i>
                            <span style="font-size: 0.55rem; font-weight: 800; color: #be123c; margin-top: 2px;">QRIS RESMI</span>
                        </div>
                        <div class="qris-info-col">
                            <h5>AUTOGLOSS PAINT HUB</h5>
                            <p>Buka m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (Gopay, OVO, ShopeePay, Dana). Scan kode QRIS atau transfer sejumlah total tagihan: <strong style="color: #fb7185;">${formatRupiah(grandTotal)}</strong>.</p>
                        </div>
                    </div>
                    <div class="pay-note-alert">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span><strong>Wajib Konfirmasi Admin:</strong> Pembayaran Anda harus diverifikasi oleh Admin toko terlebih dahulu agar pembayarannya berhasil masuk ke sistem sebelum pesanan disiapkan.</span>
                    </div>
                </div>
            `;
        } else if (val.includes('BCA')) {
            box.style.display = 'block';
            if (proofSection) proofSection.style.display = 'block';
            box.innerHTML = `
                <div class="pay-instruction-card">
                    <div class="pay-instruction-header">
                        <h5><i class="fa-solid fa-building-columns" style="color: #60a5fa;"></i> Rekening Bank Central Asia (BCA)</h5>
                    </div>
                    <div class="bank-rek-box">
                        <div>
                            <div class="bank-rek-num">8820-9988-11</div>
                            <div class="bank-rek-name">a/n PT AUTOGLOSS PAINT HUB INDONESIA</div>
                        </div>
                        <button type="button" class="btn-copy-rek" onclick="StoreApp.copyToClipboard('8820998811', 'No. Rekening BCA')">
                            <i class="fa-solid fa-copy"></i> Salin Rekening
                        </button>
                    </div>
                    <div class="pay-note-alert">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>Transfer nominal pas <strong>${formatRupiah(grandTotal)}</strong>. Admin toko akan mengecek mutasi rekening untuk mengonfirmasi pembayaran Anda.</span>
                    </div>
                </div>
            `;
        } else if (val.includes('Mandiri')) {
            box.style.display = 'block';
            if (proofSection) proofSection.style.display = 'block';
            box.innerHTML = `
                <div class="pay-instruction-card">
                    <div class="pay-instruction-header">
                        <h5><i class="fa-solid fa-building-columns" style="color: #fbbf24;"></i> Rekening Bank Mandiri</h5>
                    </div>
                    <div class="bank-rek-box">
                        <div>
                            <div class="bank-rek-num">124-00-998877-0</div>
                            <div class="bank-rek-name">a/n PT AUTOGLOSS PAINT HUB INDONESIA</div>
                        </div>
                        <button type="button" class="btn-copy-rek" onclick="StoreApp.copyToClipboard('124009988770', 'No. Rekening Mandiri')">
                            <i class="fa-solid fa-copy"></i> Salin Rekening
                        </button>
                    </div>
                    <div class="pay-note-alert">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>Transfer nominal pas <strong>${formatRupiah(grandTotal)}</strong>. Admin toko akan mengecek mutasi rekening untuk mengonfirmasi pembayaran Anda.</span>
                    </div>
                </div>
            `;
        } else if (val.includes('Kasir')) {
            box.style.display = 'block';
            if (proofSection) proofSection.style.display = 'none';
            box.innerHTML = `
                <div class="pay-instruction-card">
                    <h5><i class="fa-solid fa-store" style="color: #34d399;"></i> Pembayaran di Kasir Outlet</h5>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
                        Lakukan pelunasan tunai / debit langsung kepada kasir outlet saat pengambilan cat. Tunjukkan kode pesanan pada nota digital.
                    </p>
                </div>
            `;
        } else if (val.includes('COD')) {
            box.style.display = 'block';
            if (proofSection) proofSection.style.display = 'none';
            box.innerHTML = `
                <div class="pay-instruction-card">
                    <h5><i class="fa-solid fa-hand-holding-dollar" style="color: #60a5fa;"></i> Cash on Delivery (COD)</h5>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
                        Siapkan uang pas sejumlah <strong>${formatRupiah(grandTotal)}</strong> untuk diserahkan langsung kepada kurir / supir truk toko saat pesanan tiba di lokasi Anda.
                    </p>
                </div>
            `;
        } else {
            box.style.display = 'none';
            if (proofSection) proofSection.style.display = 'block';
        }
    },

    copyToClipboard(text, label) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast(`${label} disalin ke clipboard!`, 'success');
            }).catch(() => {
                this.showToast(`${label}: ${text}`, 'info');
            });
        } else {
            this.showToast(`${label}: ${text}`, 'info');
        }
    },

    handleProofFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Ukuran foto maksimal 5 MB!', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.tempProofFile = e.target.result;
            const labelText = document.getElementById('proofFileLabelText');
            const clearBtn = document.getElementById('btnClearProof');
            const previewBox = document.getElementById('proofPreviewContainer');
            const previewImg = document.getElementById('proofPreviewImg');

            if (labelText) labelText.innerText = file.name.length > 20 ? file.name.substring(0, 18) + '...' : file.name;
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (previewBox && previewImg) {
                previewImg.src = e.target.result;
                previewBox.style.display = 'block';
            }
            this.showToast('Foto bukti pembayaran dipilih.', 'info');
        };
        reader.readAsDataURL(file);
    },

    clearProofFile() {
        this.tempProofFile = null;
        const input = document.getElementById('checkoutPaymentProof');
        const labelText = document.getElementById('proofFileLabelText');
        const clearBtn = document.getElementById('btnClearProof');
        const previewBox = document.getElementById('proofPreviewContainer');

        if (input) input.value = '';
        if (labelText) labelText.innerText = 'Pilih Foto / Struk Bukti Bayar';
        if (clearBtn) clearBtn.style.display = 'none';
        if (previewBox) previewBox.style.display = 'none';
    },

    setFulfillmentType(type) {
        this.selectedFulfillment = type;
        const btnPickup = document.getElementById('btnFulfillPickup');
        const btnDelivery = document.getElementById('btnFulfillDelivery');
        const pickupForm = document.getElementById('pickupFieldsGroup');
        const deliveryForm = document.getElementById('deliveryFieldsGroup');

        if (type === 'pickup') {
            if (btnPickup) btnPickup.classList.add('active');
            if (btnDelivery) btnDelivery.classList.remove('active');
            if (pickupForm) pickupForm.style.display = 'block';
            if (deliveryForm) deliveryForm.style.display = 'none';
        } else {
            if (btnPickup) btnPickup.classList.remove('active');
            if (btnDelivery) btnDelivery.classList.add('active');
            if (pickupForm) pickupForm.style.display = 'none';
            if (deliveryForm) deliveryForm.style.display = 'block';
        }

        this.updateCheckoutSummary();
    },

    applyPromoVoucher() {
        const input = document.getElementById('checkoutVoucherInput');
        if (!input) return;
        const code = input.value.trim().toUpperCase();
        if (!code) return;

        const settings = DataService.getSettings();
        const cart = DataService.getCart();
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        const voucher = settings.promoVouchers.find(v => v.code === code);
        if (!voucher) {
            this.showToast('Kode promo tidak valid atau telah kadaluarsa!', 'error');
            return;
        }

        if (subtotal < voucher.minSpend) {
            this.showToast(`Minimal belanja untuk promo ini adalah ${formatRupiah(voucher.minSpend)}`, 'info');
            return;
        }

        this.appliedVoucher = voucher;
        this.showToast(`Voucher berhasil digunakan! Hemat ${formatRupiah(voucher.discount)}`, 'success');
        this.updateCheckoutSummary();
    },

    updateCheckoutSummary() {
        const cart = DataService.getCart();
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

        let shippingFee = 0;
        if (this.selectedFulfillment === 'delivery') {
            const deliverySelect = document.getElementById('checkoutDeliveryCourier');
            if (deliverySelect) {
                const selectedOpt = deliverySelect.options[deliverySelect.selectedIndex];
                shippingFee = parseInt(selectedOpt.getAttribute('data-fee')) || 25000;
            }
        }

        let discount = 0;
        if (this.appliedVoucher) {
            discount = this.appliedVoucher.discount;
        }

        const grandTotal = Math.max(0, subtotal + shippingFee - discount);

        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryShipping = document.getElementById('summaryShipping');
        const summaryDiscountRow = document.getElementById('summaryDiscountRow');
        const summaryDiscount = document.getElementById('summaryDiscount');
        const summaryGrandTotal = document.getElementById('summaryGrandTotal');

        if (summarySubtotal) summarySubtotal.innerText = formatRupiah(subtotal);
        if (summaryShipping) {
            summaryShipping.innerText = this.selectedFulfillment === 'pickup' 
                ? 'Rp 0 (GRATIS PICK UP)' 
                : formatRupiah(shippingFee);
        }

        if (summaryDiscountRow && summaryDiscount) {
            if (discount > 0) {
                summaryDiscountRow.style.display = 'flex';
                summaryDiscount.innerText = `-${formatRupiah(discount)}`;
            } else {
                summaryDiscountRow.style.display = 'none';
            }
        }

        if (summaryGrandTotal) summaryGrandTotal.innerText = formatRupiah(grandTotal);
    },

    processOrder() {
        const cart = DataService.getCart();
        if (cart.length === 0) return;

        const nameInput = document.getElementById('checkoutCustomerName');
        const phoneInput = document.getElementById('checkoutCustomerPhone');
        const emailInput = document.getElementById('checkoutCustomerEmail');
        const paymentInput = document.getElementById('checkoutPaymentMethod');
        const notesInput = document.getElementById('checkoutNotes');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const paymentMethod = paymentInput ? paymentInput.value : 'Transfer BCA';
        const notes = notesInput ? notesInput.value.trim() : '';

        if (!name || !phone) {
            this.showToast('Mohon lengkapi Nama dan No. WhatsApp Anda!', 'error');
            return;
        }

        let pickupLocation = '';
        let pickupDateTime = '';
        let deliveryAddress = '';
        let deliveryCourier = '';
        let shippingFee = 0;

        if (this.selectedFulfillment === 'pickup') {
            const outletEl = document.getElementById('checkoutPickupOutlet');
            const dateEl = document.getElementById('checkoutPickupDate');
            const timeEl = document.getElementById('checkoutPickupTime');

            pickupLocation = outletEl ? outletEl.value : 'Outlet Pusat';
            const dateVal = dateEl ? dateEl.value : new Date().toISOString().split('T')[0];
            const timeVal = timeEl ? timeEl.value : '14:00';
            pickupDateTime = `${dateVal} pukul ${timeVal} WIB`;
        } else {
            const addrEl = document.getElementById('checkoutDeliveryAddress');
            const courierEl = document.getElementById('checkoutDeliveryCourier');

            deliveryAddress = addrEl ? addrEl.value.trim() : '';
            if (!deliveryAddress) {
                this.showToast('Mohon isi alamat lengkap pengiriman cat!', 'error');
                return;
            }
            if (courierEl) {
                const opt = courierEl.options[courierEl.selectedIndex];
                deliveryCourier = opt.innerText;
                shippingFee = parseInt(opt.getAttribute('data-fee')) || 25000;
            }
        }

        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const discount = this.appliedVoucher ? this.appliedVoucher.discount : 0;
        const grandTotal = Math.max(0, subtotal + shippingFee - discount);

        const orderId = 'ORD-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(100 + Math.random() * 900);

        const newOrder = {
            orderId: orderId,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            fulfillmentType: this.selectedFulfillment,
            pickupLocation: pickupLocation,
            pickupDateTime: pickupDateTime,
            deliveryAddress: deliveryAddress,
            deliveryCourier: deliveryCourier,
            shippingFee: shippingFee,
        let paymentStatus = 'Menunggu Konfirmasi Admin';
        let orderStatus = 'Pending';

        if (paymentMethod.includes('Kasir')) {
            paymentStatus = 'Bayar di Kasir (Belum Lunas)';
            orderStatus = 'Pending';
        } else if (paymentMethod.includes('COD')) {
            paymentStatus = 'COD (Bayar ke Kurir)';
            orderStatus = 'Diproses';
        } else {
            paymentStatus = 'Menunggu Konfirmasi Admin';
            orderStatus = 'Pending';
        }

        const newOrder = {
            orderId: orderId,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            fulfillmentType: this.selectedFulfillment,
            pickupLocation: pickupLocation,
            pickupDateTime: pickupDateTime,
            deliveryAddress: deliveryAddress,
            deliveryCourier: deliveryCourier,
            shippingFee: shippingFee,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            orderStatus: orderStatus,
            paymentProof: this.tempProofFile || null,
            paymentProofUploadedAt: this.tempProofFile ? new Date().toLocaleString('id-ID') : null,
            paymentConfirmedAt: null,
            items: cart.map(i => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                total: i.price * i.qty
            })),
            subtotal: subtotal,
            discount: discount,
            grandTotal: grandTotal,
            createdAt: new Date().toLocaleString('id-ID'),
            notes: notes
        };

        // Save order and deduct stock
        DataService.addOrder(newOrder);
        DataService.clearCart();
        this.appliedVoucher = null;
        this.tempProofFile = null;
        this.clearProofFile();

        // Close Checkout & Refresh UI
        this.closeCheckoutModal();
        this.updateCartUI();
        this.renderProducts(); // stock updated!
        this.renderFlashSale();

        this.showToast('Pesanan berhasil dibuat! Menunggu konfirmasi pembayaran oleh Admin.', 'success');

        // Open Printable Invoice Receipt
        this.openInvoiceModal(orderId);
    },

    // ----------------------------------------------------
    // Invoice & Receipt Modal
    // ----------------------------------------------------
    openInvoiceModal(orderId) {
        const orders = DataService.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return;

        const modal = document.getElementById('invoiceModal');
        const container = document.getElementById('invoicePaperContent');
        if (!modal || !container) return;

        const isPickup = order.fulfillmentType === 'pickup';
        const isPaid = order.paymentStatus === 'Lunas' || order.paymentStatus === 'Sudah Bayar';
        const isRejected = order.paymentStatus?.includes('Ditolak') || order.paymentStatus?.includes('Belum Masuk');
        const isPendingVerify = !isPaid && !isRejected;

        let statusPillHtml = '';
        if (isPaid) {
            statusPillHtml = `<span class="invoice-status-pill status-success"><i class="fa-solid fa-circle-check"></i> Status: ${order.orderStatus} (Lunas)</span>`;
        } else if (isRejected) {
            statusPillHtml = `<span class="invoice-status-pill status-danger"><i class="fa-solid fa-circle-xmark"></i> Status: Pembayaran Belum Masuk / Ditolak</span>`;
        } else {
            statusPillHtml = `<span class="invoice-status-pill status-pending"><i class="fa-solid fa-hourglass-half"></i> Status: Menunggu Konfirmasi Admin</span>`;
        }

        let paymentLabelHtml = '';
        if (isPaid) {
            paymentLabelHtml = `${order.paymentMethod}<br><span class="badge-inline-success"><i class="fa-solid fa-circle-check"></i> Pembayaran Lunas (Diverifikasi Admin)</span>`;
        } else if (isRejected) {
            paymentLabelHtml = `${order.paymentMethod}<br><span class="badge-inline-danger"><i class="fa-solid fa-circle-xmark"></i> Pembayaran Belum Masuk / Ditolak</span>`;
        } else {
            paymentLabelHtml = `${order.paymentMethod}<br><span class="badge-inline-pending"><i class="fa-solid fa-clock"></i> Menunggu Konfirmasi Admin</span>`;
        }

        const waConfirmText = encodeURIComponent(`Halo Admin AutoGloss Hub, saya ingin konfirmasi pembayaran untuk pesanan:
- No. Pesanan: ${order.orderId}
- Nama Pemesan: ${order.customerName}
- Total Tagihan: ${formatRupiah(order.grandTotal)}
- Metode Pembayaran: ${order.paymentMethod}

Mohon bantuannya untuk diverifikasi mutasi rekening / QRIS agar pembayarannya berhasil masuk dan pesanan dapat segera diproses. Terima kasih!`);
        const waLink = `https://wa.me/6281288997700?text=${waConfirmText}`;

        let verificationBannerHtml = '';
        if (isPendingVerify) {
            verificationBannerHtml = `
                <div class="invoice-verification-banner alert-pending">
                    <div class="banner-top">
                        <i class="fa-solid fa-hourglass-half"></i>
                        <div>
                            <strong>Menunggu Konfirmasi Pembayaran oleh Admin</strong>
                            <p>Pesanan Anda telah tercatat di sistem AutoGloss. Pembayaran harus dicek & diverifikasi oleh Admin toko terlebih dahulu agar pembayarannya berhasil masuk sebelum pesanan dapat disiapkan & diproses.</p>
                        </div>
                    </div>
                    <div class="banner-actions">
                        <a href="${waLink}" target="_blank" class="btn-wa-confirm-invoice">
                            <i class="fa-brands fa-whatsapp"></i> Konfirmasi ke Admin via WhatsApp
                        </a>
                        ${order.paymentProof ? `
                        <button type="button" class="btn-proof-preview-invoice" onclick="StoreApp.openProofPreviewModal('${order.orderId}')">
                            <i class="fa-solid fa-image"></i> Pratinjau Bukti Bayar Terlampir
                        </button>
                        ` : `
                        <button type="button" class="btn-proof-upload-invoice" onclick="StoreApp.openUploadProofModal('${order.orderId}')">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Unggah Bukti Bayar
                        </button>
                        `}
                    </div>
                </div>
            `;
        } else if (isPaid) {
            verificationBannerHtml = `
                <div class="invoice-verification-banner alert-success">
                    <i class="fa-solid fa-circle-check"></i>
                    <div>
                        <strong>Pembayaran Telah Dikonfirmasi Berhasil Masuk!</strong>
                        <p>Admin toko telah memverifikasi pembayaran Anda${order.paymentConfirmedAt ? ' pada ' + order.paymentConfirmedAt : ''}. Pesanan Anda sekarang sedang diproses & disiapkan oleh tim AutoGloss.</p>
                    </div>
                </div>
            `;
        } else if (isRejected) {
            verificationBannerHtml = `
                <div class="invoice-verification-banner alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div>
                        <strong>Pembayaran Belum Ditemukan Masuk oleh Admin</strong>
                        <p>Admin belum mendeteksi mutasi dana untuk pesanan ini. Silakan hubungi admin toko via WhatsApp untuk konfirmasi atau kirimkan bukti transfer yang valid.</p>
                        <a href="${waLink}" target="_blank" class="btn-wa-confirm-invoice" style="margin-top: 8px;">
                            <i class="fa-brands fa-whatsapp"></i> Hubungi Admin WhatsApp
                        </a>
                    </div>
                </div>
            `;
        }

        const fulfillmentInfo = isPickup ? `
            <div>
                <strong>Metode Pemenuhan:</strong> AMBIL DI TOKO (PICK UP)<br>
                <strong>Cabang Pengambilan:</strong> ${order.pickupLocation}<br>
                <strong>Jadwal Ambil:</strong> ${order.pickupDateTime}
            </div>
        ` : `
            <div>
                <strong>Metode Pemenuhan:</strong> PENGANTARAN (DELIVERY)<br>
                <strong>Alamat Kirim:</strong> ${order.deliveryAddress}<br>
                <strong>Kurir Pengiriman:</strong> ${order.deliveryCourier}
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

        container.innerHTML = `
            <div class="invoice-paper" id="invoicePrintArea">
                <div class="invoice-header">
                    <div class="invoice-logo">
                        <h2>AUTOGLOSS & COATING HUB</h2>
                        <p>Pusat Cat Mobil & Bangunan Profesional</p>
                        <p>Jl. Raya Industri Otomotif No. 88, Jakarta | WA: 0812-8899-7700</p>
                    </div>
                    <div class="invoice-meta">
                        <strong>NOTA PESANAN RESMI</strong><br>
                        <span>No: ${order.orderId}</span><br>
                        <span>Tgl: ${order.createdAt}</span><br>
                        ${statusPillHtml}
                    </div>
                </div>

                <div class="invoice-details-grid">
                    <div>
                        <strong>Data Pelanggan:</strong><br>
                        ${order.customerName}<br>
                        Telp/WA: ${order.customerPhone}<br>
                        Email: ${order.customerEmail || '-'}<br>
                        Pembayaran: ${paymentLabelHtml}
                    </div>
                    ${fulfillmentInfo}
                </div>

                <!-- Alert Konfirmasi Pembayaran Admin -->
                ${verificationBannerHtml}

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Deskripsi Produk / Item</th>
                            <th style="width: 60px;">Qty</th>
                            <th class="text-right" style="width: 120px;">Harga Satuan</th>
                            <th class="text-right" style="width: 130px;">Total</th>
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
                        <span>Ongkos Kirim:</span>
                        <span>${order.shippingFee === 0 ? 'Rp 0 (GRATIS)' : formatRupiah(order.shippingFee)}</span>
                    </div>
                    ${order.discount > 0 ? `
                    <div class="line" style="color: #16a34a;">
                        <span>Diskon Promo:</span>
                        <span>-${formatRupiah(order.discount)}</span>
                    </div>
                    ` : ''}
                    <div class="line grand">
                        <span>TOTAL BAYAR:</span>
                        <span>${formatRupiah(order.grandTotal)}</span>
                    </div>
                </div>

                ${isPickup ? `
                <div class="invoice-barcode-box">
                    <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">TUNJUKKAN KODE INI KEPADA KASIR / PETUGAS PICK UP SAAT PENGAMBILAN CAT:</div>
                    <div class="pickup-code-badge">${order.orderId.slice(-6)}</div>
                </div>
                ` : `
                <div class="invoice-barcode-box">
                    <div style="font-size: 0.8rem; color: #64748b;">Paket cat Anda sedang disiapkan dan akan diantar sesuai jadwal. Simpan bukti ini untuk pengecekan kurir.</div>
                </div>
                `}

                <div style="margin-top: 24px; font-size: 0.75rem; color: #94a3b8; text-align: center;">
                    Terima kasih telah berbelanja di AutoGloss Paint Hub. Layanan konsultasi warna dan oplos cat via WhatsApp 0812-8899-7700.
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    closeInvoiceModal() {
        const modal = document.getElementById('invoiceModal');
        if (modal) modal.classList.remove('active');
    },

    openUploadProofModal(orderId) {
        const modal = document.getElementById('uploadProofModal');
        const idInput = document.getElementById('uploadProofOrderId');
        const label = document.getElementById('uploadProofOrderLabel');
        const fileInput = document.getElementById('modalProofFileInput');
        const previewBox = document.getElementById('modalProofPreviewBox');

        if (!modal) return;
        if (idInput) idInput.value = orderId;
        if (label) label.innerText = orderId;
        if (fileInput) fileInput.value = '';
        if (previewBox) previewBox.style.display = 'none';
        this.tempModalProofFile = null;

        modal.classList.add('active');
    },

    closeUploadProofModal() {
        const modal = document.getElementById('uploadProofModal');
        if (modal) modal.classList.remove('active');
        this.tempModalProofFile = null;
    },

    handleModalProofFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Ukuran foto maksimal 5 MB!', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.tempModalProofFile = e.target.result;
            const previewBox = document.getElementById('modalProofPreviewBox');
            const previewImg = document.getElementById('modalProofPreviewImg');
            if (previewBox && previewImg) {
                previewImg.src = e.target.result;
                previewBox.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    },

    submitUploadedProof() {
        const idInput = document.getElementById('uploadProofOrderId');
        const orderId = idInput ? idInput.value : '';
        if (!orderId) return;

        if (!this.tempModalProofFile) {
            this.showToast('Pilih foto bukti pembayaran terlebih dahulu!', 'error');
            return;
        }

        DataService.updateOrderPaymentProof(orderId, this.tempModalProofFile);
        this.closeUploadProofModal();
        this.showToast('Bukti pembayaran berhasil disimpan! Admin akan segera memverifikasi mutasi.', 'success');

        // Re-open invoice if active or refresh orders
        const invoiceModal = document.getElementById('invoiceModal');
        if (invoiceModal && invoiceModal.classList.contains('active')) {
            this.openInvoiceModal(orderId);
        }
        const trackingInput = document.getElementById('orderTrackingSearchInput');
        this.renderOrders(trackingInput ? trackingInput.value : '');
    },

    openProofPreviewModal(orderId) {
        const orders = DataService.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order || !order.paymentProof) {
            this.showToast('Belum ada foto bukti pembayaran untuk pesanan ini.', 'info');
            return;
        }

        const modal = document.getElementById('proofViewModal');
        const container = document.getElementById('proofViewModalContent');
        if (!modal || !container) return;

        container.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                Bukti transfer untuk pesanan <strong style="color: #fff;">${order.orderId}</strong> (${order.paymentMethod})
                ${order.paymentProofUploadedAt ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Diupload: ${order.paymentProofUploadedAt}</div>` : ''}
            </div>
            <img src="${order.paymentProof}" alt="Bukti Transfer" style="max-width: 100%; max-height: 420px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: contain;">
        `;
        modal.classList.add('active');
    },

    closeProofViewModal() {
        const modal = document.getElementById('proofViewModal');
        if (modal) modal.classList.remove('active');
    },

    printCurrentInvoice() {
        window.print();
    },

    // ----------------------------------------------------
    // Orders / Tracking Section
    // ----------------------------------------------------
    renderOrders(searchQuery = '') {
        const container = document.getElementById('ordersListContainer');
        if (!container) return;

        let orders = DataService.getOrders();

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            orders = orders.filter(o => 
                o.orderId.toLowerCase().includes(q) || 
                o.customerPhone.includes(q) || 
                o.customerName.toLowerCase().includes(q)
            );
        }

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
                    <i class="fa-solid fa-receipt" style="font-size: 3rem; margin-bottom: 12px; color: rgba(255,255,255,0.1);"></i>
                    <h3 style="color: #fff; margin-bottom: 6px;">Tidak Ditemukan Pesanan</h3>
                    <p>Belum ada riwayat pesanan dengan kata kunci tersebut. Coba cari dengan nomor pesanan atau nomor HP Anda.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(o => {
            const isPickup = o.fulfillmentType === 'pickup';
            const isPaid = o.paymentStatus === 'Lunas' || o.paymentStatus === 'Sudah Bayar';
            const isPendingAdmin = o.paymentStatus === 'Menunggu Konfirmasi Admin' || (o.orderStatus === 'Pending' && !isPaid);

            const fulfillmentBadge = isPickup 
                ? `<span class="fulfillment-badge fulfillment-pickup"><i class="fa-solid fa-store"></i> AMBIL DI TOKO (PICK UP)</span>`
                : `<span class="fulfillment-badge fulfillment-delivery"><i class="fa-solid fa-truck-fast"></i> PENGANTARAN (DELIVERY)</span>`;

            let statusClass = 'status-pending';
            let statusLabel = o.orderStatus;
            if (isPendingAdmin) {
                statusClass = 'status-pending';
                statusLabel = 'Menunggu Konfirmasi Admin';
            } else if (o.orderStatus === 'Diproses') {
                statusClass = 'status-processing';
            } else if (o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim')) {
                statusClass = 'status-ready';
            } else if (o.orderStatus === 'Selesai') {
                statusClass = 'status-completed';
            } else if (o.orderStatus === 'Dibatalkan') {
                statusClass = 'status-cancelled';
            }

            // Timeline states
            const steps = [
                { key: 'Pending', label: 'Menunggu Konfirmasi Admin' },
                { key: 'Diproses', label: 'Sedang Disiapkan / Oplos' },
                { key: 'Siap', label: isPickup ? 'Siap Diambil di Toko' : 'Dalam Pengantaran' },
                { key: 'Selesai', label: 'Selesai' }
            ];

            let stepIdx = 0;
            if (o.orderStatus === 'Diproses') stepIdx = 1;
            else if (o.orderStatus.includes('Siap') || o.orderStatus.includes('Dikirim')) stepIdx = 2;
            else if (o.orderStatus === 'Selesai') stepIdx = 3;
            else if (o.orderStatus === 'Dibatalkan') stepIdx = -1;

            const timelineHtml = steps.map((s, idx) => {
                let cls = '';
                if (idx < stepIdx) cls = 'completed';
                else if (idx === stepIdx) cls = 'current';
                return `
                    <div class="timeline-step ${cls}">
                        <div class="step-circle"><i class="fa-solid ${idx <= stepIdx ? 'fa-check' : 'fa-clock'}"></i></div>
                        <span class="step-label">${s.label}</span>
                    </div>
                `;
            }).join('');

            const itemsRows = o.items.map(it => `
                <div class="order-item-row">
                    <span>${it.name} <strong>x${it.qty}</strong></span>
                    <span>${formatRupiah(it.total)}</span>
                </div>
            `).join('');

            const locationInfo = isPickup 
                ? `<span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> Ambil di: <strong>${o.pickupLocation}</strong> (${o.pickupDateTime})</span>`
                : `<span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-map-pin"></i> Dikirim ke: <strong>${o.deliveryAddress}</strong> via ${o.deliveryCourier}</span>`;

            const waTrackMsg = encodeURIComponent(`Halo Admin AutoGloss, saya ingin konfirmasi pesanan:
- No. Pesanan: ${o.orderId}
- Nama: ${o.customerName}
- Total Tagihan: ${formatRupiah(o.grandTotal)}
- Metode: ${o.paymentMethod}
Mohon dicek mutasi rekening / QRIS agar pembayarannya berhasil masuk dan pesanan segera disiapkan. Terima kasih!`);
            const waTrackLink = `https://wa.me/6281288997700?text=${waTrackMsg}`;

            return `
                <div class="order-card">
                    <div class="order-card-header">
                        <div class="order-meta-info">
                            <h3>
                                <span>${o.orderId}</span>
                                ${fulfillmentBadge}
                            </h3>
                            <div class="order-date"><i class="fa-regular fa-calendar"></i> ${o.createdAt} &bull; Pemesan: ${o.customerName} (${o.customerPhone})</div>
                        </div>
                        <div class="status-badge ${statusClass}">
                            <i class="fa-solid fa-circle-dot"></i> ${statusLabel}
                        </div>
                    </div>

                    <!-- Visual Timeline Tracker -->
                    <div class="order-timeline">
                        ${timelineHtml}
                    </div>

                    <div style="margin-bottom: 12px;">
                        ${locationInfo}
                    </div>

                    <div class="order-items-list">
                        ${itemsRows}
                    </div>

                    <div class="order-card-footer">
                        <div class="order-total-block">
                            <span>Total Pembayaran:</span>
                            <strong>${formatRupiah(o.grandTotal)}</strong>
                            <span class="tracking-pay-tag ${isPaid ? 'paid' : (o.paymentStatus?.includes('Ditolak') ? 'danger' : 'pending')}">
                                ${o.paymentMethod} &bull; ${o.paymentStatus}
                            </span>
                        </div>
                        <div class="tracking-actions">
                            ${isPendingAdmin ? `
                            <a href="${waTrackLink}" target="_blank" class="btn-wa-sm">
                                <i class="fa-brands fa-whatsapp"></i> Konfirmasi WA Admin
                            </a>
                            ${o.paymentProof ? `
                            <button class="btn-invoice" onclick="StoreApp.openProofPreviewModal('${o.orderId}')">
                                <i class="fa-solid fa-image"></i> Lihat Bukti
                            </button>
                            ` : `
                            <button class="btn-invoice" onclick="StoreApp.openUploadProofModal('${o.orderId}')">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Unggah Bukti
                            </button>
                            `}
                            ` : ''}
                            <button class="btn-invoice" onclick="StoreApp.openInvoiceModal('${o.orderId}')">
                                <i class="fa-solid fa-receipt"></i> Cetak / Lihat Nota Digital
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    searchOrders() {
        const input = document.getElementById('orderTrackingSearchInput');
        if (!input) return;
        this.renderOrders(input.value);
    },

    // ----------------------------------------------------
    // Branches in About Section
    // ----------------------------------------------------
    renderBranches() {
        const container = document.getElementById('branchesListGrid');
        if (!container) return;
        const settings = DataService.getSettings();

        container.innerHTML = settings.pickupOutlets.map(b => `
            <div class="branch-card">
                <h4><i class="fa-solid fa-warehouse" style="color: var(--primary); margin-right: 6px;"></i> ${b.name}</h4>
                <p><i class="fa-regular fa-clock"></i> Jam Operasional: ${b.hours}</p>
                <span class="branch-badge"><i class="fa-solid fa-check"></i> Tersedia Layanan Free Pick Up</span>
            </div>
        `).join('');
    },

    // ----------------------------------------------------
    // Promo Countdown Timer
    // ----------------------------------------------------
    startPromoCountdown() {
        // Countdown from 5 hours
        let durationSeconds = 5 * 3600 + 42 * 60 + 15;
        const hourEl = document.getElementById('cdHours');
        const minEl = document.getElementById('cdMinutes');
        const secEl = document.getElementById('cdSeconds');

        if (!hourEl || !minEl || !secEl) return;

        setInterval(() => {
            if (durationSeconds > 0) {
                durationSeconds--;
                const h = Math.floor(durationSeconds / 3600);
                const m = Math.floor((durationSeconds % 3600) / 60);
                const s = durationSeconds % 60;

                hourEl.innerText = h < 10 ? '0' + h : h;
                minEl.innerText = m < 10 ? '0' + m : m;
                secEl.innerText = s < 10 ? '0' + s : s;
            }
        }, 1000);
    },

    // ----------------------------------------------------
    // Toast Alerts
    // ----------------------------------------------------
    showToast(message, type = 'info') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    },

    // ----------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                if (target) StoreApp.switchView(target);
            });
        });

        // Category Tab buttons in Catalog
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-category');
                StoreApp.currentCategory = cat;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                StoreApp.renderCategoryTiles();
                StoreApp.renderProducts();
            });
        });

        // Promo Toggle in Catalog
        const promoToggle = document.getElementById('catalogPromoToggle');
        if (promoToggle) {
            promoToggle.addEventListener('change', (e) => {
                StoreApp.onlyPromo = e.target.checked;
                StoreApp.renderProducts();
            });
        }

        // Sort By in Catalog
        const sortSelect = document.getElementById('catalogSortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                StoreApp.sortBy = e.target.value;
                StoreApp.renderProducts();
            });
        }

        // Main Live Search
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                StoreApp.searchQuery = e.target.value;
                StoreApp.renderProducts();
            });
        }

        // Search trigger button in header
        const btnHeaderSearch = document.getElementById('btnHeaderSearch');
        if (btnHeaderSearch) {
            btnHeaderSearch.addEventListener('click', () => {
                StoreApp.switchView('cari');
            });
        }
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    StoreApp.init();
});
