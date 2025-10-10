// ===============================================
// CONFIGURAÇÃO DO CARDÁPIO (TOTEM)
// ===============================================

// IMPORTANTE: Confirme que este é o Bin ID correto do seu JSONBin.io
const BIN_ID = '68e8478a43b1c97be960ce0c'; 
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

const cardapioContainer = document.getElementById('cardapio-container');
const dadosConfiguracao = {}; 
let carrinho = {}; // { produtoId: { item: {}, quantidade: 0 } }
let currentOrderStep = 'options'; // NOVO: Controla o passo atual: 'options', 'retirada', 'delivery'

// ===============================================
// FUNÇÕES DE UI DO PEDIDO/DRAWER (SUBSTITUI openCart/closeCart)
// ===============================================

function openOrderDrawer() {
    const { totalItens } = calcularTotais();
    if (totalItens === 0) {
         alert("Seu carrinho está vazio. Adicione itens antes de prosseguir com o pedido.");
         return;
    }
    document.getElementById('order-drawer').classList.add('open');
    document.getElementById('order-overlay').classList.add('active');
    renderizarCarrinho(); // Garante que o resumo está atualizado
    renderOrderStep();
}

function closeOrderDrawer() {
    document.getElementById('order-drawer').classList.remove('open');
    document.getElementById('order-overlay').classList.remove('active');
    resetOrderStep(); // Volta para a tela de opções quando fechar
}

function resetOrderStep() {
    currentOrderStep = 'options';
    renderOrderStep();
    // Limpa campos de formulário para evitar persistência
    document.getElementById('form-retirada').reset();
    document.getElementById('form-delivery').reset();
}

function renderOrderStep() {
    // Esconde todos os passos
    document.getElementById('order-options-step').classList.add('hidden');
    document.getElementById('form-retirada').classList.add('hidden');
    document.getElementById('form-delivery').classList.add('hidden');

    switch (currentOrderStep) {
        case 'options':
            document.getElementById('order-options-step').classList.remove('hidden');
            break;
        case 'retirada':
            document.getElementById('form-retirada').classList.remove('hidden');
            renderPaymentOptions('retirada');
            break;
        case 'delivery':
            document.getElementById('form-delivery').classList.remove('hidden');
            renderBairroOptions();
            renderPaymentOptions('delivery');
            updateDeliveryTax(); // Garante que a taxa inicial é exibida
            break;
    }
}

function selectOrderType(type) {
    currentOrderStep = type;
    renderOrderStep();
}


// ===============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS E CONFIGURAÇÃO
// ===============================================

