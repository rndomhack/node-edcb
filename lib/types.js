/*jshint node:true, esnext:true*/
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
    
    get pos() {
        return this._pos;
    }
    
    set pos(pos) {
        this._pos = pos;
    }
};

types.Char = class {
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 1)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 1;
        return reader.buf.readInt8(pos);
    }
    
    static write(writer, obj) {
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
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 1)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 1;
        return reader.buf.readUInt8(pos);
    }
    
    static write(writer, obj) {
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
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 2)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 2;
        return reader.buf.readInt16LE(pos);
    }
    
    static write(writer, obj) {
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
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 2)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 2;
        return reader.buf.readUInt16LE(pos);
    }
    
    static write(writer, obj) {
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
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 4;
        return reader.buf.readInt32LE(pos);
    }
    
    static write(writer, obj) {
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
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length  < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var pos = reader.pos;
        reader.pos += 4;
        return reader.buf.readUInt32LE(pos);
    }
    
    static write(writer, obj) {
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

types.wstring = class {
    static read(reader) {
        if (reader.constructor !== types.Reader)
            throw new TypeError("reader type is types.Reader");
        
        if (reader.buf.length < reader.pos + 4)
            throw new RangeError("can't read buf anymore");
        
        var size = types.ULong.read(reader);
        if (size > reader.buf.length - reader.pos + 4) {
            throw new RangeError("can't read buf anymore");
        }
        
        var pos = reader.pos;
        reader.pos += size;
        return reader.buf.toString("utf16le", pos, pos + size - 4);
    }
    
    static write(writer, obj) {
        if (writer.constructor !== types.Writer)
            throw new TypeError("writer type is not types.Writer");
        
        if (typeof obj !== "string")
            throw new TypeError("obj is not a string");
        
        types.ULong.writer(writer, 0);
        var size = writer.arr[writer.arr.length - 1];
        
        var buf = new Buffer(obj, "utf16le");
        size.writeUInt32LE(buf.length, 0);
        
        writer.pos += buf.length;
        writer.arr.push(buf);
    }
};

module.exports = types;