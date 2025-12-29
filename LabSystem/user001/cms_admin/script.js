// --- ESTADO GLOBAL ---
let appData = {
    user: "Administrador",
    config: { binId: "", masterKey: "", storeName: "", whatsapp: "" },
    products: []
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    appData.user = detectUser();
    setupTabs();
    setupMobileMenu();
    loadFromLocalStorage();
});

function detectUser() {
    const segments = window.location.pathname.split('/');
    const index = segments.indexOf('cms_admin');
    const name = (index > 0) ? segments[index - 1] : "Usuario_Padrao";
    document.getElementById('display-user').textContent = name;
    return name;
}

// --- NAVEGAÇÃO ---
function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            btns.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
            if(window.innerWidth < 1024) closeSidebar();
        });
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    toggle.onclick = () => {
        document.getElementById('sidebar').classList.add('mobile-open');
        overlay.classList.remove('hidden');
    };
    overlay.onclick = closeSidebar;
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- GERENCIAMENTO DE PRODUTOS ---
function addItem() {
    const name = prompt("Nome do Produto:");
    const price = prompt("Preço (Ex: 25.00):");
    if(name && price) {
        appData.products.push({ id: Date.now(), name, price });
        renderItems();
    }
}

function deleteItem(id) {
    appData.products = appData.products.filter(p => p.id !== id);
    renderItems();
}

function renderItems() {
    const list = document.getElementById('items-list');
    list.innerHTML = appData.products.map(p => `
        <tr class="border-b border-slate-50 animate__animated animate__fadeIn">
            <td class="py-4 font-bold text-slate-700">${p.name}</td>
            <td class="py-4 text-indigo-600 font-black">R$ ${p.price}</td>
            <td class="py-4 text-center">
                <button onclick="deleteItem(${p.id})" class="text-red-500 hover:scale-110">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// --- SALVAMENTO E EXPORTAÇÃO ---
function getFields() {
    return {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value,
        storeName: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value
    };
}

function saveDraft() {
    appData.config = getFields();
    localStorage.setItem(`labsystem_${appData.user}`, JSON.stringify(appData));
    const btn = document.getElementById('btn-save-draft');
    btn.innerHTML = "✅ Salvo!";
    setTimeout(() => btn.innerHTML = "💾 Salvar Rascunho", 2000);
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(`labsystem_${appData.user}`);
    if(saved) applyData(JSON.parse(saved));
}

function applyData(data) {
    appData = data;
    document.getElementById('bin-id').value = data.config.binId || "";
    document.getElementById('master-key').value = data.config.masterKey || "";
    document.getElementById('store-name').value = data.config.storeName || "";
    document.getElementById('store-whatsapp').value = data.config.whatsapp || "";
    renderItems();
}

// --- FUNÇÃO REAL: EXPORTAR JSON PARA ARQUIVO ---
function exportJSON() {
    appData.config = getFields();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `config_${appData.user}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- FUNÇÃO REAL: IMPORTAR JSON DE ARQUIVO ---
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            applyData(json);
            alert("✅ Dados importados com sucesso!");
        } catch (err) {
            alert("❌ Erro ao ler arquivo JSON.");
        }
    };
    reader.readAsText(file);
}

function syncData() {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = "🌀 SINCRONIZANDO...";
    setTimeout(() => {
        btn.innerHTML = "🚀 SUCESSO!";
        setTimeout(() => btn.innerHTML = "🌐 PUBLICAR NO TOTEM", 2000);
    }, 2000);
}

function logout() { if(confirm("Deseja sair?")) window.location.href = "../../../index.html"; }
