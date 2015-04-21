var net = require("net");
var types = require("../lib/types");

var server = net.createServer();

server.on("listening", function() {
    console.log("- server listening...");
});

server.on("connection", function(socket) {
    console.log("-- server connection start...");
    
    socket.on("data", function(data) {
        console.log("");
        console.log("-- server data:");
        console.log(data);
        
        try {
            var reader = new types.Reader(data);
            
            var server_param = types.ULong.read(reader);
            var server_dataSize = types.ULong.read(reader);
            console.log("param: " + server_param);
            console.log("dataSize: " + server_dataSize);
        } catch(e) {
            console.log(e);
        }
        
        var client = net.connect("\\\\.\\pipe\\EpgTimerSrvPipe");
        
        client.on("connect", function() {
            console.log("--- client connected.");
            
            client.on("data", function(data) {
                console.log("");
                console.log("--- client data:");
                console.log(data);
                
                try {
                    var reader = new types.Reader(data);
                    
                    var client_param = types.ULong.read(reader);
                    var client_dataSize = types.ULong.read(reader);
                    console.log("param: " + client_param);
                    console.log("dataSize: " + client_dataSize);
                    
                    if (client_param === 1) {
                        var obj = {};
                        if (server_param >= 2011) {
                            var client_ver = types.UShort.read(reader);
                            console.log("ver: " + client_ver);
                            
                            switch (server_param) {
                                case 2011:
                                    obj = types.Vector.read(types.ReserveData, reader, client_ver);
                                    break;
                                case 2012:
                                    obj = types.ReserveData.read(reader, client_ver);
                                    break;
                                case 2017:
                                    obj = types.Vector.read(types.RecFileInfo, reader, client_ver);
                                    break;
                                case 2131:
                                    obj = types.Vector.read(types.EpgAutoAddData, reader, client_ver);
                                    break;
                                case 2141:
                                    obj = types.Vector.read(types.ManualAutoAddData, reader, client_ver);
                                    break;
                            }
                        } else {
                            switch (server_param) {
                                case 1021:
                                    obj = types.Vector.read(types.EpgServiceInfo, reader, -1);
                                    break;
                                case 1022:
                                    obj = types.Vector.read(types.EpgEventInfo, reader, -1);
                                    break;
                                case 1023:
                                    obj = types.EpgEventInfo.read(reader, -1);
                                    break;
                                case 1026:
                                    obj = types.Vector.read(types.EpgServiceEventInfo, reader, -1);
                                    break;
                            }
                        }
                        console.log(JSON.stringify(obj, null, "  "));
                    }
                } catch(e) {
                    console.log(e.stack);
                }
                
                socket.write(data);
                
                client.end();
            });
            
            client.on("end", function() {
                console.log("--- client disconnected...");
            });
            
            client.on("error", function(e) {
                console.log("--- client error or disconnect: " + e.message);
            });
            
            client.write(data);
        });
        
    });
    
    socket.on("end", function() {
        console.log("-- server connection end...");
    });
});

server.on("close", function() {
    console.log("- server closed...");
});

server.on("error", function() {
    console.log("- server error...");
});
    
server.listen("\\\\.\\pipe\\NodeEpgTimerServerPipe");