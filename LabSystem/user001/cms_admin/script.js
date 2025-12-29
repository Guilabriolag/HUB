// --- ESTADO INICIAL ---
let lsData = {
    user: 'user001',
    config: { storeName: '', whatsapp: '', status: 'aberto', address: '', pix: '', bank: '', btc: '' },
    delivery: [],
    categories: ['Sistemas', 'Geral'],
    products: [
        { id: 1, name: 'LabSystem CMS', cat: 'Sistemas', price: 280, stock: 25 },
        { id: 2, name: 'Cardápio Online', cat: 'Sistemas', price: 249, stock: 100 }
    ],
    design: {
        primary: '#1f298f',
        secondary: '#ffcf69',
        bg: '#f9f9f9',
        bgImage: '',
        logo: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7T-L3I1t95j33Pu9cdst8hHJShqSHsjSu09-kpkNNWxkb1R2hhTSqdr3DGtTmv74y6gxla4YUaGzThga3M1UaJcPuterWAMycodowVFBpHRMmRPmOmI3zpexmBBaiHg6Mvb24ggw1dcJ3Hh8CZFRho4PjBcGxhRzR9rkcx-x1hpLpHBlEmIEyRwE3n-By/s756/20250918_001110.png',
        music: 'https://youtu.be/kueMeMf1Ggg?si=h0fSQnBwZUv0YLGZ',
        volume: 100
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupNavigation();
    setupMobileMenu();
    setupEventListeners();
    renderAll();
});

function initApp() {
    const path = window.location.pathname;
    const parts = path.split('/');
    lsData.user = parts[parts.indexOf('cms_admin') - 1] || "user001";
    document.getElementById('display-user').textContent = lsData.user;
    
    // Tenta carregar rascunho
    const saved = localStorage.getItem(`ls_pro_${lsData.user}`);
    if(saved) {
        lsData = JSON.parse(saved);
        fillInputs();
    }
}

// --- NAVEGAÇÃO ---
function setupNavigation() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            
            const target = btn.dataset.tab;
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
            
            if(target === 'preview') updatePreview();
            if(window.innerWidth < 1024) closeSidebar();
        });
    });
}

// --- CRUD CATEGORIAS ---
function addCategory() {
    const input = document.getElementById('new-category');
    const val = input.value.trim();
    if(val && !lsData.categories.includes(val)) {
        lsData.categories.push(val);
        input.value = '';
        renderCategories();
    }
}

function removeCategory(cat) {
    lsData.categories = lsData.categories.filter(c => c !== cat);
    renderCategories();
}

