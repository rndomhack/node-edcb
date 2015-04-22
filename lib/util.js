"use strict";

var net = require("net");
var types = require("./types");

var settings = {
    ver: 5,
    cmd: {
        // 基本
        SrvAddloadReserve:      1,
        SrvReloadEpg:           2,
        SrvReloadSetting:       3,
        SrvClose:               4,
        SrvRegistGUI:           5,
        SrvUnRegistGUI:         6,
        SrvRegistTCP:           7,
        SrvUnRegistTCP:         8,

        // 予約・録画
        SrvEnumReserve:         1011,
        SrvGetReserve:          1012,
        SrvAddReserve:          1013,
        SrvDelReserve:          1014,
        SrvChgReserve:          1015,
        SrvEnumTunerReserve:    1016,
        SrvEnumRecInfo:         1017,
        SrvDelRecInfo:          1018,

        // EPG
        SrvEnumService:         1021,
        SrvEnumPgInfo:          1022,
        SrvGetPgInfo:           1023,
        SrvSearchPg:            1025,
        SrvEnumPgAll:           1026,

        // 自動予約登録
        SrvEnumEpgAutoAdd:      1031,
        SrvAddEpgAutoAdd:       1032,
        SrvDelEpgAutoAdd:       1033,
        SrvChgEpgAutoAdd:       1034,

        // プログラム予約自動登録
        SrvEnumManualAdd:       1041,
        SrvAddManualAdd:        1042,
        SrvDelManualAdd:        1043,
        SrvChgManualAdd:        1044,

        // スタンバイ、休止、シャットダウン等
        SrvChkSuspend:          1050,
        SrvSuspend:             1051,
        SrvReboot:              1052,
        SrvEpgCapNow:           1053,

        // その他
        SrvFileCopy:            1060,
        SrvEnumPlugIn:          1061,
        SrvGetChgChTVTest:      1062,

        // ネットワークモード
        SendNwTVSetCh:          1070,
        SendNwTVClose:          1071,
        SendNwTVMode:           1072,

        // ストリーム配信
        SendNwPlayOpen:         1080,
        SendNwPlayClose:        1081,
        SendNwPlayStart:        1082,
        SendNwPlayStop:         1083,
        SendNwPlayGetPos:       1084,
        SendNwPlaySetPos:       1085,
        SendNwPlaySetIP:        1086,
        SendNwTimeShiftOpen:    1087,

        // バージョン情報追加対応版
        // 予約・録画
        SrvEnumReserve2:        2011,
        SrvGetReserve2:         2012,
        SrvAddReserve2:         2013,
        SrvChgReserve2:         2015,
        SrvEnumRecInfo2:        2017,
        SrvChgProtectRecInfo2:  2019,

        // サーバー連携用
        SrvAddChkReserve2:      2030,
        SrvGetEpgFileTime2:     2031,
        SrvGetEpgFile2:         2032,

        // 自動予約登録
        SrvEnumEpgAutoAdd2:     2131,
        SrvAddEpgAutoAdd2:      2132,
        SrvChgEpgAutoAdd2:      2134,

        // プログラム予約自動登録
        SrvEnumManualAdd2:      2141,
        SrvAddManualAdd2:       2142,
        SrvChgManualAdd2:       2144
    }
};

/**
 * CtrlCmdUtilクラス
 * @class CtrlCmdUtil
 * @param {Object} options オプション
 */
class CtrlCmdUtil {
    constructor(options) {
        options = options || {};
        
        this.useTCP = options.useTCP || false;
        this.timeout = 5 * 1000;
        
        this.pipeName = options.pipeName || "\\\\.\\pipe\\EpgTimerSrvPipe";
        this.eventName = options.eventName || "Global\\EpgTimerSrvConnect";
        
        this.host = options.host || "127.0.0.1";
        this.port = options.port || 4510;
    }
    
    get useTCP() {
        return this._useTCP;
    }
    
    set useTCP(useTCP) {
        if (typeof useTCP !== "boolean")
            throw new TypeError("property is not a boolean");
        
        this._useTCP = useTCP;
    }
    
    get timeout() {
        return this._timeout;
    }
    
    set timeout(timeout) {
        if (typeof timeout !== "number")
            throw new TypeError("property is not a number");
        
        this._timeout = timeout;
    }
    
    get pipeName() {
        return this._pipeName;
    }
    
    set pipeName(pipeName) {
        if (typeof pipeName !== "string")
            throw new TypeError("property is not a boolean");
        
        this._pipeName = pipeName;
    }
    
    get eventName() {
        return this._eventName;
    }
    
    set eventName(eventName) {
        if (typeof eventName !== "string")
            throw new TypeError("property is not a string");
        
        this._eventName = eventName;
    }
    
    get host() {
        return this._host;
    }
    
    set host(host) {
        if (typeof host !== "string")
            throw new TypeError("property is not a string");
        
        this._host = host;
    }
    
    get port() {
        return this._port;
    }
    
