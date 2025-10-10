// ===========================================
// CONFIGURAÇÃO CRÍTICA JSONBIN.io
// ===========================================
// *** PREENCHA COM SEUS DADOS! ***
const BIN_ID = "SEU_BIN_ID_AQUI"; // <-- ID do Bin (O mesmo do CMS)
const ACCESS_KEY = "SUA_CHAVE_DE_ACESSO_AQUI"; // <-- Sua Chave de Acesso (Leitura). Deixe "" se o Bin for público.

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ===========================================
// VARIÁVEIS DE ESTADO GLOBAL (Serão populadas pelo JSONBin)
// ===========================================
const LS_KEYS = {
    PRIMARY_COLOR: 'totem_cor_primaria',
    SECONDARY_COLOR: 'totem_cor_secundaria',
    HEADER_COLOR: 'totem_header_color',
    STORE_STATUS: 'totem_store_status'
};

let DADOS_INSTITUCIONAIS = {};
let DADOS_LAYOUT = {};
let DADOS_OPERACIONAIS = {};
let CARDAPIO_DATA = [];
let COBERTURA_DATA = [];

// Carrinho de Pedidos (Estado Global)
let cart = [];
let currentOrderType = null;
let deliveryTax = 0;


// ===============================================
// FUNÇÕES DE CARREGAMENTO REMOTO JSONBIN (GET)
// ===============================================

async function carregarDadosDoCardapio() {
    try {
        const headers = {};
        if (ACCESS_KEY && ACCESS_KEY.length > 0) {
            // Essa linha é CRÍTICA se seu Bin for PRIVADO
            headers['X-Access-Key'] = ACCESS_KEY; 
        }

        const response = await fetch(JSONBIN_URL + '/latest', {
            method: 'GET',
            headers: headers,
            // ESSENCIAL para garantir que o navegador não use cache antigo
            cache: 'no-store' 
        });

        if (!response.ok) {
            throw new Error(`Falha ao carregar dados. Status: ${response.status}. Verifique as chaves.`);
        }

        const result = await response.json();
        // Acessa o objeto principal de dados
        const data = result.record.data || result.record; 

        // 1. POPULAÇÃO DAS VARIÁVEIS GLOBAIS
        DADOS_INSTITUCIONAIS = data.institucional || {};
        DADOS_OPERACIONAIS = data.operacionais || {};
        DADOS_LAYOUT = data.layout || {};
        CARDAPIO_DATA = data.cardapio || [];
        COBERTURA_DATA = DADOS_OPERACIONAIS.cobertura || []; // Array de {bairro, taxa}
        
        // 2. ATUALIZAÇÃO DO LOCAL STORAGE (para tema e status)
        localStorage.setItem(LS_KEYS.PRIMARY_COLOR, DADOS_LAYOUT.corPrimaria || '#007bff');
        localStorage.setItem(LS_KEYS.SECONDARY_COLOR, DADOS_LAYOUT.corSecundaria || '#ffc107');
        localStorage.setItem(LS_KEYS.HEADER_COLOR, DADOS_LAYOUT.corCabecalho || '#FFFFFF');
        localStorage.setItem(LS_KEYS.STORE_STATUS, DADOS_OPERACIONAIS.status || 'fechado');
        
        // 3. ATUALIZAÇÃO DE ELEMENTOS INICIAIS
        document.getElementById('store-name-title').textContent = DADOS_INSTITUCIONAIS.nome || 'Cardápio Digital';
        document.getElementById('store-name-header').textContent = DADOS_INSTITUCIONAIS.nome || 'Cardápio Digital';
        
        // 4. RENDERIZAÇÃO
        loadAndApplyTheme(); 
        
        const initialCategory = CARDAPIO_DATA.filter(p => p.disponivel)[0]?.categoria || null;
        if (initialCategory) {
            renderCategoryMenu(initialCategory);
        } else {
             document.getElementById('cardapio-container').innerHTML = '<p class="text-center p-8 text-gray-500">Cardápio vazio ou sem produtos disponíveis no momento.</p>';
             renderCategoryMenu(null);
        }
        
        updateCartUI(); 
        
    } catch (error) {
        console.error('❌ Erro de Carregamento:', error);
        document.getElementById('cardapio-container').innerHTML = `
            <div class="text-center bg-red-100 p-6 rounded-lg my-10 border border-red-300">
                <p class="text-red-700 font-bold mb-2">ERRO CRÍTICO DE CONEXÃO!</p>
                <p class="text-sm text-red-600">Não foi possível carregar os dados. Verifique se o BIN_ID e ACCESS_KEY estão corretos e se o Bin está ativo.</p>
            </div>
        `;
    }
}

