
const http   = require('http');
const socket = require('socket.io');
const mysql  = require('mysql');

const server = http.createServer();
const io = socket(server);

 const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bikroykari_backup'
 })

  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })


let users=[];

server.listen(8000, () => console.log(`Server Running`))
    
      io.on('connection',socket => {
          
           socket.on('online',function(data){
          	   users.push({socket_id : socket.id , user_id : data.user_id});
           })

           socket.on('typing',function(data){
              users.map(function(user){
                if(user.user_id == data.receiver_id){
                     socket.broadcast.to(user.socket_id).emit('typing',data);
                }
              })
           });

           socket.on('send',function(data){
              let sql = `INSERT INTO chats (ad_id,sender_id,receiver_id,message) values(${data.ad_id},${data.sender_id},${data.receiver_id},'${data.message}')`;
              connection.query(sql, function (err, result) {
               if (err) throw err;
               });

            	users.map(function(user){
            		if(user.user_id == data.receiver_id){
            	       socket.broadcast.to(user.socket_id).emit('receiver',data);
            		}
            	})
           });

    		   socket.on('disconnect', function () {
     		      socket.emit('disconnected');
    		      users = users.filter(function(user){
                     if(user.socket_id != socket.id)
                          return user;
    		      });
    	 	   });

      });