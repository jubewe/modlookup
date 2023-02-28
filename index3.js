const { WebSocket } = require("ws");

const ws = new WebSocket("wss://ws.jubewe.de");

ws.onopen = () => {
    console.log("opened");
}

ws.onmessage = (msg) => {
    console.log(msg);
}

ws.onerror = e => {
    console.error(e);
}