// ===============================================
// FUNÇÕES DE TEMAS E ESTILOS (Lê do CMS/LocalStorage)
// ===============================================

function loadAndApplyTheme() {
    const root = document.documentElement;
    const corPrimaria = localStorage.getItem(LS_KEYS.PRIMARY_COLOR) || '#007bff';
    const corSecundaria = localStorage.getItem(LS_KEYS.SECONDARY_COLOR) || '#ffc107';
    const corHeader = localStorage.getItem(LS_KEYS.HEADER_COLOR) || '#FFFFFF'; // Lendo do Storage
    const status = localStorage.getItem(LS_KEYS.STORE_STATUS) || 'fechado';
    
    // Aplica as variáveis CSS globais
    root.style.setProperty('--cor-primaria', corPrimaria);
    root.style.setProperty('--cor-secundaria', corSecundaria);

    // LÓGICA ESPECÍFICA PARA O CABEÇALHO
    const headerElement = document.querySelector('.main-header');
    if (headerElement) {
        if (corHeader.toUpperCase() === 'TRANSPARENTE') {
            headerElement.style.backgroundColor = 'transparent';
            headerElement.classList.remove('shadow-md', 'bg-white');
            headerElement.classList.add('shadow-none');
        } else {
            headerElement.style.backgroundColor = corHeader;
            headerElement.classList.remove('shadow-none', 'bg-transparent');
            headerElement.classList.add('shadow-md');
        }
    }

    // Atualiza o Status da Loja
    const statusElement = document.getElementById('status-loja');
    let statusText = 'FECHADO';
    let statusClasses = 'bg-red-500';

    if (status === 'aberto') {
        statusText = 'ABERTO';
        statusClasses = 'bg-green-500';
    } else if (status === 'pausa') {
        statusText = 'PAUSA';
        statusClasses = 'bg-yellow-500';
    }
    
    if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.className = `status-badge px-3 py-1 rounded-full text-xs font-semibold ${statusClasses} text-white`;
    }
}


// ===============================================
// FUNÇÕES DE RENDERIZAÇÃO DO CARDÁPIO
// ===============================================

function renderCategoryMenu(activeCategory) {
    const menuContainer = document.getElementById('category-menu');
    if (!menuContainer) return;
    
    // Extrai categorias únicas dos produtos DISPONÍVEIS
    const availableProducts = CARDAPIO_DATA.filter(p => p.disponivel);
    const categories = [...new Set(availableProducts.map(p => p.categoria).filter(c => c))];
    
    menuContainer.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-button';
        if (category === activeCategory) {
            button.classList.add('active');
        }
        button.onclick = () => filterProducts(category);
        menuContainer.appendChild(button);
    });
    
    if (activeCategory) {
       filterProducts(activeCategory);
    }
}

