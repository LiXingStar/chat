const express = require('express');
const app = new express();
app.use(express.static(__dirname));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const SYSTEM = '系统';
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

function shuffle(arr) {
    let len = arr.length, random;
    while (0 !== len) {
        // 右移位运算符向下取整
        random = (Math.random() * len--) >>> 0;
        // 解构赋值实现变量互换
        [arr[len], arr[random]] = [arr[random], arr[len]];
    }
    return arr;
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let socketObj = {};
let mySocket = {};

io.on('connection', socket => {
    mySocket[socket.id] = socket;
    console.log(socket.id);
    console.log('服务器连接成功');
    let username = undefined;
    let color = undefined;
    socket.on('message', msg => {
        if (username) {
            let private = msg.match(/@([^ ]+) (.+)/);
            if (private) {
                let toUser = private[1];
                let content = private[2];
                let toSocket = socketObj[toUser];
                if (toUser) {
                    // 私聊
                    toSocket.send({
                        user: username,
                        content,
                        color,
                        createAt: new Date().toLocaleDateString()
                    })

                }
            } else {
                if (rooms.length) {
                    let socketJson = {};
                    rooms.forEach(room => {
                        // 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        Object.keys(roomSockets).forEach(socketId => {
                            console.log('socketId', socketId);
                            // 进行一个去重，在socketJson中只有对应唯一的socketId
                            if (!socketJson[socketId]) {
                                socketJson[socketId] = 1;
                            }
                        });
                    });

                    // 遍历socketJson，在mySocket里找到对应的id，然后发送消息
                    Object.keys(socketJson).forEach(socketId => {
                        mySocket[socketId].emit('message', {
                            user: username,
                            color,
                            content: msg,
                            createAt: new Date().toLocaleString()
                        });
                    });


                } else {
                    // 公聊
                    io.emit('message', {
                        user: username,
                        color,
                        content: msg,
                        createAt: new Date().toLocaleDateString()
                    })
                }
            }
        } else {
            username = msg;
            socketObj[username] = socket;
            color = shuffle(userColor)[0];
            socket.broadcast.emit('message', {
                user: SYSTEM,
                color,
                content: `${username}加入聊天`,
                createAt: new Date().toLocaleDateString()
            })
        }

    })

    // 加入房间

    let rooms = [];
    socket.on('join', room => {
        if (username && rooms.indexOf(room) == -1) {
            socket.join(room);
            rooms.push(room);
            socket.emit('joined', room);
            socket.send({
                user: SYSTEM,
                content: `欢迎你加入${room}战队`,
                color,
                createAt: new Date().toLocaleDateString()
            })
        }
    })

    socket.on('leave', room => {
        let index = rooms.indexOf(room);
        if (index != -1) {
            socket.leave(room);
            rooms.splice(index, 1);
            socket.emit('leave', room);
            socket.send({
                user: SYSTEM,
                content: `你一离开${room}对`,
                color,
                createAt: new Date().toLocaleDateString()
            })
        }
    })
});


server.listen(3000, () => {
    console.log('localhost:3000');
});
