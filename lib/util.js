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
 * @param {Object}  [options]           オプション
 * @param {Boolean} [options.mode]      コマンドの送信方法
 * @param {Number}  [options.timeout]   接続時のタイムアウト
 * @param {String}  [options.pipeName]  名前付きパイプ使用時の接続パイプ名
 * @param {String}  [options.eventName] 名前付きパイプ使用時の排他制御用イベント名(未実装)
 * @param {String}  [options.host]      TCP使用時の接続先ホスト
 * @param {Number}  [options.port]      TCP使用時の接続先ポート
 * @param {Number}  [options.ver]       コマンド送信に使用するバージョン
 */
class CtrlCmdUtil {
    constructor(options) {
        options = options || {};
        
        this.mode = options.mode || false;
        this.timeout = 5 * 1000;
        
        this.pipeName = options.pipeName || "\\\\.\\pipe\\EpgTimerSrvPipe";
        this.eventName = options.eventName || "Global\\EpgTimerSrvConnect";
        
        this.host = options.host || "127.0.0.1";
        this.port = options.port || 4510;

        this.ver = options.ver || settings.ver;
    }
    
    get mode() {
        return this._mode;
    }

    set mode(mode) {
        if (typeof mode !== "boolean")
            throw new TypeError("property is not a boolean");
        
        this._mode = mode;
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

    get ver() {
        return this._ver;
    }

    set ver(ver) {
        if (typeof ver !== "number")
            throw new TypeError("property is not a number");

        this._ver = ver;
    }
    
    /**
     * コマンド送信方法を設定
     * @param {Boolean} mode true:TCP,false:名前付きパイプ
     */
    setSendMode(mode) {
        this.mode = !!mode;
    }

    /**
     * 接続時のタイムアウトを設定
     * @param {Number} timeout タイムアウト(ms)
     */
    setTimeout(timeout) {
        this.timeout = timeout;
    }
    
    /**
     * 名前付きパイプの接続先を設定
     * @param {String} pipeName  接続パイプ名
     * @param {String} eventName 排他制御用イベント名
     */
    setPipeSetting(pipeName, eventName) {
        this.pipeName = pipeName;
        this.eventName = eventName;
    }
    
    /**
     * TCPの接続先を設定
     * @param {String} host 接続先ホスト
     * @param {Number} port 接続先ポート
     */
    setTCPSetting(host, port) {
        this.host = host;
        this.port = port;
    }

    /**
     * コマンド送信のバージョンを設定
     * @param {Number} ver バージョン
     */
    serVer(ver) {
        this.ver = ver;
    }
    
    /**
     * バッファを送信
     * @param   {Buffer}                 buf 送信バッファ
     * @returns {Promise.<Buffer,Error>} 受信バッファ,エラー
     */
    sendBuffer(buf) {
        if (!Buffer.isBuffer(buf))
            throw new TypeError("buf is not a buffer");
        
        var deferred = Promise.defer();
        var arr = [];

        var socket = this.mode ? net.connect(this.port, this.host) : net.connect(this.pipeName);
        
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
     * @param   {Object}                 options           オプション
     * @param   {Array.<Object>}         options.reqStruct リクエスト時に使用する構造体
     * @param   {Array.<Object>}         options.resStruct レスポンス時に使用する構造体
     * @param   {Object}                 options.reqData   リクエストに使用するデータ
     * @param   {Number}                 options.param     リクエストに使用するコマンド
     * @param   {Number}                 options.ver       リクエストに使用するバージョン
     * @returns {Promise.<Object,Error>} 受信オブジェクト,エラー
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
                throw Error("can't parse head: " + err.message);
            }
            if (obj.param !== 1) {
                var err = Error("error code: " + obj.param);
                err.code = obj.param;
                throw err;
            }
            try {
                obj.data = types.CmdStreamData.read(options.resStruct, reader, options.ver);
            } catch(err) {
                throw Error("can't parse data: " + err.message);
            }
            
            return obj;
        }).then((data) => {
            deferred.resolve(data);
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * Reserve.txtの追加読み込み(廃止されているforkもあり)
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddloadReserve() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvAddloadReserve,
            ver: -1
        };
        
        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);
        
        return deferred.promise;
    }

    /**
     * EPGの再読み込み
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendReloadEpg() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvReloadEpg,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * 設定の再読み込み
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendReloadSetting() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvReloadSetting,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * EpgTimerSrvの終了
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendClose() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvClose,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * 名前付きパイプ通知用の接続パイプ名と排他制御用イベント名を登録
     * @param   {Number}               processID プロセスID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendRegistGUI(processID) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                {name: "processID", type: types.ULong}
            ],
            resStruct: [],
            reqData: {
                processID: processID
            },
            param: settings.cmd.SrvRegistGUI,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * 名前付きパイプ通知用の接続パイプ名と排他制御用イベント名を解除
     * @param   {Number}               processID プロセスID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendUnRegistGUI(processID) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                {name: "processID", type: types.ULong}
            ],
            resStruct: [],
            reqData: {
                processID: processID
            },
            param: settings.cmd.SrvUnRegistGUI,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * TCP通知用のホスト名とポート番号を登録
     * @param   {String}               host ホスト名
     * @param   {Number}               port ポート番号
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendRegistTCP(host, port) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                {name: "registTcpInfo", type: types.RegistTCPInfo}
            ],
            resStruct: [],
            reqData: {
                registTcpInfo: {
                    ip: host,
                    port: port
                }
            },
            param: settings.cmd.SrvRegistTCP,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }

    /**
     * TCP通知用のホスト名とポート番号を解除
     * @param   {String}               host ホスト名
     * @param   {Number}               port ポート番号
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendUnRegistTCP(host, port) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                {name: "registTcpInfo", type: types.RegistTCPInfo}
            ],
            resStruct: [],
            reqData: {
                registTcpInfo: {
                    ip: host,
                    port: port
                }
            },
            param: settings.cmd.SrvUnRegistTCP,
            ver: -1
        };

        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
    }
    
    /**
     * 予約一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<予約一覧([ReserveData]),エラー>
     */
    sendEnumReserve() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumReserve,
            ver: this.ver
        };

        if (this.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
            options.param = settings.cmd.SrvEnumReserve2;
        }
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.arrReserveData);
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * 予約情報取得
     * @param   {Number}                 reserveID 予約ID
     * @returns {Promise.<Object,Error>} Promise<予約情報(ReserveData),エラー>
     */
    sendGetReserve(reserveID) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                { name: "reserveID", type: types.ULong }
            ],
            resStruct: [
                { name: "reserveData", type: types.ReserveData }
            ],
            reqData: {
                reserveID: reserveID
            },
            param: settings.cmd.SrvGetReserve,
            ver: this.ver
        };

        if (this.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
            options.param = settings.cmd.SrvGetReserve2;
        }
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.reserveData);
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * 予約情報追加
     * @param   {Array.<Object>}       arrReserveData 予約情報(ReserveData)
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddReserve(arrReserveData) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            resStruct: [],
            reqData: {
                arrReserveData: arrReserveData
            },
            param: settings.cmd.SrvAddReserve,
            ver: this.ver
        };

        if (this.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
            options.param = settings.cmd.SrvAddReserve2;
        }
        
        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * 予約情報削除
     * @param   {Array.<Number>}       arrReserveID 予約ID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendDeleteReserve(arrReserveID) {
        var deferred = Promise.defer();
        
        var options = {
            reqStruct: [
                { name: "arrReserveID", type: [types.ULong] }
            ],
            resStruct: [],
            reqData: {
                arrReserveID: arrReserveID
            },
            param: settings.cmd.SrvDelReserve,
            ver: this.ver
        };
        
        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * 予約情報変更
     * @param   {Array.<Object>}       arrReserveData 予約情報(ReserveData)
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendChangeReserve(arrReserveData) {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            resStruct: [],
            reqData: {
                arrReserveData: arrReserveData
            },
            param: settings.cmd.SrvChgReserve,
            ver: this.ver
        };

        if (this.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
            options.param = settings.cmd.SrvChgReserve2;
        }
        
        this.sendCommand(options).then((data) => {
            deferred.resolve();
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * チューナーごとの予約ID一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<予約一覧([TunerReserveInfo]),エラー>
     */
    sendEnumTunerReserve() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrTunerReserveInfo", type: [types.TunerReserveInfo] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumTunerReserve,
            ver: this.ver
        };
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.arrTunerReserveInfo);
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
    
    /**
     * 録画済み情報一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<録画済み情報一覧([RecFileInfo]),エラー>
     */
    sendEnumRecInfo() {
        var deferred = Promise.defer();

        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrRecFileInfo", type: [types.RecFileInfo] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumRecInfo,
            ver: this.ver
        };

        if (this.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
            options.param = settings.cmd.SrvEnumRecInfo2;
        }
        
        this.sendCommand(options).then((data) => {
            deferred.resolve(data.data.arrRecFileInfo);
        }).catch(deferred.reject);
        
        return deferred.promise;
    }
}

module.exports = CtrlCmdUtil;