"use strict";

var Int64 = require("node-int64");

var types = {};

// Reader and Writer

types.Reader = class {
    constructor(buf, pos) {
        this.buf = buf;
        this.pos = pos || this.pos;
    }
    
    get buf() {
        return this._buf;
    }
    
    set buf(buf) {
        if (!Buffer.isBuffer(buf))
            throw new TypeError("buf is not a buffer");
        
        this._buf = buf;
        this._pos = 0;
    }
    
    get pos() {
        return this._pos;
    }
    
    set pos(pos) {
        this._pos = pos;
    }
};

types.Writer = class {
    constructor(arr, pos) {
        this.arr = arr || [];
        this.pos = pos || this.pos;
    }
    
    add(buf) {
        if (!Buffer.isBuffer(buf))
            throw new TypeError("buf is not a buffer");
        
        this._arr.push(buf);
        this._pos += buf.length;
    }
    
    reset() {
        this._arr = [];
        this._pos = 0;
    }
    
    get arr() {
        return this._arr;
    }
    
    set arr(arr) {
        var pos = 0;
        
        if (!Array.isArray(arr))
            throw new TypeError("arr is not a array");
        
        arr.forEach(buf => {
            if (!Buffer.isBuffer(buf))
                throw new TypeError("buf is not a buffer");
            pos += buf.length;
        });
        
        this._arr = arr;
        this._pos = pos;
    }
    
    get buf() {
        return Buffer.concat(this._arr, this._pos);
    }
    
    set buf(buf) {
        if (!Buffer.isBuffer(buf))
            throw new TypeError("buf is not a buffer");
        
        this._arr = [buf];
        this._pos = buf.length;
    }
    
    get pos() {
        return this._pos;
    }
    
    set pos(pos) {
        this._pos = pos;
    }
};

// Basic Types

types.Number = {
    read: (funcname, size, reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is not types.Reader");
        
        if (!(funcname in Buffer.prototype))
            throw new ReferenceError("can't find funcname in Buffer");
        
        if (typeof Buffer.prototype[funcname] !== "function")
            throw new TypeError("buffer.funcname type is not function");
        
        if (reader.buf.length  < reader.pos + size)
            throw new RangeError("can't read buf anymore");
        
        var obj = reader.buf[funcname](reader.pos);
        reader.pos += size;
        
        return obj;
    },
    write: (obj, funcname, size, range, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!(funcname in Buffer.prototype))
            throw new ReferenceError("can't find funcname in Buffer");
        
        if (typeof Buffer.prototype[funcname] !== "function")
            throw new TypeError("buffer.funcname type is not function");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < range[0] || obj > range[1])
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(size);
        buf.fill(0x00);
        buf[funcname](obj, 0);
        
        writer.add(buf);
    }
};

types.Bool = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias + "LE", this.size, reader, ver) === 1 ? true : false;
    },
    write: (obj, writer, ver) => {
        if (typeof obj !== "boolean")
            throw new TypeError("obj is not a boolean");
        
        types.Number.write(obj ? 1 : 0, "write" + this.alias + "LE", this.size, this.range, writer, ver);
    },
    get alias() {
        return "Int32";
    },
    get range() {
        return [0, 1];
    },
    get size() {
        return 4;
    }
};

types.Char = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias, this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias, this.size, this.range, writer, ver);
    },
    get alias() {
        return "Int8";
    },
    get range() {
        return [-128, 127];
    },
    get size() {
        return 1;
    }
};

types.UChar = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias, this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias, this.size, this.range, writer, ver);
    },
    get alias() {
        return "UInt8";
    },
    get range() {
        return [0, 255];
    },
    get size() {
        return 1;
    }
};

types.Short = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias + "LE", this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias + "LE", this.size, this.range, writer, ver);
    },
    get alias() {
        return "Int16";
    },
    get range() {
        return [-32768, 32767];
    },
    get size() {
        return 2;
    }
};

types.UShort = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias + "LE", this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias + "LE", this.size, this.range, writer, ver);
    },
    get alias() {
        return "UInt16";
    },
    get range() {
        return [0, 65535];
    },
    get size() {
        return 2;
    }
};

types.Int = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias + "LE", this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias + "LE", this.size, this.range, writer, ver);
    },
    get alias() {
        return "Int32";
    },
    get range() {
        return [-2147486948, 2147483647];
    },
    get size() {
        return 4;
    }
};

