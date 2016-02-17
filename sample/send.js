var CtrlCmdUtil = require("../lib/util");

var ctrlCmdUtil = new CtrlCmdUtil({
    useTCP: true,
    host: "127.0.0.1",
    port: 4510
    /*ver: -1*/
});

ctrlCmdUtil.sendEnumRecInfo().then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});

/*
ctrlCmdUtil.sendEnumTunerReserve().then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});
*/


/*
ctrlCmdUtil.sendEnumReserve().then((data) => {
    var obj;
    data.forEach(item => {
        if (item.title !== "試験電波") return;
        obj = item;
    });
    console.log(obj);
    obj.recSetting.batFilePath = "C:\\test.bat";
    return ctrlCmdUtil.sendChangeReserve([obj]);
}).then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});
*/


/*
ctrlCmdUtil.sendEnumReserve().then((data) => {
    var reserveID = -1;
    data.forEach(item => {
        if (item.title !== "試験電波") return;
        reserveID = item.reserveID;
    });
    console.log(reserveID);
    return ctrlCmdUtil.sendDeleteReserve([reserveID]);
}).then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});
*/


/*
var reserveData = {
  "title": "試験電波",
  "startTime": new Date(2015, 3, 27, 2, 14),
  "durationSecond": 1080,
  "stationName": "ＫＢＳ京都",
  "originalNetworkID": 32102,
  "transportStreamID": 32102,
  "serviceID": 42032,
  "eventID": 42801,
  "comment": "Nothing",
  "reserveID": 0,
  "recWaitFlag": 0,
  "overlapMode": 0,
  "recFilePath": "",
  "startTimeEpg": new Date(2015, 3, 27, 2, 14),
  "recSetting": {
    "recMode": 1,
    "priority": 2,
    "tuijyuuFlag": 1,
    "serviceMode": 0,
    "pittariFlag": 0,
    "batFilePath": "C:\\TV\\EpgDataCap_Bon\\EpgTimer_Bon.bat",
    "recFolderList": [],
    "suspendMode": 0,
    "rebootFlag": 0,
    "useMargineFlag": 0,
    "startMargine": 0,
    "endMargine": 0,
    "continueRecFlag": 0,
    "partialRecFlag": 0,
    "tunerID": 0,
    "partialRecFolder": []
  },
  "reserveStatus": 0,
  "recFileNameList": [],
  "param1": 0
};

ctrlCmdUtil.sendAddReserve([reserveData]).then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});
*/

/*
ctrlCmdUtil.sendEnumReserve().then((data) => {
    return ctrlCmdUtil.sendGetReserve(data[data.length - 1].reserveID);
}).then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});
*/
