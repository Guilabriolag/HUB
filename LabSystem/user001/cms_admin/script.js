// --- CONTROLE DE UI E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const userName = detectUser();
    setupTabs();
    setupMobileMenu();
    loadDraft(userName);
});

// Detecta o nome do usuário pela URL (Pasta Pai)
function detectUser() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const cmsIndex = segments.indexOf('cms_admin');
    const user = (cmsIndex > 0) ? segments[cmsIndex - 1] : "Usuario_Admin";
    
    document.getElementById('display-user').textContent = user;
    document.getElementById('user-tag').textContent = `@${user.toLowerCase()}`;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${user}&background=6366f1&color=fff&bold=true&rounded=true`;
    
    return user;
}

// Navegação entre abas
function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            buttons.forEach(b => b.classList.remove('sidebar-active'));
            btn.classList.add('sidebar-active');

            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            // Fecha menu no mobile após clique
            if(window.innerWidth < 1024) closeMenu();
        });
    });
}

// Menu Mobile
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('overlay');
    
    toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', closeMenu);
}

function closeMenu() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('overlay').classList.add('hidden');
}

// --- SISTEMA DE SALVAMENTO (LOCALSTORAGE) ---

function saveDraft() {
    const user = document.getElementById('display-user').textContent;
    const btn = document.getElementById('btn-save-draft');
    
    const data = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value,
        storeName: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        address: document.getElementById('store-address').value,
        pix: document.getElementById('pix-key').value,
        updatedAt: new Date().toLocaleString()
    };

    localStorage.setItem(`ls_draft_${user}`, JSON.stringify(data));

    // Feedback visual
    const originalText = btn.innerHTML;
    btn.innerHTML = "✅ Dados Salvos!";
    btn.classList.replace('bg-amber-500', 'bg-emerald-500');
    btn.classList.add('pulse-save');

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('bg-emerald-500', 'bg-amber-500');
        btn.classList.remove('pulse-save');
    }, 2500);
}

function loadDraft(user) {
    const saved = localStorage.getItem(`ls_draft_${user}`);
    if(saved) {
        const data = JSON.parse(saved);
        document.getElementById('bin-id').value = data.binId || '';
        document.getElementById('master-key').value = data.masterKey || '';
        document.getElementById('store-name').value = data.storeName || '';
        document.getElementById('store-whatsapp').value = data.whatsapp || '';
        document.getElementById('store-address').value = data.address || '';
        document.getElementById('pix-key').value = data.pix || '';
        console.log("Rascunho carregado com sucesso.");
    }
}

// Sincronização (Feedback de Publicação)
function syncData() {
    const btn = document.getElementById('btn-sync');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = "🌀 PUBLICANDO...";

    setTimeout(() => {
        btn.innerHTML = "🚀 SUCESSO NO TOTEM!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja encerrar a sessão?")) {
        window.location.href = "../../../index.html"; // Volta para o login
    }
}