async function carregarDados() {
    try {
        const statusLoja = document.getElementById('status-loja');
        statusLoja.textContent = 'Carregando Cardápio...';
        
        const response = await fetch(JSONBIN_URL);
        
        if (!response.ok) {
            throw new Error(`Falha ao buscar dados: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const dataRecord = result.record.data || result.record;
        
        Object.keys(dadosConfiguracao).forEach(key => delete dadosConfiguracao[key]);
        Object.assign(dadosConfiguracao, dataRecord);

        if (Object.keys(dadosConfiguracao).length === 0 || !dadosConfiguracao.institucional) {
             throw new Error("Dados de configuração inválidos ou Bin vazio.");
        }

        const produtos = dadosConfiguracao.cardapio || [];
        renderizarMenuCategorias(produtos);
        renderizarCardapio(produtos); 
        aplicarConfiguracoes();
        
    } catch (error) {
        console.error("Erro ao carregar dados do JSONBin:", error);
        document.getElementById('status-loja').textContent = '❌ Erro no Cardápio. Tente recarregar.';
    }
}

function aplicarConfiguracoes() {
    const institucional = dadosConfiguracao.institucional || {};
    const operacionais = dadosConfiguracao.operacionais || {};
    const layout = dadosConfiguracao.layout || {};
    
    // Aplica layout e estilos dinâmicos (CSS Variables)
    document.documentElement.style.setProperty('--cor-primaria', layout.corPrimaria || '#007bff');
    document.documentElement.style.setProperty('--cor-secundaria', layout.corSecundaria || '#ffc107');
    document.documentElement.style.setProperty('--cor-fundo', layout.corFundo || '#f3f4f6');
    document.documentElement.style.setProperty('--cor-botao-carrinho', layout.corBotaoCarrinho || '#25D366'); // NOVO
    document.body.style.backgroundImage = layout.backgroundUrl ? `url(${layout.backgroundUrl})` : 'none';
    document.body.style.fontFamily = layout.fonte || "'Segoe UI', sans-serif";
    
    // Aplica dados institucionais e status
    document.title = institucional.nome || 'Cardápio Digital';
    
    const nomeLojaHeader = document.getElementById('header-loja-nome');
    if (nomeLojaHeader) {
        nomeLojaHeader.textContent = institucional.nome || 'Nome da Loja';
    }
    
    const logoElement = document.getElementById('loja-logo');
    if (logoElement) {
        logoElement.src = institucional.urlLogo || 'placeholder_logo.png';
        logoElement.alt = `Logo de ${institucional.nome}`;
    }

    // Atualiza status da loja
    const statusLoja = document.getElementById('status-loja');
    const status = operacionais.status || 'fechado';
    statusLoja.textContent = status.toUpperCase();
    statusLoja.className = `status-badge ${status}`;
}


// ===============================================
// FUNÇÕES DE FILTRO E RENDERIZAÇÃO (Permanece)
// ===============================================

function extrairCategorias(produtos) {
    const categorias = new Set(['TODOS']);
    produtos.forEach(p => {
        if (p.categoria) {
            // Garante que a primeira letra é maiúscula para exibição
            const catFormatada = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1);
            categorias.add(catFormatada);
        }
    });
    return Array.from(categorias);
}

function renderizarMenuCategorias(produtos) {
    const categorias = extrairCategorias(produtos);
    const menu = document.getElementById('category-menu');
    menu.innerHTML = '';

    categorias.forEach(categoria => {
        const button = document.createElement('button');
        button.className = 'category-button';
        button.textContent = categoria;
        button.setAttribute('data-category', categoria);
        button.onclick = () => filtrarCardapio(categoria, button);
        menu.appendChild(button);
    });
    
    // Ativa o botão 'TODOS' por padrão
    const todosButton = menu.querySelector('[data-category="TODOS"]');
    if (todosButton) {
        todosButton.classList.add('active');
    }
}

function filtrarCardapio(categoria, clickedButton) {
    // 1. Remove 'active' de todos os botões
    document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
    
    // 2. Adiciona 'active' ao botão clicado
    clickedButton.classList.add('active');

    // 3. Filtra e renderiza
    let produtosParaRenderizar = dadosConfiguracao.cardapio || [];

    if (categoria !== 'TODOS') {
        // Filtra comparando a categoria do produto com a categoria selecionada (ignora case)
        produtosParaRenderizar = produtosParaRenderizar
            .filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    renderizarCardapio(produtosParaRenderizar);
}


function renderizarCardapio(produtos) {
    if (produtos.length === 0) {
        cardapioContainer.innerHTML = '<p class="text-center p-8 text-white">Nenhum produto disponível nesta categoria.</p>';
        return;
    }

    cardapioContainer.innerHTML = '';
    let categoriaAtual = '';

    // Garante que o array está ordenado pela categoria para que o agrupamento funcione
    const produtosOrdenados = [...produtos].sort((a, b) => a.categoria.localeCompare(b.categoria));


    produtosOrdenados.forEach(produto => {
        // Se a categoria mudou, adiciona um novo título
        if (produto.categoria !== categoriaAtual) {
            categoriaAtual = produto.categoria;
            const tituloCategoria = document.createElement('h2');
            tituloCategoria.className = 'categoria-titulo';
            tituloCategoria.textContent = categoriaAtual;
            cardapioContainer.appendChild(tituloCategoria);
        }

        const card = document.createElement('div');
        card.className = `product-card ${produto.disponivel ? 'disponivel' : 'indisponivel'}`;
        card.id = `prod-${produto.id}`;
        
        const btnAdd = produto.disponivel 
            ? `<button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}')"><i class="fas fa-plus"></i> Adicionar</button>`
            : `<button class="btn-indisponivel" disabled>Indisponível</button>`;

        card.innerHTML = `
            <img src="${produto.urlImagem || 'placeholder_img.png'}" alt="${produto.nome}" class="product-img">
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p class="product-description">${produto.descricao || 'Sem descrição.'}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                    ${btnAdd}
                </div>
            </div>
        `;
        cardapioContainer.appendChild(card);
    });
}


