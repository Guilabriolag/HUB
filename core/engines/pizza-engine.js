/** 🚀 LAB_ENGINE: PIZZA v3.1 **/
let selectedFlavors = [];

async function initPizzaEngine() {
    const res = await fetch('data.json');
    const data = await res.json();
    const app = document.getElementById('app');

    app.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <header style="text-align:center; margin-bottom:30px;">
                <h1 style="font-style:italic;">${data.nome_estabelecimento}</h1>
                <div class="glass" id="selection-bar" style="padding:15px; margin-top:20px; border-color:var(--azul-lab);">
                    <p id="pizza-msg" style="margin:0; font-size:12px;">Selecione o 1º sabor da sua Pizza Meia-a-Meia</p>
                </div>
            </header>

            <div style="display:grid; gap:15px;">
                ${data.itens.map(item => `
                    <div class="glass-card" onclick="selectFlavor('${item.nome}', '${item.preco}')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                        <div>
                            <h4 style="margin:0;">${item.nome}</h4>
                            <p style="margin:5px 0 0; font-size:11px; color:#666;">${item.descricao}</p>
                        </div>
                        <span style="color:var(--azul-lab); font-weight:bold;">R$ ${item.preco}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    window.dispatchEvent(new Event('lab-ready'));
}

function selectFlavor(nome, preco) {
    selectedFlavors.push({nome, preco: parseFloat(preco.replace(',','.'))});
    
    if(selectedFlavors.length === 1) {
        document.getElementById('pizza-msg').innerText = `1º Sabor: ${nome}. Agora selecione o 2º sabor...`;
    } else if(selectedFlavors.length === 2) {
        // Calcula pela pizza mais cara (Lógica padrão de pizzarias)
        const finalPrice = Math.max(selectedFlavors[0].preco, selectedFlavors[1].preco);
        alert(`Pizza Meia-a-Meia: ${selectedFlavors[0].nome} + ${selectedFlavors[1].nome}\nTotal: R$ ${finalPrice.toFixed(2).replace('.',',')}`);
        selectedFlavors = [];
        document.getElementById('pizza-msg').innerText = "Selecione o 1º sabor da sua Pizza Meia-a-Meia";
    }
}

initPizzaEngine();
