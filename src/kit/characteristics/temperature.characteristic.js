'use strict';

var _require = require('../../services/sinope.gateway'),
    request = _require.request;

var R = require('ramda');

function pickCharacteristic(Characteristic, loginPromise) {

  var features = [{
    uuid: new Characteristic.CurrentTemperature().UUID,
    set: setTemperature,
    get: getTemperature
  }, {
    uuid: new Characteristic.TargetTemperature().UUID,
    set: setTargetTemperature,
    get: getTargetTemperature
  }, {
    uuid: new Characteristic.CurrentHeatingCoolingState().UUID,
    get: getHeatingState
  }, {
    uuid: new Characteristic.TargetHeatingCoolingState().UUID,
    get: getTargetHeatingCoolingState,
    set: setTargetHeatingCoolingState
  }, {
    uuid: new Characteristic.TemperatureDisplayUnits().UUID,
    get: getTemperatureDisplayUnits,
    set: setTemperatureDisplayUnits
  }];

  return function (characteristic, homebridgeAccessory) {
    var uuid = 'uuid';
    var get = 'get';
    var set = 'set';
    var hasSetEvent = R.has(set);
    var hasGetEvent = R.has(get);
    var extractEvent = R.compose(R.dissoc(uuid), R.find(R.propEq(uuid, characteristic.UUID)));
    var event = extractEvent(features);

    if (hasSetEvent(event)) {
      characteristic.on(set, function (value, callback) {
        event[set](value, callback, homebridgeAccessory, loginPromise);
      });
    }
    if (hasGetEvent(event)) {
      characteristic.on(get, function (callback) {
        event[get](callback, homebridgeAccessory, loginPromise);
      });
    }
  };
}

function getDevice(deviceId, loginPromise) {
  return loginPromise.then(function (authData) {
    var session = authData.session;

    return request({
      method: 'GET',
      path: ['device', deviceId, 'data'],
      sessionId: session
    }).then(function (device) {
      return device;
    });
  });
}

function getTemperature(callback, _ref, loginPromise) {
  var id = _ref.id;

  getDevice(id, loginPromise).then(function (device) {
    callback(undefined, Math.round(device.temperature));
  });
}

function setTemperature(callback, _ref2, loginPromise) {
  var id = _ref2.id;

  callback(undefined, 10.0);
}

function setTargetTemperature(value, callback, homebridgeAccessory, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  var body = {
    temperature: value
  };
  console.log(value);
  loginPromise.then(function (authData) {
    request({
      method: 'PUT',
      path: ['device', homebridgeAccessory.id, 'setpoint'],
      sessionId: authData.session,
      body: body
    }).then(function (res) {
      callback(undefined, value);
    });
  });
}

function getTargetTemperature(callback, _ref3, loginPromise) {
  var id = _ref3.id;

  getDevice(id, loginPromise).then(function (device) {
    callback(undefined, Math.round(device.setpoint));
  });
}

function getHeatingState(callback, _ref4, loginPromise) {
  var id = _ref4.id;

  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 1);
}

function getTargetHeatingCoolingState(callback, _ref5, loginPromise) {
  var id = _ref5.id;

  callback(undefined, 1);
  /*
  Characteristic.TargetHeatingCoolingState.OFF = 0;
  Characteristic.TargetHeatingCoolingState.HEAT = 1;
  Characteristic.TargetHeatingCoolingState.COOL = 2; // not supported
  Characteristic.TargetHeatingCoolingState.AUTO = 3; no supported
  */
}

function setTargetHeatingCoolingState(callback, _ref6, loginPromise) {
  var id = _ref6.id;

  callback(undefined, 1);
}

function getTemperatureDisplayUnits(callback, _ref7, loginPromise) {
  var id = _ref7.id;

  callback(undefined, 0);
}

function setTemperatureDisplayUnits(callback, _ref8, loginPromise) {
  var id = _ref8.id;

  callback(undefined, 1);
}

module.exports = {
  pickCharacteristic: pickCharacteristic
};
