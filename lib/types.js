"use strict";

var types = {};

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
    
    get pos() {
        return this._pos;
    }
    
    set pos(pos) {
        this._pos = pos;
    }
};

types.Bool = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 1)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 1;
        return !!reader.buf.readInt8(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "boolean")
            throw new TypeError("obj is not a boolean");
        
        var buf = new Buffer(1);
        buf.fill(0x00);
        buf.writeInt8(obj, obj ? 1 : 0);
        
        writer.pos += 1;
        writer.arr.push(buf);
    }
};

types.Char = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 1)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 1;
        return reader.buf.readInt8(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < -128 || obj > 127)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(1);
        buf.fill(0x00);
        buf.writeInt8(obj, 0);
        
        writer.pos += 1;
        writer.arr.push(buf);
    }
};

types.UChar = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 1)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 1;
        return reader.buf.readUInt8(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < 0 || obj > 255)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(1);
        buf.fill(0x00);
        buf.writeUInt8(obj, 0);
        
        writer.pos += 1;
        writer.arr.push(buf);
    }
};


types.Short = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 2)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 2;
        return reader.buf.readInt16LE(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < -32768 || obj > 32767)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(2);
        buf.fill(0x00);
        buf.writeInt16LE(obj, 0);
        
        writer.pos += 2;
        writer.arr.push(buf);
    }
};

types.UShort = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 2)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 2;
        return reader.buf.readUInt16LE(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < 0 || obj > 65535)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(2);
        buf.fill(0x00);
        buf.writeUInt16LE(obj, 0);
        
        writer.pos += 2;
        writer.arr.push(buf);
    }
};

types.Int = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 4;
        return reader.buf.readInt32LE(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < -2147486948 || obj > 2147483647)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(4);
        buf.fill(0x00);
        buf.writeInt32LE(obj, 0);
        
        writer.pos += 4;
        writer.arr.push(buf);
    }
};

types.UInt = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 4;
        return reader.buf.readUInt32LE(pos);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "number")
            throw new TypeError("obj is not a number");
        
        if (obj < 0 || obj > 4294967295)
            throw new RangeError("obj range is incorrect");
        
        var buf = new Buffer(4);
        buf.fill(0x00);
        buf.writeUInt32LE(obj, 0);
        
        writer.pos += 4;
        writer.arr.push(buf);
    }
};

types.Long = types.Int;
types.ULong = types.UInt;

types.Vector = class {
    static read(type, reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 8)
            throw new RangeError("can't read buf anymore");
        
        var size = types.ULong.read(reader, ver);
        var length = types.ULong.read(reader, ver);
        
        if (size > reader.buf.length - reader.pos + 8) {
            throw new RangeError("can't read buf anymore");
        }
        
        var obj = [];
        for (let i = 0; i < length; ++i) {
            obj.push(type.read(reader, ver));
        }
        
        return obj;
    }
    
    static write(type, obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        var pos = writer.pos;
        
        types.ULong.writer(0, writer, ver);
        var size = writer.arr[writer.arr.length - 1];
        
        types.ULong.writer(obj.length, writer, ver);
        
        obj.forEach(function(value) {
            types.write(value, writer, ver);
        });
        
        size.writeUInt32LE(writer.pos - pos, 0);
    }
};

types.WString = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var size = types.ULong.read(reader, ver);
        if (size > reader.buf.length - reader.pos + 4) {
            throw new RangeError("can't read buf anymore");
        }
        
        var pos = reader.pos;
        reader.pos += size;
        return reader.buf.toString("utf16le", pos, pos + size - 4);
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "string")
            throw new TypeError("obj is not a string");
        
        types.ULong.writer(0, writer, ver);
        var size = writer.arr[writer.arr.length - 1];
        
        var buf = new Buffer(obj, "utf16le");
        size.writeUInt32LE(buf.length + 4, 0);
        
        writer.pos += buf.length;
        writer.arr.push(buf);
    }
};

