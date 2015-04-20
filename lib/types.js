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
    write: (funcname, size, range, obj, writer, ver) => {
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
        
        writer.pos += size;
        writer.arr.push(buf);
    }
};

types.Char = {
    read: (reader, ver) => {
        return types.Number.read("read" + this.alias, this.size, reader, ver);
    },
    write: (obj, writer, ver) => {
        types.Number.write("write" + this.alias, this.size, this.range, obj, writer, ver);
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
        types.Number.write("write" + this.alias, this.size, this.range, obj, writer, ver);
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
        types.Number.write("write" + this.alias + "LE", this.size, this.range, obj, writer, ver);
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
        types.Number.write("write" + this.alias + "LE", this.size, this.range, obj, writer, ver);
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
        types.Number.write("write" + this.alias + "LE", this.size, this.range, obj, writer, ver);
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
        types.Number.write("write" + this.alias + "LE", this.size, this.range, obj, writer, ver);
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
        
        types.ULong.writer(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        var buf = new Buffer(obj + "\u0000", "utf16le");
        writer.pos += buf.length;
        writer.arr.push(buf);
        
        bufSize.writeUInt32LE(writer.pos - pos, 0);
    }
};

types.SystemTime = {
    read: (reader, ver) => {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is not types.Reader");
        
        if (reader.buf.length < reader.pos + types.UShort.size * 8)
            throw new RangeError("can't read buf anymore");
        
        var obj = {};
        obj.wYear = types.UShort.read(reader, ver);
        obj.wMonth = types.UShort.read(reader, ver);
        obj.wDayOfWeek = types.UShort.read(reader, ver);
        obj.wDay = types.UShort.read(reader, ver);
        obj.wHour = types.UShort.read(reader, ver);
        obj.wMinute = types.UShort.read(reader, ver);
        obj.wSecond = types.UShort.read(reader, ver);
        obj.wMilliseconds = types.UShort.read(reader, ver);
        
        return obj;
    },
    write: (obj, writer, ver) => {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "object")
            throw new TypeError("obj is not a object");
        
        types.UShort.writer(obj.wYear, writer, ver);
        types.UShort.writer(obj.wMonth, writer, ver);
        types.UShort.writer(obj.wDayOfWeek, writer, ver);
        types.UShort.writer(obj.wDay, writer, ver);
        types.UShort.writer(obj.wHour, writer, ver);
        types.UShort.writer(obj.wMinute, writer, ver);
        types.UShort.writer(obj.wSecond, writer, ver);
        types.UShort.writer(obj.wMilliseconds, writer, ver);
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
    write: (type, obj, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!Array.isArray(obj))
            throw new TypeError("obj is not an array");
        
        var pos = writer.pos;
        
        types.ULong.writer(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        types.ULong.writer(obj.length, writer, ver);
        
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
    write: (struct, obj, writer, ver) => {
        if (!(writer instanceof types.Writer))
            throw new TypeError("writer type is not types.Writer");
        
        if (!Array.isArray(struct))
            throw new TypeError("struct is not an array");
        
        var pos = writer.pos;
        
        types.ULong.writer(0, writer, ver);
        var bufSize = writer.arr[writer.arr.length - 1];
        
        types.ULong.writer(obj.length, writer, ver);
        
        struct.forEach(function(item) {
            if (Array.isArray(item.type)) {
                types.Vector.write(item.type[0], obj[item.name], writer, ver);
            } else {
                item.type.write(obj[item.name], writer, ver);
            }
        });
        
        bufSize.writeUInt32LE(writer.pos - pos, 0);
    }
};

// EDCB Structs

types.RecFileSetInfo = {
    read: (reader, ver) => {
        return types.Struct.read(this.struct(ver), reader, ver);
    },
    write: (obj, writer, ver) => {
        return types.Struct.write(obj, this.struct(ver), writer, ver);
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
        return types.Struct.write(obj, this.struct(ver), writer, ver);
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
        return types.Struct.write(obj, this.struct(ver), writer, ver);
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

module.exports = types;