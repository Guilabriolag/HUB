let appData = {
    info: { name: '', tel: '', status: 'aberto', address: '' },
    payment: { pix: '', bank: '', lightning: '' },
    delivery: [],
    categories: ['Sistemas'],
    products: [
        { id: 1, name: 'LabSystem CMS', cat: 'Sistemas', price: '280,00', stock: '25' },
        { id: 2, name: 'Cardapio Online', cat: 'Sistemas', price: '249,00', stock: '100' }
    ],
    visual: { primary: '#1f298f', secondary: '#ffcf69', bg: '#f9f9f9', bgImg: '', logo: '' },
    midia: { ytUrl: 'https://youtu.be/kueMeMf1Ggg', volume: 100 },
    cloud: { binId: '', masterKey: '' }
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupTabs();
    handleImports();
    renderAll();
});

function initApp() {
    const user = window.location.pathname.split('/').slice(-3, -2)[0] || "admin";
    document.getElementById('display-user').textContent = user;
    loadDraft(user);
}

// --- RENDERIZAÇÃO ---
function renderAll() {
    renderDelivery();
    renderCategories();
    renderProducts();
}

function renderDelivery() {
    const list = document.getElementById('zones-list');
    list.innerHTML = appData.delivery.map((z, i) => `
        <div class="flex justify-between bg-slate-50 p-3 rounded-xl border">
            <span class="font-bold text-slate-700">${z.name} - R$ ${z.tax}</span>
            <button onclick="removeZone(${i})" class="text-red-500 font-bold">X</button>
        </div>
    `).join('');
}

function renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = appData.categories.map((c, i) => `
        <div class="bg-indigo-50 text-[#1f298f] px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs">
            ${c} <button onclick="removeCategory(${i})" class="text-red-500">×</button>
        </div>
    `).join('');
}

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = appData.products.map(p => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-bold">${p.name}</td>
            <td class="p-3"><span class="bg-slate-100 px-2 py-1 rounded text-[10px] font-black">${p.cat}</span></td>
            <td class="p-3 text-[#1f298f] font-black">R$ ${p.price}</td>
            <td class="p-3">${p.stock}</td>
            <td class="p-3 text-center">
                <button onclick="deleteProduct(${p.id})" class="text-red-500 text-xs font-bold">EXCLUIR</button>
            </td>
        </tr>
    `).join('');
}

// --- AÇÕES ---
function addZone() {
    const name = prompt("Nome do Bairro:");
    const tax = prompt("Taxa de Entrega:");
    if(name && tax) { appData.delivery.push({name, tax}); renderDelivery(); }
}

function removeZone(i) { appData.delivery.splice(i, 1); renderDelivery(); }

function addCategory() {
    const input = document.getElementById('new-cat-name');
    if(input.value) { appData.categories.push(input.value); input.value = ''; renderCategories(); }
}

function removeCategory(i) { appData.categories.splice(i, 1); renderCategories(); }

function addProduct() {
    const name = prompt("Nome do Produto:");
    const price = prompt("Preço:");
    const cat = prompt("Categoria (conforme lista):");
    if(name && price) {
        appData.products.push({ id: Date.now(), name, cat, price, stock: '99' });
        renderProducts();
    }
}

function deleteProduct(id) {
    appData.products = appData.products.filter(p => p.id !== id);
    renderProducts();
}

// --- ARQUIVOS E SYNC ---
function exportJSON() {
    updateState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const dl = document.createElement('a');
    dl.href = dataStr;
    dl.download = `config_labsystem.json`;
    dl.click();
}

function handleImports() {
    document.getElementById('import-file').addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            appData = JSON.parse(ev.target.result);
            fillUI();
            renderAll();
            alert("Dados Importados!");
        };
        reader.readAsText(e.target.files[0]);
    });
}

function updateState() {
    appData.info = {
        name: document.getElementById('store-name').value,
        tel: document.getElementById('store-tel').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value
    };
    appData.payment = {
        pix: document.getElementById('pix-key').value,
        bank: document.getElementById('bank-details').value,
        lightning: document.getElementById('lightning-address').value
    };
    appData.cloud = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value
    };
}

function fillUI() {
    document.getElementById('store-name').value = appData.info.name;
    document.getElementById('pix-key').value = appData.payment.pix;
    document.getElementById('bin-id').value = appData.cloud.binId;
    // ... repetir para os demais campos
}

async function syncToCloud() {
    updateState();
    const btn = document.getElementById('btn-sync');
    btn.disabled = true;
    btn.textContent = "🚀 PUBLICANDO...";

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${appData.cloud.binId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': appData.cloud.masterKey },
            body: JSON.stringify(appData)
        });
        if(res.ok) alert("TOTALMENTE PUBLICADO NO SITE!");
    } catch(e) { alert("Erro ao sincronizar."); }
    btn.disabled = false;
    btn.textContent = "🚀 PUBLICAR AGORA";
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(btn.dataset.tab).classList.remove('hidden');
        });
    });
}

function saveDraft() {
    updateState();
    localStorage.setItem(`draft_${document.getElementById('display-user').textContent}`, JSON.stringify(appData));
    alert("Rascunho salvo!");
}

function loadDraft(user) {
    const saved = localStorage.getItem(`draft_${user}`);
    if(saved) { appData = JSON.parse(saved); fillUI(); renderAll(); }
}
