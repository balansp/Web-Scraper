const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();

const APP_NAME ="Motif - Web Scrapper"

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));



router.get("/", (req, res) => {
  res.render(__dirname+"/ui/index", { title: APP_NAME, message: "Hello there!" });
});

// router.post("/scrapper", (req, res) => {
//     res.render(__dirname+"/ui/index", { title: APP_NAME, message: "Hello there!" });
// });

app.post("/scrapper", (req, res) =>{
    // var num1 = Number(req.body.num1);
    // var num2 = Number(req.body.num2);
     
   // var result = num1 + num2 ;
     console.log(req)
    res.send("Addition - " + JSON.stringify );
  });


app.use("/", router);
app.listen(process.env.port || 3000);

console.log("Running at Port 3000");