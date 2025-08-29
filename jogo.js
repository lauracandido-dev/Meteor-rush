// chamando as configurações do jogo
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const scoreMeteorsDisplay = document.getElementById('score-meteors');
const scoreMoedasDisplay = document.getElementById('score-moedas');

// aqui ajusta o tamanho do canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// aqui estão as variáveis do jogo
let gameRunning = false;
let score = 0;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 80,
    height: 80,
    speed: 8
};

let meteors = [];
let moedas = [];
let keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// aqui adiciona a imagem do carro
const shipImage = new Image();
shipImage.src = 'carro.png';

shipImage.onload = () => {
    startButton.disabled = false;
};

// aqui indica que na primeira fase nao tem a opcao de atirar
let fase = 1;
let podeAtirar = false;
let tiros = [];

// função para desenhar o tiro
function drawTiro(tiro) {
    ctx.fillStyle = 'pink';
    ctx.fillRect(tiro.x - 2, tiro.y, 4, 15);
}

// função para atualizar os tiros
function updateTiros() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        tiros[i].y -= tiros[i].speed;

        for (let j = meteors.length - 1; j >= 0; j--) {
            const dx = tiros[i].x - meteors[j].x;
            const dy = tiros[i].y - meteors[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < meteors[j].radius) {
                meteors.splice(j, 1);
                tiros.splice(i, 1);
                scoreMeteors += 1;
                updateScoreDisplay();
                break;
            }
        }

        if (tiros[i] && tiros[i].y < 0) {
            tiros.splice(i, 1);
        }
    }
}

// função para disparar
function atirar() {
    if (fase >= 2) {
        tiros.push({
            x: player.x,
            y: player.y,
            speed: 10
        });
    }
}

// função para desenhar o jogador, chamando a imagem
function drawPlayer() {
    ctx.drawImage(
        shipImage,
        player.x - player.width / 2,
        player.y,
        player.width,
        player.height
    );
}

// função para desenhar os meteoros
function drawMeteor(meteor) {
    const gradient = ctx.createRadialGradient(
        meteor.x, meteor.y, meteor.radius * 0.1,
        meteor.x, meteor.y, meteor.radius        
    );

    gradient.addColorStop(0, '#dddddd'); 
    gradient.addColorStop(1, '#333333'); // desenho com cinza claro dentro e escuro por fora

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
    ctx.fill();
}

// função para desenhar as moedas
function drawMoeda(moeda) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(moeda.x + moeda.width / 2, moeda.y + moeda.height / 2, moeda.width / 2, 0, Math.PI * 2);
    ctx.fill();
}

// função para criar novos meteoros
function createMeteor() {
    const radius = Math.random() * 40 + 20;
    const x = Math.random() * (canvas.width - radius * 2) + radius;

    meteors.push({
        x: x,
        y: -radius,
        radius: radius,
        speed: Math.random() * 3 + 2
    });
}

// função para criar novas moedas
function createMoeda() {
    const size = 30;
    const x = Math.random() * (canvas.width - size);
    moedas.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: 3
    });
}

// função para atualizar o estado do jogo
function update() {
    if (fase >= 2) updateTiros();

    if (keys.ArrowLeft && player.x > player.width / 2) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width / 2) {
        player.x += player.speed;
    }

// atualizar meteoros
    for (let i = meteors.length - 1; i >= 0; i--) {
        meteors[i].y += meteors[i].speed;

        // verificar colisão com o jogador e encerra se houver
        const dx = player.x - meteors[i].x;
        const dy = (player.y + player.height) - meteors[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const naveRaioAproximado = 30;

        if (distance < meteors[i].radius + naveRaioAproximado) {
            alert("💥 Colisão! Fim de jogo.");
            gameOver();
            return;
        }

        // remover meteoros fora do canvas
        if (meteors[i].y > canvas.height + meteors[i].radius) {
            meteors.splice(i, 1);
            scoreMeteors += 1; 
            updateScoreDisplay(); 
        }
    }

    // atualizar moedas
    for (let i = moedas.length - 1; i >= 0; i--) {
        moedas[i].y += moedas[i].speed;

        // colisão com o jogador
        if (
            player.x < moedas[i].x + moedas[i].width &&
            player.x + player.width > moedas[i].x &&
            player.y < moedas[i].y + moedas[i].height &&
            player.y + player.height > moedas[i].y
        ) {
            moedas.splice(i, 1);
            scoreMoedas += 5; // pega a moeda e ganha pontos
            updateScoreDisplay();
        }

        // moeda sai da tela
        if (moedas[i] && moedas[i].y > canvas.height) {
            moedas.splice(i, 1);
        }
    }

    // adicionar novos meteoros e moedas
    if (Math.random() < 0.05) {
        createMeteor();
    }
    if (Math.random() < 0.02) {
        createMoeda();
    }

    if (fase === 1 && scoreMoedas >= 150) {
        fase = 2;
        alert("🚀 Fase 2: Agora você pode atirar!");
    }

    if (fase === 2 && scoreMoedas >= 400) {
        alert("🎉 Você venceu o jogo!");
        gameOver();
    }
}

// função para atualizar a pontuação
function updateScoreDisplay() {
    scoreMeteorsDisplay.textContent = `Pontos Meteoros: ${scoreMeteors}`;
    scoreMoedasDisplay.textContent = `Pontos Moedas: ${scoreMoedas}`;
}

// função de renderização
function render() {
    // limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // desenhar os elementos no canvas
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }

    drawPlayer();
    meteors.forEach(drawMeteor);
    moedas.forEach(drawMoeda);
    tiros.forEach(drawTiro); // desenhar os tiros
}

// função de loop do jogo
function gameLoop() {
    if (!gameRunning) return;

    update();
    render();
    requestAnimationFrame(gameLoop);
}

// função de fim de jogo
function gameOver() {
    gameRunning = false;
    startScreen.style.display = 'flex';
    startButton.textContent = 'JOGAR NOVAMENTE';
    updateScoreDisplay(); // Pontos na tela e o fim
    fase = 1;
    tiros = [];
}

// função de iniciar o jogo
function startGame() {
    gameRunning = true;
    scoreMeteors = 0;
    scoreMoedas = 0;
    updateScoreDisplay(); // atualiza a tela com a pontuação inicial - 0
    meteors = [];
    player.x = canvas.width / 2;
    startScreen.style.display = 'none';
    gameLoop();
}

// inicia o jogo no botão
startButton.addEventListener('click', startGame);

// detecta as teclas pressionadas
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
    if (e.key === ' ') {
        atirar();
    }
});

// detecta as teclas 'soltas'
window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// ajusta a tela e a posição do jogador
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
});
