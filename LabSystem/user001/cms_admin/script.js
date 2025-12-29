// --- DATABASE LOCAL ---
let appData = {
    contato: { name: '', whatsapp: '', status: 'aberto', address: '' },
    pagamento: { pix: '', bank: '', btc: '' },
    cobertura: [],
    categorias: [],
    produtos: [],
    design: { primary: '#1f298f', secondary: '#ffcf69', bg: '#f9f9f9', imgBg: '', imgLogo: '', yt: '', vol: 50 }
};

document.addEventListener('DOMContentLoaded', () => {
    initCMS();
    setupTabs();
    setupMobile();
});

function initCMS() {
    const user = detectUser();
    loadData(user);
    renderAll();
}

function detectUser() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const user = segments[segments.indexOf('cms_admin') - 1] || 'user001';
    document.getElementById('public-link').textContent = `www.labriolag.shop/${user}/index.html`;
    return user;
}

// --- NAVEGAÇÃO ---
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            const target = btn.dataset.tab;
            document.getElementById(target).classList.remove('hidden');
            if(target === 'preview') updatePreview();
            if(window.innerWidth < 1024) toggleMenu(false);
        });
    });
}

function setupMobile() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    toggle.onclick = () => toggleMenu(true);
    overlay.onclick = () => toggleMenu(false);
}

function toggleMenu(show) {
    const side = document.getElementById('sidebar');
    const over = document.getElementById('overlay');
    show ? side.classList.add('open') : side.classList.remove('open');
    show ? over.classList.remove('hidden') : over.classList.add('hidden');
}

// --- LÓGICA DE CATEGORIAS E PRODUTOS ---
function addCat() {
    const val = document.getElementById('new-cat').value;
    if(!val) return;
    appData.categorias.push(val);
    document.getElementById('new-cat').value = '';
    renderAll();
}

function openProdModal() {
    if(appData.categorias.length === 0) return alert("Crie uma categoria primeiro!");
    const name = prompt("Nome do Produto:");
    const cat = prompt("Categoria (" + appData.categorias.join(", ") + "):");
    const price = prompt("Preço (0.00):");
    const stock = prompt("Estoque:");
    
    if(name && cat && price) {
        appData.produtos.push({ id: Date.now(), name, cat, price, stock });
        renderAll();
    }
}

function addBairro() {
    const n = prompt("Nome do Bairro:");
    const t = prompt("Taxa de Entrega:");
    if(n && t) {
        appData.cobertura.push({ id: Date.now(), nome: n, taxa: t });
        renderAll();
    }
}

// --- RENDERS ---
function renderAll() {
    // Render Categorias
    document.getElementById('list-cats').innerHTML = appData.categorias.map(c => `
        <div class="flex justify-between bg-slate-50 p-3 rounded-xl border font-bold">
            <span>${c}</span>
            <button onclick="removeCat('${c}')" class="text-red-500">✕</button>
        </div>
    `).join('');

    // Render Bairros
    document.getElementById('list-bairros').innerHTML = appData.cobertura.map(b => `
        <div class="flex justify-between bg-white p-4 rounded-2xl border items-center shadow-sm">
            <span class="font-bold">${b.nome}</span>
            <span class="text-emerald-600 font-black">R$ ${b.taxa}</span>
            <button onclick="removeBairro(${b.id})" class="text-red-400">Excluir</button>
        </div>
    `).join('');

    // Render Produtos
    document.getElementById('count-prod').textContent = appData.produtos.length;
    document.getElementById('list-prods').innerHTML = appData.produtos.map(p => `
        <tr class="border-b text-sm">
            <td class="p-4 font-bold text-slate-700">${p.name}</td>
            <td class="p-4"><span class="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black">${p.cat}</span></td>
            <td class="p-4 font-black">R$ ${p.price}</td>
            <td class="p-4 text-slate-400">${p.stock}</td>
            <td class="p-4 text-right"><button onclick="removeProd(${p.id})" class="text-red-400">✕</button></td>
        </tr>
    `).join('');
}

