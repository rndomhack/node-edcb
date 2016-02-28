"use strict";

const net = require("net");
const EventEmitter = require("events").EventEmitter;
const types = require("./types");

const settings = {
    ver: 5,
    cmd: {
        TimerGuiShowDlg:            101,
        TimerGuiUpdateReserve:      102,
        TimerGuiUpdateEpgData:      103,
        TimerGuiViewExecute:        110,
        TimerGuiQuerySuspend:       120,
        TimerGuiQueryReboot:        121,
        TimerGuiSrvStatusChg:       130,

        // バージョン情報追加対応版
        TimerGuiSrvStatusNotify2:   1130
    },
    err: {
        CmdSuccess:             1,
        CmdErr:                 0,
        CmdNext:                202,
        CmdNonSupport:          203,
        CmdErrInvalidArg:       204,
        CmdErrConnect:          205,
        CmdErrDisconnect:       206,
        CmdErrTimeout:          207,
        CmdErrBusy:             208,
        CmdNoRes:               250
    }
};

/**
 * CtrlCmdNotifyクラス
 * @class CtrlCmdNotify
 */
class CtrlCmdNotify extends EventEmitter {
    constructor(options) {
        super();

        options = options || {};

        this.mode = options.mode || false;

        this.identifier = options.identifier || Math.floor(Math.random() * 0x100000000);
        this.pipeName = options.pipeName || `\\\\.\\pipe\\EpgTimerGUI_Ctrl_BonPipe_${this.identifier}`;

        this.port = options.port || 4511;

        this.ver = options.ver || settings.ver;

        this.server = null;
    }

    get mode() {
        return this._mode;
    }

    set mode(mode) {
        if (typeof mode !== "boolean")
            throw new TypeError("property is not a boolean");

        this._mode = mode;
    }

    get identifier() {
        return this._identifier;
    }

    set identifier(identifier) {
        if (typeof identifier !== "number")
            throw new TypeError("property is not a number");

        this._identifier = identifier;
    }

    get pipeName() {
        return this._pipeName;
    }

    set pipeName(pipeName) {
        if (typeof pipeName !== "string")
            throw new TypeError("property is not a string");

        this._pipeName = pipeName;
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
     * サーバーを起動
     * @returns {Void} なし
     */
    startServer() {
        if (this.server !== null) return;

        const server = net.createServer(socket => {
            socket.on("data", data => {
                this.emit("data", data);

                var reader = new types.Reader(data);
                var writer = new types.Writer();
                var obj = {};
                var buf;
                var error = settings.err.CmdSuccess;

                try {
                    obj = types.CmdStreamHead.read(reader, this.ver);
                } catch (err) {
                    this.emit("error", new Error("can't parse head: " + err.message));
                    error = settings.err.CmdErr;
                }

                if (error === settings.err.CmdSuccess) {
                    switch (obj.param) {
                        case settings.cmd.TimerGuiSrvStatusNotify2:
                            if (this.ver === -1) {
                                error = settings.err.CmdNonSupport;
                                break;
                            }

                            try {
                                obj.data = types.CmdStreamData.read([
                                    { name: "ver", type: types.UShort },
                                    { name: "notifySrvInfo", type: types.NotifySrvInfo }
                                ], reader, this.ver);
                            } catch (err) {
                                this.emit("error", new Error("can't parse data: " + err.stack));
                                error = settings.err.CmdErr;
                                break;
                            }

                            this.emit("notify", obj);
                            break;

                        case settings.cmd.TimerGuiUpdateEpgData:
                        case settings.cmd.TimerGuiUpdateReserve:
                            this.emit("notify", obj);
                            break;

                        case settings.cmd.TimerGuiSrvStatusChg:
                            try {
                                obj.data = types.CmdStreamData.read([
                                    { name: "status", type: types.UShort }
                                ], reader, this.ver);
                            } catch (err) {
                                this.emit("error", new Error("can't parse data: " + err.stack));
                                error = settings.err.CmdErr;
                                break;
                            }

                            this.emit("notify", obj);
                            break;
                    }
                }

                try {
                    if (this.ver === -1) {
                        types.CmdStreamData.write({}, [], writer, this.ver);
                    } else {
                        types.CmdStreamData.write({ ver: this.ver }, [{ name: "ver", type: types.UShort }], writer, this.ver);
                    }
                    buf = writer.buf;
                    writer.reset();

                    types.CmdStreamHead.write({ param: error, dataSize: buf.length }, writer, this.ver);
                    writer.add(buf);
                    buf = writer.buf;
                } catch (err) {
                    this.emit("error", new Error("can't write data: " + err.stack));
                    server.close();
                    return;
                }

                socket.write(buf);
            });

            socket.on("error", err => {
                this.emit("error", err);
            });
        });

        server.on("close", () => {
            this.emit("close");
            this.server = null;
        });

        server.on("error", err => {
            this.emit("error", err);
        });

        server.listen(this.mode ? this.port : this.pipeName, () => {
            this.emit("listening");
        });

        this.server = server;
    }

    /**
     * サーバーを終了
     * @returns {Void} なし
     */
    stopServer() {
        if (this.server === null) return;

        this.server.close();
    }
}

module.exports = CtrlCmdNotify;
