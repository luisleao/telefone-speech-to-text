const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });


require("dotenv").config();
app.use(express.urlencoded({
    extended: true
}));

// Inicializar Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

// Configurar a Requisição de Transcrição
const request = {
  config: {
    encoding: "MULAW",
    sampleRateHertz: 8000,
    languageCode: "pt-BR"
  },
  interimResults: true
};



// Tratar Conexão do Web Socket
wss.on("connection", function connection(ws, req) {
    console.log("Nova conexão iniciada", req.url);

    const recognizeStream = client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", data => {
            let callSid = req.url.replace('/', '');
            console.log(callSid, data.results[0].alternatives[0].transcript);
        });

    
    ws.on("message", function incoming(message) {
        const msg = JSON.parse(message);
        switch (msg.event) {
            case "connected":
                console.log(`Uma nova chamada foi conectada.`);
                break;
            case "start":
                console.log(`Começando Media Stream ${msg.streamSid}`);
                break;
            case "media":
                // console.log('Recebendo áudio...');
                if (recognizeStream.destroyed) return;
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`Chamada finalizada!`);
                recognizeStream.destroy();
                break;
        }
    });
});

  


// Home da página
app.get("/", (req, res) => res.send("Olá mundo!"));


// Receber chamada telefônica
app.post("/", (req, res) => {
    console.log(`Nova chamada de ${req.body.FromCity}/${req.body.FromState} do número ${escondeNumero(req.body.From)}`, );
    res.set("Content-Type", "text/xml");
    res.send(`
        <Response>
            <Start>
                <Stream url="wss://${req.headers.host}/${req.body.CallSid}"/>
            </Start>
            <Say voice="alice" language="pt-BR">Olá. Estou reconhecendo sua voz nos próximos 60 segundos.</Say>
            <Pause length="60" />
            <Say voice="alice" language="pt-BR">O tempo acabou... Obrigada!</Say>
        </Response>
    `);
});

console.log("Escutando na porta 8080");
server.listen(8080);



function escondeNumero(number) {
    // +5511999991234 => +55119****1234
    return number.substr(0, number.length - 8) + '****-' + number.substr(number.length - 4 )
}
