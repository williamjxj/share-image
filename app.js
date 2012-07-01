/**
 * Module dependencies.
 */
var my_dir = __dirname+'/public/images/';

var express = require('express'), 
	routes = require('./routes'),
	request = require('request'),
	fs = require('fs'),
	mongoose = require('mongoose');

require('./upimage');

var app = module.exports = express.createServer();

var Image = mongoose.model('YouAdWorld');
var image = new Image();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes
app.get('/', function(req, res){
	var html = fs.readFileSync(__dirname+'/public/index.html');
	res.end(html);
});

app.post('/api/photos', function(req, res) {
	console.log(JSON.stringify(req.body));

	// stream response to a file stream.
	var serverPath = req.body.userPhotoInput.replace(/.*\//, '');
	var path = my_dir + serverPath;

	// path: /home/william/projects/share-image/public/images/Canada_Day-2012hp.jpg
	//serverPath: Canada_Day-2012hp.jpg


	image.name = req.body.userPhotoInput;
	//image.size = 
	//image.type = 
	//image.modifed = 

	image.save(function(err, res) {
		if(err) { throw err; }
		console.log(res);
	});

	var ws = fs.createWriteStream(path);

	// request(uri, options, callback)
	var r = request({url:req.body.userPhotoInput, res:res}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send({ path: serverPath	});
		}
		else {
			res.send({ error: 'No such image file!' });
		}
	}).pipe(ws);


  Image.find({}, function(err, docs) {
	  console.log(docs);
		mongoose.disconnect();
  });

});

app.listen(3001, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


var nowjs = require("now");
var everyone = nowjs.initialize(app);

everyone.now.distributeMessage = function(message){
	everyone.now.receiveMessage(message);
};
