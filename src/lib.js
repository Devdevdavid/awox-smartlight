var execSync = require('child_process').execSync;

const HEADER = [0xAA, 0x0A, 0xFC, 0x3A, 0x86, 0x01];
const TAIL = [0x0D];

const SEQUENCE_ON = HEADER.concat([0x0A, 0x01, 0x01, 0x00, 0x28], TAIL);
const SEQUENCE_OFF = HEADER.concat([0x0A, 0x01, 0x00, 0x01, 0x28], TAIL);
const SEQUENCE_BRIGHNTESS = HEADER.concat([0x0C, 0x01, 0x00, 0xEC, 0x00]);
const SEQUENCE_WHITE = HEADER.concat([0x0E, 0x01, 0x00, 0x14, 0x00]);
const SEQUENCE_WHITE_RESET = HEADER.concat([0x0D, 0x06, 0x02, 0x20, 0x30, 0x40, 0x50, 0x60, 0x00, 0x00]);
const SEQUENCE_RGB = HEADER.concat([0x0D, 0x06, 0x01, 0x00, 0x00, 0x00, 0x20, 0x30, 0xF8, 0x00]);
const SEQUENCE_RGB_RESET = HEADER.concat([0x0D, 0x06, 0x01, 0x20, 0x30, 0x40, 0x50, 0x60, 0x00, 0x00]);

module.exports = class AwoxSmartLight {
  constructor (lampMac, logger) { /*"d03972b84926"*/
    this.lampMac = lampMac;
    this.logger = logger || console.log;
  }

  lightOn() {
    this.logger("lightOn...");
    this._sendCommand(SEQUENCE_ON);
  }

  lightOff() {
    this.logger("lightOff...");
    this._sendCommand(SEQUENCE_OFF);
  }

  lightBrightness(intensity) {
    this.logger("lightBrightness...");
    // value
    SEQUENCE_BRIGHNTESS[8] = Math.floor((intensity * 9) + 2);
    // random
    SEQUENCE_BRIGHNTESS[9] = Math.floor(Math.random() * 0xFF) >>> 0;
    // checksum
    SEQUENCE_BRIGHNTESS[10] = 0x00;
    SEQUENCE_BRIGHNTESS[10] = this._checksum(SEQUENCE_BRIGHNTESS);

    this._sendCommand(SEQUENCE_BRIGHNTESS.concat(TAIL));
  }

  lightWhite(temperature) {
    this.logger("lightWhite...");
    // value
    SEQUENCE_WHITE[8] = Math.floor((temperature * 9) + 2);
    // random
    SEQUENCE_WHITE[9] = Math.floor(Math.random() * 0xFF) >>> 0;
    // checksum
    SEQUENCE_WHITE[10] = 0x00;
    SEQUENCE_WHITE[10] = this._checksum(SEQUENCE_WHITE);

    this._sendCommand(SEQUENCE_WHITE.concat(TAIL));
  }

  lightWhiteReset() {
    this.logger("lightWhiteReset...");
    // random
    SEQUENCE_WHITE_RESET[14] = Math.floor(Math.random() * 0xFF) >>> 0;
    // checksum
    SEQUENCE_WHITE_RESET[15] = 0x00;
    SEQUENCE_WHITE_RESET[15] = this._checksum(SEQUENCE_WHITE_RESET);

    this._sendCommand(SEQUENCE_WHITE_RESET.concat(TAIL));
  }

  lightRgbReset() {
    this.logger("lightRgbReset...");
    // random
    SEQUENCE_RGB_RESET[14] = Math.floor(Math.random() * 0xFF) >>> 0;
    // checksum
    SEQUENCE_RGB_RESET[15] = 0x00;
    SEQUENCE_RGB_RESET[15] = this._checksum(SEQUENCE_WHITE_RESET);

    this._sendCommand(SEQUENCE_WHITE_RESET.concat(TAIL));
  }

  lightRgb(r, g, b, special) {
    this.logger("lightRgb...");
    SEQUENCE_RGB[8] = special ? 0x02 : 0x01;
    // RGB values
    SEQUENCE_RGB[9] = r;
    SEQUENCE_RGB[10] = g;
    SEQUENCE_RGB[11] = b;
    // random
    SEQUENCE_RGB[14] = 137;//Math.floor(Math.random() * 0xFF) >>> 0;
    // checksum
    SEQUENCE_RGB[15] = 0x00;
    SEQUENCE_RGB[15] = this._checksum(SEQUENCE_RGB);

    this._sendCommand(SEQUENCE_RGB.concat(TAIL));
  }

  _checksum(data) {
      return ((data.slice(1).reduce(function(a, b) { return (a + b); }) + 85) & 0xFF);
  }

  _hexToAscii(data) {
    var b = Buffer.from(data);
    return b.toString('hex').toUpperCase();
  }

  _sendCommand(data) {
    var cmd = 'gatttool -b ' + this.lampMac + ' --char-write-req -a 0x001D -n ' + this._hexToAscii(data)
    try {
      execSync(cmd,
        function (error, stdout, stderr) {
            if (error !== null) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              console.log('[ERROR] Command failed: ' + error);
            }
        });
    } catch (err) {
    }
  }
}