// ===============================================
// FUNÇÕES DE LÓGICA E RENDERIZAÇÃO DO CARRINHO
// ===============================================

function calcularTotais(taxaEntrega = 0.00) {
    let subtotal = 0;
    let totalItens = 0;

    const itensCarrinho = Object.values(carrinho);
    
    itensCarrinho.forEach(itemCarrinho => {
        subtotal += itemCarrinho.quantidade * itemCarrinho.item.preco;
        totalItens += itemCarrinho.quantidade;
    });

    const taxaServicoPercentual = (dadosConfiguracao.layout?.taxaServico || 0) / 100;
    const valorTaxaServico = subtotal * taxaServicoPercentual;
    
    // NOVO: Adiciona a taxa de entrega ao total
    const totalGeral = subtotal + valorTaxaServico + taxaEntrega; 

    return { subtotal, valorTaxaServico, taxaEntrega, totalGeral, totalItens };
}

function renderizarCarrinho() {
    // 1. Obtém a taxa de entrega atual (se estiver no passo de Delivery e com bairro selecionado)
    let taxaEntregaAtual = 0.00;
    const selectBairro = document.getElementById('delivery-bairro');
    if (currentOrderStep === 'delivery' && selectBairro.value) {
         const selectedOption = selectBairro.options[selectBairro.selectedIndex];
         taxaEntregaAtual = parseFloat(selectedOption.getAttribute('data-taxa')) || 0.00;
    }

    const { subtotal, valorTaxaServico, taxaEntrega, totalGeral, totalItens } = calcularTotais(taxaEntregaAtual);
    const taxaServicoPercentual = dadosConfiguracao.layout?.taxaServico || 0;
    
    // 2. Renderiza os ITENS no preview do drawer
    const lista = document.getElementById('cart-items-list');
    lista.innerHTML = '';
    
    const itensCarrinho = Object.values(carrinho);
    if (itensCarrinho.length === 0) {
        lista.innerHTML = '<p class="text-center text-gray-500 p-4">Seu carrinho está vazio.</p>';
    } else {
        itensCarrinho.forEach(itemCarrinho => {
            const { item, quantidade } = itemCarrinho;
            const subtotalItem = quantidade * item.preco;
            
            const itemHtml = document.createElement('div');
            itemHtml.className = 'cart-item';
            itemHtml.innerHTML = `
                <div class="item-details">
                    <h4 class="font-semibold">${item.nome}</h4>
                    <span class="text-sm text-gray-500">R$ ${item.preco.toFixed(2).replace('.', ',')} / und</span>
                </div>
                <div class="item-controls">
                     <button onclick="mudarQuantidade('${item.id}', -1)" class="w-6 h-6 text-sm bg-gray-200 border-none rounded-full"><i class="fas fa-minus"></i></button>
                    <span class="item-qty">${quantidade}</span>
                    <button onclick="mudarQuantidade('${item.id}', 1)" class="w-6 h-6 text-sm bg-gray-200 border-none rounded-full"><i class="fas fa-plus"></i></button>
                    <span class="font-bold text-red-500 ml-3 text-sm">R$ ${subtotalItem.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            lista.appendChild(itemHtml);
        });
    }


    // 3. Renderiza o RESUMO TOTAL no drawer
    const summaryContainer = document.getElementById('cart-summary');
    summaryContainer.innerHTML = `
        <div class="flex justify-between font-semibold mb-1">
            <span>Subtotal:</span>
            <span id="subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-600">
            <span>Taxa de Serviço (${taxaServicoPercentual}%):</span>
            <span id="taxa-servico">R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}</span>
        </div>
        ${taxaEntrega > 0 ? `
            <div class="flex justify-between text-sm text-gray-600 font-bold text-green-600">
                <span>Taxa de Entrega:</span>
                <span id="taxa-entrega">R$ ${taxaEntrega.toFixed(2).replace('.', ',')}</span>
            </div>` : ''}
        <div class="flex justify-between font-extrabold text-lg mt-2 pt-2 border-t border-gray-200">
            <span>TOTAL:</span>
            <span id="total-geral" class="text-red-500">R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
        </div>
    `;


    // 4. Atualiza o botão fixo
    document.getElementById('cart-count').textContent = totalItens;
}

function adicionarAoCarrinho(id) {
    const produto = dadosConfiguracao.cardapio.find(p => p.id === id);
    if (!produto || !produto.disponivel) return;

    if (carrinho[id]) {
        carrinho[id].quantidade += 1;
    } else {
        carrinho[id] = { item: produto, quantidade: 1 };
    }
    
    renderizarCarrinho();
}

function mudarQuantidade(id, delta) {
    if (!carrinho[id]) return;

    carrinho[id].quantidade += delta;

    if (carrinho[id].quantidade <= 0) {
        delete carrinho[id];
    }
    
    renderizarCarrinho();
}

// ===============================================
// FUNÇÕES DE FLUXO E FORMULÁRIO (NOVO)
// ===============================================

function renderBairroOptions() {
    const select = document.getElementById('delivery-bairro');
    const cobertura = dadosConfiguracao.operacionais?.cobertura || [];

    // Salva a seleção anterior para não perder ao re-renderizar
    const selectedBairro = select.value; 

    select.innerHTML = '<option value="" data-taxa="0.00" disabled>Selecione seu Bairro *</option>';
    
    cobertura.forEach(item => {
        const option = document.createElement('option');
        option.value = item.bairro;
        option.textContent = `${item.bairro} (R$ ${item.taxa.toFixed(2).replace('.', ',')})`;
        option.setAttribute('data-taxa', item.taxa);
        if (item.bairro === selectedBairro) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    // Se não tinha seleção, força a primeira opção a ser selecionável
    if (!selectedBairro) {
        select.options[0].selected = true;
    }
}

function updateDeliveryTax() {
    const select = document.getElementById('delivery-bairro');
    const selectedOption = select.options[select.selectedIndex];
    const taxa = parseFloat(selectedOption.getAttribute('data-taxa')) || 0.00;
    
    document.getElementById('taxa-entrega-info').textContent = `Taxa de Entrega: R$ ${taxa.toFixed(2).replace('.', ',')}`;
    renderizarCarrinho(); // Recalcula o total com a nova taxa
}

function renderPaymentOptions(type) {
    const containerId = type === 'retirada' ? 'retirada-pagamento-options' : 'delivery-pagamento-options';
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const options = [
        { id: 'cartao', label: 'Cartão (Débito ou Crédito)', icon: 'fa-credit-card' },
        { id: 'pix', label: 'PIX (QR-Code ou Chave)', icon: 'fa-qrcode' },
        { id: 'dinheiro', label: 'Dinheiro', icon: 'fa-money-bill-wave' }
    ];

    options.forEach(option => {
        const optionId = `${type}-${option.id}`;
        const card = document.createElement('div');
        card.className = 'payment-option-card';
        card.setAttribute('data-payment-id', optionId);
        
        card.innerHTML = `
            <div class="flex items-center space-x-3">
                <input type="radio" name="${type}-forma-pagamento" id="${optionId}" value="${option.id}" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required>
                <label for="${optionId}" class="flex-1 text-sm font-medium text-gray-700">
                    <i class="fas ${option.icon} mr-2"></i> ${option.label}
                </label>
            </div>
            ${option.id === 'dinheiro' 
                ? `<div id="${optionId}-details" class="mt-3 hidden ml-7">
                    <div class="flex items-center space-x-2 mt-1">
                        <input type="radio" name="${optionId}-troco-required" id="${optionId}-troco-sim" value="sim" onclick="toggleTrocoInput('${optionId}', true)">
                        <label for="${optionId}-troco-sim" class="text-sm">Precisa de Troco</label>
                        <input type="radio" name="${optionId}-troco-required" id="${optionId}-troco-nao" value="nao" checked onclick="toggleTrocoInput('${optionId}', false)">
                        <label for="${optionId}-troco-nao" class="text-sm">Não</label>
                        <input type="number" id="${optionId}-troco-input" placeholder="Para quanto? (R$)" class="p-1 border border-gray-300 rounded-md text-sm hidden w-32" step="0.01" min="0.01">
                    </div>
                </div>`
                : ''}
        `;
        container.appendChild(card);
    });

    // Adiciona evento de clique para seleção visual
    document.querySelectorAll(`#${containerId} .payment-option-card`).forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll(`#${containerId} .payment-option-card`).forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
            
            // Lógica para mostrar/esconder detalhes de dinheiro
            const id = this.getAttribute('data-payment-id');
            const dinheiroDetails = document.getElementById(`${type}-dinheiro-details`);

            if (dinheiroDetails) {
                 if (id.includes('dinheiro')) {
                    dinheiroDetails.classList.remove('hidden');
                 } else {
                    dinheiroDetails.classList.add('hidden');
                 }
            }
        });
    });
}

