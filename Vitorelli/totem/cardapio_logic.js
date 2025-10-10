// ===============================================
// CONFIGURAÇÃO DO CARDÁPIO (TOTEM)
// ===============================================

// IMPORTANTE: Confirme que este é o Bin ID correto do seu JSONBin.io
const BIN_ID = '68e8478a43b1c97be960ce0c'; 
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

const cardapioContainer = document.getElementById('cardapio-container');
const dadosConfiguracao = {}; 
let carrinho = {}; 

// ===============================================
// FUNÇÕES DE UTILIDADE E WHATSAPP
// ===============================================

function criarMensagemWhatsApp() {
    let mensagem = `Olá, gostaria de fazer um pedido!\n\n*Meu Pedido:*\n`;
    let total = 0;

    const itensCarrinho = Object.values(carrinho);

    if (itensCarrinho.length === 0) {
        return "Olá, gostaria de fazer um pedido, mas meu carrinho está vazio!";
    }

    itensCarrinho.forEach(itemCarrinho => {
        const { item, quantidade } = itemCarrinho;
        const subtotal = quantidade * item.preco;
        total += subtotal;
        
        mensagem += `\n- ${quantidade}x ${item.nome} (R$ ${subtotal.toFixed(2).replace('.', ',')})`;
    });

    mensagem += `\n\n*Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*`;
    
    // Adiciona a mensagem de pagamento configurada no CMS
    if (dadosConfiguracao.institucional && dadosConfiguracao.institucional.msgPagamento) {
        mensagem += `\n\n${dadosConfiguracao.institucional.msgPagamento}`;
    }

    return encodeURIComponent(mensagem);
}

function abrirWhatsApp() {
    const tel = dadosConfiguracao.institucional.telPrincipal || '5511999998888'; // Use um número padrão se não configurado
    const mensagem = criarMensagemWhatsApp();
    window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${mensagem}`, '_blank');
}


// ===============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// ===============================================

async function carregarDados() {
    try {
        // Exibe o loading e o status inicial
        const statusLoja = document.getElementById('status-loja');
        statusLoja.textContent = 'Carregando Cardápio...';
        
        const response = await fetch(JSONBIN_URL);
        
        if (!response.ok) {
            // Se falhar o GET, mostra o erro do servidor
            throw new Error(`Falha ao buscar dados: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // 🚨 Lendo a estrutura correta: result.record.data
        // Se a chave "data" não existir, usa o próprio record (compatibilidade)
        const dataRecord = result.record.data || result.record;
        
        Object.assign(dadosConfiguracao, dataRecord);

        // Se o objeto de configuração estiver vazio, significa que o Bin está vazio ou a leitura falhou.
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
    const { institucional, operacionais, layout } = dadosConfiguracao;
    
    // Aplica layout e estilos dinâmicos (CSS Variables)
    document.documentElement.style.setProperty('--cor-primaria', layout.corPrimaria || '#007bff');
    document.documentElement.style.setProperty('--cor-secundaria', layout.corSecundaria || '#ffc107');
    document.documentElement.style.setProperty('--cor-fundo', layout.corFundo || '#f3f4f6');
    document.body.style.backgroundImage = layout.backgroundUrl ? `url(${layout.backgroundUrl})` : 'none';
    document.body.style.fontFamily = layout.fonte || "'Segoe UI', sans-serif";
    
    // Aplica dados institucionais e status
    document.title = institucional.nome || 'Cardápio Digital';
    document.getElementById('loja-nome').textContent = institucional.nome || 'Nome da Loja';
    
    const logoElement = document.getElementById('loja-logo');
    if (logoElement) {
        logoElement.src = institucional.urlLogo || 'placeholder_logo.png';
        logoElement.alt = `Logo de ${institucional.nome}`;
    }

    // Atualiza status da loja
    const statusLoja = document.getElementById('status-loja');
    statusLoja.textContent = operacionais.status.toUpperCase();
    statusLoja.className = `status-badge ${operacionais.status}`;

    // Atualiza o botão do WhatsApp
    document.getElementById('whatsapp-button').onclick = abrirWhatsApp;
}


// ===============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ===============================================

function renderizarCardapio(produtos) {
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

        // Cria o card do produto
        const card = document.createElement('div');
        card.className = `product-card ${produto.disponivel ? 'disponivel' : 'indisponivel'}`;
        card.id = `prod-${produto.id}`;
        
        // Se não estiver disponível, não permite adicionar
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
// FUNÇÕES DE CARRINHO (Simples)
// ===============================================

function adicionarAoCarrinho(id) {
    const produto = dadosConfiguracao.cardapio.find(p => p.id === id);
    if (!produto) return;

    if (carrinho[id]) {
        carrinho[id].quantidade += 1;
    } else {
        carrinho[id] = { item: produto, quantidade: 1 };
    }
    
    // Apenas para mostrar que funciona, você implementaria a visualização do carrinho aqui
    console.log('Carrinho Atualizado:', carrinho);
    alert(`"${produto.nome}" adicionado. Total no carrinho: ${Object.keys(carrinho).length} itens.`);
}

// Inicializa o carregamento dos dados
document.addEventListener('DOMContentLoaded', carregarDados);