// --- CRUD PRODUTOS ---
function openProductModal() {
    const select = document.getElementById('p-cat');
    select.innerHTML = lsData.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById('prod-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('prod-modal').classList.add('hidden');
}

function saveProduct() {
    const p = {
        id: Date.now(),
        name: document.getElementById('p-name').value,
        cat: document.getElementById('p-cat').value,
        price: document.getElementById('p-price').value,
        stock: document.getElementById('p-stock').value
    };
    if(p.name && p.price) {
        lsData.products.push(p);
        renderProducts();
        closeProductModal();
    }
}

function deleteProduct(id) {
    lsData.products = lsData.products.filter(p => p.id !== id);
    renderProducts();
}

// --- ENTREGA ---
function addDeliveryZone() {
    const bairro = prompt("Nome do Bairro:");
    const taxa = prompt("Taxa de Entrega (R$):");
    if(bairro && taxa) {
        lsData.delivery.push({ bairro, taxa });
        renderDelivery();
    }
}

function removeZone(index) {
    lsData.delivery.splice(index, 1);
    renderDelivery();
}

// --- RENDERIZAÇÃO ---
function renderAll() {
    renderCategories();
    renderProducts();
    renderDelivery();
}

function renderCategories() {
    const container = document.getElementById('categories-list');
    container.innerHTML = lsData.categories.map(c => `
        <div class="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-[#1f298f]">
            ${c} <button onclick="removeCategory('${c}')" class="text-red-400 font-black">×</button>
        </div>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = lsData.products.map(p => `
        <tr class="border-b border-slate-50 text-xs font-semibold text-slate-600">
            <td class="py-4 font-black text-slate-800">${p.name}</td>
            <td class="py-4">${p.cat}</td>
            <td class="py-4 text-[#1f298f]">R$ ${p.price}</td>
            <td class="py-4">${p.stock} un</td>
            <td class="py-4 text-center">
                <button onclick="deleteProduct(${p.id})" class="text-red-400 hover:text-red-600">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderDelivery() {
    const container = document.getElementById('delivery-list');
    container.innerHTML = lsData.delivery.map((d, i) => `
        <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
                <span class="text-xs font-black text-[#1f298f] uppercase">${d.bairro}</span>
                <p class="text-[10px] text-slate-400 font-bold">Taxa: R$ ${d.taxa}</p>
            </div>
            <button onclick="removeZone(${i})" class="text-red-400 font-bold text-xs">Excluir</button>
        </div>
    `).join('');
}

// --- PRE-VISUALIZAÇÃO ---
function updatePreview() {
    syncState(); // Atualiza objeto com inputs
    const p = lsData.design;
    const header = document.getElementById('preview-header');
    const logo = document.getElementById('preview-logo');
    const name = document.getElementById('preview-store-name');
    const btn = document.getElementById('preview-btn');
    const status = document.getElementById('preview-status');
    const addr = document.getElementById('preview-address');

    header.style.backgroundColor = p.primary;
    name.style.color = p.secondary;
    logo.src = p.logo;
    name.textContent = lsData.config.storeName || "SUA LOJA";
    btn.style.backgroundColor = p.primary;
    btn.style.color = p.secondary;
    btn.textContent = "VER PRODUTOS";
    status.textContent = lsData.config.status === 'aberto' ? '🟢 ABERTO' : '🔴 FECHADO';
    addr.textContent = lsData.config.address || "Endereço não definido";
}

// --- BACKUP E SYNC ---
function syncState() {
    lsData.config = {
        storeName: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value,
        pix: document.getElementById('pix-key').value,
        bank: document.getElementById('bank-details').value,
        btc: document.getElementById('btc-lightning').value
    };
    lsData.design = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        bg: document.getElementById('color-bg').value,
        bgImage: document.getElementById('bg-image-url').value,
        logo: document.getElementById('logo-url').value,
        music: document.getElementById('yt-link').value,
        volume: document.getElementById('yt-volume').value
    };
}

function fillInputs() {
    const c = lsData.config;
    const d = lsData.design;
    document.getElementById('store-name').value = c.storeName;
    document.getElementById('store-whatsapp').value = c.whatsapp;
    document.getElementById('store-status').value = c.status;
    document.getElementById('store-address').value = c.address;
    document.getElementById('pix-key').value = c.pix;
    document.getElementById('bank-details').value = c.bank;
    document.getElementById('btc-lightning').value = c.btc;
    
    document.getElementById('color-primary').value = d.primary;
    document.getElementById('color-secondary').value = d.secondary;
    document.getElementById('color-bg').value = d.bg;
    document.getElementById('bg-image-url').value = d.bgImage;
    document.getElementById('logo-url').value = d.logo;
    document.getElementById('yt-link').value = d.music;
    document.getElementById('yt-volume').value = d.volume;
}

function saveDraft() {
    syncState();
    localStorage.setItem(`ls_pro_${lsData.user}`, JSON.stringify(lsData));
    alert("📝 Rascunho salvo no navegador!");
}

function exportJSON() {
    syncState();
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lsData, null, 2));
    const link = document.createElement('a');
    link.href = data;
    link.download = `ls_backup_${lsData.user}.json`;
    link.click();
}

function handleImport(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        lsData = JSON.parse(event.target.result);
        fillInputs();
        renderAll();
        alert("✅ Backup restaurado!");
    };
    reader.readAsText(e.target.files[0]);
}

// --- AUXILIARES ---
function setupMobileMenu() {
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('mobile-open');
        document.getElementById('overlay').classList.remove('hidden');
    });
    document.getElementById('overlay').addEventListener('click', closeSidebar);
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

function setupEventListeners() {
    document.getElementById('yt-volume').addEventListener('input', (e) => {
        document.getElementById('vol-display').textContent = e.target.value;
    });
    document.getElementById('import-file').addEventListener('change', handleImport);
}

async function syncToCloud() {
    saveDraft();
    const btn = document.getElementById('btn-publish');
    btn.innerHTML = "🌀 PUBLICANDO...";
    setTimeout(() => {
        btn.innerHTML = "✅ PUBLICADO!";
        btn.classList.replace('bg-emerald-500', 'bg-[#1f298f]');
        setTimeout(() => {
            btn.innerHTML = "🚀 PUBLICAR AGORA";
            btn.classList.replace('bg-[#1f298f]', 'bg-emerald-500');
        }, 3000);
    }, 2000);
        }
