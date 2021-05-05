console.log("Bitwise work...")

function bitmask(width) {
  return Math.pow(2, width) - 1;
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function readData(data, byteIndex, bitIndex, bitLength) {
  var value = 0

  var list = data.split(" ").slice(4)
  var bytes = Buffer.from(list.join(''), 'hex');
  var bits = bitIndex + bitLength;

  if (bits > 8) {
    // The value is encoded across 2 bytes
    // value = (bytes[0] & 3) << 1 | bytes[1] >> 7;

    var position = 8 - bitIndex;
    value = (bytes[byteIndex + 1] & bitmask(bitLength - position)) << position | (bytes[byteIndex] & bitmask(position));
  } else {
    // The value is encoded in one byte
    value = bytes[byteIndex] >> (8 - bits) & bitmask(bitLength)
  }

  return value;
}

// 1A = 26
// 00011010

// D3 = 211
// 211 = 11010011

// 72 = 114
// 114 = 0 1 1 1 0 0 1 0

// 5F
// 95 = 0 1 0 1 1 1 1 1

// 15 0 15 32 96 6432


var data = "< frame 01F 1612561349.494768 1A D3 72 5F C7 B3 >" // 00011010 11010011  101011
// var data = "< frame 01F 1612561349.494768 E5 4B 03 6C 00 00 F2 80 >"
//var data = "< frame 01F 1612561349.494768 E5 4B 03 6C 00 00 F9 80 >"
//var data = "< frame 01F 1612561349.494768 E5 4B 03 6C 00 00 02 81 >"

// var data = "< frame 01F 1612561349.494768 E5 4B 03 6C 00 00 02 76 >"

// (1619719128.354056) can0 309#E54B036C0000F280 11110010 10000000    000011110010
// (1619719128.473735) can0 309#E54B036C0000F980 11111001 10000000    000011111001
// (1619719128.573735) can0 309#E54B036C00000281 00000010 10000001    000100000010

var val = readData(data, 0, 4, 6);
console.log(val);

//var val = readData(data, 6, 0, 12);
//console.log(val);

//var val = readData(data, 6, 0, 12);
//console.log(val);

// 2 byte test
// Should give us 0100101111 which is 303
// var val = readData(data, 2, 5, 10);
// console.log(val);

// console.log(buffer[0])
// console.log(bitmask(3))
// console.log(scale(10, 0, 15, 32, 96))