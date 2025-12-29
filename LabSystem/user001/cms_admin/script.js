// --- CONFIGURAÇÃO INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    const userName = initApp();
    setupTabs();
    setupMobileMenu();
    loadSavedData(userName);
});

function initApp() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const index = parts.indexOf('cms_admin');
    const user = (index > 0) ? parts[index - 1] : "Usuario_Admin";
    
    document.getElementById('display-user').textContent = user;
    return user;
}

// --- NAVEGAÇÃO ---
function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            btns.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');

            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            if(window.innerWidth < 1024) closeSidebar();
        });
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    
    toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('mobile-open');
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- LÓGICA DE DADOS (LOCALSTORAGE) ---
let products = [];

function saveDraft() {
    const user = document.getElementById('display-user').textContent;
    const data = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value,
        products: products
    };

    localStorage.setItem(`labsystem_${user}`, JSON.stringify(data));
    
    const btn = document.getElementById('btn-save-draft');
    btn.innerHTML = "✅ Salvo Localmente";
    btn.classList.replace('bg-amber-500', 'bg-emerald-500');
    
    setTimeout(() => {
        btn.innerHTML = "💾 Salvar Rascunho";
        btn.classList.replace('bg-emerald-500', 'bg-amber-500');
    }, 2000);
}

function loadSavedData(user) {
    const saved = localStorage.getItem(`labsystem_${user}`);
    if(saved) {
        const data = JSON.parse(saved);
        document.getElementById('bin-id').value = data.binId || '';
        document.getElementById('master-key').value = data.masterKey || '';
        products = data.products || [];
        renderItems();
    }
}

// --- GERENCIADOR DE ITENS ---
function addItem() {
    const name = prompt("Nome do produto:");
    const price = prompt("Preço (Ex: 29.90):");
    if(name && price) {
        products.push({ id: Date.now(), name, price });
        renderItems();
    }
}

function deleteItem(id) {
    products = products.filter(p => p.id !== id);
    renderItems();
}

function renderItems() {
    const list = document.getElementById('items-list');
    list.innerHTML = products.map(p => `
        <tr class="border-b border-slate-50 animate__animated animate__fadeIn">
            <td class="py-4 font-semibold text-slate-700">${p.name}</td>
            <td class="py-4 text-indigo-600 font-bold">R$ ${p.price}</td>
            <td class="py-4 text-center">
                <button onclick="deleteItem(${p.id})" class="text-red-400 hover:text-red-600 font-bold">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// --- SYNC ---
function syncData() {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = "🌀 SINCRONIZANDO...";
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = "🚀 DADOS NO AR!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = "🌐 PUBLICAR NO TOTEM";
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja sair?")) window.location.href = "../../../index.html";
}