types.UInt = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias + "LE", this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write(obj, "write" + this.alias + "LE", this.size, this.range, writer, ver);
    },
    get alias() {
        return "UInt32";
    },
    get range() {
        return [0, 4294967295];
    },
    get size() {
        return 4;
    }
};

types.Long = types.Int;
types.ULong = types.UInt;

types.Int64 = {
    read: (reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is not types.Reader");
        
        if (reader.buf.length  < reader.pos + 8)
            throw new RangeError("can't read buf anymore");
        
        var arr = Array.from(reader.buf.slice(reader.pos, reader.pos + 8));
        arr.reverse();
        
        var obj = new Int64(new Buffer(arr));
        reader.pos += 8;
        
        return obj;
    },
    write: (obj, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!(obj instanceof Int64))
            throw new TypeError("obj is not a Int64");
        
        var arr = Array.from(obj.toBuffer());
        arr.reverse();
        
        var buf = new Buffer(arr);
        
        writer.add(buf);
    }
};

types.WString = {
    read: (reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + types.ULong.size)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        
        var size = types.ULong.read(reader, ver);
        
        if (size > reader.buf.length - pos) {
            throw new RangeError("can't read buf anymore");
        }
        
        var obj = reader.buf.toString("utf16le", reader.pos, pos + size).slice(0, -1);
        reader.pos = pos + size;
        
        return obj;
    },
    write: (obj, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "string")
            throw new TypeError("obj is not a string");
        
        var pos = writer.pos;
        
        types.ULong.write(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        var buf = new Buffer(obj + "\u0000", "utf16le");
        writer.add(buf);
        
        bufSize.writeUInt32LE(writer.pos - pos, 0);
    }
};

types.SystemTime = {
    read: (reader, ver) => {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is not types.Reader");
        
        if (reader.buf.length < reader.pos + types.UShort.size * 8)
            throw new RangeError("can't read buf anymore");
        
        var wYear = types.UShort.read(reader, ver);
        var wMonth = types.UShort.read(reader, ver);
        var wDayOfWeek = types.UShort.read(reader, ver);
        var wDay = types.UShort.read(reader, ver);
        var wHour = types.UShort.read(reader, ver);
        var wMinute = types.UShort.read(reader, ver);
        var wSecond = types.UShort.read(reader, ver);
        var wMilliseconds = types.UShort.read(reader, ver);
        
        var obj = new Date(Date.UTC(wYear, wMonth - 1, wDay, wHour, wMinute, wSecond, wMilliseconds));
        
        return obj;
    },
    write: (obj, writer, ver) => {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        // Object.prototype.toString.call(obj) === "[object Date]"
        if (!(obj instanceof Date))
            throw new TypeError("obj type is not Date");
        
        types.UShort.write(obj.getUTCFullYear(), writer, ver);
        types.UShort.write(obj.getUTCMonth() + 1, writer, ver);
        types.UShort.write(obj.getUTCDay(), writer, ver);
        types.UShort.write(obj.getUTCDate(), writer, ver);
        types.UShort.write(obj.getUTCHours(), writer, ver);
        types.UShort.write(obj.getUTCMinutes(), writer, ver);
        types.UShort.write(obj.getUTCSeconds(), writer, ver);
        types.UShort.write(obj.getUTCMilliseconds(), writer, ver);
    }
};

types.Vector = {
    read: (type, reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is not types.Reader");
        
        if (reader.buf.length < reader.pos + types.ULong.size * 2)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        
        var size = types.ULong.read(reader, ver);
        var length = types.ULong.read(reader, ver);
        
        if (size > reader.buf.length - pos)
            throw new RangeError("can't read buf anymore");
        
        var obj = [];
        for (let i = 0; i < length; ++i) {
            obj.push(type.read(reader, ver));
        }
        
        return obj;
    },
    write: (obj, type, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!Array.isArray(obj))
            throw new TypeError("obj is not an array");
        
        var pos = writer.pos;
        
        types.ULong.write(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        types.ULong.write(obj.length, writer, ver);
        
        obj.forEach(function(value) {
            type.write(value, writer, ver);
        });
        
        bufSize.writeUInt32LE(writer.pos - pos, 0);
    }
};

