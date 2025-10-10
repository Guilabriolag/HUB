// ===============================================
// CONFIGURAÇÃO DO CARDÁPIO (TOTEM)
// ===============================================
const BIN_ID = '68e8478a43b1c97be960ce0c';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
const cardapioContainer = document.getElementById('cardapio-container');
const dadosConfiguracao = {}; // Objeto que guardará todos os dados (layout, telefone, etc.)
let carrinho = {}; // { produtoId: { item: {}, quantidade: 0 } }

// ===============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// ===============================================

async function carregarDados() {
    try {
        // Exibe o loading e o status
        document.getElementById('status-loja').textContent = 'Carregando Cardápio...';

        const response = await fetch(JSONBIN_URL);
        
        if (!response.ok) {
            throw new Error(`Falha ao buscar dados: ${response.status}`);
        }

        const result = await response.json();
        
        // 🚨 MUDANÇA CRUCIAL: Lendo a nova estrutura de dados do CMS
        // O Cardápio e as Configurações estão dentro de result.record.data
        Object.assign(dadosConfiguracao, result.record.data);

        aplicarConfiguracoes();
        renderizarCardapio(dadosConfiguracao.cardapio || []);
        
    } catch (error) {
        console.error("Erro ao carregar dados do JSONBin:", error);
        document.getElementById('status-loja').textContent = '❌ Erro ao carregar dados. Tente recarregar.';
    }
}

function aplicarConfiguracoes() {
    const { institucional, operacionais, layout } = dadosConfiguracao;
    
    // Aplica layout e estilos dinâmicos
    document.documentElement.style.setProperty('--cor-primaria', layout.corPrimaria || '#007bff');
    document.documentElement.style.setProperty('--cor-secundaria', layout.corSecundaria || '#ffc107');
    document.documentElement.style.setProperty('--cor-fundo', layout.corFundo || '#f3f4f6');
    document.body.style.backgroundImage = layout.backgroundUrl ? `url(${layout.backgroundUrl})` : 'none';
    document.body.style.fontFamily = layout.fonte || "'Segoe UI', sans-serif";
    
    // Aplica dados institucionais e status
    document.title = institucional.nome || 'Cardápio Digital';
    document.getElementById('loja-nome').textContent = institucional.nome || 'Nome da Loja';
    document.getElementById('loja-logo').src = institucional.urlLogo || 'logo_placeholder.png';
    document.getElementById('loja-logo').alt = `Logo de ${institucional.nome}`;

    // Atualiza status da loja
    const statusLoja = document.getElementById('status-loja');
    statusLoja.textContent = `Status: ${operacionais.status.toUpperCase()}`;
    statusLoja.className = `status-badge ${operacionais.status}`;

    // Atualiza o telefone para o botão do WhatsApp
    document.getElementById('whatsapp-button').dataset.tel = institucional.telPrincipal;
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
            ? `<button class="btn-add" onclick="adicionarAoCarrinho('${produto.id}')"><i class="fas fa-plus"></i></button>`
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
// FUNÇÕES DO CARRINHO (Simplificadas)
// ===============================================

function adicionarAoCarrinho(id) {
    // Implementação simplificada: apenas um alerta de sucesso
    const produto = dadosConfiguracao.cardapio.find(p => p.id === id);
    if(produto) {
        alert(`🎉 Produto adicionado! (Aqui entraria a lógica completa do carrinho)`);
    }
    // Aqui você adicionaria a lógica completa de carrinho e WhatsApp
}

// Inicializa o carregamento dos dados
document.addEventListener('DOMContentLoaded', carregarDados);
