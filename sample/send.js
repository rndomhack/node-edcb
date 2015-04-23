var CtrlCmdUtil = require("../lib/util");

var ctrlCmdUtil = new CtrlCmdUtil({
    useTCP: true,
    host: "127.0.0.1",
    port: 4510
});

/*
ctrlCmdUtil.sendReloadSetting().then((data) => {
    console.log("success");
}).catch((err) => {
    console.log(err);
});
*/

ctrlCmdUtil.sendEnumReserve2().then((data) => {
    return ctrlCmdUtil.sendGetReserve2(data[data.length - 1].reserveID);
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});
