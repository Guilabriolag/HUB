/** 🚀 LAB_ENGINE: WEIGHT v3.1 **/
async function initWeightEngine() {
    const res = await fetch('data.json');
    const data = await res.json();
    const app = document.getElementById('app');

    app.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <h1 style="text-align:center; font-style:italic;">${data.nome_estabelecimento}</h1>
            <p style="text-align:center; font-size:12px; color:#666; margin-bottom:40px;">PRODUTOS POR QUILO / GRAMA</p>

            ${data.itens.map(item => `
                <div class="glass-card" style="margin-bottom:20px;">
                    <h3 style="margin:0;">${item.nome}</h3>
                    <p style="color:var(--azul-lab); font-size:12px; margin:5px 0 15px;">R$ ${item.preco_kg} / Kg</p>
                    
                    <div style="display:flex; gap:10px;">
                        <input type="number" placeholder="Gramas (ex: 500)" id="input-${item.id}" 
                            oninput="updateWeightPrice('${item.id}', ${parseFloat(item.preco_kg.replace(',','.'))})"
                            style="flex:1; background:black; border:1px solid #333; color:white; padding:12px; border-radius:12px;">
                        <div class="glass" style="padding:12px; min-width:80px; text-align:center; border-radius:12px; font-weight:bold; color:var(--azul-lab);">
                            R$ <span id="total-${item.id}">0,00</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    window.dispatchEvent(new Event('lab-ready'));
}

function updateWeightPrice(id, precoKg) {
    const gramas = document.getElementById(`input-${id}`).value;
    const total = (gramas / 1000) * precoKg;
    document.getElementById(`total-${id}`).innerText = total.toFixed(2).replace('.',',');
}

initWeightEngine();
