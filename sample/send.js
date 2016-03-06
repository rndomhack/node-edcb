"use strict";

const util = require("util");
const CtrlCmdUtil = require("../index.js").CtrlCmdUtil;

var ctrlCmdUtil = new CtrlCmdUtil({
    mode: true,
    host: "127.0.0.1",
    port: 4510
    /*ver: -1*/
});

/*
var service = {
    ONID: 32742,
    TSID: 32742,
    SID: 1072
};

var serviceID = new Buffer(8).fill(0);

serviceID.writeUInt16BE(service.ONID, 2);
serviceID.writeUInt16BE(service.TSID, 4);
serviceID.writeUInt16BE(service.SID, 6);
*/

ctrlCmdUtil.sendEnumReserve().then(data => {
    console.log(util.inspect(data, {depth: null}));
}).catch(err => {
    console.log(err.stack);
});


/*ctrlCmdUtil.sendAddEpgAutoAdd([
    { dataID: 47,
    searchInfo:
     { andKey: "テスト",
       notKey: "",
       regExpFlag: false,
       titleOnlyFlag: false,
       contentList:
        [ { content_nibble_level_1: 7,
            content_nibble_level_2: 255,
            user_nibble_1: 0,
            user_nibble_2: 0 } ],
       dateList: [],
       serviceList:
        [ new Buffer([0x00, 0x00, 0x7f, 0xe1, 0x7f, 0xe1, 0x04, 0x08]) ],
       videoList: [],
       audioList: [],
       aimaiFlag: 0,
       notContetFlag: 0,
       notDateFlag: 0,
       freeCAFlag: 0,
       chkRecEnd: 0,
       chkRecDay: 6 },
    recSetting:
     { recMode: 1,
       priority: 2,
       tuijyuuFlag: 1,
       serviceMode: 0,
       pittariFlag: 0,
       batFilePath: "",
       recFolderList: [],
       suspendMode: 0,
       rebootFlag: 0,
       useMargineFlag: 0,
       startMargine: 10,
       endMargine: 5,
       continueRecFlag: 0,
       partialRecFlag: 0,
       tunerID: 0,
       partialRecFolder: [] },
    addCount: 2 }]).then(data => {
    console.log(util.inspect(data, {depth: null}));
}).catch(err => {
    console.log(err.stack);
});*/


/*
var serviceID = new Buffer(8).fill(0);

serviceID.writeUInt16BE(service.ONID, 2);
serviceID.writeUInt16BE(service.TSID, 4);
serviceID.writeUInt16BE(service.SID, 6);

var searchKey = {
    andKey: "蒼の彼方のフォーリズム",
    notKey: "あにむす！",
    regExpFlag: false,
    titleOnlyFlag: false,
    contentList: [],
    dateList: [],
    serviceList: [serviceID],
    videoList: [],
    audioList: [],
    aimaiFlag: 0,
    notContetFlag: 0,
    notDateFlag: 0,
    freeCAFlag: 0
};

ctrlCmdUtil.sendSearchProgram([searchKey]).then(data => {
    console.log(util.inspect(data, {depth: null}));
}).catch(err => {
    console.log(err.stack);
});
*/

/*
ctrlCmdUtil.sendEnumEpgAutoAdd().then(data => {
    console.log(util.inspect(data, {depth: null}));
}).catch(err => {
    console.log(err.stack);
});
*/

/*
var programID = new Buffer(8).fill(0);

programID.writeUInt16BE(service.ONID, 0);
programID.writeUInt16BE(service.TSID, 2);
programID.writeUInt16BE(service.SID, 4);
programID.writeUInt16BE(29010, 6);

ctrlCmdUtil.sendGetProgramInfo(programID).then(data => {
    console.log(JSON.stringify(data, null, "  "));
}).catch(err => {
    console.log(err.stack);
});
*/

/*
var serviceID = new Buffer(8).fill(0);

serviceID.writeUInt16BE(service.ONID, 2);
serviceID.writeUInt16BE(service.TSID, 4);
serviceID.writeUInt16BE(service.SID, 6);

ctrlCmdUtil.sendEnumProgramInfo(serviceID).then(data => {
    console.log(JSON.stringify(data, null, "  "));
}).catch(err => {
    console.log(err.stack);
});
*/

/*ctrlCmdUtil.sendEnumRecInfo().then((data) => {
    console.log(JSON.stringify(data, null, "  "));
}).catch((err) => {
    console.log(err.stack);
});*/

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
