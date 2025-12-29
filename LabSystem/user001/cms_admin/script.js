document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupNavigation();
    setupMobileMenu();
});

// 1. LÓGICA MODULAR (DETECÇÃO DE USUÁRIO)
function initApp() {
    const path = window.location.pathname;
    const parts = path.split('/');
    // Tenta pegar o nome da pasta pai de 'cms_admin'
    const index = parts.indexOf('cms_admin');
    const userName = (index > 0) ? parts[index - 1] : "Administrador";

    // Atualiza UI
    document.getElementById('display-user').textContent = userName;
    document.getElementById('user-tag').textContent = `@${userName}`;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${userName}&background=6366f1&color=fff&bold=true`;
}

// 2. NAVEGAÇÃO DE ABAS
function setupNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Altera classes dos botões
            tabs.forEach(t => t.classList.remove('sidebar-active', 'bg-slate-800'));
            tab.classList.add('sidebar-active');

            // Exibe a seção correta
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            // Se estiver no mobile, fecha a sidebar ao clicar
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        });
    });
}

// 3. CONTROLE MENU MOBILE (DRAWER)
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebar.classList.contains('open') ? openSidebar() : closeSidebar();
    });

    overlay.addEventListener('click', closeSidebar);
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('open', 'translate-x-0');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open', 'translate-x-0');
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('overlay').classList.add('hidden');
}

// 4. SINCRONIZAÇÃO (FEEDBACK VISUAL)
async function syncData() {
    const btn = document.getElementById('sync-btn');
    const binId = document.getElementById('bin-id').value;
    
    if(!binId) return alert("Insira a BIN ID para sincronizar.");

    btn.disabled = true;
    btn.innerHTML = `<span class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Sincronizando...</span>`;

    // Simula envio para JSONBin
    setTimeout(() => {
        btn.innerHTML = "✅ Dados Sincronizados!";
        btn.classList.replace('bg-indigo-600', 'bg-emerald-500');
        
        setTimeout(() => {
            btn.innerHTML = "Sincronizar Agora";
            btn.classList.replace('bg-emerald-500', 'bg-indigo-600');
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

function logout() {
    if(confirm("Deseja sair do painel?")) {
        window.location.href = "../../index.html";
    }
}
