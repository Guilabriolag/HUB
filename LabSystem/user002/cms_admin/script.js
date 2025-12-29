/**
 * LABSYSTEM CMS - PROTECTED SCRIPT
 * Camada de Segurança e Gerenciamento Serverless
 */

// --- 1. GUARDIÃO DE SESSÃO (EXECUÇÃO IMEDIATA) ---
(function() {
    const pathParts = window.location.pathname.split('/');
    // Tenta encontrar o nome do usuário na estrutura: /LabSystem/user001/cms_admin/
    const userFromUrl = pathParts[pathParts.indexOf('cms_admin') - 1];
    const sessionKey = `ls_auth_${userFromUrl}`;
    const sessionData = sessionStorage.getItem(sessionKey);

    if (!sessionData) {
        console.error("Acesso não autorizado. Redirecionando...");
        window.location.href = "../../login.html?error=unauthorized";
        return;
    }

    const auth = JSON.parse(sessionData);
    if (!auth.authenticated || auth.user !== userFromUrl) {
        sessionStorage.removeItem(sessionKey);
        window.location.href = "../../login.html?error=invalid_session";
    }
})();

// --- 2. ESTADO GLOBAL ---
let cmsData = {
    info: { name: 'Minha Loja', phone: '', status: 'aberto', address: '' },
    payments: { pix: '', btc: '', bank: { name: '', agency: '', account: '', owner: '' } },
    design: { primary: '#1f298f', secondary: '#ffcf69', bg: '#f9f9f9', bgImage: '', logo: '', ytUrl: '', ytVol: 100 },
    categories: [],
    products: [],
    delivery: [],
    config: { binId: '', masterKey: '' } // Serão preenchidos via sessão
};

// --- 3. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupNav();
    setupMobile();
    renderPreview();
    
    // Listeners para atualização em tempo real
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
            updateState();
            renderPreview();
        });
    });
});

function initApp() {
    const user = window.location.pathname.split('/').reverse()[2];
    const auth = JSON.parse(sessionStorage.getItem(`ls_auth_${user}`));
    
    document.getElementById('display-user').textContent = `@${user}`;
    
    // Preenche as chaves de configuração vindas do login (Segurança!)
    document.getElementById('bin-id').value = auth.bin;
    document.getElementById('master-key').value = auth.token;
    
    // Tenta carregar dados existentes do servidor
    loadFromServer(auth.bin, auth.token);
}

// --- 4. COMUNICAÇÃO COM O SERVIDOR (JSONBin) ---
async function loadFromServer(binId, key) {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': key, 'X-Bin-Meta': 'false' }
        });
        if (res.ok) {
            cmsData = await res.json();
            fillInputs();
            renderAllLists();
            renderPreview();
        }
    } catch (e) {
        console.warn("Iniciando com rascunho local ou vazio.");
    }
}

async function syncToCloud() {
    updateState();
    const btn = document.getElementById('btn-sync');
    const { binId, masterKey } = cmsData.config;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> SINCRONIZANDO...`;

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey },
            body: JSON.stringify(cmsData)
        });

        if (res.ok) {
            btn.innerHTML = "🚀 PUBLICADO COM SUCESSO!";
            btn.style.backgroundColor = "#10b981";
            setTimeout(() => {
                btn.innerHTML = "🌐 PUBLICAR NO TOTEM";
                btn.style.backgroundColor = "#1f298f";
                btn.disabled = false;
            }, 3000);
        }
    } catch (e) {
        alert("Erro na publicação!");
        btn.disabled = false;
    }
}

// --- 5. LÓGICA DE NEGÓCIO (LISTAS) ---

function addCategory() {
    const input = document.getElementById('new-cat-name');
    if(!input.value) return;
    cmsData.categories.push({ id: Date.now(), name: input.value });
    input.value = '';
    renderCategories();
}

function openProductModal() {
    if(cmsData.categories.length === 0) return alert("Crie uma categoria primeiro!");
    const name = prompt("Nome do Produto:");
    const price = prompt("Preço (R$):");
    const catIdx = prompt("Selecione a Categoria (Número):\n" + 
                  cmsData.categories.map((c, i) => `${i} - ${c.name}`).join('\n'));
    
    if(name && price && cmsData.categories[catIdx]) {
        cmsData.products.push({
            id: Date.now(),
            name,
            price,
            stock: prompt("Estoque:") || 0,
            image: prompt("URL da Imagem:") || 'https://via.placeholder.com/150',
            category: cmsData.categories[catIdx].name
        });
        renderProducts();
        renderPreview();
    }
}

// --- 6. RENDERIZADORES ---

function renderAllLists() {
    renderCategories();
    renderProducts();
    renderDelivery();
}

function renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = cmsData.categories.map(c => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border animate__animated animate__fadeIn">
            <span class="font-bold text-slate-700">${c.name}</span>
            <button onclick="deleteCategory(${c.id})" class="text-red-500 font-bold">×</button>
        </div>
    `).join('');
}

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = cmsData.products.map(p => `
        <tr class="border-b text-xs animate__animated animate__fadeIn">
            <td class="py-3 flex items-center gap-2 font-bold">${p.name}</td>
            <td>${p.category}</td>
            <td class="text-indigo-600 font-bold">R$ ${p.price}</td>
            <td>${p.stock}</td>
            <td class="text-right">
                <button onclick="deleteProduct(${p.id})" class="text-red-400 font-bold">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// --- 7. AUXILIARES E UI ---

function updateState() {
    cmsData.info = {
        name: document.getElementById('store-name').value,
        phone: document.getElementById('store-phone').value,
        status: document.getElementById('store-status').value,
        address: document.getElementById('store-address').value
    };
    cmsData.design = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        bg: document.getElementById('color-bg').value,
        bgImage: document.getElementById('bg-image-url').value,
        logo: document.getElementById('logo-url').value,
        ytUrl: document.getElementById('yt-music-url').value,
        ytVol: document.getElementById('yt-volume').value
    };
    cmsData.config = {
        binId: document.getElementById('bin-id').value,
        masterKey: document.getElementById('master-key').value
    };
}

function fillInputs() {
    document.getElementById('store-name').value = cmsData.info.name || '';
    document.getElementById('store-phone').value = cmsData.info.phone || '';
    document.getElementById('store-address').value = cmsData.info.address || '';
    document.getElementById('color-primary').value = cmsData.design.primary || '#1f298f';
    document.getElementById('logo-url').value = cmsData.design.logo || '';
    // Adicione os demais campos conforme necessário
}

function logout() {
    if(confirm("Deseja encerrar a sessão?")) {
        const user = window.location.pathname.split('/').reverse()[2];
        sessionStorage.removeItem(`ls_auth_${user}`);
        window.location.href = "../../login.html";
    }
}

// (Funções de deletar, setupNav, setupMobile e renderPreview permanecem iguais à versão Master Ultra anterior)