function toggleTrocoInput(optionId, show) {
    const input = document.getElementById(`${optionId}-troco-input`);
    if (show) {
        input.classList.remove('hidden');
        input.required = true;
    } else {
        input.classList.add('hidden');
        input.required = false;
        input.value = '';
    }
}

function getPaymentDetails(type, totalGeral) {
    const selectedRadio = document.querySelector(`input[name="${type}-forma-pagamento"]:checked`);
    if (!selectedRadio) {
        alert("Por favor, selecione uma forma de pagamento.");
        return null;
    }

    const formaPagamento = selectedRadio.value;
    let detalhesPagamento = { forma: formaPagamento, troco: 'Não necessário.' };

    if (formaPagamento === 'dinheiro') {
        const trocoSim = document.getElementById(`${type}-dinheiro-troco-sim`).checked;
        if (trocoSim) {
            const trocoInput = document.getElementById(`${type}-dinheiro-troco-input`);
            const valorTroco = parseFloat(trocoInput.value) || 0;
            
            if (valorTroco < totalGeral) {
                 alert(`O valor para o troco (R$ ${valorTroco.toFixed(2).replace('.', ',')}) deve ser maior ou igual ao Total do Pedido (R$ ${totalGeral.toFixed(2).replace('.', ',')}).`);
                 return null;
            }
            
            detalhesPagamento.troco = `Sim, para R$ ${valorTroco.toFixed(2).replace('.', ',')}`;
        } else {
            detalhesPagamento.troco = 'Não, valor exato ou troco não necessário.';
        }
    } else {
        detalhesPagamento.troco = 'N/A'; // Cartão ou Pix
    }

    return detalhesPagamento;
}


