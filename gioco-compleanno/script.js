const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 500,
    parent: 'game-container',
    backgroundColor: '#2b233c',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let ominoSprite;
let fameText, igieneText, felicitaText;
let fame = 100, igiene = 100, felicita = 100;

function preload() {
    // Carichiamo le immagini reali dalla cartella assets che hai creato
    this.load.image('stanza', 'assets/stanza.png');
    this.load.image('omino', 'assets/omino.png');
}

function create() {
    // 1. Sfondo della stanza (centrato nello schermo del gioco)
    // Se l'immagine è molto grande o piccola, la posizioniamo al centro
    let bg = this.add.image(180, 200, 'stanza');
    bg.setDisplaySize(360, 250); // Adatta la stanza alla schermata stile GBA

    // 2. Il tuo omino pixel art al centro (sopra il divano/stanza)
    ominoSprite = this.add.image(180, 210, 'omino');
    ominoSprite.setScale(1.5); // Modifica questo valore se vuoi rimpicciolire o ingrandire l'omino

    // Effetto "respiro" o animazione leggera
    this.tweens.add({
        targets: ominoSprite,
        y: 215,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // 3. Pannello delle Statistiche in stile retro
    this.add.rectangle(180, 60, 320, 90, 0x1e1e2f, 0.9).setStrokeStyle(2, 0x6272a4);
    
    this.add.text(25, 25, "IL MIO RAGAZZO GBA", { font: "13px Courier", fill: "#ff79c6" });
    
    fameText = this.add.text(25, 45, "🍕 Fame: 100%", { font: "12px Courier", fill: "#50fa7b" });
    igieneText = this.add.text(25, 65, "🚿 Igiene: 100%", { font: "12px Courier", fill: "#50fa7b" });
    felicitaText = this.add.text(25, 85, "❤️ Felicità: 100%", { font: "12px Courier", fill: "#50fa7b" });

    // 4. Pulsanti di interazione inferiori
    creaBottone(this, 70, 440, "DA MANGIARE", 0xff79c6, () => {
        fame = Math.min(100, fame + 20);
        aggiornaTesto();
        faiAnimazioneReazione();
    });

    creaBottone(this, 180, 440, "DOCCIA", 0x8be9fd, () => {
        igiene = Math.min(100, igiene + 20);
        aggiornaTesto();
        faiAnimazioneReazione();
    });

    creaBottone(this, 290, 440, "COCCOLA", 0xff5555, () => {
        felicita = Math.min(100, felicita + 20);
        aggiornaTesto();
        faiAnimazioneReazione();
    });
}

function update() {
    // Logica di aggiornamento continuo
}

function aggiornaTesto() {
    fameText.setText("🍕 Fame: " + fame + "%");
    igieneText.setText("🚿 Igiene: " + igiene + "%");
    felicitaText.setText("❤️ Felicità: " + felicita + "%");
}

function faiAnimazioneReazione() {
    ominoSprite.y -= 10;
    setTimeout(() => {
        ominoSprite.y += 10;
    }, 200);
}

function creaBottone(scena, x, y, testo, colore, callback) {
    let btn = scena.add.rectangle(x, y, 95, 32, 0x44475a).setInteractive();
    btn.setStrokeStyle(2, colore);
    let txt = scena.add.text(x, y, testo, { font: "9px Courier", fill: "#fff" }).setOrigin(0.5);

    btn.on('pointerdown', callback);
    btn.on('pointerover', () => btn.setFillStyle(0x6272a4));
    btn.on('pointerout', () => btn.setFillStyle(0x44475a));
}