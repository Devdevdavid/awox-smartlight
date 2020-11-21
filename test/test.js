var AwoxSmartLight = require('awox-smartlight-dave');

var lamp = new AwoxSmartLight("D0:39:72:B8:5A:36", console.log);
lamp.lightOn()

function function2() {
    lamp.lightBrightness(28)
}

setTimeout(function2, 2000);

var hexOut = lamp._hexToAscii([0, 255, 0x5A]);
console.log(hexOut, hexOut === "00FF5A")