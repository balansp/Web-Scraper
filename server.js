const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");

const userData = require("./users");
const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
server.listen(9898);
const wsServer = new WebSocketServer({
  httpServer: server
});

let  connection ;
wsServer.on('request', function(request) {
   connection = request.accept(null, request.origin);
   connection.on('message', function(message) {
      console.log('Received Message:', message.utf8Data);
      connection.sendUTF('Ready!');
  });
  connection.on('close', function(reasonCode, description) {
      console.log('Client has disconnected.');
  });
});

const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({
  extended: true
}));

const port = 3000;

const APP_NAME = "Motif - Web Scrapper";

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

router.get("/", (req, res) => {
  res.render(__dirname+"/ui/index", { title: APP_NAME, message: "Data Scrapper!" });
});



app.post('/scraper', function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'})
  userData.scraper(request.body.json,connection);
  response.end('ok')
})


app.use("/", router);
app.listen(process.env.port || port);
console.log(`Running at Port ${port}`);