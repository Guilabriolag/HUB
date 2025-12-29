/* PxCardapio.js 
   Lógica de Funcionamento: Pastelaria Ponto X
*/

const cardapio = {
  mais_pedidos: [
    { n: "Frango com Catupiry", p: 13.00, d: "Frango desfiado com Catupiry" },
    { n: "Carne com Queijo", p: 13.00, d: "Carne moída com queijo mussarela" },
    { n: "Queijo", p: 12.00, d: "Queijo mussarela" },
    { n: "Queijo com Milho", p: 13.00, d: "Queijo mussarela com milho" },
    { n: "Frango, Queijo e Milho", p: 14.00, d: "Frango desfiado, queijo mussarela e milho" },
    { n: "Palitinhos de Pastéis Doce de Leite", p: 20.00, d: "6 palitos empanados com açúcar e canela" }
  ],
  tradicionais: [
    { n: "Calabresa", p: 12.00, d: "Calabresa fatiada" },
    { n: "Carne", p: 12.00, d: "Carne moída" },
    { n: "Frango", p: 12.00, d: "Frango desfiado" },
    { n: "Queijo Tradicional", p: 12.00, d: "Queijo mussarela" }
  ],
  especiais: [
    { n: "Carne com Catupiry", p: 13.00, d: "Carne moída com Catupiry" },
    { n: "Carne com Cheddar", p: 13.00, d: "Carne moída com Cheddar" },
    { n: "Carne com Milho", p: 13.00, d: "Carne moída com Milho" },
    { n: "Calabresa com Catupiry", p: 13.00, d: "Calabresa com Catupiry" },
    { n: "Frango com Queijo", p: 13.00, d: "Frango desfiado com Queijo mussarela" },
    { n: "Presunto com Queijo", p: 13.00, d: "Presunto com Queijo mussarela" }
  ],
  combinados: [
    { n: "Queijo, Catupiry e Milho", p: 14.00, d: "Queijo mussarela, Catupiry e Milho" },
    { n: "Carne, Queijo e Presunto", p: 14.00, d: "Carne moída, Queijo mussarela e Presunto" },
    { n: "Carne, Catupiry e Milho", p: 14.00, d: "Carne moída, Catupiry e Milho" },
    { n: "Calabresa, Queijo e Catupiry", p: 14.00, d: "Calabresa fatiada, Queijo mussarela e Catupiry" },
    { n: "Frango, Catupiry e Queijo", p: 14.00, d: "Frango desfiado, Catupiry e Queijo mussarela" },
    { n: "Presunto, Queijo e Tomate", p: 14.00, d: "Presunto, Queijo mussarela e Tomate" }
  ],
  doces: [
    { n: "Chocolate Preto", p: 15.00, d: "Chocolate ao leite" },
    { n: "Chocolate Branco", p: 15.00, d: "Chocolate branco" },
    { n: "Banoffe", p: 15.00, d: "Banana, doce de leite e bolacha (empanado com açúcar e canela)" },
    { n: "Banana com Chocolate", p: 16.00, d: "Banana com chocolate preto" }
  ],
  porcoes: [
    { n: "Mini Pastéis de Carne", p: 25.00, d: "20 unidades com carne moída" },
    { n: "Mini Pastéis de Queijo", p: 25.00, d: "20 unidades com queijo mussarela" },
    { n: "Porção Mista", p: 25.00, d: "10 mini de queijo + 10 mini de carne" },
    { n: "Mini Pastéis de Vento", p: 15.00, d: "20 unidades sem recheio" }
  ],
  bebidas: [
    { n: "Coca-Cola Lata 350ml", p: 6.00, d: "Gelada" },
    { n: "Coca-Cola 600ml", p: 9.00, d: "Gelada" },
    { n: "Coca-Cola 2L", p: 18.00, d: "Ideal para a família" },
    { n: "Guaraná Antártica 2L", p: 16.00, d: "Gelado" }
  ]
};

let categoriaAtiva = "mais_pedidos";
let itensNoCarrinho = [];
let valorTotalProdutos = 0;
let valorTaxaEntrega = 0;
let modalidadePedido = "retirar";

// Seleção de Categoria
function selecionar(cat) {
  categoriaAtiva = cat;
  document.querySelectorAll(".btn-nav").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("btn-" + cat);
  if (btn) btn.classList.add("active");
  renderizarCardapio();
}

// Renderizar Produtos
function renderizarCardapio() {
  const container = document.getElementById("sabores");
  if (!container) return;
  container.innerHTML = "";

  cardapio[categoriaAtiva].forEach(item => {
    container.innerHTML += `
      <div class="item-card">
        <h3>${item.n}</h3>
        <p>${item.d}</p>
        <span class="preco">R$ ${item.p.toFixed(2)}</span>
        <button class="btn-add" onclick="adicionarAoCarrinho('${item.n}', ${item.p})">ADICIONAR</button>
      </div>`;
  });
}

