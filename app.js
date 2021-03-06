var express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var authConfig = require('./auth-config');

//archivos JSON
var prescripcion = require('./JSON/prescripcion.json');
var horas = require('./JSON/horasAdministracion.json');

var app = express();
app.use(bodyParser.json()); //habilita la recepcion de datos desde body en formato json
app.use(bodyParser.urlencoded({ extended: false })); //habilita la recepcion de datos desde body en formato application/x-www-form-urlencoded

var jsonData = {
    options:[
        {
            name:"opcion1"
        },
        {
            name:"opcion2"
        },
        {
            name:"opcion3"
        }
    ]
}

var userAuth = {
    user: 'usuario',
    password: 'mipassword'
};

//habilita cors origin
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, token, Accept");
    next();
})

app.get('/api/securedata',function(req,res){
    if(req.headers.token){
        jwt.verify(req.headers.token,authConfig.secretKey,function(err,decoded){
            if(err){
                res.writeHead(401);
                res.end('token no valido');
            }else{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(jsonData));
            }
        });
    }else{
        res.writeHead(401);
        res.end('sin token');
    }
});

app.get('/api/nonsecuredata/:fileName',function(req,res){
    try{
        var requestFile = require('./JSON/'+req.params.fileName+'.json');
        res.end(JSON.stringify(requestFile));
    }
    catch(error){
        res.writeHead(400);
        res.end('no existe el recurso ' + req.params.fileName+'.json')
    }
});

app.get('/api/nonsecuredata',function(req,res){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(jsonData));
});



app.post('/api/authenticate',function(req,res){
    if(req.body.password === userAuth.password){
        var data = {
            token: jwt.sign({user:userAuth.user}, authConfig.secretKey, {expiresIn:authConfig.expirationTime})
        }
        res.end(JSON.stringify(data));
    }else{
        res.writeHead(400);
        res.end("error de usuario o password");
    }
});

var server = app.listen(3700,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://localhost:"+port);
});