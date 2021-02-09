const csv = require('csv-parser')
const fs = require('fs')
const net = require('net')

var midiOut = [];
var mapValues = [];
var sockets = []
var streaming = false;
const socketInstanceCount = 4;

const {
  ipcRenderer
} = require('electron');
const {
  connected
} = require('process');

const version = "1.0.1"
const loadMapFileButton = document.getElementById('load-map-file')
const saveMapFileButton = document.getElementById('save-map-file')
const midiDeviceSelector = document.getElementById('midi-devices')
const toggleStreamButton = document.getElementById('toggle-stream')
const socketcandServerInput = document.getElementById('socketcand-server')
const canPrefix = document.getElementById('can-prefix');
const streamStatus = document.getElementById('stream-status')

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const bitmask = (width) => {
  return Math.pow(2, width) - 1;
}

function printVersion() {
  console.log("CAN2MIDI")
  console.log(version)
  console.log("Scott Metoyer, 2021")
}

function stopStream() {
  // Destroy any open sockets
  for (var i = 0; i < sockets.length; i++) {
    sockets[i].destroy();
    console.log("can" + i + " socket destroyed")
  }

  sockets = [];

  streaming = false;
  streamStatus.innerText = "STANDBY"
  streamStatus.className = "disconnected"
  toggleStreamButton.innerText = "Start streaming"
  midiDeviceSelector.disabled = false
}

function startStream() {
  streaming = true;
  streamStatus.innerText = "STREAMING"
  streamStatus.className = "connected"
  toggleStreamButton.innerText = "Stop streaming"
  midiDeviceSelector.disabled = true
}

function subscribeToCanEvents(socket) {
  for (var i = 0; i < mapValues.length; i++) {
    var canId = mapValues[i]["CAN ID"];
    var name =  mapValues[i]["Name"];
    console.log("Subscribing to " + name + " on " + canId)
    socket.write('< subscribe 0 10000 ' + canId + ' >');
  }
}

function parseCanData(buffer, byteIndex, bitIndex, bitLength) {
  var value = 0
  var bits = bitIndex + bitLength;

  if (bits > 8) {
    // The value is encoded across 2 bytes
    var position = 8 - bitIndex
    value = (buffer[byteIndex] & bitmask(position)) << (bitLength - position) | buffer[byteIndex + 1] >> (8 - (bitLength - position))
  } else {
    // The value is encoded in one byte
    value = buffer[byteIndex] >> (8 - bits) & bitmask(bitLength)
  }

  return value;
}

function processCanFrame(data) {
  // Extract the CAN frame ID
  var list = data.toString().split(" ");
  var canId = list[2];

  // Look up the data parameters for this CAN ID
  var map = mapValues.filter(x => x["CAN ID"] === canId);

  // Slice out the data bytes
  list = list.slice(4)
  var buffer = Buffer.from(list.join(''), 'hex');

  // Process each individual signal in this CAN frame
  for (var i = 0; i < map.length; i++) {
    // Byte number is 1 based
    var byteNumber = map[i]["Byte number"] - 1;
    if (byteNumber < buffer.length) {
      var value = parseCanData(buffer, byteNumber, map[i]["Bit number"], map[i]["Length"]);

      // Map the value to a valid MIDI range. The ~~ operator converts the float to a whole number
      var scaledValue = ~~scale(value, map[i]["CAN min"], map[i]["CAN max"], map[i]["MIDI min"], map[i]["MIDI max"])

      // Send it :)
      sendMidiCCMessage(map[i]["MIDI CC"], scaledValue)
      // console.log(map[i]["Name"] + ", " + canId + " CAN:" + value + " MIDI CC:" + map[i]["MIDI CC"] + ": " + scaledValue);
    }
  }
}

function createSocketInstance(canBusId) {
  var server = socketcandServerInput.value.trim();
  var socketClient = net.connect({
    host: server,
    port: 29536
  }, () => {});

  socketClient.on('data', (data) => {
    // console.log(data.toString())
    switch (data.toString()) {
      case '< hi >':
        socketClient.write('< open ' + canBusId + ' >', function () {
          console.log(canBusId + " open requested")
        });
        break

      case '< ok >':
        subscribeToCanEvents(socketClient)
        startStream();
        break;

      default:
        processCanFrame(data)
        break;
    }
  });

  socketClient.on('end', () => {
    console.log("Stream closed by server.")
    stopStream();
  });

  socketClient.on('error', function (ex) {
    // ipcRenderer.send('open-error-dialog', ex)
    console.log(ex);
    stopStream();
  });

  sockets.push(socketClient);
}

function loadMapFile(path) {
  console.log("Loading map file")
  mapValues = [];

  fs.createReadStream(path)
    .pipe(csv({
      mapValues: ({
        header,
        index,
        value
      }) => {
        if (index > 1) {
          return parseInt(value)
        } else {
          return value
        }
      }
    }))
    .on('data', function (data) {
      if (Object.keys(data).length > 0) {
        mapValues.push(data)
      }
    })
    .on('end', () => {
      var new_tbody = document.createElement('tbody');
      var old_tbody = document.getElementById('map-table').getElementsByTagName('tbody')[0];

      // Write the rows into the display table
      for (var i = 0; i < mapValues.length; i++) {
        var newRow = new_tbody.insertRow();

        for (const property in mapValues[i]) {
          var newCell = newRow.insertCell();
          var newText = document.createTextNode(mapValues[i][property]);
          newCell.appendChild(newText);
        }
      }

      old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
      console.log(mapValues)
    });
}

function toggleStream() {
  if (!streaming) {
    console.log('Connecting to socketcand instances');
    streamStatus.innerText = "CONNECTING..."

    for (var i = 0; i < socketInstanceCount; i++) {
      createSocketInstance(canPrefix.value + i);
    }
  } else {
    stopStream();
  }
}

toggleStreamButton.addEventListener('click', (event) => {
  toggleStream();
})

loadMapFileButton.addEventListener('click', (event) => {
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('selected-file', (event, path) => {
  if (streaming == true) {
    toggleStream();
  }

  loadMapFile(path)
})

ipcRenderer.on('initial-load', (event, path) => {
  loadMapFile(path + '/map.csv')
})

function connectToMidi() {
  // Load MIDI devices
  navigator.requestMIDIAccess().then(
    (midi) => midiReady(midi),
    (err) => console.log('Something went wrong', err))
}

function midiReady(midi) {
  // midi.addEventListener('statechange', (event) => initMidiDevices(event.target))
  initMidiDevices(midi)
}

function initMidiDevices(midi) {
  const outputs = midi.outputs.values();
  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    midiOut.push(output.value);
  }

  displayMidiDevices();
}

function displayMidiDevices() {
  midiDeviceSelector.innerHTML = midiOut.map(device => `<option>${device.name}</option>`).join('');
}

function sendMidiCCMessage(controlNumber, value) {
  const CC = 0xB0;
  const device = midiOut[midiDeviceSelector.selectedIndex];
  const ccMessage = [CC, controlNumber, value];
  device.send(ccMessage);
}

ipcRenderer.send('initial-load')
printVersion()
connectToMidi()