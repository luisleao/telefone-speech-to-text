const express = require("express");
const app = express();
const server = require("http").createServer(app);


require("dotenv").config();
app.use(express.urlencoded({
    extended: true
}));



// Home da página
app.get("/", (req, res) => res.send("Olá mundo!"));


// Receber chamada telefônica
app.post("/", (req, res) => {
    console.log(`Nova chamada de ${req.body.FromCity}/${req.body.FromState} do número ${escondeNumero(req.body.From)}`, );
    res.set("Content-Type", "text/xml");
    res.send(`
        <Response>
            <Say voice="alice" language="pt-BR">A Tuílio quer dar boas vindas para você no Tê Dê Cê.</Say>
            <Play>http://demo.twilio.com/docs/classic.mp3</Play>
        </Response>
    `);
});

console.log("Escutando na porta 8080");
server.listen(8080);



function escondeNumero(number) {
    // +5511999991234 => +55119****1234
    return number.substr(0, number.length - 8) + '****-' + number.substr(number.length - 4 )
}

