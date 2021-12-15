// var fs = require('fs');
// var https = require('https');

// // Certificate
// const privateKey = fs.readFileSync('/path/to/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/path/to/cert.pem', 'utf8');
// const ca = fs.readFileSync('/path/to/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };

const express = require("express");
const download = require("./routes/download");

const cors = require("cors");

var jwt = require("jsonwebtoken");

require("dotenv").config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.json({ tutorial: "Esta é a Api de Relatórios do G-Publicadores!" });
});

app.use(function (req, res, next) {
  req.url = req.url.replace(/[/]+/g, "/");
  next();
});

// public route
app.use("/downloads", validateUser, download);

function validateUser(req, res, next) {
  console.log("process", process.env.SECRET_KEY);
  const token = req.headers["authorization"].replace("Bearer ", "");
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      res.status(401).json({ message: err.message });
    } else {
      // add user id to requestss
      req.body.userId = decoded.id;
      next();
    }
  });
}

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// handle errors
app.use(function (err, req, res, next) {
  console.log(err);

  if (err.status === 404)
    res.status(404).json({ message: "Not found", url: req.url });
  else res.status(500).json({ message: err.message });
});

const port = process.env.PORT || 3000;

// const httpsServer = https.createServer(credentials,app)

// httpsServer.listen(port, function(){ console.log(`Node server listening on port ${port}`);});

app.listen(port, function () {
  console.log(`Node server listening on port ${port}`);
});