function removeCat(val) { appData.categorias = appData.categorias.filter(c => c !== val); renderAll(); }
function removeProd(id) { appData.produtos = appData.produtos.filter(p => p.id !== id); renderAll(); }
function removeBairro(id) { appData.cobertura = appData.cobertura.filter(b => b.id !== id); renderAll(); }

// --- PREVIEW ---
function updatePreview() {
    saveToState();
    const d = appData.design;
    const mock = document.getElementById('phone-mockup');
    const namePre = document.getElementById('preview-name');
    const statusPre = document.getElementById('preview-status');
    
    mock.style.backgroundColor = d.bg;
    document.getElementById('preview-bg').style.backgroundImage = d.imgBg ? `url(${d.imgBg})` : 'none';
    document.getElementById('preview-logo').src = d.imgLogo || 'https://via.placeholder.com/150';
    
    namePre.textContent = appData.contato.name || "Sua Loja";
    namePre.style.color = d.secondary;
    
    statusPre.textContent = appData.contato.status.toUpperCase();
    statusPre.style.backgroundColor = appData.contato.status === 'aberto' ? '#10b981' : '#ef4444';
    statusPre.style.color = '#fff';

    const menu = document.getElementById('preview-menu');
    menu.innerHTML = appData.categorias.map(cat => `
        <div class="space-y-2">
            <h3 class="text-xs font-black uppercase tracking-widest" style="color:${d.secondary}">${cat}</h3>
            ${appData.produtos.filter(p => p.cat === cat).map(p => `
                <div class="bg-white/80 backdrop-blur p-3 rounded-2xl flex justify-between items-center shadow-sm border border-black/5">
                    <div>
                        <p class="text-sm font-bold text-slate-800">${p.name}</p>
                        <p class="text-[10px] text-slate-400">Estoque: ${p.stock}</p>
                    </div>
                    <span class="text-sm font-black" style="color:${d.primary}">R$ ${p.price}</span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// --- PERSISTÊNCIA ---
function saveToState() {
    appData.contato = {
        name: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value
    };
    appData.pagamento = {
        pix: document.getElementById('pix-key').value,
        bank: document.getElementById('bank-info').value,
        btc: document.getElementById('btc-address').value
    };
    appData.design = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-sec').value,
        bg: document.getElementById('color-bg').value,
        imgBg: document.getElementById('img-bg').value,
        imgLogo: document.getElementById('img-logo').value,
        yt: document.getElementById('yt-link').value,
        vol: document.getElementById('yt-vol').value
    };
}

function saveDraft() {
    saveToState();
    const user = detectUser();
    localStorage.setItem(`ls_master_${user}`, JSON.stringify(appData));
    alert("💾 Rascunho salvo no navegador!");
}

function loadData(user) {
    const saved = localStorage.getItem(`ls_master_${user}`);
    if(saved) {
        appData = JSON.parse(saved);
        document.getElementById('store-name').value = appData.contato.name || '';
        document.getElementById('store-whatsapp').value = appData.contato.whatsapp || '';
        document.getElementById('store-status').value = appData.contato.status || 'aberto';
        document.getElementById('store-address').value = appData.contato.address || '';
        document.getElementById('pix-key').value = appData.pagamento.pix || '';
        document.getElementById('bank-info').value = appData.pagamento.bank || '';
        document.getElementById('btc-address').value = appData.pagamento.btc || '';
        document.getElementById('color-primary').value = appData.design.primary;
        document.getElementById('color-sec').value = appData.design.secondary;
        document.getElementById('color-bg').value = appData.design.bg;
        document.getElementById('img-bg').value = appData.design.imgBg;
        document.getElementById('img-logo').value = appData.design.imgLogo;
        document.getElementById('yt-link').value = appData.design.yt;
        document.getElementById('yt-vol').value = appData.design.vol;
    }
}

function exportJSON() {
    saveToState();
    const blob = new Blob([JSON.stringify(appData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labsystem_config.json`;
    a.click();
}

async function syncToCloud() {
    alert("🚀 Conectando ao JSONBin para atualizar o Totem...");
    // Aqui entraria a lógica de FETCH (PUT) enviando appData para o seu servidor.
}