function filterProducts(category) {
    // 1. Atualiza o estado visual dos botões de categoria
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category) {
            btn.classList.add('active');
        }
    });

    // 2. Filtra os produtos
    const filteredProducts = CARDAPIO_DATA.filter(p => p.categoria === category);
    const cardapioContainer = document.getElementById('cardapio-container');
    if (!cardapioContainer) return;

    let html = `<h2 class="categoria-titulo">${category}</h2>`;
    
    if (filteredProducts.length === 0) {
        html += `<p class="text-center p-8 text-gray-500">Nenhum produto encontrado nesta categoria.</p>`;
    } else {
        filteredProducts.forEach(product => {
            const isAvailable = product.disponivel;
            const buttonClass = isAvailable ? 'btn-add' : 'btn-indisponivel';
            const buttonText = isAvailable ? `<i class="fas fa-plus mr-1"></i> Adicionar` : 'Indisponível';
            const cardClass = isAvailable ? '' : 'indisponivel opacity-50 cursor-not-allowed';
            
            html += `
                <div class="product-card ${cardClass}" data-product-id="${product.id}" onclick="${isAvailable ? `addToCart('${product.id}')` : ''}">
                    <img class="product-img" src="${product.urlImagem || 'placeholder.png'}" alt="${product.nome}" onerror="this.src='https://via.placeholder.com/100?text=Sem+Foto'">
                    <div class="product-info">
                        <h3 class="text-lg font-semibold text-gray-800">${product.nome}</h3>
                        <p class="product-description">${product.descricao}</p>
                        <div class="product-footer">
                            <span class="product-price">R$ ${product.preco.toFixed(2).replace('.', ',')}</span>
                            <button class="${buttonClass}" ${isAvailable ? '' : 'disabled'}>${buttonText}</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    cardapioContainer.innerHTML = html;
}


// ===============================================
// FUNÇÕES DE GERENCIAMENTO DO CARRINHO
// ===============================================

function addToCart(productId) {
    // Procura o produto no array de dados vindo do JSONBin
    const product = CARDAPIO_DATA.find(p => p.id === productId);
    if (!product || !product.disponivel) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: productId,
            nome: product.nome,
            preco: product.preco,
            qty: 1
        });
    }

    updateCartUI();
}

function updateCartItemQty(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateCartUI();
    }
}

function removeCartItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartSummary = document.getElementById('cart-summary');
    
    // 1. Atualiza a contagem do botão flutuante
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;
    
    // 2. Renderiza a lista de itens
    // ... (Mantida a lógica do usuário)

    if (cart.length === 0) {
        cartList.innerHTML = `<p class="text-center text-gray-500 p-4">Seu carrinho está vazio.</p>`;
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-details flex-grow">
                    <h4>${item.nome}</h4>
                    <span class="text-sm text-gray-500">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="item-controls">
                    <button onclick="updateCartItemQty('${item.id}', -1)" class="w-7 h-7 rounded-full text-lg"><i class="fas fa-minus"></i></button>
                    <span class="item-qty">${item.qty}</span>
                    <button onclick="updateCartItemQty('${item.id}', 1)" class="w-7 h-7 rounded-full text-lg"><i class="fas fa-plus"></i></button>
                    <button onclick="removeCartItem('${item.id}')" class="w-7 h-7 rounded-full text-red-500 hover:text-white hover:bg-red-500"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');
    }
    
    // 3. Renderiza o resumo de totais
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    
    const taxaServico = DADOS_LAYOUT.taxaServico || 0;
    const valorTaxaServico = subtotal * (taxaServico / 100);
    
    const totalParcial = subtotal + valorTaxaServico;
    const totalGeral = totalParcial + deliveryTax;
    
    cartSummary.innerHTML = `
        <div class="flex justify-between text-md text-gray-600 mb-1">
            <span>Subtotal:</span>
            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        ${taxaServico > 0 ? `
            <div class="flex justify-between text-md text-gray-600 mb-1">
                <span>Taxa de Serviço (${taxaServico}%):</span>
                <span>R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}</span>
            </div>
        ` : ''}
        ${currentOrderType === 'delivery' ? `
            <div class="flex justify-between text-md text-red-500 mb-2">
                <span>Taxa de Entrega:</span>
                <span>R$ ${deliveryTax.toFixed(2).replace('.', ',')}</span>
            </div>
        ` : ''}
        <div class="flex justify-between text-xl font-bold border-t pt-2 mt-2">
            <span>Total:</span>
            <span>R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
        </div>
    `;

    if (cart.length > 0) {
        document.getElementById('cart-button').classList.remove('hidden');
    } else {
        document.getElementById('cart-button').classList.add('hidden');
        closeOrderDrawer();
    }
}


// ===============================================
// FUNÇÕES DE GERENCIAMENTO DO DRAWER DE PEDIDO
// ===============================================

function openOrderDrawer() {
    if (cart.length === 0) return;
    document.getElementById('order-drawer').classList.add('open');
    document.getElementById('order-overlay').classList.add('active');
    resetOrderStep();
}

function closeOrderDrawer() {
    document.getElementById('order-drawer').classList.remove('open');
    document.getElementById('order-overlay').classList.remove('active');
}

function resetOrderStep() {
    currentOrderType = null;
    deliveryTax = 0;
    document.getElementById('order-options-step').classList.remove('hidden');
    document.getElementById('form-retirada').classList.add('hidden');
    document.getElementById('form-delivery').classList.add('hidden');
    updateCartUI();
}

function selectOrderType(type) {
    if (cart.length === 0) return;
    
    // Verificação de Mínimo de Pedido
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    const minimoPedido = DADOS_LAYOUT.minimoPedido || 0;
    if (minimoPedido > 0 && subtotal < minimoPedido) {
        alert(`O valor mínimo do pedido é R$ ${minimoPedido.toFixed(2).replace('.', ',')}. Seu subtotal atual é R$ ${subtotal.toFixed(2).replace('.', ',')}.`);
        return;
    }
    
    currentOrderType = type;
    document.getElementById('order-options-step').classList.add('hidden');

    if (type === 'retirada') {
        document.getElementById('form-delivery').classList.add('hidden');
        document.getElementById('form-retirada').classList.remove('hidden');
    } else if (type === 'delivery') {
        document.getElementById('form-retirada').classList.add('hidden');
        document.getElementById('form-delivery').classList.remove('hidden');
        renderBairroOptions(); 
        updateDeliveryTax();
    }
}

function renderBairroOptions() {
    const select = document.getElementById('delivery-bairro');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione seu Bairro...</option>';
    
    // Itera sobre o array COBERTURA_DATA vindo do JSONBin
    COBERTURA_DATA.forEach(item => {
        if (item.bairro.toLowerCase() !== 'retirada') {
            const option = document.createElement('option');
            option.value = item.bairro;
            option.textContent = `${item.bairro} (R$ ${item.taxa.toFixed(2).replace('.', ',')})`;
            select.appendChild(option);
        }
    });
}

function updateDeliveryTax() {
    const selectedBairro = document.getElementById('delivery-bairro').value;
    
    // Encontra a taxa no array COBERTURA_DATA
    const selectedCoverage = COBERTURA_DATA.find(item => item.bairro === selectedBairro);
    
    deliveryTax = selectedCoverage ? selectedCoverage.taxa : 0;
    
    const infoElement = document.getElementById('taxa-entrega-info');
    infoElement.textContent = `Taxa de Entrega: R$ ${deliveryTax.toFixed(2).replace('.', ',')}`;
    
    updateCartUI();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Verificação de Loja Aberta
    const storeStatus = localStorage.getItem(LS_KEYS.STORE_STATUS);
    if (storeStatus !== 'aberto') {
        alert("A loja está fechada ou em pausa e não está aceitando pedidos no momento.");
        return;
    }
    
    // Montagem da Mensagem (Mantida a lógica do usuário)
    let mensagem = "";
    let nomeCliente = "";

    if (currentOrderType === 'retirada') {
        nomeCliente = document.getElementById('retirada-nome').value;
        mensagem = `*PEDIDO PARA RETIRADA*\nCliente: ${nomeCliente}\n\n`;
    } else if (currentOrderType === 'delivery') {
        nomeCliente = document.getElementById('delivery-nome').value;
        const endereco = document.getElementById('delivery-endereco').value;
        const numero = document.getElementById('delivery-numero').value;
        const bairro = document.getElementById('delivery-bairro').value;
        
        mensagem = `*PEDIDO PARA ENTREGA*\nCliente: ${nomeCliente}\nEndereço: ${endereco}, ${numero} - ${bairro}\nTaxa: R$ ${deliveryTax.toFixed(2).replace('.', ',')}\n\n`;
    }

    mensagem += `*ITENS DO PEDIDO (${cart.length} itens distintos)*:\n`;
    cart.forEach(item => {
        mensagem += `• ${item.qty}x ${item.nome} (R$ ${(item.preco * item.qty).toFixed(2).replace('.', ',')})\n`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    const taxaServico = DADOS_LAYOUT.taxaServico || 0;
    const valorTaxaServico = subtotal * (taxaServico / 100);
    const totalGeral = subtotal + valorTaxaServico + deliveryTax;

    mensagem += `\n*RESUMO DE VALORES:*\n`;
    mensagem += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (taxaServico > 0) {
         mensagem += `Taxa de Serviço (${taxaServico}%): R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}\n`;
    }
    if (currentOrderType === 'delivery') {
        mensagem += `Taxa de Entrega: R$ ${deliveryTax.toFixed(2).replace('.', ',')}\n`;
    }
    mensagem += `TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`;

    // Informação de pagamento
    if (DADOS_INSTITUCIONAIS.msgPagamento) {
        mensagem += `\n*INFORMAÇÃO DE PAGAMENTO:*\n${DADOS_INSTITUCIONAIS.msgPagamento}\n`;
    }

    // Monta o link do WhatsApp
    const whatsappNumber = DADOS_INSTITUCIONAIS.telPrincipal || '5511999999999'; 
    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');

    cart = [];
    currentOrderType = null;
    deliveryTax = 0;
    updateCartUI();
    closeOrderDrawer();
    alert(`Pedido de ${nomeCliente} enviado com sucesso! Aguarde a confirmação no WhatsApp.`);
}


// ===============================================
// INICIALIZAÇÃO
// ===============================================

function init() {
    // 1. CARREGA DADOS REMOTOS E RENDERIZA O TEMA/MENU
    carregarDadosDoCardapio();
    
    // 2. ADICIONA LISTENERS
    document.getElementById('cart-button').addEventListener('click', openOrderDrawer);
    document.getElementById('order-overlay').addEventListener('click', closeOrderDrawer);
    document.getElementById('form-retirada').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-delivery').addEventListener('submit', handleFormSubmit);
}

document.addEventListener('DOMContentLoaded', init);
