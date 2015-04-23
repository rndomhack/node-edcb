/**
 * Usage:
 *   powershell.exe
 *   Add-Type -Path "C:\path\to\CtrlCmdCLI.dll";
 *   $util = New-Object CtrlCmdCLI.CtrlCmdUtil;
 *   $util.SetPipeSetting("Global\EpgTimerSrvConnect", "\\.\pipe\NodeEpgTimerServerPipe");
 *   $list = @{};
 *   $util.SendEnumReserve([ref]$list);
 *   $list;
 */

var net = require("net");
var types = require("../lib/types");

var server = net.createServer();

server.on("listening", function() {
    console.log("** server listening **");
});

server.on("connection", function(socket) {
    console.log("** server connection start **");
    
    socket.on("data", function(data) {
        console.log("\n** server data **");
        console.log(data);
        
        try {
            var reader = new types.Reader(data);

            var server_head = types.CmdStreamHead.read(reader);
            console.log("param: " + server_head.param);
            console.log("dataSize: " + server_head.dataSize);
        } catch(err) {
            console.log(err.stack);
        }

        console.log("-- server data --\n");
        
        var client = net.connect("\\\\.\\pipe\\EpgTimerSrvPipe");
        
        client.on("connect", function() {
            console.log("\n** client connected **");
            
            client.on("data", function(data) {
                console.log("** client data **");
                console.log(data);
                
                try {
                    var reader = new types.Reader(data);

                    var client_head = types.CmdStreamHead.read(reader);
                    console.log("param: " + client_head.param);
                    console.log("dataSize: " + client_head.dataSize);
                    
                    if (client_head.param === 1) {
                        var obj = {};
                        if (server_head.param >= 2000) {
                            var ver = types.UShort.read(reader);
                            console.log("ver: " + ver);
                        }
                        switch (server_head.param) {
                            case 1021:
                                obj = types.Vector.read(types.EpgServiceInfo, reader);
                                break;
                            case 1022:
                                obj = types.Vector.read(types.EpgEventInfo, reader);
                                break;
                            case 1023:
                                obj = types.EpgEventInfo.read(reader);
                                break;
                            case 1026:
                                obj = types.Vector.read(types.EpgServiceEventInfo, reader);
                                break;
                            case 2011:
                                obj = types.Vector.read(types.ReserveData, reader, ver);
                                break;
                            case 2012:
                                obj = types.ReserveData.read(reader, ver);
                                break;
                            case 2017:
                                obj = types.Vector.read(types.RecFileInfo, reader, ver);
                                break;
                            case 2131:
                                obj = types.Vector.read(types.EpgAutoAddData, reader, ver);
                                break;
                            case 2141:
                                obj = types.Vector.read(types.ManualAutoAddData, reader, ver);
                                break;
                        }

                        console.log(JSON.stringify(obj, null, "  "));
                    }
                } catch(err) {
                    console.log(err.stack);
                }

                console.log("** client data **\n");
                
                socket.write(data);
                
                client.end();
            });
            
            client.on("end", function() {
                console.log("** client disconnected **");
            });
            
            client.on("error", function(err) {
                console.log("** client error or disconnect **");
            });
            
            client.write(data);
        });
        
    });
    
    socket.on("end", function() {
        console.log("** server connection end **");
    });
});

server.on("close", function() {
    console.log("** server closed **");
});

server.on("error", function() {
    console.log("** server error **");
});

server.listen("\\\\.\\pipe\\NodeEpgTimerServerPipe");

process.on("SIGINT", function() {
    server.close();
});