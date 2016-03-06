"use strict";

const net = require("net");
const types = require("./types");

const settings = {
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
            throw new TypeError("property is not a string");

        this._pipeName = pipeName;
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
     * バッファを送信
     * @param   {Buffer}                 buf 送信バッファ
     * @returns {Promise.<Buffer,Error>} 受信バッファ,エラー
     */
    sendBuffer(buf) {
        return new Promise((resolve, reject) => {
            if (!Buffer.isBuffer(buf)) {
                reject(new TypeError("buf is not a buffer"));
                return;
            }

            var arr = [];

            var socket = this.mode ? net.connect(this.port, this.host) : net.connect(this.pipeName);

            socket.setTimeout(this.timeout, () => {
                reject(new Error("connection timeout"));
                socket.destroy();
            });

            socket.on("connect", () => {
                socket.write(buf);
            });

            socket.on("data", data => {
                arr.push(data);
            });

            socket.on("end", () => {
                var data = Buffer.concat(arr);
                resolve(data);
            });

            socket.on("error", err => {
                if (err.message === "read EPIPE") {
                    var data = Buffer.concat(arr);
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
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
        var writer, buf;
        writer = new types.Writer();

        if (options.ver !== -1) {
            options.reqStruct = [{ name: "ver", type: types.UShort }].concat(options.reqStruct);
            options.resStruct = [{ name: "ver", type: types.UShort }].concat(options.resStruct);
            options.reqData.ver = this.ver;
        }

        try {
            types.CmdStreamData.write(options.reqData, options.reqStruct, writer, options.ver);
            buf = writer.buf;
            writer.reset();

            types.CmdStreamHead.write({ param: options.param, dataSize: buf.length }, writer, options.ver);
            writer.add(buf);
            buf = writer.buf;
        } catch (err) {
            return Promise.reject(err);
        }

        return this.sendBuffer(buf).then(data => {
            var reader = new types.Reader(data);
            var obj = {};

            try {
                obj = types.CmdStreamHead.read(reader, options.ver);
            } catch (err) {
                throw Error("can't parse head: " + err.message);
            }

            if (obj.param !== 1) {
                let err2 = Error("error code: " + obj.param);
                err2.code = obj.param;
                throw err2;
            }

            try {
                obj.data = types.CmdStreamData.read(options.resStruct, reader, options.ver);
            } catch (err3) {
                throw Error("can't parse data: " + err3.stack);
            }

            return obj;
        });
    }

    /**
     * Reserve.txtの追加読み込み(廃止されているforkもあり)
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddloadReserve() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvAddloadReserve,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * EPGの再読み込み
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendReloadEpg() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvReloadEpg,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 設定の再読み込み
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendReloadSetting() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvReloadSetting,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * EpgTimerSrvの終了
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendClose() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvClose,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 名前付きパイプ通知用の接続パイプ名と排他制御用イベント名を登録
     * @param   {Number}               processID プロセスID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendRegistGUI(processID) {
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

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 名前付きパイプ通知用の接続パイプ名と排他制御用イベント名を解除
     * @param   {Number}               processID プロセスID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendUnRegistGUI(processID) {
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

        return this.sendCommand(options).then(() => {});
    }

    /**
     * TCP通知用のポート番号を登録
     * @param   {Number}               port ポート番号
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendRegistTCP(port) {
        var options = {
            reqStruct: [
                {name: "port", type: types.ULong}
            ],
            resStruct: [],
            reqData: {
                port: port
            },
            param: settings.cmd.SrvRegistTCP,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * TCP通知用のポート番号を解除
     * @param   {Number}               port ポート番号
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendUnRegistTCP(port) {
        var options = {
            reqStruct: [
                {name: "port", type: types.ULong}
            ],
            resStruct: [],
            reqData: {
                port: port
            },
            param: settings.cmd.SrvUnRegistTCP,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 予約一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<予約一覧([ReserveData]),エラー>
     */
    sendEnumReserve() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            reqData: {},
            param: this.ver === -1 ? settings.cmd.SrvEnumReserve : settings.cmd.SrvEnumReserve2,
            ver: this.ver
        };

        return this.sendCommand(options).then(data => data.data.arrReserveData);
    }

    /**
     * 予約情報取得
     * @param   {Number}                 reserveID 予約ID
     * @returns {Promise.<Object,Error>} Promise<予約情報(ReserveData),エラー>
     */
    sendGetReserve(reserveID) {
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
            param: this.ver === -1 ? settings.cmd.SrvGetReserve : settings.cmd.SrvGetReserve2,
            ver: this.ver
        };

        return this.sendCommand(options).then(data => data.data.reserveData);
    }

    /**
     * 予約情報追加
     * @param   {Array.<Object>}       arrReserveData 予約情報([ReserveData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddReserve(arrReserveData) {
        var options = {
            reqStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            resStruct: [],
            reqData: {
                arrReserveData: arrReserveData
            },
            param: this.ver === -1 ? settings.cmd.SrvAddReserve : settings.cmd.SrvAddReserve2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 予約情報削除
     * @param   {Array.<Number>}       arrReserveID 予約ID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendDeleteReserve(arrReserveID) {
        var options = {
            reqStruct: [
                { name: "arrReserveID", type: [types.ULong] }
            ],
            resStruct: [],
            reqData: {
                arrReserveID: arrReserveID
            },
            param: settings.cmd.SrvDelReserve,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 予約情報変更
     * @param   {Array.<Object>}       arrReserveData 予約情報([ReserveData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendChangeReserve(arrReserveData) {
        var options = {
            reqStruct: [
                { name: "arrReserveData", type: [types.ReserveData] }
            ],
            resStruct: [],
            reqData: {
                arrReserveData: arrReserveData
            },
            param: this.ver === -1 ? settings.cmd.SrvChgReserve : settings.cmd.SrvChgReserve2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * チューナーごとの予約ID一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<予約一覧([TunerReserveInfo]),エラー>
     */
    sendEnumTunerReserve() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrTunerReserveInfo", type: [types.TunerReserveInfo] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumTunerReserve,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.arrTunerReserveInfo);
    }

    /**
     * 録画済み情報一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<録画済み情報一覧([RecFileInfo]),エラー>
     */
    sendEnumRecInfo() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrRecFileInfo", type: [types.RecFileInfo] }
            ],
            reqData: {},
            param: this.ver === -1 ? settings.cmd.SrvEnumRecInfo : settings.cmd.SrvEnumRecInfo2,
            ver: this.ver
        };

        return this.sendCommand(options).then(data => data.data.arrRecFileInfo);
    }

    /**
     * 録画済み情報削除
     * @param   {Array.<Number>}       arrRecID 録画ID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendDeleteRecInfo(arrRecID) {
        var options = {
            reqStruct: [
                { name: "arrRecID", type: [types.ULong] }
            ],
            resStruct: [],
            reqData: {
                arrRecID: arrRecID
            },
            param: settings.cmd.SrvDelRecInfo,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * サービス一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<サービス一覧([EpgServiceInfo]),エラー>
     */
    sendEnumService() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrEpgServiceInfo", type: [types.EpgServiceInfo] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumService,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.arrEpgServiceInfo);
    }

    /**
     * サービス指定番組情報一覧取得
     * @param   {Buffer}                        serviceID サービスID
     * @returns {Promise.<Array<Object>,Error>} Promise<番組情報一覧([EpgEventInfo]),エラー>
     */
    sendEnumProgramInfo(serviceID) {
        var options = {
            reqStruct: [
                { name: "serviceID", type: types.UInt64 }
            ],
            resStruct: [
                { name: "arrEpgEventInfo", type: [types.EpgEventInfo] }
            ],
            reqData: {
                serviceID: serviceID
            },
            param: settings.cmd.SrvEnumPgInfo,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.arrEpgEventInfo);
    }

    /**
     * 番組情報取得
     * @param   {Buffer}                 programID プログラムID
     * @returns {Promise.<Object,Error>} Promise<番組情報(EpgEventInfo),エラー>
     */
    sendGetProgramInfo(programID) {
        var options = {
            reqStruct: [
                { name: "programID", type: types.UInt64 }
            ],
            resStruct: [
                { name: "epgEventInfo", type: types.EpgEventInfo }
            ],
            reqData: {
                programID: programID
            },
            param: settings.cmd.SrvGetPgInfo,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.epgEventInfo);
    }

    /**
     * 番組情報検索
     * @param   {Array<Object>}                 arrEpgSearchKeyInfo 検索キー([EpgSearchKeyInfo])
     * @returns {Promise.<Array<Object>,Error>} Promise<番組情報一覧([EpgEventInfo]),エラー>
     */
    sendSearchProgram(arrEpgSearchKeyInfo) {
        var options = {
            reqStruct: [
                { name: "arrEpgSearchKeyInfo", type: [types.EpgSearchKeyInfo] }
            ],
            resStruct: [
                { name: "arrEpgEventInfo", type: [types.EpgEventInfo] }
            ],
            reqData: {
                arrEpgSearchKeyInfo: arrEpgSearchKeyInfo
            },
            param: settings.cmd.SrvSearchPg,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.arrEpgEventInfo);
    }

    /**
     * 番組情報一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<番組情報一覧([EpgServiceEventInfo]),エラー>
     */
    sendEnumProgramAll() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrEpgServiceEventInfo", type: [types.EpgServiceEventInfo] }
            ],
            reqData: {},
            param: settings.cmd.SrvEnumPgAll,
            ver: -1
        };

        return this.sendCommand(options).then(data => data.data.arrEpgServiceEventInfo);
    }

    /**
     * 自動予約登録条件一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<自動予約登録条件一覧([EpgAutoAddData]),エラー>
     */
    sendEnumEpgAutoAdd() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrEpgAutoAddData", type: [types.EpgAutoAddData] }
            ],
            reqData: {},
            param: this.ver === -1 ? settings.cmd.SrvEnumEpgAutoAdd : settings.cmd.SrvEnumEpgAutoAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(data => data.data.arrEpgAutoAddData);
    }

    /**
     * 自動予約登録条件追加
     * @param   {Array<Object>}        arrEpgAutoAddData 自動予約登録条件一覧([EpgAutoAddData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddEpgAutoAdd(arrEpgAutoAddData) {
        var options = {
            reqStruct: [
                { name: "arrEpgAutoAddData", type: [types.EpgAutoAddData] }
            ],
            resStruct: [],
            reqData: {
                arrEpgAutoAddData: arrEpgAutoAddData
            },
            param: this.ver === -1 ? settings.cmd.SrvAddEpgAutoAdd : settings.cmd.SrvAddEpgAutoAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 自動予約登録条件削除
     * @param   {Array.<Number>}       arrAutoAddID 自動予約ID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendDeleteEpgAutoAdd(arrAutoAddID) {
        var options = {
            reqStruct: [
                { name: "arrAutoAddID", type: [types.ULong] }
            ],
            resStruct: [],
            reqData: {
                arrAutoAddID: arrAutoAddID
            },
            param: settings.cmd.SrvDelEpgAutoAdd,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * 自動予約登録条件変更
     * @param   {Array<Object>}        arrEpgAutoAddData 自動予約登録条件一覧([EpgAutoAddData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendChangeEpgAutoAdd(arrEpgAutoAddData) {
        var options = {
            reqStruct: [
                { name: "arrEpgAutoAddData", type: [types.EpgAutoAddData] }
            ],
            resStruct: [],
            reqData: {
                arrEpgAutoAddData: arrEpgAutoAddData
            },
            param: this.ver === -1 ? settings.cmd.SrvChgEpgAutoAdd : settings.cmd.SrvChgEpgAutoAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * プログラム予約自動登録条件一覧取得
     * @returns {Promise.<Array<Object>,Error>} Promise<プログラム予約自動登録条件一覧([ManualAutoAddData]),エラー>
     */
    sendEnumManualAdd() {
        var options = {
            reqStruct: [],
            resStruct: [
                { name: "arrManualAutoAddData", type: [types.ManualAutoAddData] }
            ],
            reqData: {},
            param: this.ver === -1 ? settings.cmd.SrvEnumManualAdd : settings.cmd.SrvEnumManualAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(data => data.data.arrManualAutoAddData);
    }

    /**
     * プログラム予約自動登録条件追加
     * @param   {Array<Object>}        arrManualAutoAddData プログラム予約自動登録条件一覧([ManualAutoAddData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendAddManualAdd(arrManualAutoAddData) {
        var options = {
            reqStruct: [
                { name: "arrManualAutoAddData", type: [types.ManualAutoAddData] }
            ],
            resStruct: [],
            reqData: {
                arrManualAutoAddData: arrManualAutoAddData
            },
            param: this.ver === -1 ? settings.cmd.SrvAddManualAdd : settings.cmd.SrvAddManualAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * プログラム予約自動登録条件削除
     * @param   {Array.<Number>}       arrManualAddID プログラム予約ID
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendDeleteManualAdd(arrManualAddID) {
        var options = {
            reqStruct: [
                { name: "arrManualAddID", type: [types.ULong] }
            ],
            resStruct: [],
            reqData: {
                arrManualAddID: arrManualAddID
            },
            param: settings.cmd.SrvDelManualAdd,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * プログラム予約自動登録条件変更
     * @param   {Array<Object>}        arrManualAutoAddData プログラム予約自動登録条件一覧([ManualAutoAddData])
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendChangeManualAdd(arrManualAutoAddData) {
        var options = {
            reqStruct: [
                { name: "arrManualAutoAddData", type: [types.ManualAutoAddData] }
            ],
            resStruct: [],
            reqData: {
                arrManualAutoAddData: arrManualAutoAddData
            },
            param: this.ver === -1 ? settings.cmd.SrvChgManualAdd : settings.cmd.SrvChgManualAdd2,
            ver: this.ver
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * サスペンド許可確認
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendCheckSuspend() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvChkSuspend,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * サスペンド
     * @param   {Number}               param パラメータ
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendSuspend(param) {
        var options = {
            reqStruct: [
                {name: "param", type: types.UShort}
            ],
            resStruct: [],
            reqData: {
                param: param
            },
            param: settings.cmd.SrvSuspend,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * リブート
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendReboot() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvReboot,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }

    /**
     * EPG取得
     * @returns {Promise.<void,Error>} Promise<なし,エラー>
     */
    sendEpgCapNow() {
        var options = {
            reqStruct: [],
            resStruct: [],
            reqData: {},
            param: settings.cmd.SrvEpgCapNow,
            ver: -1
        };

        return this.sendCommand(options).then(() => {});
    }
}

module.exports = CtrlCmdUtil;
