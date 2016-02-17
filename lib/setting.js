"use strict";

const fs = require("fs");
const ini = require("ini");
const encoding = require("encoding-japanese");

/**
 * @class EDCBの設定を取り扱うクラス
 */
class Setting {
    constructor() {

    }

    load(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                var text = encoding.convert(data, {
                    to: "UNICODE",
                    from: "SJIS",
                    type: "string"
                });

                this.parse(text);

                resolve();
            });
        });
    }

    save(path) {
        return new Promise((resolve, reject) => {
            var text = this.stringify();

            var data = new Buffer(encoding.convert(new Buffer(text, "utf8"), {
                to: "SJIS",
                from: "UTF8"
            }));

            fs.writeFile(path, data, 0, data.length, err => {
                if (err) reject(err);

                resolve();
            });
        });
    }

    parse(text) {
        this.settings = ini.parse(text);
        return this.settings;
    }

    stringify() {
        return ini.stringify(this.settings);
    }

}

module.exports = Setting;
