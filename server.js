const express = require("express"),
      session = require('express-session')
      bodyParser = require('body-parser'),
      path = require("path"),
      fs = require('fs'),
      userData = require("./users"),
      http = require('http'),
      WebSocketServer = require('websocket').server,
      server = http.createServer(),
      wsServer = new WebSocketServer({
        httpServer: server
      });
const app = express();
const router = express.Router();

const APP_NAME = "Motif - Web Scrapper";
const port = 3000;
const authUser = 'user1@motif.com';
const authPwd = 'Heimdall@2021'

let  connection ;

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'Keep it secret',
  name:'uniqueSessionID',
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, //maxAge = 1 day
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/", router);
app.listen(process.env.port || port);
server.listen(port +1 );

console.log(`Running @ ${port}`);
console.log(`Socket @ ${port+1}`);


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

let isSessionValid = (req) => (req.session && req.session.email && req.session.email==authUser);

//************************************************************ Routers ************************************************************
router.get("/", (req, res) => {
  if(isSessionValid(req)){
    res.render(__dirname+"/ui/index", { title: APP_NAME, email:req.session.email }); 
  } else {  
    res.render(__dirname+"/ui/login", { title: APP_NAME, message: "Data Scrapper!" });
  }
  
});

router.get("/csvfiles", (req, res) => {
  if(!isSessionValid(req)){
    res.sendStatus(401);
    return;
  }
  let filesJson={};
  res.writeHead(200, {"Content-Type": "application/json"});
    const directoryPath = path.join(__dirname, 'output');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        filesJson.files = files
        res.write(JSON.stringify(filesJson));
        res.end('');
    });
});

router.get("/download", (req, res) => {
  if(!isSessionValid(req)){
    res.sendStatus(401);
    return;
  }
  res.download("output/" + req.query.file)
});

router.get("/clearDir", (req, res) => {
  if(!isSessionValid(req)){
    res.sendStatus(401);
    return;
  }
  fs.readdir('output', (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join('output', file), err => {
        if (err) throw err;
      });
    }
  });
  res.end('ok');
});

app.post('/scraper', function(req, res) {
  if(!isSessionValid(req)){
    res.sendStatus(401);
    return;
  }
  res.writeHead(200, {'Content-Type': 'text/html'})
  userData.scraper(req.body.json,connection);
  res.end('ok')
})


app.post('/',bodyParser.urlencoded(),(req,res)=>{
    if(req.body.email==authUser && req.body.password==authPwd) {
       req.session.email=req.body.email;
       console.log("Login Success!!!");
        res.render(__dirname+"/ui/index", { title: APP_NAME,email:req.session.email }); 
    }  else {
       res.sendStatus(401) ;
    }
});


app.get('/logout',bodyParser.urlencoded(),(req,res)=>{
  req.session.destroy((err) => {
    res.render(__dirname+"/ui/login", { title: APP_NAME, message: "Data Scrapper!" });
  })
  
});