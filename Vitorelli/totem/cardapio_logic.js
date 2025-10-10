// ===============================================
// VARIÁVEIS DE CONFIGURAÇÃO E DADOS MOCK (SIMULADOS)
// * Em produção, estes dados viriam de uma API/Banco de Dados
// ===============================================

// Chaves do LocalStorage que serão definidas pelo CMS Admin (index1.html)
const LS_KEYS = {
    PRIMARY_COLOR: 'totem_cor_primaria',
    SECONDARY_COLOR: 'totem_cor_secundaria',
    HEADER_COLOR: 'totem_header_color',
    STORE_STATUS: 'totem_store_status' // Ex: 'aberto' ou 'fechado'
};

// Estrutura de Bairros e Taxas (Exemplo)
const BAIRROS = {
    'Centro': 5.00,
    'Vila Nova': 8.00,
    'Jardim América': 10.00,
    'Retirada': 0.00 // Bairro especial para Retirada
};

// MOCK de Produtos (Substitua por sua lógica real de carregamento)
const DATA_PRODUTOS = [
    { id: 1, categoria: 'Pizzas Salgadas', nome: 'Pizza Margherita', preco: 45.00, descricao: 'Molho de tomate, mussarela e manjericão.', imagem: 'img/margherita.jpg', disponivel: true },
    { id: 2, categoria: 'Pizzas Salgadas', nome: 'Pizza Calabresa', preco: 42.00, descricao: 'Calabresa fatiada, cebola e azeitonas.', imagem: 'img/calabresa.jpg', disponivel: true },
    { id: 3, categoria: 'Bebidas', nome: 'Coca-Cola 2L', preco: 12.00, descricao: 'Refrigerante de cola gelado.', imagem: 'img/coca.jpg', disponivel: true },
    { id: 4, categoria: 'Pizzas Doces', nome: 'Pizza Brigadeiro', preco: 50.00, descricao: 'Massa fina, chocolate e granulado.', imagem: 'img/brigadeiro.jpg', disponivel: true },
    { id: 5, categoria: 'Bebidas', nome: 'Água Mineral', preco: 4.00, descricao: 'Sem gás.', imagem: 'img/agua.jpg', disponivel: false }, // Exemplo de produto indisponível
];

// Carrinho de Pedidos (Estado Global)
let cart = [];
let currentOrderType = null;
let deliveryTax = 0;


// ===============================================
// FUNÇÕES DE TEMAS E ESTILOS (Lê do CMS)
// ===============================================

/**
 * Carrega as cores do LocalStorage (definidas pelo CMS) e aplica ao CSS.
 * Também gerencia o fundo do cabeçalho de forma dinâmica.
 */
function loadAndApplyTheme() {
    const root = document.documentElement;
    const corPrimaria = localStorage.getItem(LS_KEYS.PRIMARY_COLOR) || '#007bff';
    const corSecundaria = localStorage.getItem(LS_KEYS.SECONDARY_COLOR) || '#ffc107';
    const corHeader = localStorage.getItem(LS_KEYS.HEADER_COLOR);
    const status = localStorage.getItem(LS_KEYS.STORE_STATUS) || 'fechado';
    
    // Aplica as variáveis CSS globais
    root.style.setProperty('--cor-primaria', corPrimaria);
    root.style.setProperty('--cor-secundaria', corSecundaria);

    // LÓGICA ESPECÍFICA PARA O CABEÇALHO (O Foco do seu pedido)
    const headerElement = document.querySelector('.main-header');
    if (corHeader) {
        if (corHeader === 'transparent') {
            headerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.0)';
            headerElement.style.boxShadow = 'none';
        } else {
            // Se for uma cor sólida
            headerElement.style.backgroundColor = corHeader;
            // headerElement.style.boxShadow pode ser mantido ou ajustado
        }
    }

    // Atualiza o Status da Loja
    const statusElement = document.getElementById('status-loja');
    if (statusElement) {
        statusElement.textContent = status.toUpperCase();
        statusElement.className = 'status-badge px-3 py-1 rounded-full text-xs font-semibold';
        if (status === 'aberto') {
            statusElement.classList.add('bg-green-500', 'text-white');
        } else {
            statusElement.classList.add('bg-red-500', 'text-white');
        }
    }
}


