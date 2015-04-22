"use strict";

var fs = require("fs"),
    ini = require("ini"),
    encoding = require("encoding-japanese");

/**
 * @class EDCBの設定を取り扱うクラス。
 */
var Setting = class {

    constructor() {
    }

    load(path) {
        var deferred = Promise.defer();

        fs.readFile(path, ((err, data) => {
            if (err) deferred.reject(err);
            var text = encoding.convert(data, {
                to: "UNICODE",
                from: "SJIS",
                type: "string"
            });
            this.parse(text);
            deferred.resolve(this);
        }).bind(this));

        return deferred.promise;
    }

    parse(text) {
        this.settings = ini.parse(text);
        return this.settings;
    }

    stringify() {
        return ini.stringify(this.settings);
    }

    save(path) {
        var deferred = Promise.defer();

        var text = this.stringify();

        var data = new Buffer(encoding.convert(new Buffer(text, "utf8"), {
            to: "SJIS",
            from: "UTF8"
        }));

        fs.writeFile(path, data, 0, data.length, err => {
            if (err) deferred.reject(err);
            deferred.resolve();
        });

        return deferred.promise;
    }

};

module.exports = Setting;