types.Struct = {
    read: (struct, reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is not types.Reader");
        
        if (!Array.isArray(struct))
            throw new TypeError("struct is not an array");
        
        if (reader.buf.length < reader.pos + types.ULong.size)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        
        var size = types.ULong.read(reader, ver);
        
        if (size > reader.buf.length - pos) {
            throw new RangeError("can't read buf anymore");
        }
        
        var obj = {};
        struct.forEach(function(item) {
            if (Array.isArray(item.type)) {
                obj[item.name] = types.Vector.read(item.type[0], reader, ver);
            } else {
                obj[item.name] = item.type.read(reader, ver);
            }
        });
        
        return obj;
    },
    write: (obj, struct, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!Array.isArray(struct))
            throw new TypeError("struct is not an array");
        
        var pos = writer.pos;
        
        types.ULong.write(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        struct.forEach(function(item) {
            if (Array.isArray(item.type)) {
                types.Vector.write(obj[item.name], item.type[0], writer, ver);
            } else {
                item.type.write(obj[item.name], writer, ver);
            }
        });
        
        bufSize.writeUInt32LE(writer.pos - pos, 0);
    }
};

// EDCB Structs (from CtrlCmdCLIDef.h)

types.CmdStreamHead = {
    read: (reader, ver) => {
        var obj = {};
        obj.param = types.ULong.read(reader, ver);
        obj.dataSize = types.ULong.read(reader, ver);
        return obj;
    },
    write: (obj, writer, ver) => {
        types.ULong.write(obj.param, writer, ver);
        types.ULong.write(obj.dataSize, writer, ver);
    }
};

types.CmdStreamData = {
    read: (struct, reader, ver) => {
        if (!(reader instanceof types.Reader))
            throw new TypeError("reader type is not types.Reader");
        
        if (!Array.isArray(struct))
            throw new TypeError("struct is not an array");
        
        if (reader.buf.length < reader.pos + types.ULong.size)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        
        var obj = {};
        struct.forEach(function(item) {
            if (Array.isArray(item.type)) {
                obj[item.name] = types.Vector.read(item.type[0], reader, ver);
            } else {
                obj[item.name] = item.type.read(reader, ver);
            }
        });
        
        return obj;
    },
    write: (obj, struct, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!Array.isArray(struct))
            throw new TypeError("struct is not an array");
        
        var pos = writer.pos;
        
        struct.forEach(function(item) {
            if (Array.isArray(item.type)) {
                types.Vector.write(obj[item.name], item.type[0], writer, ver);
            } else {
                item.type.write(obj[item.name], writer, ver);
            }
        });
    }
};

types.RecFileSetInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "recFolder", type: types.WString },
            { name: "writePlugIn", type: types.WString },
            { name: "recNamePlugIn", type: types.WString },
            { name: "recFileName", type: types.WString }
        ];
        return struct;
    }
};

types.RecSettingData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "recMode", type: types.UChar },
            { name: "priority", type: types.UChar },
            { name: "tuijyuuFlag", type: types.UChar },
            { name: "serviceMode", type: types.ULong },
            { name: "pittariFlag", type: types.UChar },
            { name: "batFilePath", type: types.WString },
            { name: "recFolderList", type: [types.RecFileSetInfo] },
            { name: "suspendMode", type: types.UChar },
            { name: "rebootFlag", type: types.UChar },
            { name: "useMargineFlag", type: types.UChar },
            { name: "startMargine", type: types.Int },
            { name: "endMargine", type: types.Int },
            { name: "continueRecFlag", type: types.UChar },
            { name: "partialRecFlag", type: types.UChar },
            { name: "tunerID", type: types.ULong }
        ];
        if (ver >= 2) {
            struct = struct.concat([
                { name: "partialRecFolder", type: [types.RecFileSetInfo] }
            ]);
        }
        return struct;
    }
};

types.ReserveData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "title", type: types.WString },
            { name: "startTime", type: types.SystemTime },
            { name: "durationSecond", type: types.ULong },
            { name: "stationName", type: types.WString },
            { name: "originalNetworkID", type: types.UShort },
            { name: "transportStreamID", type: types.UShort },
            { name: "serviceID", type: types.UShort },
            { name: "eventID", type: types.UShort },
            { name: "comment", type: types.WString },
            { name: "reserveID", type: types.ULong },
            { name: "recWaitFlag", type: types.UChar },
            { name: "overlapMode", type: types.UChar },
            { name: "recFilePath", type: types.WString },
            { name: "startTimeEpg", type: types.SystemTime },
            { name: "recSetting", type: types.RecSettingData },
            { name: "reserveStatus", type: types.ULong }
        ];
        if (ver >= 5) {
            struct = struct.concat([
                { name: "recFileNameList", type: [types.WString] },
                { name: "param1", type: types.ULong }
            ]);
        }
        return struct;
    }
};

