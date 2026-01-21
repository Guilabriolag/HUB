/** 🚀 LAB_ENGINE: COMBO v3.1 **/
async function initComboEngine() {
    try {
        const res = await fetch('data.json');
        const data = await res.json();
        const app = document.getElementById('app');

        app.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto; padding: 20px; font-family: 'Poppins', sans-serif;">
                <header style="text-align:center; padding: 30px 0;">
                    <img src="${data.logo_url}" style="width:80px; border-radius:50%; margin-bottom:15px;">
                    <h1 style="margin:0; font-style:italic;">${data.nome_estabelecimento}</h1>
                    <p style="font-size:10px; color:var(--azul-lab); letter-spacing:3px;">OPEN: ${data.horario}</p>
                </header>

                <div id="menu-lanches">
                    ${data.itens.map(item => `
                        <div class="glass-card" style="margin-bottom:20px; overflow:hidden; border-radius:25px;">
                            <img src="${item.img}" style="width:100%; height:200px; object-fit:cover;">
                            <div style="padding:20px;">
                                <div style="display:flex; justify-content:space-between; align-items:start;">
                                    <h3 style="margin:0;">${item.nome}</h3>
                                    <span style="background:var(--azul-lab); padding:4px 10px; border-radius:8px; font-size:14px; font-weight:bold;">R$ ${item.preco}</span>
                                </div>
                                <p style="color:#888; font-size:12px; margin-top:10px;">${item.descricao}</p>
                                <button onclick="addToCart('${item.nome}')" style="width:100%; margin-top:15px; background:white; color:black; border:none; padding:12px; border-radius:12px; font-weight:900; cursor:pointer;">ESCOLHER</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Notifica o loader que a renderização terminou
        window.dispatchEvent(new Event('lab-ready'));
    } catch (e) { console.error("Erro ComboEngine:", e); }
}

function addToCart(nome) {
    const querCombo = confirm(`Ótima escolha! Deseja transformar seu ${nome} em um COMBO (Batata + Refri) por apenas R$ 15,00 extras?`);
    alert(querCombo ? "Combo adicionado!" : "Lanche simples adicionado!");
}

initComboEngine();
