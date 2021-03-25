# Faça transcrição de falas originadas por linhas telefônicas utilizando Twilio e Google Speech-to-Text

Você pode utilizar a API do Google Speech to Text para transcrever uma conversa telefônica através da Twilio e executar ações na chamada em andamento.

O sistema funciona quando uma ligação é recebida ou criada e o webhook do serviço retorna o comando de `<Stream>`. Este comando cria um websocket e começa a enviar o conteúdo de áudio para ser tratado do lado do servidor. Neste caso, carregados o payload com o áudio e enviamos para a ferramenta de transcrição da Google.



Alguns casos de uso que você pode implementar adaptando este código:
* realizar análise de sentimento de uma fala em andamento
* transferir a chamada para um agente humano caso identifique alguma palavra-chave
* ativar a gravação a ligação dependendo do conteúdo falado




## Quer rodar como tutorial?

Antes de iniciar o programa você precisa realizar alguns procedimentos:
* Criar uma conta Twilio
* Criar uma conta da Google Cloud
* Ativar a API Google Speech to Text no console da Google Cloud
* Preencher as variáveis do arquivo `.env.sample`
* Modificar o nome do arquivo de `.env.sample` para `.env`


Para rodar essa aplicação execute os seguintes comandos no seu terminal:
```
npm install
npm start
```

Veja as etapas a seguir, cada passo implementa uma função específica:
* [index_0.js](tutorial/index_0.js) Esqueleto básico, inicializando as bibliotecas e resposta padrão do webhook
* [index_1.js](tutorial/index_1.js) Conectando o serviço de streaming da Twilio com um websocket
* [index_2.js](tutorial/index_2.js) Configurando o Google Speech to Text e recebendo a transcrição
* [index_3.js](tutorial/index_3.js) Verificando a transcrição recebida e modificando a chamada ativa
* [index_4.js](tutorial/index_4.js) Criando a url `/encerrar` para finalizar as ligações ativas




##  Documentação
* Blog Post em inglês: https://www.twilio.com/blog/live-transcribing-phone-calls-using-twilio-media-streams-and-google-speech-text
* Twilio Programmable Voice: https://www.twilio.com/docs/voice
* TwiML Stream: https://www.twilio.com/docs/voice/twiml/stream
* Google Speech to Text: https://cloud.google.com/speech-to-text/





Caso tenha alguma dúvida ou queira demonstrar o que implementou através deste código, entre em contato com lleao [arroba] twilio.com.