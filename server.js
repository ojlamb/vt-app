var express     = require('express');
var jsonfile    = require('jsonfile')
var app = express();

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


app.get('/', function(req, res){
  res.render('index.ejs');
});


app.listen(3000);
console.log('Listening on port 3000');
