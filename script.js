let main = document.getElementById("main");
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let coorTopCanvas = canvas.getBoundingClientRect().top + pageYOffset;
let coorTopMain = main.getBoundingClientRect().top + pageYOffset;
main.style.marginTop = `${coorTopCanvas - coorTopMain}px`;

let player = "";
let num = "";
let bool = false;
let queue = 1;
let socket = io();

let chat = document.getElementById('chat');
let send = document.getElementById("send");
let string = document.getElementById("string");
let clearChat = document.getElementById('clearChat');

clearChat.onclick = () => {

    while (chat.firstChild) {
        chat.firstChild.remove()
    }
}

string.onfocus = () => {
    socket.emit("sendData", { activity: true, player: player });
};
string.onblur = () => {
    socket.emit("sendData", { activity: false, player: player });
}

send.onclick = () => {
    let color = (player === "Player 1") ? "green" : "red";
    socket.emit("sendData", { text: string.value, player: player, color: color });
    string.value = "";
}

socket.on('PlayerName', (data) => {
    player = data;
    alert(player);
})

for (let i = 0; i < 9; i++) {
    let div = document.createElement("div");
    div.style.cssText = `float: left;
        width: 33.333%;
        height: 33.333%;`;
    div.className = `${i}`;
    div.id = `${i}`;
    main.append(div);
}

function drawMarkup() {
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(300, 100);
    ctx.moveTo(0, 200);
    ctx.lineTo(300, 200);
    ctx.moveTo(100, 0);
    ctx.lineTo(100, 300);
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 300);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
}
drawMarkup();

socket.on('sendRes', (data) => {

    if (data.activity === true && data.player !== player) {
        let div = document.createElement('div');
        div.className = 'printing';
        div.textContent = `${data.player}: is typing...`;
        chat.append(div);

    } else if (data.activity === false && data.player !== player) {
        document.querySelector('.printing').remove();
        return;
    }
    if (data.text) {
        let div = document.createElement('div');
        div.style.color = data.color;
        div.textContent = data.player;

        let playerText = document.createElement('span');
        playerText.style.color = "black";
        playerText.textContent = ": " + data.text;

        chat.append(div);
        div.append(playerText);
        chat.scrollTop = chat.scrollHeight;
        return;
    }
    if (data.checkPlayer === "Player 1") {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineTo(data.x1, data.y1);
        ctx.moveTo(data.x2, data.y);
        ctx.lineTo(data.x, data.y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.stroke();
        bool = true;
        console.log('check')
    } else if (data.checkPlayer === "Player 2") {
        ctx.beginPath();
        ctx.arc(data.x, data.y, 30, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.stroke();
        bool = false;

    } else if (data.checkPlayer === 'Finish') {
        crossOut(data.x, data.y, data.x1, data.y1, data.x2, data.y2);
        setTimeout(clear, 2000);
        alert(data.name + "  WON!!!");
        bool = (data.queue === 1) ? false : true;
    }
})

main.addEventListener("mouseup", (e) => {

    let clickTarget = e.target;

    let x =
        clickTarget.getBoundingClientRect().left -
        canvas.getBoundingClientRect().left +
        20;
    let y =
        clickTarget.getBoundingClientRect().top -
        canvas.getBoundingClientRect().top +
        20;

    if (clickTarget.className === "circle" || clickTarget.className === "cross") {
        return;

    } else if (player === "Player 1") {

        if (bool === true) { return };

        let x1 =
            clickTarget.getBoundingClientRect().right -
            canvas.getBoundingClientRect().left -
            20;
        let y1 =
            clickTarget.getBoundingClientRect().bottom -
            canvas.getBoundingClientRect().top -
            20;
        let x2 =
            clickTarget.getBoundingClientRect().right -
            canvas.getBoundingClientRect().left -
            20;
        let y2 =
            clickTarget.getBoundingClientRect().bottom -
            canvas.getBoundingClientRect().top -
            20;

        clickTarget.className = "cross";

        socket.emit("sendData", {
            x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2,
            checkPlayer: "Player 1"
        });


    } else if (player === "Player 2") {

        if (bool === false) { return };

        x =
            clickTarget.getBoundingClientRect().right -
            clickTarget.getBoundingClientRect().width / 2 -
            canvas.getBoundingClientRect().left;
        y =
            clickTarget.getBoundingClientRect().bottom -
            clickTarget.getBoundingClientRect().height / 2 -
            canvas.getBoundingClientRect().top;

        clickTarget.className = "circle";

        socket.emit("sendData", {
            x: x, y: y, checkPlayer: "Player 2"
        });
    }

    let clickRow = Math.trunc(clickTarget.id / 3);
    let clickColumn = clickTarget.id % 3;
    let clicks = [];
    // row
    for (let i = 0; i < 3; i++) {
        clicks.push(main.children[3 * clickRow + i]);
        finish(clicks);
    }
    // column
    clicks = [];
    for (let i = 0; i < 3; i++) {
        clicks.push(main.children[3 * i + clickColumn]);
        finish(clicks);
    }
    // // diagonal
    clicks = [];
    for (let i = 0; i < 3; i++) {
        clicks.push(main.children[3 * i + i]);
        finish(clicks);
    }
    // second diagonal
    clicks = [];
    for (let i = 0; i < 3; i++) {
        clicks.push(main.children[3 * i + 2 - i]);
        finish(clicks);
    }
});

function finish(massive) {
    let x1;
    let y1;
    let x2;
    let y2;
    let x;
    let y;

    if (massive.length < 3) {
        return;
    }

    for (let i = 0; i < massive.length - 1; i++) {
        if (massive[i].className === massive[i + 1].className) {
            num++;
            queue = (queue === 1) ? 2 : 1;
            let name = (massive[0].className === "cross") ? "Player 1" : "Player 2"
            if (num === massive.length - 1) {

                for (let i = 0; i < massive.length; i++) {
                    if (i === 0) {
                        x =
                            massive[i].getBoundingClientRect().right -
                            massive[i].getBoundingClientRect().width / 2 -
                            canvas.getBoundingClientRect().left;
                        y =
                            massive[i].getBoundingClientRect().bottom -
                            massive[i].getBoundingClientRect().height / 2 -
                            canvas.getBoundingClientRect().top;
                    } else if (!x1 && !y1) {
                        x1 =
                            massive[i].getBoundingClientRect().right -
                            massive[i].getBoundingClientRect().width / 2 -
                            canvas.getBoundingClientRect().left;
                        y1 =
                            massive[i].getBoundingClientRect().bottom -
                            massive[i].getBoundingClientRect().height / 2 -
                            canvas.getBoundingClientRect().top;
                    } else if (!x2 && !y2) {
                        x2 =
                            massive[i].getBoundingClientRect().right -
                            massive[i].getBoundingClientRect().width / 2 -
                            canvas.getBoundingClientRect().left;
                        y2 =
                            massive[i].getBoundingClientRect().bottom -
                            massive[i].getBoundingClientRect().height / 2 -
                            canvas.getBoundingClientRect().top;

                        socket.emit("sendData", {
                            x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2,
                            checkPlayer: "Finish", name: name, queue: queue
                        });
                        massive.splice(0);

                    }
                }
            }
        } else {
            num = 0;
            massive.splice(0);
        }
    }
}

function clear(massive) {
    ctx.clearRect(0, 0, 300, 300);
    num = 0;
    for (let i = 0; i < main.children.length; i++) {
        main.children[i].className = i + 1;
    }
    drawMarkup();
}

function crossOut(x, y, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "yellow";
    ctx.stroke();
}

