const express = require('express');
const users = require('./routes/users');
const grupos = require('./routes/grupos');
const publicadores = require('./routes/publicadores');
const registros = require('./routes/registros');

const mongoose = require('mongoose');
const cors = require('cors');

var jwt = require('jsonwebtoken');
const app = express();

app.set('secretKey', 'nodeRestApi'); // jwt secret token

app.use(cors());

mongoose.connect('mongodb://publicadores01:oministack@mongodb.tjcampestre.com.br/publicadores01?retryWrites=true&w=majority', {
    useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.json({"tutorial" : "Esta é a Api do G-Publicadores!"});
});

app.use(function (req,res,next) { 
    req.url = req.url.replace(/[/]+/g, '/'); next(); 
});

// public route
app.use('/users', validateUser, users);
app.use('/grupos', validateUser, grupos);
app.use('/publicadores', validateUser, publicadores);
app.use('/registros', validateUser, registros);

function validateUser(req, res, next) {
    if (req.url != '/authenticate') {
        const token = req.headers['authorization'].replace('Bearer ', '');
        jwt.verify(token, req.app.get('secretKey'), function(err, decoded) {
            if (err) {
                res.status(401).json({status:"error", message: err.message});
            }else{
                // add user id to requestss
                req.body.userId = decoded.id;
                next();
            }
        });
    } else {
        next();
    }
}

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function(req, res, next) {
    let err = new Error('Not Found');
       err.status = 404;
       next(err);
});

// handle errors
app.use(function(err, req, res, next) {
    console.log(err);
    
     if(err.status === 404)
        res.status(404).json({status: "error", message: "Not found", url: req.url });
     else 
       res.status(500).json({status: "error", message: err.message});
});

const port = process.env.PORT_BACKEND_SRC_SERVER || 21147

app.listen(port, function(){ console.log(`Node server listening on port ${port}`);});