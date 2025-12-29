// --- INICIALIZAÇÃO E MODULARIDADE ---
document.addEventListener('DOMContentLoaded', () => {
    const user = detectUser();
    setupNavigation();
    setupMobileMenu();
    loadDraft(user);
});

function detectUser() {
    const path = window.location.pathname;
    const parts = path.split('/');
    // Tenta pegar a pasta anterior à pasta "cms_admin"
    const idx = parts.indexOf('cms_admin');
    const user = (idx > 0) ? parts[idx-1] : "user001";
    
    document.getElementById('display-user').textContent = user;
    return user;
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function setupNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            if(window.innerWidth < 1024) closeSidebar();
        });
    });
}

// --- MENU MOBILE ---
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    
    toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- GERENCIAMENTO DE PRODUTOS ---
let productList = [];

function openProductModal() {
    document.getElementById('modal-product').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('modal-product').classList.add('hidden');
}

function saveNewProduct() {
    const name = document.getElementById('modal-p-name').value;
    const price = document.getElementById('modal-p-price').value;

    if(!name || !price) return alert("Preencha os campos!");

    productList.push({ id: Date.now(), name, price });
    renderProducts();
    closeProductModal();
    
    // Limpa campos
    document.getElementById('modal-p-name').value = "";
    document.getElementById('modal-p-price').value = "";
}

function removeProduct(id) {
    productList = productList.filter(p => p.id !== id);
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('items-list');
    container.innerHTML = productList.map(p => `
        <tr class="border-b border-slate-50 animate__animated animate__fadeIn">
            <td class="py-4 font-bold text-slate-800">${p.name}</td>
            <td class="py-4 text-indigo-600 font-black">R$ ${p.price}</td>
            <td class="py-4 text-center">
                <button onclick="removeProduct(${p.id})" class="text-red-400 font-bold hover:text-red-600 transition">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// --- SALVAMENTO LOCAL (RASCUNHO) ---
function saveDraft() {
    const user = document.getElementById('display-user').textContent;
    const btn = document.getElementById('btn-save-draft');

    const draftData = {
        config: {
            binId: document.getElementById('bin-id').value,
            masterKey: document.getElementById('master-key').value,
            storeName: document.getElementById('store-name').value,
            whatsapp: document.getElementById('store-whatsapp').value,
            status: document.getElementById('store-status').value
        },
        payment: {
            pixKey: document.getElementById('pix-key').value,
            pixName: document.getElementById('pix-name').value
        },
        design: {
            primary: document.getElementById('color-primary').value,
            secondary: document.getElementById('color-secondary').value,
            logo: document.getElementById('logo-url').value,
            music: document.getElementById('music-url').value
        },
        products: productList
    };

    localStorage.setItem(`labsystem_draft_${user}`, JSON.stringify(draftData));

    // Efeito Visual de Sucesso
    btn.innerHTML = "✅ SALVO COM SUCESSO!";
    btn.classList.replace('bg-amber-500', 'bg-emerald-500');

    setTimeout(() => {
        btn.innerHTML = "💾 SALVAR RASCUNHO";
        btn.classList.replace('bg-emerald-500', 'bg-amber-500');
    }, 2500);
}

function loadDraft(user) {
    const raw = localStorage.getItem(`labsystem_draft_${user}`);
    if(!raw) return;

    const d = JSON.parse(raw);
    
    // Mapeamento dos campos
    document.getElementById('bin-id').value = d.config.binId || "";
    document.getElementById('master-key').value = d.config.masterKey || "";
    document.getElementById('store-name').value = d.config.storeName || "";
    document.getElementById('store-whatsapp').value = d.config.whatsapp || "";
    document.getElementById('store-status').value = d.config.status || "open";
    document.getElementById('pix-key').value = d.payment.pixKey || "";
    document.getElementById('pix-name').value = d.payment.pixName || "";
    document.getElementById('color-primary').value = d.design.primary || "#1f298f";
    document.getElementById('color-secondary').value = d.design.secondary || "#ffcf69";
    document.getElementById('logo-url').value = d.design.logo || "";
    document.getElementById('music-url').value = d.design.music || "";

    productList = d.products || [];
    renderProducts();
}

// --- SINCRONIZAÇÃO (SIMULADA) ---
function syncData() {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = "🌀 SINCRONIZANDO...";
    btn.disabled = true;

    // Simulação de delay para API
    setTimeout(() => {
        btn.innerHTML = "🚀 PUBLICADO COM SUCESSO!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        
        setTimeout(() => {
            btn.innerHTML = "🌐 PUBLICAR E SINCRONIZAR";
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja sair e voltar para a tela inicial?")) {
        window.location.href = "../../../index.html";
    }
}
