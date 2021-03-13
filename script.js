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



for (let i = 0; i < 9; i++) {
    let div = document.createElement("div");
    div.style.cssText = `float: left;
        width: 33.333%;
        height: 33.333%;`;
    div.className = `${i}`;
    div.id = `${i}`;
    main.append(div);
};

socket.on('checkWhoStayed', () => {
    socket.emit("resName", { myName: player });
});

clearChat.onclick = () => {
    while (chat.firstChild) {
        chat.firstChild.remove()
    }
    sessionStorage.removeItem('chat');
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

//                      ** FOR DEV **
// function clearLocal() {     
//     sessionStorage.clear()
// }

function drawCross(x, y, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.moveTo(x2, y);
    ctx.lineTo(x, y2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();
}

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "blue";
    ctx.stroke();
}

function parseStorage() {
    if (sessionStorage.getItem('chat') !== null) {
        console.log('ya tut')
        let mas = JSON.parse(sessionStorage.getItem('chat'));
        for (let sort of mas) {
            createDivInChat(sort.color, sort.player, sort.text);
        }
    }

    if (sessionStorage.getItem('coor') === null) return;

    if (sessionStorage.getItem('queue') !== null) {
        queue = sessionStorage.getItem('queue');
    };

    bool = JSON.parse(sessionStorage.getItem('bool'));
    let mas = JSON.parse(sessionStorage.getItem('coor'));
    for (let sort of mas) {
        if (sort.x2 === undefined) {
            drawCircle(sort.x, sort.y);
        } else {
            drawCross(sort.x, sort.y, sort.x1, sort.y1, sort.x2, sort.y2);
        }
        document.getElementById(`${sort.divNum}`).className = sort.class;
    }
}
parseStorage();

function saveDataCollection(data, boolStatus) {
    if (sessionStorage.getItem('coor') === null) {
        let json = JSON.stringify([data]);
        sessionStorage.setItem("coor", json);

    } else {
        let mas = JSON.parse(sessionStorage.getItem('coor'));
        mas.push(data);
        mas = JSON.stringify(mas);
        sessionStorage.setItem("coor", mas);
    }
    sessionStorage.setItem("bool", boolStatus);
}

function createDivInChat(col, pl, text) {
    let div = document.createElement('div');
    div.style.color = col;
    div.textContent = pl;

    let playerText = document.createElement('span');
    playerText.style.color = "black";
    playerText.textContent = ": " + text;

    chat.append(div);
    div.append(playerText);
    chat.scrollTop = chat.scrollHeight;
}

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
        createDivInChat(data.color, data.player, data.text);
        if (sessionStorage.getItem("chat") === null) {
            let objChat = JSON.stringify([{ color: data.color, player: data.player, text: data.text }]);

            sessionStorage.setItem('chat', objChat);
        } else {
            let objChat = JSON.parse(sessionStorage.getItem('chat'));
            objChat.push({ color: data.color, player: data.player, text: data.text });
            objChat = JSON.stringify(objChat);
            sessionStorage.setItem('chat', objChat);
        }
        return;
    }

    if (data.checkPlayer === "Player 1") {

        document.getElementById(`${data.crossCoor.divNum}`).className = data.crossCoor.class;
        drawCross(data.crossCoor.x, data.crossCoor.y, data.crossCoor.x1, data.crossCoor.y1, data.crossCoor.x2, data.crossCoor.y2);
        saveDataCollection(data.crossCoor, data.bool);
        bool = data.bool;

    } else if (data.checkPlayer === "Player 2") {
        document.getElementById(`${data.circleCoor.divNum}`).className = data.circleCoor.class;
        drawCircle(data.circleCoor.x, data.circleCoor.y);
        saveDataCollection(data.circleCoor, data.bool);
        bool = data.bool;

    } else if (data.checkPlayer === 'Finish') {
        crossOut(data.finishCoor.x, data.finishCoor.y, data.finishCoor.x1, data.finishCoor.y1, data.finishCoor.x2, data.finishCoor.y2);
        setTimeout(clear, 2000);
        alert(data.name + "  WON!!!");
        queue = data.queue;
        bool = (data.queue == 1) ? false : true;
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

        socket.emit("sendData", {
            crossCoor: {
                x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2,
                divNum: clickTarget.id, class: "cross"
            },
            checkPlayer: "Player 1",
            bool: true
        });
        clickTarget.className = "cross";

    } else if (player === "Player 2") {

        if (bool === false) return;

        x =
            clickTarget.getBoundingClientRect().right -
            clickTarget.getBoundingClientRect().width / 2 -
            canvas.getBoundingClientRect().left;
        y =
            clickTarget.getBoundingClientRect().bottom -
            clickTarget.getBoundingClientRect().height / 2 -
            canvas.getBoundingClientRect().top;

        socket.emit("sendData", {
            circleCoor: {
                x: x, y: y,
                divNum: clickTarget.id, class: "circle"
            },
            checkPlayer: "Player 2",
            bool: false
        });
        clickTarget.className = "circle";
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

            let name = (massive[0].className === "cross") ? "Player 1" : "Player 2";

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

                        queue = (queue === 1) ? 2 : 1;

                        socket.emit("sendData", {
                            finishCoor:
                                { x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2 },
                            checkPlayer: "Finish",
                            name: name,
                            queue: queue
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

function clear() {
    sessionStorage.removeItem('coor');
    sessionStorage.removeItem('bool');
    sessionStorage.setItem('queue', queue);
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

