// ===============================================
// CONFIGURAÇÃO DO CARDÁPIO (TOTEM)
// ===============================================

// IMPORTANTE: Confirme que este é o Bin ID correto do seu JSONBin.io
const BIN_ID = '68e8478a43b1c97be960ce0c'; 
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

const cardapioContainer = document.getElementById('cardapio-container');
const dadosConfiguracao = {}; 
let carrinho = {}; // { produtoId: { item: {}, quantidade: 0 } }

// ===============================================
// FUNÇÕES DE UI DO CARRINHO (DRAWER)
// ===============================================

function openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('active');
    renderizarCarrinho(); // Garante que o conteúdo está atualizado ao abrir
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('active');
}

// ===============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS (CORRIGIDO)
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
        
        // 🚨 CORREÇÃO: Lendo a estrutura correta: result.record.data
        const dataRecord = result.record.data || result.record;
        
        // Limpa e atribui novos dados
        Object.keys(dadosConfiguracao).forEach(key => delete dadosConfiguracao[key]);
        Object.assign(dadosConfiguracao, dataRecord);

        if (Object.keys(dadosConfiguracao).length === 0 || !dadosConfiguracao.institucional) {
             throw new Error("Dados de configuração inválidos ou Bin vazio.");
        }

        aplicarConfiguracoes();
        renderizarCardapio(dadosConfiguracao.cardapio || []);
        
    } catch (error) {
        console.error("Erro ao carregar dados do JSONBin:", error);
        document.getElementById('status-loja').textContent = '❌ Erro no Cardápio. Tente recarregar.';
    }
}

function aplicarConfiguracoes() {
    // 🚨 CORREÇÃO DE SEGURANÇA: Garante que as variáveis existem
    const institucional = dadosConfiguracao.institucional || {};
    const operacionais = dadosConfiguracao.operacionais || {};
    const layout = dadosConfiguracao.layout || {};
    
    // Aplica layout e estilos dinâmicos (CSS Variables)
    document.documentElement.style.setProperty('--cor-primaria', layout.corPrimaria || '#007bff');
    document.documentElement.style.setProperty('--cor-secundaria', layout.corSecundaria || '#ffc107');
    document.documentElement.style.setProperty('--cor-fundo', layout.corFundo || '#f3f4f6');
    document.body.style.backgroundImage = layout.backgroundUrl ? `url(${layout.backgroundUrl})` : 'none';
    document.body.style.fontFamily = layout.fonte || "'Segoe UI', sans-serif";
    
    // Aplica dados institucionais e status
    document.title = institucional.nome || 'Cardápio Digital';
    document.getElementById('loja-nome').textContent = institucional.nome || 'Nome da Loja'; // CORRIGIDO AQUI
    
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
// FUNÇÕES DE RENDERIZAÇÃO DO CARDÁPIO
// ===============================================

function renderizarCardapio(produtos) {
    // ... (Esta função permanece inalterada)
    if (produtos.length === 0) {
        cardapioContainer.innerHTML = '<p class="text-center p-8 text-white">Nenhum produto disponível no momento.</p>';
        return;
    }

    cardapioContainer.innerHTML = '';
    let categoriaAtual = '';

    produtos.forEach(produto => {
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
// FUNÇÕES DE LÓGICA DO CARRINHO (COMANDA INTELIGENTE)
// ===============================================

function calcularTotais() {
    let subtotal = 0;
    let totalItens = 0;

    const itensCarrinho = Object.values(carrinho);
    
    itensCarrinho.forEach(itemCarrinho => {
        subtotal += itemCarrinho.quantidade * itemCarrinho.item.preco;
        totalItens += itemCarrinho.quantidade;
    });

    const taxaServicoPercentual = (dadosConfiguracao.layout?.taxaServico || 0) / 100;
    const valorTaxaServico = subtotal * taxaServicoPercentual;
    const totalGeral = subtotal + valorTaxaServico;

    return { subtotal, valorTaxaServico, totalGeral, totalItens };
}

function renderizarCarrinho() {
    const lista = document.getElementById('cart-items-list');
    const { subtotal, valorTaxaServico, totalGeral, totalItens } = calcularTotais();
    const taxaServicoPercentual = dadosConfiguracao.layout?.taxaServico || 0;
    
    lista.innerHTML = '';
    
    // 1. Renderiza os itens
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
                    <button onclick="mudarQuantidade('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                    <span class="item-qty">${quantidade}</span>
                    <button onclick="mudarQuantidade('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                    <span class="font-bold text-red-500 ml-3">R$ ${subtotalItem.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            lista.appendChild(itemHtml);
        });
    }

    // 2. Renderiza o resumo no footer
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('taxa-servico').textContent = `R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-geral').textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    document.getElementById('cart-count').textContent = totalItens;
    document.getElementById('taxa-perc').textContent = taxaServicoPercentual;
    
    // Atualiza o botão fixo
    const whatsappButton = document.getElementById('whatsapp-button');
    whatsappButton.className = `whatsapp-fixed ${totalItens > 0 ? 'bg-red-500' : 'bg-green-600'}`;
    whatsappButton.innerHTML = totalItens > 0 
        ? `<i class="fas fa-shopping-basket"></i> Abrir Comanda (${totalItens})`
        : `<i class="fab fa-whatsapp"></i> Fazer Pedido`; // Mensagem inicial
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
    openCart(); 
}

function mudarQuantidade(id, delta) {
    if (!carrinho[id]) return;

    carrinho[id].quantidade += delta;

    if (carrinho[id].quantidade <= 0) {
        delete carrinho[id];
    }
    
    renderizarCarrinho();
}

function enviarPedido(tipo) {
    const { subtotal, totalItens } = calcularTotais();
    
    if (totalItens === 0) {
        alert("Seu carrinho está vazio. Adicione itens antes de prosseguir.");
        return;
    }

    const tel = dadosConfiguracao.institucional.telPrincipal || '5511999998888';
    
    let mensagem = `*🚨 NOVO PEDIDO (${tipo.toUpperCase()})*\n\n`;
    
    // Detalhamento dos Itens
    Object.values(carrinho).forEach(itemCarrinho => {
        const { item, quantidade } = itemCarrinho;
        const subtotalItem = quantidade * item.preco;
        mensagem += `- ${quantidade}x ${item.nome} (R$ ${subtotalItem.toFixed(2).replace('.', ',')})\n`;
    });
    
    // Resumo de Totais
    const taxaServicoPercentual = (dadosConfiguracao.layout?.taxaServico || 0);
    const valorTaxaServico = subtotal * (taxaServicoPercentual / 100);
    const totalGeral = subtotal + valorTaxaServico;

    mensagem += `\n*Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}*`;
    if (valorTaxaServico > 0) {
         mensagem += `\n*Taxa de Serviço (${taxaServicoPercentual}%): R$ ${valorTaxaServico.toFixed(2).replace('.', ',')}*`;
    }
    mensagem += `\n*TOTAL GERAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;
    
    mensagem += `\n*Modalidade:* ${tipo.toUpperCase()}`;
    
    // Adiciona a mensagem de pagamento configurada no CMS
    if (dadosConfiguracao.institucional && dadosConfiguracao.institucional.msgPagamento) {
        mensagem += `\n\n*Informações Extras:*\n${dadosConfiguracao.institucional.msgPagamento}`;
    }

    // Abre o WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${encodeURIComponent(mensagem)}`, '_blank');
}

// Inicializa o carregamento dos dados
document.addEventListener('DOMContentLoaded', carregarDados);
