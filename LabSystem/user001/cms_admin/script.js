// VARIÁVEL GLOBAL DE PRODUTOS
let products = [];

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const user = initUser();
    setupNavigation();
    setupMobileMenu();
    loadFromLocalStorage(user);
});

// Detecta o nome do usuário pela estrutura de pastas (/user001/cms_admin/)
function initUser() {
    const pathSegments = window.location.pathname.split('/');
    const adminIndex = pathSegments.indexOf('cms_admin');
    const userName = (adminIndex > 0) ? pathSegments[adminIndex - 1] : "Convidado";
    
    document.getElementById('display-user').textContent = userName;
    return userName;
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function setupNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            // Muda cor do botão lateral
            tabButtons.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');

            // Troca o conteúdo visível
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            // No Mobile: Fecha o menu automaticamente ao clicar em uma aba
            if(window.innerWidth < 1024) closeMenu();
        });
    });
}

// --- MENU MOBILE (DRAWER) ---
function setupMobileMenu() {
    const btnToggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('sidebar');

    btnToggle.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', closeMenu);
}

function closeMenu() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- SISTEMA DE SALVAMENTO LOCAL (APENAS AO CLICAR) ---
function saveDraft() {
    const user = document.getElementById('display-user').textContent;
    const btn = document.getElementById('btn-save-draft');

    const configData = {
        storeName: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        pixKey: document.getElementById('pix-key').value,
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value,
        ytUrl: document.getElementById('yt-url').value,
        color: document.getElementById('color-primary').value,
        items: products // Salva a lista de produtos atual
    };

    localStorage.setItem(`labsystem_draft_${user}`, JSON.stringify(configData));

    // Feedback visual de sucesso
    const originalText = btn.innerHTML;
    btn.innerHTML = "✅ Rascunho Salvo!";
    btn.classList.replace('bg-amber-500', 'bg-emerald-500');

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('bg-emerald-500', 'bg-amber-500');
    }, 2000);
}

function loadFromLocalStorage(user) {
    const rawData = localStorage.getItem(`labsystem_draft_${user}`);
    if(rawData) {
        const data = JSON.parse(rawData);
        
        // Preenche campos de texto
        document.getElementById('store-name').value = data.storeName || '';
        document.getElementById('store-whatsapp').value = data.whatsapp || '';
        document.getElementById('pix-key').value = data.pixKey || '';
        document.getElementById('bin-id').value = data.binId || '';
        document.getElementById('master-key').value = data.masterKey || '';
        document.getElementById('yt-url').value = data.ytUrl || '';
        document.getElementById('color-primary').value = data.color || '#1f298f';
        
        // Carrega produtos
        products = data.items || [];
        renderItems();
    }
}

// --- GERENCIADOR DE ITENS (PRODUTOS) ---
function addItem() {
    const nome = prompt("Nome do Produto:");
    const preco = prompt("Preço (Ex: 35.00):");
    
    if(nome && preco) {
        products.push({ id: Date.now(), nome, preco });
        renderItems();
    }
}

function deleteItem(id) {
    products = products.filter(item => item.id !== id);
    renderItems();
}

function renderItems() {
    const tbody = document.getElementById('items-list');
    tbody.innerHTML = products.map(item => `
        <tr class="border-b border-slate-50 animate__animated animate__fadeIn">
            <td class="py-4 font-bold text-slate-700">${item.nome}</td>
            <td class="py-4 text-indigo-600 font-black">R$ ${item.preco}</td>
            <td class="py-4 text-center">
                <button onclick="deleteItem(${item.id})" class="text-red-400 hover:text-red-600 transition">Remover</button>
            </td>
        </tr>
    `).join('');
}

// --- SINCRONIZAÇÃO (FEEDBACK) ---
function syncData() {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = "🌀 CONECTANDO AO SERVIDOR...";
    btn.disabled = true;

    // Simulação de Sincronização
    setTimeout(() => {
        btn.innerHTML = "🚀 PUBLICADO COM SUCESSO!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        
        setTimeout(() => {
            btn.innerHTML = "🌐 PUBLICAR AGORA";
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja sair do painel?")) {
        window.location.href = "../../../index.html"; 
    }
}
