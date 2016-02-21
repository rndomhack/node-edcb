# node-edcb
Using EpgDataCap_Bon from node.js

## What's this?
EpgDataCap_Bonをnode.jsから扱えるようにするモジュールです。
基本的にEpgTimerSrvとTCP(または非推奨ですが名前付きパイプ)で接続したり、
設定を直接書き換えるなどをして制御するようになっています。

## Usage
```cmd
git clone https://github.com/rndomhack/node-edcb.git
cd node-edcb
npm i
```