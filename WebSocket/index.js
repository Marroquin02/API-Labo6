const WebSocket = require("ws");

const Tokens = new Map();

const clients = new Map();
const wss = new WebSocket.Server({ port: 3333 });

wss.on("connection", async (ws, request) => {
  const urlSearchParams = new URLSearchParams(request.url.split("?")[1]);
  const clientId = urlSearchParams.get("id");

  if (clientId) {
    if (clients.has(clientId)) {
      console.log(
        `Cliente con ID '${clientId}' ya existe. Cerrando la conexión anterior.`
      );
      const existingWebSocket = clients.get(clientId);

      existingWebSocket.send("disconect");
      const closeExistingWebSocket = () => {
        return new Promise((resolve) => {
          existingWebSocket.onclose = (event) => {
            if (event.wasClean) {
              console.log(
                `La conexión del cliente '${clientId}' se cerró con éxito.`
              );
            } else {
              console.log(
                `La conexión del cliente '${clientId}' se cerró de forma inesperada.`
              );
            }
            clients.delete(clientId);
            resolve();
          };
          existingWebSocket.close();
        });
      };

      await closeExistingWebSocket();
    }

    console.log(`Cliente con ID '${clientId}' conectado`);
    clients.set(clientId, ws);
    console.log(clients.size);
    ws.on("message", async (message) => {
      let _message = JSON.parse(message);
      console.log(`Mensaje recibido del cliente '${clientId}':`, _message);
      if (_message.type == "AddPost") {
        //Enviar mensaje a todos los clients conectado con el messaje NewPost
        clients.forEach((client) => {
          client.send(JSON.stringify({ type: "NewPost" }));
        });
      }
      if (_message.type == "AddMessage") {
        //Enviar mensaje a todos los clients conectado con el messaje NewMessage
        clients.forEach((client) => {
          client.send(JSON.stringify({ type: "NewMessage" }));
        });
      }
    });
  } else {
    console.log("Cliente intentó conectarse sin proporcionar un ID válido");
    ws.close();
  }
});

wss.on("listening", () => {
  const address = wss.address();
  console.log(
    `Servidor WebSocket iniciado en la dirección: ${address.address}:${address.port}`
  );
});