    set port(port) {
        if (typeof port !== "number")
            throw new TypeError("property is not a number");
        
        this._port = port;
    }
    
    /**
     * コマンド送信方法の設定
     * @param {Boolean} useTCP true：TCP/IPモード、false：名前付きパイプモード
     */
    setSendMode(useTCP) {
        this.useTCP = !!useTCP;
    }
    
    /**
     * 名前付きパイプモード時の接続先を設定
     * @param {String} eventName 排他制御用Eventの名前
     * @param {String} pipeName  接続パイプの名前
     */
    setPipeSetting(eventName, pipeName) {
        this.eventName = eventName;
        this.pipeName = pipeName;
    }
    
    /**
     * TCP/IPモード時の接続先を設定
     * @param {String} host 接続先ホスト
     * @param {Number} port 接続先ポート
     */
    setTCPSetting(host, port) {
        this.host = host;
        this.port = port;
    }
    
    /**
     * 接続処理時のタイムアウト設定
     * @param {Number} timeout タイムアウト値（単位：ms）
     */
    setTimeout(timeout) {
        this.timeout = timeout;
    }
    
    /**
     * バッファを送信
     * @param   {Object}                 buf 送信バッファ
     * @returns {Promise.<Buffer,Error>} 受信バッファ、エラー
     */
    sendBuffer(buf) {
        if (!Buffer.isBuffer(buf))
            throw new TypeError("buf is not a buffer");
        
        var deferred = Promise.defer();
        var arr = [];
        
        var socket = this.useTCP ? net.connect(this.port, this.host) : net.connect(this.pipeName);
        
        socket.setTimeout(this.timeout, () => {
            deferred.reject(new Error("connection timeout"));
            socket.destroy();
        });
        
        socket.on("connect", function() {
            socket.write(buf);
        });
        
        socket.on("data", function(data) {
            arr.push(data);
        });
        
        socket.on("end", function() {
            var data = Buffer.concat(arr);
            deferred.resolve(data);
        });
        
        socket.on("error", function(e) {
            if (e.message === "read EPIPE") {
                var data = Buffer.concat(arr);
                deferred.resolve(data);
            } else {
                deferred.reject(e);
            }
        });
        
        return deferred.promise;
    }
    
    /**
     * コマンドを送信
     * @param   {Object}                 options オプション
     * @returns {Promise.<Object,Error>} 受信オブジェクト
     */
    sendCommand(options) {
        var deferred = Promise.defer();
        
        var writer, buf;
        writer = new types.Writer();
        
        try {
            types.CmdStreamData.write(options.reqData, options.reqStruct, writer, options.ver);
            buf = writer.buf;
            writer.reset();
            
            types.CmdStreamHead.write({ param: options.param, dataSize: buf.length }, writer, options.ver);
            writer.add(buf);
            buf = writer.buf;
        } catch(err) {
            deferred.reject(err);
            return deferred.promise;
        }
        
        this.sendBuffer(buf).then((data) => {
            var reader = new types.Reader(data);
            var obj = {};
            
            try {
                obj = types.CmdStreamHead.read(reader, options.ver);
            } catch(err) {
                throw Error("can't parse head");
            }
            if (obj.param !== 1) {
                throw Error("error code isn't 1");
            }
            try {
                obj.data = types.CmdStreamData.read(options.resStruct, reader, options.ver);
            } catch(err) {
                throw Error("can't parse data");
            }
            
            return obj;
        }).then((data) => {
            deferred.resolve(data);
        }).catch((err) => {
            deferred.reject(err);
        });
        
        return deferred.promise;
    }
    
    /**
     * 予約一覧取得
     * @returns {Promise.<Object,Error>} 予約一覧
     */
    sendEnumReserve2() {
        var deferred = Promise.defer();
        
        var options = {
            reqStruct: [
                { name: "ver", type: types.UShort }
            ],
            resStruct: [
                { name: "ver", type: types.UShort },
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            reqData: {
                ver: settings.ver
            },
            param: settings.cmd.SrvEnumReserve2,
            ver: 5
        };
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.arrReserveData);
        }).catch((err) => {
            deferred.reject(err);
        });
        
        return deferred.promise;
    }
    
    /**
     * 予約情報取得
     * @param   {Number}                 reserveID 予約ID
     * @returns {Promise.<Object,Error>} 予約情報
     */
    sendGetReserve2(reserveID) {
        var deferred = Promise.defer();
        
        var options = {
            reqStruct: [
                { name: "ver", type: types.UShort },
                { name: "reserveID", type: types.ULong },
            ],
            resStruct: [
                { name: "ver", type: types.UShort },
                { name: "reserveData", type: types.ReserveData }
            ],
            reqData: {
                ver: settings.ver,
                reserveID: reserveID
            },
            param: settings.cmd.SrvGetReserve2,
            ver: 5
        };
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.reserveData);
        }).catch((err) => {
            deferred.reject(err);
        });
        
        return deferred.promise;
    }
}

module.exports = CtrlCmdUtil;