types.RecFileInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "id", type: types.ULong },
            { name: "recFilePath", type: types.WString },
            { name: "title", type: types.WString },
            { name: "startTime", type: types.SystemTime },
            { name: "durationSecond", type: types.ULong },
            { name: "serviceName", type: types.WString },
            { name: "originalNetworkID", type: types.UShort },
            { name: "transportStreamID", type: types.UShort },
            { name: "serviceID", type: types.UShort },
            { name: "eventID", type: types.UShort },
            { name: "drops", type: types.Int64 },
            { name: "scrambles", type: types.Int64 },
            { name: "recStatus", type: types.ULong },
            { name: "startTimeEpg", type: types.SystemTime },
            { name: "comment", type: types.WString },
            { name: "programInfo", type: types.WString },
            { name: "errInfo", type: types.WString }
        ];
        if (ver >= 4) {
            struct = struct.concat([
                { name: "protectFlag", type: types.UChar }
            ]);
        }
        return struct;
    }
};

types.EpgShortEventInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "event_name", type: types.WString },
            { name: "text_char", type: types.WString },
            { name: "search_event_name", type: types.WString },
            { name: "search_text_char", type: types.WString }
        ];
        return struct;
    }
};

types.EpgExtendedEventInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "text_char", type: types.WString },
            { name: "search_text_char", type: types.WString }
        ];
        return struct;
    }
};

types.EpgContentData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "content_nibble_level_1", type: types.UChar },
            { name: "content_nibble_level_2", type: types.UChar },
            { name: "user_nibble_1", type: types.UChar },
            { name: "user_nibble_2", type: types.UChar }
        ];
        return struct;
    }
};

types.EpgContentInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "nibbleList", type: [types.EpgContentData] }
        ];
        return struct;
    }
};

types.EpgComponentInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "stream_content", type: types.UChar },
            { name: "component_type", type: types.UChar },
            { name: "component_tag", type: types.UChar },
            { name: "text_char", type: types.WString }
        ];
        return struct;
    }
};

types.EpgAudioComponentInfoData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "stream_content", type: types.UChar },
            { name: "component_type", type: types.UChar },
            { name: "component_tag", type: types.UChar },
            { name: "stream_type", type: types.UChar },
            { name: "simulcast_group_tag", type: types.UChar },
            { name: "ES_multi_lingual_flag", type: types.UChar },
            { name: "main_component_flag", type: types.UChar },
            { name: "quality_indicator", type: types.UChar },
            { name: "sampling_rate", type: types.UChar },
            { name: "text_char", type: types.WString }
        ];
        return struct;
    }
};

types.EpgAudioComponentInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "componentList", type: [types.EpgAudioComponentInfoData] }
        ];
        return struct;
    }
};

types.EpgEventData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "original_network_id", type: types.UShort },
            { name: "transport_stream_id", type: types.UShort },
            { name: "service_id", type: types.UShort },
            { name: "event_id", type: types.UShort }
        ];
        return struct;
    }
};

types.EpgEventGroupInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "group_type", type: types.UChar },
            { name: "eventDataList", type: [types.EpgEventData] }
        ];
        return struct;
    }
};

types.EpgEventInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "original_network_id", type: types.UShort },
            { name: "transport_stream_id", type: types.UShort },
            { name: "service_id", type: types.UShort },
            { name: "event_id", type: types.UShort },
            { name: "StartTimeFlag", type: types.UChar },
            { name: "start_time", type: types.SystemTime },
            { name: "DurationFlag", type: types.UChar },
            { name: "durationSec", type: types.ULong },
            { name: "shortInfo", type: types.EpgShortEventInfo },
            { name: "extInfo", type: types.EpgExtendedEventInfo },
            { name: "contentInfo", type: types.EpgContentInfo },
            { name: "componentInfo", type: types.EpgComponentInfo },
            { name: "audioInfo", type: types.EpgAudioComponentInfo },
            { name: "eventGroupInfo", type: types.EpgEventGroupInfo },
            { name: "eventRelayInfo", type: types.EpgEventGroupInfo },
            { name: "freeCAFlag", type: types.UChar }
        ];
        return struct;
    }
};

