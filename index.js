const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server,
    {
        cors:{
            origin:true,
            credentials:true,
            methods:["GET","POST"]
        }
    }
    );
const path = require("path");
const PORT = process.env.PORT || 3000;
const list_users = {};

app.get('/',(req,res)=>{res.send('<h1>Hola mundo</h1>')});
/*app.use(express.static(path.join(__dirname, "views")));*/

server.listen(PORT, () => {
  console.log(
    "Server Iniciado\n" +
      "http://127.0.0.1:" + PORT
  );
});


io.on("connection", (socket) => 
{
    socket.on("register", (nickname) => 
    {
        if (list_users[nickname]) 
        {
            console.log(socket.nickname+" existe");
            socket.emit("userExists", true);
            return ;
        } 
        else 
        {
            console.log(socket.nickname+" no existe");
            list_users[nickname] = socket.id;
            socket.nickname = nickname;
            socket.emit("userExists", false);
          
            /*socket.emit("login");
            io.emit("activeSessions", list_users);*/
        }
    });




    socket.on("disconnect", () => 
    {
        delete list_users[socket.nickname];
        io.emit("activeSessions", list_users);
    });

    socket.on("sendMessage", ({ message, image }) => 
    {
        io.emit("sendMessage", { message, user: socket.nickname, image });
    });

    socket.on("sendMessagesPrivate", ({ message, image, selectUser }) => 
    {
        if (list_users[selectUser]) 
        {
            io.to(list_users[selectUser]).emit("sendMessage", 
            {
                message,
                user: socket.nickname,
                image,
            });
               
            io.to(list_users[socket.nickname]).emit("sendMessage", 
            {
                message,
                user: socket.nickname,
                image,
            });
        } 
        else 
        {
            alert("El usuario al que intentas enviar el mensaje no existe!");
        }
    });
});
