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

  var buffer = Buffer.from(list.join(''), 'hex');
  console.log(buffer.length);
  var bits = bitIndex + bitLength;

  if (bits > 8) {
    // The value is encoded across 2 bytes
    // value = (bytes[0] & 3) << 1 | bytes[1] >> 7;
    var position = 8 - bitIndex
    value = (buffer[byteIndex] & bitmask(position)) << (bitLength - position) | buffer[byteIndex + 1] >> (8 - (bitLength - position))

  } else {
    // The value is encoded in one byte
    value = buffer[byteIndex] >> (8 - bits) & bitmask(bitLength)
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


var data = "< frame 01F 1612561349.494768 1A D3 72 5F C7 B3 >"

/*
// This should result in 1001 (decimal 9)
var val = readData(data, 1, 3, 4);
console.log(val);

// This should result in 0010 (decimal 2)
var val = readData(data, 2, 4, 4);
console.log(val);

// This should result in 00001 (decimal 1)
var val = readData(data, 0, 0, 4);
console.log(val);

// 2 byte test
// Should give us 0100101111 which is 303
var val = readData(data, 2, 5, 10);
console.log(val);

//console.log(buffer[0])
*/

console.log(scale(10, 0, 15, 32, 96))