// ===============================================
// FUNÇÕES DE RENDERIZAÇÃO DO CARDÁPIO
// ===============================================

/**
 * Renderiza o menu de categorias.
 * @param {string} activeCategory - Categoria atualmente ativa.
 */
function renderCategoryMenu(activeCategory = 'Pizzas Salgadas') {
    const menuContainer = document.getElementById('category-menu');
    if (!menuContainer) return;
    
    // Extrai categorias únicas
    const categories = [...new Set(DATA_PRODUTOS.map(p => p.categoria))];
    
    menuContainer.innerHTML = ''; // Limpa o menu
    
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
    
    // Filtra os produtos para a categoria inicial
    filterProducts(activeCategory);
}

/**
 * Filtra e renderiza os produtos de uma categoria.
 * @param {string} category - A categoria a ser exibida.
 */
function filterProducts(category) {
    // 1. Atualiza o estado visual dos botões de categoria
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category) {
            btn.classList.add('active');
        }
    });

    // 2. Filtra os produtos
    const filteredProducts = DATA_PRODUTOS.filter(p => p.categoria === category);
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
            const cardClass = isAvailable ? '' : 'indisponivel';
            
            html += `
                <div class="product-card ${cardClass}" data-product-id="${product.id}" onclick="${isAvailable ? `addToCart(${product.id})` : ''}">
                    <img class="product-img" src="${product.imagem}" alt="${product.nome}" onerror="this.src='placeholder.png'">
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

/**
 * Adiciona um produto ao carrinho ou aumenta sua quantidade.
 * @param {number} productId - ID do produto.
 */
function addToCart(productId) {
    const product = DATA_PRODUTOS.find(p => p.id === productId);
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

/**
 * Atualiza a quantidade de um item no carrinho.
 * @param {number} productId - ID do produto.
 * @param {number} change - +1 para aumentar, -1 para diminuir.
 */
function updateCartItemQty(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1); // Remove se a quantidade for 0
        }
        
        updateCartUI();
    }
}

/**
 * Remove completamente um item do carrinho.
 * @param {number} productId - ID do produto.
 */
function removeCartItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}


/**
 * Atualiza a interface do carrinho (lista de itens, contagem e resumo).
 */
function updateCartUI() {
    const cartList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartSummary = document.getElementById('cart-summary');
    
    // 1. Atualiza a contagem do botão flutuante
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;
    
    // 2. Renderiza a lista de itens
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
                    <button onclick="updateCartItemQty(${item.id}, -1)" class="w-7 h-7 rounded-full text-lg"><i class="fas fa-minus"></i></button>
                    <span class="item-qty">${item.qty}</span>
                    <button onclick="updateCartItemQty(${item.id}, 1)" class="w-7 h-7 rounded-full text-lg"><i class="fas fa-plus"></i></button>
                    <button onclick="removeCartItem(${item.id})" class="w-7 h-7 rounded-full text-red-500 hover:text-white hover:bg-red-500"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');
    }

    // 3. Renderiza o resumo de totais
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    const totalGeral = subtotal + deliveryTax;
    
    cartSummary.innerHTML = `
        <div class="flex justify-between text-md text-gray-600 mb-1">
            <span>Subtotal:</span>
            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
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

    // Garante que o Drawer só apareça se houver itens
    if (cart.length > 0) {
        document.getElementById('cart-button').style.display = 'flex';
    } else {
        document.getElementById('cart-button').style.display = 'none';
        closeOrderDrawer(); // Fecha o drawer se o carrinho esvaziar
    }
}


// ===============================================
// FUNÇÕES DE GERENCIAMENTO DO DRAWER DE PEDIDO
// ===============================================

/** Abre o painel lateral do pedido. */
function openOrderDrawer() {
    if (cart.length === 0) return;
    document.getElementById('order-drawer').classList.add('open');
    document.getElementById('order-overlay').classList.add('active');
    
    // Garante que o primeiro passo seja exibido ao abrir
    resetOrderStep();
}

/** Fecha o painel lateral do pedido. */
function closeOrderDrawer() {
    document.getElementById('order-drawer').classList.remove('open');
    document.getElementById('order-overlay').classList.remove('active');
}

