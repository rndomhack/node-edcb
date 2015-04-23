var CtrlCmdUtil = require("../lib/util");

var ctrlCmdUtil = new CtrlCmdUtil({
    useTCP: true,
    host: "127.0.0.1",
    port: 4510
});

ctrlCmdUtil.sendEnumReserve().then((data) => {
    return ctrlCmdUtil.sendGetReserve(data[data.length - 1].reserveID);
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err.stack);
});