types.SystemTime = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 16)
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
    }
    
    static write(obj, writer, ver) {
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

types.RecFileSetInfo = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var size = types.ULong.read(reader, ver);
        if (size > reader.buf.length - reader.pos + 4) {
            throw new RangeError("can't read buf anymore");
        }
        
        var obj = {};
        obj.recFolder = types.wstring.read(reader, ver);
        obj.writePlugIn = types.wstring.read(reader, ver);
        obj.recNamePlugIn = types.wstring.read(reader, ver);
        obj.recFileName = types.wstring.read(reader, ver);
        
        return obj;
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "object")
            throw new TypeError("obj is not a object");
        
        var pos = writer.pos;
        
        types.ULong.writer(0, writer, ver);
        var size = writer.arr[writer.arr.length - 1];
        
        types.wstring.writer(obj.recFolder, writer, ver);
        types.wstring.writer(obj.writePlugIn, writer, ver);
        types.wstring.writer(obj.recNamePlugIn, writer, ver);
        types.wstring.writer(obj.recFileName, writer, ver);
        
        size.writeUInt32LE(writer.pos - pos, 0);
    }
};

types.RecSettingData = class {
    static read(reader, ver) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var size = types.ULong.read(reader, ver);
        if (size > reader.buf.length - reader.pos + 4) {
            throw new RangeError("can't read buf anymore");
        }
        
        var obj = {};
        obj.recMode = types.UChar.read(reader, ver);
        obj.priority = types.UChar.read(reader, ver);
        obj.tuijyuuFlag = types.UChar.read(reader, ver);
        obj.serviceMode = types.ULong.read(reader, ver);
        obj.pittariFlag = types.UChar.read(reader, ver);
        obj.batFilePath = types.wstring.read(reader, ver);
        obj.recFolderList = types.Vector.read(types.RecFileSetInfo, reader, ver);
        obj.suspendMode = types.UChar.read(reader, ver);
        obj.rebootFlag = types.UChar.read(reader, ver);
        obj.useMargineFlag = types.UChar.read(reader, ver);
        obj.startMargine = types.Int.read(reader, ver);
        obj.endMargine = types.Int.read(reader, ver);
        obj.continueRecFlag = types.UChar.read(reader, ver);
        obj.partialRecFlag = types.UChar.read(reader, ver);
        obj.tunerID = types.ULong.read(reader, ver);
        obj.partialRecFolder = types.Vector.read(types.RecFileSetInfo, reader, ver);
        
        return obj;
    }
    
    static write(obj, writer, ver) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "object")
            throw new TypeError("obj is not a object");
        
        var pos = writer.pos;
        
        types.ULong.writer(0, writer, ver);
        var size = writer.arr[writer.arr.length - 1];
        
        types.UChar.writer(obj.recMode, writer, ver);
        types.UChar.writer(obj.priority, writer, ver);
        types.UChar.writer(obj.tuijyuuFlag, writer, ver);
        types.ULong.writer(obj.serviceMode, writer, ver);
        types.UChar.writer(obj.pittariFlag, writer, ver);
        types.wstring.writer(obj.batFilePath, writer, ver);
        types.Vector.writer(types.RecFileSetInfo, obj.recFolderList, writer, ver);
        types.UChar.writer(obj.suspendMode, writer, ver);
        types.UChar.writer(obj.rebootFlag, writer, ver);
        types.UChar.writer(obj.useMargineFlag, writer, ver);
        types.INT.writer(obj.startMargine, writer, ver);
        types.INT.writer(obj.endMargine, writer, ver);
        types.UChar.writer(obj.continueRecFlag, writer, ver);
        types.UChar.writer(obj.partialRecFlag, writer, ver);
        types.ULong.writer(obj.tunerID, writer, ver);
        types.Vector.writer(types.RecFileSetInfo, obj.partialRecFolder, writer, ver);
        
        size.writeUInt32LE(writer.pos - pos, 0);
    }
};

module.exports = types;