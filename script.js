const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 500,
    parent: 'game-container',
    backgroundColor: '#383a59',
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
    // Carichiamo le immagini dalla cartella assets
    this.load.image('stanza', 'assets/stanza.png');
    this.load.image('omino', 'assets/omino.png');
}

function create() {
    // Gestione di sicurezza: se l'immagine stanza non si carica, mettiamo un colore di fondo
    let bg;
    try {
        bg = this.add.image(180, 200, 'stanza');
        bg.setDisplaySize(360, 250);
    } catch(e) {
        bg = this.add.rectangle(180, 200, 360, 250, 0x44475a);
    }

    // Gestione di sicurezza per l'omino
    try {
        ominoSprite = this.add.image(180, 210, 'omino');
        ominoSprite.setScale(1.5);
    } catch(e) {
        // Se non trova l'immagine dell'omino, ne disegna uno geometrico provvisorio
        ominoSprite = this.add.rectangle(180, 210, 40, 70, 0xffdbac);
    }

    // Effetto "respiro"
    this.tweens.add({
        targets: ominoSprite,
        y: 215,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Pannello delle Statistiche
    this.add.rectangle(180, 60, 320, 90, 0x1e1e2f, 0.9).setStrokeStyle(2, 0x6272a4);
    
    this.add.text(25, 25, "IL MIO RAGAZZO GBA", { font: "13px Courier", fill: "#ff79c6" });
    
    fameText = this.add.text(25, 45, "🍕 Fame: 100%", { font: "12px Courier", fill: "#50fa7b" });
    igieneText = this.add.text(25, 65, "🚿 Igiene: 100%", { font: "12px Courier", fill: "#50fa7b" });
    felicitaText = this.add.text(25, 85, "❤️ Felicità: 100%", { font: "12px Courier", fill: "#50fa7b" });

    // Pulsanti
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

function update() {}

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