// Lógica de Toast (Aviso)
function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = mensagem;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Adicionar ao Carrinho
function adicionarAoCarrinho(nome, preco) {
  itensNoCarrinho.push({ nome, preco });
  valorTotalProdutos += preco;
  atualizarCarrinhoUI();
  mostrarToast(`${nome} adicionado! 🚀`);
}

// Atualizar Interface do Carrinho
function atualizarCarrinhoUI() {
  const count = document.getElementById("cart-count");
  const resumo = document.getElementById("pedido");
  
  if (count) count.innerText = itensNoCarrinho.length;
  if (resumo) {
    const textoResumo = itensNoCarrinho.map(i => `• ${i.nome} - R$ ${i.preco.toFixed(2)}`).join('\n');
    resumo.value = textoResumo || "Seu carrinho está vazio...";
  }
  atualizarSomaTotal();
}

function atualizarSomaTotal() {
  const totalGeral = valorTotalProdutos + valorTaxaEntrega;
  const displayTotal = document.getElementById("total-valor");
  if (displayTotal) displayTotal.innerText = totalGeral.toFixed(2);
}

// Modalidade Entrega/Retirada
function mostrarDados(tipo) {
  modalidadePedido = tipo;
  const camposEntrega = document.getElementById("entregaCampos");
  const btnRetirar = document.getElementById("btn-retirar");
  const btnDelivery = document.getElementById("btn-delivery");

  if (camposEntrega) camposEntrega.style.display = tipo === "delivery" ? "block" : "none";
  if (btnRetirar) btnRetirar.classList.toggle("active", tipo === "retirar");
  if (btnDelivery) btnDelivery.classList.toggle("active", tipo === "delivery");
  
  if (tipo === "retirar") {
    valorTaxaEntrega = 0;
    const bairroSelect = document.getElementById("bairro");
    if (bairroSelect) bairroSelect.value = "0";
  }
  atualizarSomaTotal();
}

function atualizarFrete() {
  const select = document.getElementById("bairro");
  if (select) {
    valorTaxaEntrega = parseFloat(select.value) || 0;
  }
  atualizarSomaTotal();
}

// Mostrar Campo de Troco
function mostrarTroco() {
  const pag = document.getElementById("pagamento").value;
  const campoTroco = document.getElementById("valorTroco");
  if (campoTroco) campoTroco.style.display = (pag === "Dinheiro") ? "block" : "none";
}

// Limpar Carrinho
function editarPedido() {
  itensNoCarrinho = [];
  valorTotalProdutos = 0;
  valorTaxaEntrega = 0;
  const obs = document.getElementById("obs");
  const troco = document.getElementById("valorTroco");
  if (obs) obs.value = "";
  if (troco) troco.value = "";
  atualizarCarrinhoUI();
  mostrarToast("Carrinho limpo!");
}

function toggleCarrinho() {
  const cart = document.getElementById("carrinho");
  if (cart) cart.classList.toggle("open");
}

// Enviar para WhatsApp
function enviarPedido() {
  if (itensNoCarrinho.length === 0) {
    alert("O seu carrinho está vazio!");
    return;
  }
  
  const obs = document.getElementById("obs").value;
  const pag = document.getElementById("pagamento").value;
  const troco = document.getElementById("valorTroco").value;
  const total = valorTotalProdutos + valorTaxaEntrega;
  
  if (!pag) {
    alert("Por favor, escolha a forma de pagamento.");
    return;
  }

  let msg = `*PASTELARIA PONTO X - NOVO PEDIDO*\n\n`;
  msg += `*ITENS:*\n${document.getElementById("pedido").value}\n\n`;
  
  if(obs) msg += `*OBS:* ${obs}\n`;
  msg += `*TOTAL:* R$ ${total.toFixed(2)}\n`;
  msg += `*PAGAMENTO:* ${pag}\n`;
  
  if(pag === "Dinheiro" && troco) msg += `*TROCO PARA:* R$ ${troco}\n`;

  if(modalidadePedido === "delivery") {
    const end = document.getElementById("endereco").value;
    const selectBairro = document.getElementById("bairro");
    const bairroNome = selectBairro.options[selectBairro.selectedIndex].text;
    
    if(!end || selectBairro.value === "0") {
      alert("Por favor, informe o endereço e o bairro.");
      return;
    }
    msg += `\n*ENTREGA:* ${end}\n*BAIRRO:* ${bairroNome}`;
  } else {
    msg += `\n*MODALIDADE:* Retirada no Local`;
  }

  const fone = "5511920672544"; 
  window.open(`https://wa.me/${fone}?text=${encodeURIComponent(msg)}`);
}

// Inicialização
window.onload = () => {
  renderizarCardapio();
};
