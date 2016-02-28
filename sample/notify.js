"use strict";

const util = require("util");
const CtrlCmdUtil = require("../lib/util");
const CtrlCmdNotify = require("../lib/notify");

var ctrlCmdUtil = new CtrlCmdUtil({
    mode: true,
    host: "127.0.0.1",
    port: 4510
    /*ver: -1*/
});

var ctrlCmdNotify = new CtrlCmdNotify({
    mode: true,
    port: 4511
    /*ver: -1*/
});

ctrlCmdNotify.on("listening", () => {
    ctrlCmdUtil.sendRegistTCP(4511).then(() => {
        console.log("successful");
    }).catch(err => {
        console.log(err);
    });
});

ctrlCmdNotify.on("notify", obj => {
    console.log(obj);
});

ctrlCmdNotify.on("error", err => {
    console.log(err);
});

ctrlCmdNotify.startServer();
