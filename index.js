let socket = io();
let sendBtn = document.querySelector('#sendBtn'),
    input = document.querySelector('#input'),
    list = document.querySelector('#list');

socket.on('connection', () => {
    console.log('连接成功');
});

// 点击发送消息
sendBtn.onclick = function () {
    send();

};
// 回车发送消息
input.onkeydown = function (e) {
    let code = e.keyCode;
    if (code == 13) {
        send();
    }
};


// 接受服务器消息
socket.on('message', data => {
    let li = document.createElement('li');
    li.innerHTML = `
        <p style="color: #ccc;">
            <span class="user" style="color: ${data.color};">${data.user}</span>
            ${data.createAt}
        </p>
        <p class="content" style="background-color: ${data.color};">${data.content}</p>
   `;
    li.classList.add('list-group-item');
    list.appendChild(li);
    list.scrollTop = list.scrollHeight;
});

// 私聊 @一下

list.onclick = function (e) {
    let ele = e.target;
    let html = ele.innerHTML;
    if (ele.className == 'user') {
        input.value = `@${html}`;
    }
};

// 加入房间方法

function join(room) {
    socket.emit('join', room);
}

// 监听进入房间
socket.on('joined', room => {
    document.getElementById(`join-${room}`).style.display = 'none';
    document.getElementById(`leave-${room}`).style.display = 'inline-block';
});


function leave(room) {
    socket.emit('leave', room)
}

socket.on('leave', room => {
    document.getElementById(`leave-${room}`).style.display = 'none';
    document.getElementById(`join-${room}`).style.display = 'inline-block';
});


// 发送消息函数
function send() {
    let val = input.value.trim();
    if (val) {
        socket.emit('message', val);
        input.value = '';

    } else {
        alert('信息不能为空');
    }
}
