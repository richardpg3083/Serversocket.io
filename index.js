const app = require("express")();
const server = require("http").Server(app);
const { instrument } = require("@socket.io/admin-ui");
const io = new require("socket.io")( server,
    {
        cors:{
            origin:true,
            credentials:true,
            methods:["GET","POST"]
        }
    }
    );
    instrument(io, {
        auth: false,
        mode: "development",
      });
const path = require("path");
const PORT = process.env.PORT || 3000;
const list_users = {};

app.get('/',(req,res)=>{res.send('<h1>Hola mundo</h1>')});
/*app.use(express.static(path.join(__dirname, "views")));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});*/
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
        console.log(nickname);
        console.log(list_users);
        if(nickname!='')
        {
            if (list_users[nickname]) 
            {
                console.log(nickname+" existe");
                socket.emit("userExists", true);
                return ;
            } 
            else 
            {
                console.log(nickname+" no existe");
                list_users[nickname] = socket.id;
                socket.nickname = nickname;
                socket.emit("userExists", false);
              
                /*socket.emit("login");*/
                io.emit("activeSessions", list_users);
                 /* let   message="hola";
                  let image=null;
                io.emit("sendMessage", { message, user: socket.nickname, image });*/
            }
        }
       
    });




    socket.on("disconnect", () => 
    {
        delete list_users[socket.nickname];
        io.emit("activeSessions", list_users);
    });

    socket.on("sendMessage", ({ message, image, user }) => 
    {
        socket.nickname = user;
        io.emit("sendMessage", { message, user: socket.nickname, image });
    });

    socket.on("sendMessagesPrivate", ({ message, image, selectUser,user }) => 
    {
        socket.nickname = user;
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
