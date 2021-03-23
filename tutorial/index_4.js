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

// Inicializar Twilio
const twilio = require('twilio');
const twilioClient = twilio( process.env.TWILIO_ACCOUNT_ID, process.env.TWILIO_AUTH_TOKEN);




// Tratar Conexão do Web Socket
wss.on("connection", function connection(ws, req) {
    console.log("Nova conexão iniciada", req.url);

    const recognizeStream = client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", data => {
            let callSid = req.url.replace('/', '');
            console.log(callSid, data.results[0].alternatives[0].transcript);

            // verificar conteudo recebido e redirecionar quando for o caso
            if (checkContent(callSid, data.results[0].alternatives[0].transcript)) {
                recognizeStream.destroy();

                const twiml = new twilio.twiml.VoiceResponse();
                twiml.say({ voice: 'alice', language: 'pt-BR' }, 'Você acertou a palavra-chave.');
                twiml.pause({ length: 1 });
                twiml.say({ voice: 'alice', language: 'pt-BR' }, 'Parabéns!');
                twiml.play('http://demo.twilio.com/docs/classic.mp3');

                twilioClient.calls(callSid)
                    .update({ twiml: twiml.toString() })
                    .then(call => console.log('> > > > > > > > > > ', escondeNumero(call.from), ' < < < < < < < < < <'));

            }
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

// encerrar chamadas em aberto
app.get("/encerrar", (req, res) => {
    twilioClient.calls.each(call => {
        if (call.status === 'in-progress') {
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say({ voice: 'alice', language: 'pt-BR' }, 'Então é isso pessoal! Obrigado por participar da nossa demonstração.');
            
            twilioClient.calls(call.sid)
                .update({ twiml: twiml.toString() })
                .then(call => console.log('encerrada: ', call.to));
    
        }
    });
    res.send('Obrigado!');
});

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

function checkContent(callSid, content) {
    return content.toLowerCase().includes('bazinga');
}