function collectAndSendOrder(tipo) {
    const selectBairro = document.getElementById('delivery-bairro');
    const taxaEntregaCalculada = tipo === 'delivery' && selectBairro.value 
        ? parseFloat(selectBairro.options[selectBairro.selectedIndex].getAttribute('data-taxa')) || 0.00 
        : 0.00;

    const { subtotal, valorTaxaServico, taxaEntrega, totalGeral } = calcularTotais(taxaEntregaCalculada);
    
    // Verifica se o mínimo de pedido foi atingido
    const minimoPedido = dadosConfiguracao.layout?.minimoPedido || 0;
    if (subtotal < minimoPedido) {
        alert(`O valor mínimo para pedido é de R$ ${minimoPedido.toFixed(2).replace('.', ',')}. Por favor, adicione mais itens.`);
        return;
    }

    const paymentDetails = getPaymentDetails(tipo, totalGeral);
    if (!paymentDetails) return; // Se a validação de pagamento falhar (ex: troco), interrompe

    const tel = dadosConfiguracao.institucional?.telPrincipal || '5511999998888';
    const nomeLoja = dadosConfiguracao.institucional?.nome || 'Nome da Loja';
    
    let mensagem = `*🛍️ PEDIDO - ${nomeLoja} (${tipo.toUpperCase()})*\n\n`;

    // 1. Detalhamento dos Itens
    mensagem += `*🧾 ITENS DO PEDIDO (${calcularTotais().totalItens} Total)*:\n`;
    Object.values(carrinho).forEach(itemCarrinho => {
        const { item, quantidade } = itemCarrinho;
        const subtotalItem = quantidade * item.preco;
        mensagem += `• ${quantidade}x ${item.nome} (R$ ${subtotalItem.toFixed(2).replace('.', ',')})\n`;
    });
    
    // 2. Detalhes do Cliente/Endereço
    mensagem += `\n*👤 DETALHES DO CLIENTE:*\n`;
    if (tipo === 'delivery') {
        const formDelivery = document.getElementById('form-delivery');
        const nome = formDelivery.elements['delivery-nome'].value;
        const endereco = formDelivery.elements['delivery-endereco'].value;
        const numero = formDelivery.elements['delivery-numero'].value;
        const bairro = formDelivery.elements['delivery-bairro'].value;
        
        mensagem += `*Nome:* ${nome}\n`;
        mensagem += `*Endereço:* ${endereco}, Nº ${numero}\n`;
        mensagem += `*Bairro:* ${bairro}\n`;
    } else {
        const nome = document.getElementById('retirada-nome').value || '[Não informado]';
        mensagem += `*Nome:* ${nome}\n`;
        mensagem += `*Modalidade:* Retirada no Local\n`;
    }

    // 3. Detalhes de Pagamento
    mensagem += `\n*💳 PAGAMENTO:*\n`;
    mensagem += `*Forma:* ${paymentDetails.forma.toUpperCase()}\n`;
    if (paymentDetails.forma === 'dinheiro') {
         mensagem += `*Troco:* ${paymentDetails.troco}\n`;
    }

    // 4. Resumo de Totais
    mensagem += `\n*💰 RESUMO FINANCEIRO:*\n`;
    mensagem += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (valorTaxaServico > 0) {
         const taxaServicoPercentual = dadosConfiguracao.layout?.taxaServico || 0;
         mensagem += `Taxa de Serviço (${taxaServicoPercentual}%): R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}\n`;
    }
    if (tipo === 'delivery' && taxaEntrega > 0) {
         mensagem += `Taxa de Entrega: R$ ${taxaEntrega.toFixed(2).replace('.', ',')}\n`;
    }
    mensagem += `*TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;
    
    // 5. Mensagem Adicional
    if (dadosConfiguracao.institucional && dadosConfiguracao.institucional.msgPagamento) {
        mensagem += `\n\n*ℹ️ INFO ADICIONAL:*\n${dadosConfiguracao.institucional.msgPagamento}`;
    }

    // 6. Abre o WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${encodeURIComponent(mensagem)}`, '_blank');
    
    // Opcional: Limpa o carrinho após o envio
    carrinho = {};
    renderizarCarrinho();
    closeOrderDrawer();
}

// Inicializa os event listeners dos formulários
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    
    document.getElementById('form-retirada').addEventListener('submit', (e) => { 
        e.preventDefault(); 
        collectAndSendOrder('retirada'); 
    });
    
    document.getElementById('form-delivery').addEventListener('submit', (e) => { 
        e.preventDefault(); 
        collectAndSendOrder('delivery'); 
    });
});