types.EpgServiceInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "ONID", type: types.UShort },
            { name: "TSID", type: types.UShort },
            { name: "SID", type: types.UShort },
            { name: "service_type", type: types.UChar },
            { name: "partialReceptionFlag", type: types.UChar },
            { name: "service_provider_name", type: types.WString },
            { name: "service_name", type: types.WString },
            { name: "network_name", type: types.WString },
            { name: "ts_name", type: types.WString },
            { name: "remote_control_key_id", type: types.UChar }
        ];
        return struct;
    }
};

types.EpgSearchDateInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "startDayOfWeek", type: types.UChar },
            { name: "startHour", type: types.UShort },
            { name: "startMin", type: types.UShort },
            { name: "endDayOfWeek", type: types.UChar },
            { name: "endHour", type: types.UShort },
            { name: "endMin", type: types.UShort }
        ];
        return struct;
    }
};

types.EpgSearchKeyInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "andKey", type: types.WString },
            { name: "notKey", type: types.WString },
            { name: "regExpFlag", type: types.Bool },
            { name: "titleOnlyFlag", type: types.Bool },
            { name: "contentList", type: [types.EpgContentData] },
            { name: "dateList", type: [types.EpgSearchDateInfo] },
            { name: "serviceList", type: [types.Int64] },
            { name: "videoList", type: [types.UShort] },
            { name: "audioList", type: [types.UShort] },
            { name: "aimaiFlag", type: types.UChar },
            { name: "notContetFlag", type: types.UChar },
            { name: "notDateFlag", type: types.UChar },
            { name: "freeCAFlag", type: types.UChar }
        ];
        if (ver >= 3) {
            struct = struct.concat([
                { name: "chkRecEnd", type: types.UChar },
                { name: "chkRecDay", type: types.UShort }
            ]);
        }
        return struct;
    }
};

types.EpgAutoAddData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "dataID", type: types.ULong },
            { name: "searchInfo", type: types.EpgSearchKeyInfo },
            { name: "recSetting", type: types.RecSettingData },
            { name: "addCount", type: types.ULong }
        ];
        return struct;
    }
};

types.ManualAutoAddData = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "dataID", type: types.ULong },
            { name: "dayOfWeekFlag", type: types.UChar },
            { name: "startTime", type: types.ULong },
            { name: "durationSecond", type: types.ULong },
            { name: "title", type: types.WString },
            { name: "stationName", type: types.WString },
            { name: "originalNetworkID", type: types.UShort },
            { name: "transportStreamID", type: types.UShort },
            { name: "serviceID", type: types.UShort },
            { name: "recSetting", type: types.RecSettingData }
        ];
        return struct;
    }
};

types.TunerReserveInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "tunerID", type: types.ULong },
            { name: "tunerName", type: types.WString },
            { name: "reserveList", type: [types.ULong] }
        ];
        return struct;
    }
};

types.EpgServiceEventInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "serviceInfo", type: types.EpgServiceInfo },
            { name: "eventList", type: types.EpgEventInfo }
        ];
        return struct;
    }
};

types.SetChInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "useSID;", type: types.Bool },
            { name: "ONID", type: types.UShort },
            { name: "TSID", type: types.UShort },
            { name: "SID", type: types.UShort },
            { name: "useBonCh", type: types.Bool },
            { name: "space", type: types.ULong },
            { name: "ch", type: types.ULong },
            { name: "swBasic", type: types.Bool }
        ];
        return struct;
    }
};

types.TvTestChChgInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "bonDriver", type: types.WString },
            { name: "chInfo", type: types.SetChInfo }
        ];
        return struct;
    }
};

types.TVTestStreamingInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "enableMode", type: types.Bool },
            { name: "ctrlID", type: types.ULong },
            { name: "serverIP", type: types.ULong },
            { name: "serverPort", type: types.ULong },
            { name: "filePath", type: types.WString },
            { name: "udpSend", type: types.Bool },
            { name: "tcpSend", type: types.Bool },
            { name: "timeShiftMode", type: types.Bool }
        ];
        return struct;
    }
};

types.NWPlayTimeShiftInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Struct.write(obj, this.struct(ver), writer, ver);
    },
    struct: (ver) => {
        var struct = [
            { name: "ctrlID", type: types.ULong },
            { name: "ip", type: types.ULong },
            { name: "udp", type: types.UChar },
            { name: "tcp", type: types.UChar },
            { name: "udpPort", type: types.ULong },
            { name: "tcpPort", type: types.ULong }
        ];
        return struct;
    }
};

module.exports = types;