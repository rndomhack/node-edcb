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
                    
                    if (server_param === 2012 && client_param == 1) {
                        var client_ver = types.UShort.read(reader);
                        
                        console.log("ver: " + client_ver);
                        var obj = types.ReserveData.read(reader, client_ver);
                        
                        console.log(obj);
                    }
                } catch(e) {
                    console.log(e);
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