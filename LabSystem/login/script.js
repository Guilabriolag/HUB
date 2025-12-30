// Aguarda o documento estar pronto para garantir que os elementos existam
document.addEventListener('DOMContentLoaded', () => {
    
    const splash = document.getElementById('splash');
    const container = document.getElementById('login-container');

    // 1. ESPERA 1 SEGUNDO E COMEÇA O FADE
    setTimeout(() => {
        splash.style.opacity = '0';
        
        // 2. APÓS O FADE (800ms), SOME DE VEZ E MOSTRA O LOGIN
        setTimeout(() => {
            splash.style.display = 'none';
            container.classList.remove('hidden');
            document.body.style.backgroundColor = '#f8fafc';
        }, 800);

    }, 1000); 
});

function toggleFlip() {
    document.getElementById('flip-inner').classList.toggle('flipped');
}

function validaAcesso() {
    const usuario = document.getElementById('user').value.replace('@', '').trim();
    const bin_id = document.getElementById('bin_id').value.trim();

    const db_clientes = {
        "user001": "69505ac343b1c97be908ec76",
        "user002": "44321bc343b1c97be908e000",
        "Racaodochico": "bin8877chico"
    };

    if (db_clientes[usuario] === bin_id) {
        window.location.href = `/LabSystem/${usuario}/cms_admin/index.html`;
    } else {
        alert("Acesso Negado!");
    }
}

function openPlanos() {
    document.getElementById('modalPlanos').classList.remove('hidden');
}

function closePlanos() {
    const modal = document.getElementById('modalPlanos');
    modal.classList.add('animate__fadeOutDown');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('animate__fadeOutDown');
    }, 500);
}
