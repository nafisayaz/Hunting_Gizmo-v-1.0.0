 

var execSync = require('child_process').execSync;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var uid = require('uid');
var bodyParser = require('body-parser');

var request = require('request')


app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use(express.static(__dirname+"/style"));
app.use(express.static(__dirname+"/utility"));
app.use(express.static(__dirname+"/views"));


var port = process.env.PORT || 8000

server.listen(port,function(){console.log('Server is up.... at: ', server.address().port );});

app.get('/*',function(req,res){

	res.sendFile(__dirname + '/views/index.html');

});

app.post('/intro', function(req, res){
	console.log(req.body.intro);
	res.end(" Hey, I am Gizmo, a highly professional artificial intelligence assistant from jobsmarkt.com");
});

app.post('/getReply', function(req, res){
	console.log(req.body.text);

	var headers = {
    	'User-Agent':       'Super Agent/0.0.1',
    	'Content-Type':     'application/x-www-form-urlencoded'
	}

	var options = {
    	url: 'http://localhost:5000/getReply',
    	method: 'POST',
	    headers: headers,
    	json: { 'text' : req.body.text}
	}

	request.post(options, function(error, response, body){

			if(error)
				console.log("ERROR => ", error);
			res.end(body)
		});

});


var names=[];
var users={};
var codes={};
io.on('connection',function(socket){
    if((socket.handshake.headers.referer=="http://192.168.1.8:8000/")||( socket.handshake.headers.referer=="http://localhost:8000/")){
        var projectid=uid();
        socket.projectID=projectid;
        socket.join(projectid);
		execSync("mkdir cache/" + projectid);

        socket.emit('projectID',projectid);
    }
    else{
        var projectid=socket.handshake.headers.referer.split('/')[3];
        socket.projectID=projectid;
        socket.join(projectid);
        socket.emit('edited',codes[socket.projectID]);
    }

    socket.on('compile_msg',function(msg){
        io.in(socket.projectID).emit('compile_msg',msg);
    })

	socket.on('edited',function(code){
        codes[socket.projectID]=code;
        socket.broadcast.to(socket.projectID).emit('edited',code);//Send to all in the room except the sender.
    })

	socket.on('user',function(data){
				names.push(data);
				users[socket.id]=data;
	//			io.sockets.emit('names',names);
	});

	socket.on('chat message',function(message){
			if(message){
				io.in(socket.projectID).emit('chat message',users[socket.id]+" :: "+message);
				//console.log("Message Emitted from: " + users[socket.id]);
			}
	});

	socket.on('disconnect',function(){
		if( !(socket.id in users )) return;
		var tmp=users[socket.id];
		names.splice(names.indexOf(users[socket.id]),1);
		delete users[socket.id];
		socket.broadcast.to(socket.projectID).emit('out',tmp);
		socket.broadcast.to(socket.projectID).emit('names',names);
	});
});