/** Esconde todos os passos e mostra o inicial. */
function resetOrderStep() {
    currentOrderType = null;
    deliveryTax = 0;
    document.getElementById('order-options-step').classList.remove('hidden');
    document.getElementById('form-retirada').classList.add('hidden');
    document.getElementById('form-delivery').classList.add('hidden');
    updateCartUI(); // Recalcula o total sem taxa
}

/**
 * Seleciona o tipo de pedido e avança para o formulário correspondente.
 * @param {string} type - 'retirada' ou 'delivery'.
 */
function selectOrderType(type) {
    if (cart.length === 0) return;
    
    currentOrderType = type;
    document.getElementById('order-options-step').classList.add('hidden');

    // Esconde/Mostra os formulários
    if (type === 'retirada') {
        document.getElementById('form-delivery').classList.add('hidden');
        document.getElementById('form-retirada').classList.remove('hidden');
    } else if (type === 'delivery') {
        document.getElementById('form-retirada').classList.add('hidden');
        document.getElementById('form-delivery').classList.remove('hidden');
        renderBairroOptions(); // Renderiza as opções de bairro
        updateDeliveryTax(); // Inicializa a taxa de entrega
    }
}

/** Renderiza a lista de bairros no formulário de Delivery. */
function renderBairroOptions() {
    const select = document.getElementById('delivery-bairro');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione seu Bairro...</option>';
    
    Object.keys(BAIRROS).forEach(bairro => {
        if (bairro !== 'Retirada') { // Exclui a opção Retirada
            const option = document.createElement('option');
            option.value = bairro;
            option.textContent = `${bairro} (R$ ${BAIRROS[bairro].toFixed(2).replace('.', ',')})`;
            select.appendChild(option);
        }
    });
}

/** Atualiza a taxa de entrega e o total do carrinho. */
function updateDeliveryTax() {
    const selectedBairro = document.getElementById('delivery-bairro').value;
    deliveryTax = BAIRROS[selectedBairro] || 0;
    
    const infoElement = document.getElementById('taxa-entrega-info');
    infoElement.textContent = `Taxa de Entrega: R$ ${deliveryTax.toFixed(2).replace('.', ',')}`;
    
    updateCartUI();
}

// ===============================================
// INICIALIZAÇÃO E LISTENERS DE EVENTOS
// ===============================================

/** Função principal de inicialização */
function init() {
    loadAndApplyTheme();
    renderCategoryMenu();
    updateCartUI();
    
    // Adiciona listener para submissão dos formulários (Simulação de Envio)
    document.getElementById('form-retirada').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-delivery').addEventListener('submit', handleFormSubmit);

    // Esconde o botão da comanda se o carrinho estiver vazio na inicialização
    document.getElementById('cart-button').style.display = 'none';
}

/** Lida com o envio do formulário (simulando envio para WhatsApp) */
function handleFormSubmit(event) {
    event.preventDefault();
    
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

    // Detalhes dos Itens
    mensagem += `*ITENS DO PEDIDO (${cart.length} itens distintos)*:\n`;
    cart.forEach(item => {
        mensagem += `• ${item.qty}x ${item.nome} (R$ ${(item.preco * item.qty).toFixed(2).replace('.', ',')})\n`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    const totalGeral = subtotal + deliveryTax;

    mensagem += `\n*RESUMO DE VALORES:*\n`;
    mensagem += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (currentOrderType === 'delivery') {
        mensagem += `Taxa de Entrega: R$ ${deliveryTax.toFixed(2).replace('.', ',')}\n`;
    }
    mensagem += `TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`;

    // Monta o link do WhatsApp
    const whatsappNumber = '5511999999999'; // Coloque o número do seu WhatsApp aqui
    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    // Abre a URL
    window.open(whatsappURL, '_blank');

    // Limpa o carrinho e fecha o drawer
    cart = [];
    currentOrderType = null;
    deliveryTax = 0;
    updateCartUI();
    closeOrderDrawer();
    alert(`Pedido de ${nomeCliente} enviado com sucesso!`);
}


// Inicia o script quando a página estiver totalmente carregada
document.addEventListener('DOMContentLoaded', init);
