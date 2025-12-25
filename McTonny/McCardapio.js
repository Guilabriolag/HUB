const cardapio = {
  lanches: [
    { n: "1 – DOG SIMPLES", p: 16.00, d: "Salsicha, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "2 – DOG EGG", p: 21.00, d: "Salsicha, ovo, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "3 – DOG CALABRESA", p: 21.00, d: "Salsicha, calabresa, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "4 – DOG CATUPIRY", p: 21.00, d: "Salsicha, catupiry, queijo, milho, batata palha e pão de banha." },
    { n: "5 – DOG BACON", p: 21.00, d: "Salsicha, bacon, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "6 – DOG SALAME", p: 21.00, d: "Salsicha, salame, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "7 – DOG CHEDDAR", p: 21.00, d: "Salsicha, cheddar, queijo, milho, batata palha e pão de banha." },
    { n: "8 – DOG SALADA", p: 21.00, d: "Salsicha, alface, tomate, queijo, milho, batata palha, ketchup, maionese e pão de banha." },
    { n: "9 – DOG FRANGO", p: 21.00, d: "Salsicha, frango, queijo, milho, batata palha, maionese e pão de banha." },
    { n: "10 – MISTO QUENTE", p: 14.00, d: "Queijo, presunto, maionese e pão francês." },
    { n: "11 – BAURU", p: 14.00, d: "Queijo, presunto, tomate, orégano, maionese e pão francês." },
    { n: "12 – AMERICANO", p: 23.00, d: "Hambúrguer, queijo, presunto, alface, tomate, ovo, maionese e ketchup." },
    { n: "13 – CALABRESA VINAGRETE", p: 24.00, d: "Calabresa, vinagrete, queijo e pão francês." },
    { n: "14 – CHURRASCO VINAGRETE", p: 32.00, d: "Contrafilé, vinagrete, queijo, maionese e pão francês." },
    { n: "15 – X-MAIONESE", p: 20.00, d: "Hambúrguer, queijo, maionese e pão de hambúrguer." },
    { n: "16 – X-BURGUER", p: 20.00, d: "Hambúrguer, queijo, presunto, maionese e ketchup." },
    { n: "17 – X-EGG", p: 21.00, d: "Hambúrguer, ovo, queijo, presunto, maionese e ketchup." },
    { n: "18 – X-CALABRESA", p: 24.00, d: "Hambúrguer, calabresa, queijo, maionese e ketchup." },
    { n: "19 – X-BACON", p: 24.00, d: "Hambúrguer, bacon, queijo, maionese e ketchup." },
    { n: "20 – X-SALADA", p: 20.00, d: "Hambúrguer, queijo, alface, tomate, maionese e ketchup." },
    { n: "21 – X-TUDO", p: 28.00, d: "Hambúrguer, calabresa, bacon, salame, queijo, presunto, ovo e salada." }
  ],
  mclanches: [
    { n: "22 – MC FRANGO", p: 24.00, d: "Frango desfiado, catupiry, alface, queijo, maionese e pão de hambúrguer." },
    { n: "23 – MC CHEDDAR", p: 27.00, d: "Hambúrguer, ovo, alface, tomate, cheddar + refrigerante." },
    { n: "24 – MC CATUPIRY", p: 23.00, d: "Hambúrguer, presunto, queijo, alface, catupiry e pão de hambúrguer." },
    { n: "25 – MC DOGÃO", p: 23.00, d: "Hambúrguer, salsicha, salame, presunto, queijo, maionese e ketchup." },
    { n: "26 – MC TONNY FELIZ", p: 35.00, d: "Hambúrguer, queijo, alface, salame, milho, surpresa + refri lata." },
    { n: "27 – MC MILHO", p: 20.00, d: "Hambúrguer, queijo, milho, maionese, ketchup e pão de hambúrguer." },
    { n: "28 – SUPER MC TONNY", p: 25.00, d: "2 hambúrgueres, alface, queijo, salame, bacon, maionese e ketchup." },
    { n: "29 – MC SALAME", p: 25.00, d: "Hambúrguer, salame, queijo, ovo, alface, tomate, maionese e ketchup." },
    { n: "30 – MC TITAN", p: 90.00, d: "Gigante: 3 carnes, bacon, calabresa, salame, 3 ovos, fritas + Kuat 2L." },
    { n: "34 – X-TUDO NO PRATO", p: 35.00, d: "Hambúrguer, calabresa, bacon, ovo, queijo, salame, salada e fritas." },
    { n: "35 – AMERICANO NO PRATO", p: 32.00, d: "Hambúrguer, ovo, queijo, presunto, alface, tomate e fritas." },
    { n: "36 – SUPER MC NO PRATO", p: 35.00, d: "2 hambúrgueres, bacon, salame, queijo, alface, tomate e fritas." }
  ],
  beirutes: [
    { n: "31 – Beirute Hambúrguer", p: 40.00, d: "Hambúrguer, calabresa, bacon, ovo, salame, salada e queijo." },
    { n: "32 – Beirute Contrafilé", p: 48.00, d: "Contrafilé, calabresa, bacon, ovo, alface, tomate e queijo." },
    { n: "33 – Beirute Frango", p: 38.00, d: "Frango desfiado, queijo, presunto, alface, tomate e maionese." }
  ],
  combos: [
    { n: "37 – MC BURGUER DUPLO", p: 40.00, d: "2 carnes, cheddar, bacon, salada + fritas + refri lata." },
    { n: "38 – MC BURGUER TRIPLO", p: 42.00, d: "3 carnes, cheddar, bacon, salada + fritas + refri lata." },
    { n: "39 – MC SALADA COMBO", p: 40.00, d: "Carne, cheddar, bacon, ovo, cebola, salada + fritas + refri lata." },
    { n: "40 – CHICKEN TONNY", p: 45.00, d: "Frango empanado, mussarela, bacon, ovo, alface + fritas + refri lata." },
    { n: "41 – CHICKEN DUPLO", p: 51.00, d: "2 frangos empanados, bacon, ovo, alface + fritas + refri lata." },
    { n: "43 – VEGETARIANO", p: 28.00, d: "Alface, tomate, cebola, molho especial, queijo + fritas + refri lata." }
  ],
  porcoes: [
    { n: "44 – MC PORÇÃO", p: 65.00, d: "Batata frita, calabresa, bacon e cheddar + Kuat 2L." },
    { n: "45 – BATATA CHEDDAR", p: 35.00, d: "Porção generosa de batata com cheddar." },
    { n: "46 – CALABRESA ACEBOLADA", p: 40.00, d: "Calabresa fatiada com cebola." },
    { n: "47 – CONTRAFILÉ ACEBOLADO", p: 50.00, d: "Contrafilé em tiras com cebola." }
  ],
  bebidas: [
    { n: "Coca-Cola Lata", p: 6.00, d: "Lata 350ml - Gelada" },
    { n: "Coca-Cola 2L", p: 13.00, d: "Ideal para a família" },
    { n: "Guaraná Kuat 2L", p: 10.00, d: "Gelado" },
    { n: "Fanta Laranja Lata", p: 6.00, d: "Lata 350ml" },
    { n: "Água Sem Gás", p: 4.00, d: "Garrafa 500ml" },
    { n: "Suco de Laranja", p: 8.00, d: "Copo 400ml - Natural" }
],
};

let categoriaAtiva = "lanches";
let itensNoCarrinho = [];
let valorTotalProdutos = 0;
let valorTaxaEntrega = 0;
let modalidadePedido = "retirar";

function selecionar(cat) {
  categoriaAtiva = cat;
  document.querySelectorAll(".btn-nav").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-" + cat).classList.add("active");
  renderizarCardapio();
}

function renderizarCardapio() {
  const container = document.getElementById("sabores");
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

function adicionarAoCarrinho(nome, preco) {
  itensNoCarrinho.push({ nome, preco });
  valorTotalProdutos += preco;
  atualizarCarrinhoUI();
  alerta("Pedido", `${nome} adicionado!`);
}

function atualizarCarrinhoUI() {
  document.getElementById("cart-count").innerText = itensNoCarrinho.length;
  const textoResumo = itensNoCarrinho.map(i => `• ${i.nome} - R$ ${i.preco.toFixed(2)}`).join('\n');
  document.getElementById("pedido").value = textoResumo;
  atualizarSomaTotal();
}

function atualizarSomaTotal() {
  const totalGeral = valorTotalProdutos + valorTaxaEntrega;
  document.getElementById("total-valor").innerText = totalGeral.toFixed(2);
}

function mostrarDados(tipo) {
  modalidadePedido = tipo;
  document.getElementById("entregaCampos").style.display = tipo === "delivery" ? "block" : "none";
  document.getElementById("btn-retirar").classList.toggle("active", tipo === "retirar");
  document.getElementById("btn-delivery").classList.toggle("active", tipo === "delivery");
  
  if (tipo === "retirar") {
    valorTaxaEntrega = 0;
    document.getElementById("bairro").value = "0";
  }
  atualizarSomaTotal();
}

function atualizarFrete() {
  const select = document.getElementById("bairro");
  valorTaxaEntrega = parseFloat(select.value) || 0;
  atualizarSomaTotal();
}

function mostrarTroco() {
  const p = document.getElementById("pagamento").value;
  document.getElementById("valorTroco").style.display = p === "Dinheiro" ? "block" : "none";
}

function editarPedido() {
  itensNoCarrinho = [];
  valorTotalProdutos = 0;
  valorTaxaEntrega = 0;
  document.getElementById("obs").value = "";
  atualizarCarrinhoUI();
}

function toggleCarrinho() {
  document.getElementById("carrinho").classList.toggle("open");
}

function enviarPedido() {
  if (itensNoCarrinho.length === 0) return alerta("Atenção", "O carrinho está vazio!");

  const obs = document.getElementById("obs").value;
  const pag = document.getElementById("pagamento").value;
  const total = valorTotalProdutos + valorTaxaEntrega;
  
  let msg = `*MCTONNY - PEDIDO*\n\n`;
  msg += `*ITENS:*\n${document.getElementById("pedido").value}\n\n`;
  if(obs) msg += `*OBS:* ${obs}\n`;
  msg += `*TOTAL:* R$ ${total.toFixed(2)}\n`;
  msg += `*PAGAMENTO:* ${pag}\n`;
  
  if(modalidadePedido === "delivery") {
    const end = document.getElementById("endereco").value;
    const bairro = document.getElementById("bairro").options[document.getElementById("bairro").selectedIndex].text;
    msg += `*ENTREGA:* ${end}\n*BAIRRO:* ${bairro}`;
  } else {
    msg += `*RETIRADA NO LOCAL*`;
  }

  window.open(`https://wa.me/5511943198316?text=${encodeURIComponent(msg)}`);
}

function alerta(t, m) {
  document.getElementById("alert-title").innerText = t;
  document.getElementById("alert-msg").innerText = m;
  document.getElementById("custom-alert-overlay").style.display = "flex";
}

function fecharAlerta() {
  document.getElementById("custom-alert-overlay").style.display = "none";
}

// Inicia com Lanches
selecionar("lanches");
