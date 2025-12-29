// --- DADOS E MEMÓRIA ---
let db = {
    products: [],
    config: {},
    ui: {}
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const user = detectUser();
    setupNavigation();
    setupMobileMenu();
    loadFromLocalStorage(user);
});

function detectUser() {
    const segments = window.location.pathname.split('/');
    const user = segments[segments.indexOf('cms_admin') - 1] || "user001";
    document.getElementById('display-user').textContent = user;
    return user;
}

// --- NAVEGAÇÃO ---
function setupNavigation() {
    const btns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            btns.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden', 'active');
            document.getElementById(target).classList.add('active');
            if(window.innerWidth < 1024) closeSidebar();
        });
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    toggle.onclick = () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
        overlay.classList.toggle('hidden');
    }
    overlay.onclick = closeSidebar;
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- GERENCIAMENTO DE PRODUTOS ---
function openProductModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function confirmAddProduct() {
    const name = document.getElementById('p-name').value;
    const cat = document.getElementById('p-cat').value;
    const price = document.getElementById('p-price').value;

    if(name && price) {
        db.products.push({ id: Date.now(), name, cat, price });
        renderProducts();
        closeModal();
    }
}

function removeProduct(id) {
    db.products = db.products.filter(p => p.id !== id);
    renderProducts();
}

function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = db.products.map(p => `
        <tr class="border-b border-slate-50">
            <td class="py-4 uppercase">${p.name}</td>
            <td class="py-4"><span class="bg-slate-100 px-2 py-1 rounded text-[10px]">${p.cat}</span></td>
            <td class="py-4 text-indigo-600">R$ ${p.price}</td>
            <td class="py-4"><button onclick="removeProduct(${p.id})" class="text-red-400 hover:text-red-600">Excluir</button></td>
        </tr>
    `).join('');
}

// --- SISTEMA DE SALVAMENTO ---
function saveDraft() {
    const user = document.getElementById('display-user').textContent;
    const saveBtn = document.getElementById('saveBtn');

    db.config = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value,
        storeName: document.getElementById('store-name').value,
        storePhone: document.getElementById('store-phone').value,
        pixKey: document.getElementById('pix-key').value
    };

    localStorage.setItem(`labsystem_${user}`, JSON.stringify(db));
    
    // Feedback Visual
    saveBtn.innerHTML = "✅ SALVO COM SUCESSO";
    saveBtn.classList.replace('bg-amber-500', 'bg-emerald-500');
    setTimeout(() => {
        saveBtn.innerHTML = "💾 SALVAR RASCUNHO";
        saveBtn.classList.replace('bg-emerald-500', 'bg-amber-500');
    }, 2000);
}

function loadFromLocalStorage(user) {
    const data = localStorage.getItem(`labsystem_${user}`);
    if(data) {
        db = JSON.parse(data);
        document.getElementById('bin-id').value = db.config.binId || '';
        document.getElementById('master-key').value = db.config.masterKey || '';
        document.getElementById('store-name').value = db.config.storeName || '';
        document.getElementById('store-phone').value = db.config.storePhone || '';
        document.getElementById('pix-key').value = db.config.pixKey || '';
        renderProducts();
    }
}

// --- SINCRONIZAÇÃO NUVEM ---
function syncToCloud() {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = "🌀 PROCESSANDO...";
    btn.disabled = true;

    // Simulação de Sync (Depois pode ser substituído por Fetch Real)
    setTimeout(() => {
        btn.innerHTML = "🚀 PUBLICADO NO TOTEM!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = "🌐 PUBLICAR AGORA";
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja sair do sistema?")) window.location.href = "../../../index.html";
}
