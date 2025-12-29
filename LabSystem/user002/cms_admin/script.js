// --- ESTADO GLOBAL DO SISTEMA ---
let cmsData = {
    info: { name: 'Minha Loja', phone: '', status: 'aberto', address: '' },
    payments: { pix: '', btc: '', bank: { name: '', agency: '', account: '', owner: '' } },
    design: { primary: '#1f298f', secondary: '#ffcf69', bg: '#f9f9f9', bgImage: '', logo: '', ytUrl: '', ytVol: 100 },
    categories: [],
    products: [],
    delivery: [],
    config: { binId: '', masterKey: '' }
};

document.addEventListener('DOMContentLoaded', () => {
    const user = detectUser();
    setupNav();
    setupMobile();
    loadDraft(user);
    initImport();
    
    // Listeners de tempo real para o Preview
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
            updateState();
            renderPreview();
        });
    });
});

// --- CORE ---
function detectUser() {
    const path = window.location.pathname;
    const user = path.split('/')[path.split('/').indexOf('cms_admin') - 1] || "user001";
    document.getElementById('display-user').textContent = `@${user}`;
    document.getElementById('preview-user-url').textContent = user;
    return user;
}

function updateState() {
    cmsData.info = {
        name: document.getElementById('store-name').value,
        phone: document.getElementById('store-phone').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value
    };
    cmsData.payments = {
        pix: document.getElementById('pix-key').value,
        btc: document.getElementById('btc-address').value,
        bank: {
            name: document.getElementById('bank-name').value,
            agency: document.getElementById('bank-agency').value,
            account: document.getElementById('bank-account').value,
            owner: document.getElementById('bank-owner').value
        }
    };
    cmsData.design = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        bg: document.getElementById('color-bg').value,
        bgImage: document.getElementById('bg-image-url').value,
        logo: document.getElementById('logo-url').value,
        ytUrl: document.getElementById('yt-music-url').value,
        ytVol: document.getElementById('yt-volume').value
    };
    cmsData.config = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value
    };
    document.getElementById('vol-val').textContent = cmsData.design.ytVol;
}

// --- GERENCIAMENTO DE LISTAS ---

function addCategory() {
    const name = document.getElementById('new-cat-name').value;
    if(!name) return;
    cmsData.categories.push({ id: Date.now(), name });
    document.getElementById('new-cat-name').value = '';
    renderCategories();
    renderPreview();
}

function deleteCategory(id) {
    cmsData.categories = cmsData.categories.filter(c => c.id !== id);
    renderCategories();
    renderPreview();
}

function addDeliveryArea() {
    const name = document.getElementById('area-name').value;
    const fee = document.getElementById('area-fee').value;
    if(!name) return;
    cmsData.delivery.push({ id: Date.now(), name, fee: fee || 0 });
    document.getElementById('area-name').value = '';
    document.getElementById('area-fee').value = '';
    renderDelivery();
}

function deleteDelivery(id) {
    cmsData.delivery = cmsData.delivery.filter(d => d.id !== id);
    renderDelivery();
}

function openProductModal() {
    if(cmsData.categories.length === 0) return alert("Crie uma categoria primeiro!");
    const name = prompt("Nome do Produto:");
    const price = prompt("Preço (R$):");
    const stock = prompt("Estoque:");
    const img = prompt("URL da Imagem do Produto:");
    
    let catOptions = cmsData.categories.map((c, i) => `${i} - ${c.name}`).join('\n');
    const catIdx = prompt("Selecione a Categoria (Número):\n" + catOptions);
    
    if(name && price && cmsData.categories[catIdx]) {
        cmsData.products.push({
            id: Date.now(),
            name,
            price,
            stock: stock || 0,
            image: img || 'https://via.placeholder.com/150',
            category: cmsData.categories[catIdx].name
        });
        renderProducts();
        renderPreview();
    }
}

function deleteProduct(id) {
    cmsData.products = cmsData.products.filter(p => p.id !== id);
    renderProducts();
    renderPreview();
}

// --- RENDERIZADORES DO CMS ---

function renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = cmsData.categories.map(c => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
            <span class="font-bold text-slate-700">${c.name}</span>
            <button onclick="deleteCategory(${c.id})" class="text-red-500 font-bold">×</button>
        </div>
    `).join('');
}

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = cmsData.products.map(p => `
        <tr class="border-b text-xs">
            <td class="py-3 flex items-center gap-2">
                <img src="${p.image}" class="w-8 h-8 rounded shadow-sm">
                <b>${p.name}</b>
            </td>
            <td>${p.category}</td>
            <td class="text-indigo-600 font-bold">R$ ${p.price}</td>
            <td>${p.stock}</td>
            <td class="text-right">
                <button onclick="deleteProduct(${p.id})" class="text-red-400 font-bold">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderDelivery() {
    const list = document.getElementById('delivery-list');
    list.innerHTML = cmsData.delivery.map(d => `
        <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border">
            <span class="font-bold">${d.name}</span>
            <div class="flex items-center gap-4">
                <span class="text-emerald-600 font-bold">R$ ${d.fee}</span>
                <button onclick="deleteDelivery(${d.id})" class="text-red-400">Excluir</button>
            </div>
        </div>
    `).join('');
}

// --- SIMULADOR DE PREVIEW (TOTEM) ---

function renderPreview() {
    const screen = document.getElementById('phone-screen');
    const d = cmsData.design;
    const info = cmsData.info;

    screen.style.backgroundColor = d.bg;
    if(d.bgImage) screen.style.backgroundImage = `url(${d.bgImage})`;
    screen.style.backgroundSize = 'cover';

    let html = `
        <div class="p-4 text-center" style="color: ${d.primary}">
            <img src="${d.logo || 'https://via.placeholder.com/100'}" class="w-16 mx-auto mb-2 rounded-full shadow-md">
            <h1 class="text-lg font-black uppercase">${info.name || 'Nome da Loja'}</h1>
            <p class="text-[10px] opacity-70">${info.address || 'Endereço não definido'}</p>
            <div class="inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-bold ${info.status === 'aberto' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'} uppercase">
                ${info.status}
            </div>
        </div>
        
        <div class="p-4 space-y-6">
            ${cmsData.categories.map(cat => `
                <div>
                    <h3 class="text-xs font-black uppercase mb-3 border-b pb-1" style="color: ${d.primary}; border-color: ${d.primary}33">${cat.name}</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${cmsData.products.filter(p => p.category === cat.name).map(p => `
                            <div class="bg-white p-2 rounded-xl shadow-sm border border-black/5 preview-product-card">
                                <img src="${p.image}" class="w-full h-16 object-cover rounded-lg mb-2">
                                <h4 class="text-[9px] font-bold text-slate-800 truncate">${p.name}</h4>
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-[10px] font-black" style="color: ${d.primary}">R$ ${p.price}</span>
                                    <span class="text-[8px] text-slate-400">Est: ${p.stock}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="p-6">
            <button class="w-full py-3 rounded-xl font-black text-xs shadow-lg uppercase" style="background: ${d.primary}; color: ${d.secondary}">
                🛒 Finalizar Pedido
            </button>
        </div>
    `;
    screen.innerHTML = html;
}

// --- PERSISTÊNCIA & ARQUIVOS ---

function saveDraft() {
    updateState();
    const user = document.getElementById('display-user').textContent.replace('@','');
    localStorage.setItem(`lab_master_${user}`, JSON.stringify(cmsData));
    alert("💾 Rascunho salvo no navegador!");
}

function loadDraft(user) {
    const saved = localStorage.getItem(`lab_master_${user}`);
    if(saved) {
        cmsData = JSON.parse(saved);
        fillInputs();
        renderCategories();
        renderProducts();
        renderDelivery();
        renderPreview();
    }
}

function fillInputs() {
    document.getElementById('store-name').value = cmsData.info.name;
    document.getElementById('store-phone').value = cmsData.info.phone;
    document.getElementById('store-status').value = cmsData.info.status;
    document.getElementById('store-address').value = cmsData.info.address;
    document.getElementById('pix-key').value = cmsData.payments.pix;
    document.getElementById('btc-address').value = cmsData.payments.btc;
    document.getElementById('bank-name').value = cmsData.payments.bank.name;
    document.getElementById('bank-agency').value = cmsData.payments.bank.agency;
    document.getElementById('bank-account').value = cmsData.payments.bank.account;
    document.getElementById('bank-owner').value = cmsData.payments.bank.owner;
    document.getElementById('color-primary').value = cmsData.design.primary;
    document.getElementById('color-secondary').value = cmsData.design.secondary;
    document.getElementById('color-bg').value = cmsData.design.bg;
    document.getElementById('logo-url').value = cmsData.design.logo;
    document.getElementById('bg-image-url').value = cmsData.design.bgImage;
    document.getElementById('yt-music-url').value = cmsData.design.ytUrl;
    document.getElementById('yt-volume').value = cmsData.design.ytVol;
    document.getElementById('bin-id').value = cmsData.config.binId;
    document.getElementById('master-key').value = cmsData.config.masterKey;
}

function exportJSON() {
    updateState();
    const blob = new Blob([JSON.stringify(cmsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labsystem_backup_${cmsData.info.name}.json`;
    a.click();
}

function initImport() {
    document.getElementById('import-file').addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            cmsData = JSON.parse(event.target.result);
            fillInputs();
            renderCategories();
            renderProducts();
            renderDelivery();
            renderPreview();
            alert("✅ Backup restaurado!");
        };
        reader.readAsText(e.target.files[0]);
    });
}

// --- CLOUD SYNC ---

async function syncToCloud() {
    updateState();
    const btn = document.getElementById('btn-sync');
    const { binId, masterKey } = cmsData.config;

    if(!binId || !masterKey) return alert("Configure BIN ID e Master Key!");

    btn.disabled = true;
    btn.innerHTML = "🌀 PUBLICANDO...";

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey },
            body: JSON.stringify(cmsData)
        });

        if(res.ok) {
            btn.innerHTML = "🚀 PUBLICADO COM SUCESSO!";
            btn.style.backgroundColor = "#10b981";
            setTimeout(() => {
                btn.innerHTML = "🌐 PUBLICAR NO TOTEM";
                btn.style.backgroundColor = "#1f298f";
                btn.disabled = false;
            }, 3000);
        }
    } catch (e) {
        alert("Erro de conexão!");
        btn.disabled = false;
    }
}

// Auxiliares Navegação
function setupNav() {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('sidebar-active'));
            b.classList.add('sidebar-active');
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(b.dataset.tab).classList.remove('hidden');
        });
    });
}
function setupMobile() {
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
        document.getElementById('overlay').classList.toggle('hidden');
    });
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('mobile-open');
        document.getElementById('overlay').classList.add('hidden');
    });
}
function logout() { if(confirm("Sair do sistema?")) window.location.href = "../index.html"; }
