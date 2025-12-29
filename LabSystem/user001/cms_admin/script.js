// --- ESTADO GLOBAL ---
let lsData = {
    operacional: { name: '', whatsapp: '', status: 'aberto', address: '', pix: '', bank: '', lightning: '' },
    entregas: [],
    categorias: ["Geral"],
    produtos: [],
    visual: { primary: '#1f298f', secondary: '#ffcf69', bg: '#f9f9f9', bgImage: '', logo: '', ytUrl: '', volume: 100 },
    cloud: { binId: '', masterKey: '' }
};

document.addEventListener('DOMContentLoaded', () => {
    const user = initApp();
    setupNavigation();
    setupMobileMenu();
    loadDraft(user);
    setupImport();
});

function initApp() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const user = parts[parts.indexOf('index.html') === -1 ? parts.length - 2 : parts.indexOf('index.html') - 1] || "user";
    document.getElementById('display-user').textContent = user;
    return user;
}

function setupNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(btn.dataset.tab).classList.remove('hidden');
            if(window.innerWidth < 1024) closeMenu();
        });
    });
}

// --- LOGICA DE DADOS ---

function updateStateFromInputs() {
    lsData.operacional = {
        name: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value,
        pix: document.getElementById('pix-key').value,
        bank: document.getElementById('bank-details').value,
        lightning: document.getElementById('lightning-address').value
    };
    lsData.visual = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        bg: document.getElementById('color-bg').value,
        bgImage: document.getElementById('bg-image-url').value,
        logo: document.getElementById('logo-url').value,
        ytUrl: document.getElementById('yt-music-url').value,
        volume: document.getElementById('yt-volume').value
    };
    lsData.cloud = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value
    };
}

function fillInputsFromState() {
    // Operacional
    document.getElementById('store-name').value = lsData.operacional.name || '';
    document.getElementById('store-whatsapp').value = lsData.operacional.whatsapp || '';
    document.getElementById('store-status').value = lsData.operacional.status || 'aberto';
    document.getElementById('store-address').value = lsData.operacional.address || '';
    document.getElementById('pix-key').value = lsData.operacional.pix || '';
    document.getElementById('bank-details').value = lsData.operacional.bank || '';
    document.getElementById('lightning-address').value = lsData.operacional.lightning || '';
    
    // Visual
    document.getElementById('color-primary').value = lsData.visual.primary || '#1f298f';
    document.getElementById('color-secondary').value = lsData.visual.secondary || '#ffcf69';
    document.getElementById('color-bg').value = lsData.visual.bg || '#f9f9f9';
    document.getElementById('bg-image-url').value = lsData.visual.bgImage || '';
    document.getElementById('logo-url').value = lsData.visual.logo || '';
    document.getElementById('yt-music-url').value = lsData.visual.ytUrl || '';
    document.getElementById('yt-volume').value = lsData.visual.volume || 100;
    
    // Cloud
    document.getElementById('bin-id').value = lsData.cloud.binId || '';
    document.getElementById('master-key').value = lsData.cloud.masterKey || '';

    // Status Dashboard
    document.getElementById('dash-status-display').textContent = lsData.operacional.status;
    renderCategories();
    renderProducts();
    renderLocations();
}

// --- CATEGORIAS & PRODUTOS ---

function addCategory() {
    const input = document.getElementById('new-cat-name');
    if(input.value) {
        lsData.categorias.push(input.value);
        input.value = '';
        renderCategories();
    }
}

function deleteCategory(index) {
    lsData.categorias.splice(index, 1);
    renderCategories();
}

function renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = lsData.categorias.map((cat, i) => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
            <span class="font-bold text-slate-700 text-sm">${cat}</span>
            <button onclick="deleteCategory(${i})" class="text-red-500 font-bold text-xs">Excluir</button>
        </div>
    `).join('');
}

function openProductModal() {
    const name = prompt("Nome do Produto:");
    if(!name) return;
    const cat = prompt("Categoria (" + lsData.categorias.join(", ") + "):", lsData.categorias[0]);
    const price = prompt("Preço (Ex: 280.00):");
    const stock = prompt("Estoque Inicial:", "100");
    
    lsData.produtos.push({ id: Date.now(), name, cat, price, stock });
    renderProducts();
}

function deleteProduct(id) {
    lsData.produtos = lsData.produtos.filter(p => p.id !== id);
    renderProducts();
}

function renderProducts() {
    const body = document.getElementById('products-table-body');
    document.getElementById('dash-prod-count').textContent = lsData.produtos.length;
    body.innerHTML = lsData.produtos.map(p => `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="py-4 font-bold text-slate-800">${p.name}</td>
            <td class="py-4"><span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">${p.cat}</span></td>
            <td class="py-4 font-black text-indigo-600">R$ ${p.price}</td>
            <td class="py-4 font-medium text-slate-500">${p.stock}</td>
            <td class="py-4 text-right">
                <button onclick="deleteProduct(${p.id})" class="text-red-400 hover:text-red-600 font-bold">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// --- ENTREGAS ---

function addLocation() {
    const bairro = prompt("Nome do Bairro:");
    const taxa = prompt("Taxa de Entrega:");
    if(bairro && taxa) {
        lsData.entregas.push({ bairro, taxa });
        renderLocations();
    }
}

function renderLocations() {
    const container = document.getElementById('locations-list');
    container.innerHTML = lsData.entregas.map((loc, i) => `
        <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border">
            <div><span class="font-bold text-slate-700">${loc.bairro}</span> <span class="ml-2 text-indigo-600 font-black">R$ ${loc.taxa}</span></div>
            <button onclick="lsData.entregas.splice(${i},1); renderLocations();" class="text-red-500 font-bold text-xs">Excluir</button>
        </div>
    `).join('');
}

// --- ARQUIVOS E SYNC ---

function saveDraft() {
    updateStateFromInputs();
    const user = document.getElementById('display-user').textContent;
    localStorage.setItem(`ls_v3_${user}`, JSON.stringify(lsData));
    const btn = document.getElementById('btn-save-draft');
    btn.innerHTML = "✅ Dados Salvos";
    btn.classList.replace('bg-amber-500', 'bg-emerald-500');
    setTimeout(() => {
        btn.innerHTML = "💾 Salvar Rascunho";
        btn.classList.replace('bg-emerald-500', 'bg-amber-500');
    }, 2000);
}

function loadDraft(user) {
    const saved = localStorage.getItem(`ls_v3_${user}`);
    if(saved) {
        lsData = JSON.parse(saved);
        fillInputsFromState();
    }
}

function exportData() {
    updateStateFromInputs();
    const blob = new Blob([JSON.stringify(lsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ls_config_${lsData.operacional.name || 'labsystem'}.json`;
    a.click();
}

function setupImport() {
    document.getElementById('import-json-file').addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            lsData = JSON.parse(ev.target.result);
            fillInputsFromState();
            alert("Configuração importada!");
        };
        reader.readAsText(e.target.files[0]);
    });
}

async function publishToCloud() {
    updateStateFromInputs();
    const btn = document.getElementById('btn-publish');
    const { binId, masterKey } = lsData.cloud;

    if(!binId || !masterKey) return alert("Configure BIN ID e Master Key!");

    btn.disabled = true;
    btn.innerHTML = "🌀 PUBLICANDO...";

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey },
            body: JSON.stringify(lsData)
        });
        if(res.ok) {
            btn.innerHTML = "🚀 SUCESSO NO TOTEM!";
            btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
            setTimeout(() => {
                btn.innerHTML = "🌐 PUBLICAR AGORA";
                btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
                btn.disabled = false;
            }, 3000);
        } else throw new Error();
    } catch (e) {
        alert("Erro na publicação. Verifique as chaves.");
        btn.disabled = false;
        btn.innerHTML = "🌐 TENTAR NOVAMENTE";
    }
}

function setupMobileMenu() {
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('mobile-open');
        document.getElementById('overlay').classList.remove('hidden');
    });
    document.getElementById('overlay').addEventListener('click', closeMenu);
}
function closeMenu() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}
function logout() { if(confirm("Sair do sistema?")) window.location.href = "../../index.html"; }
