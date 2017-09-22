'use strict';

var _require = require('./accessory.factory.js'),
    accessories = _require.accessories,
    getInformationService = _require.getInformationService,
    getServices = _require.getServices,
    identify = _require.identify;

var _require2 = require('./characteristics/temperature.characteristic.js'),
    pickCharacteristic = _require2.pickCharacteristic;

var _require3 = require('../services/sinope.gateway'),
    request = _require3.request;

function sinopePlatform(homebridge) {
  var _homebridge$hap = homebridge.hap,
      Service = _homebridge$hap.Service,
      Characteristic = _homebridge$hap.Characteristic;


  return function (log, _ref) {
    var username = _ref.username,
        password = _ref.password;

    var loginPromise = request({
      method: 'POST',
      path: ['login'],
      body: { email: username, password: password }
    });

    var services = getServices(log, pickCharacteristic(Characteristic, loginPromise));
    this.getInformationService = getInformationService(Characteristic, Service);
    this.getServices = services;
    this.identify = identify(log);
    this.accessories = accessories(log, makeAccessory(log, Characteristic, Service, services, this), loginPromise);
  };
}

function makeAccessory(log, Characteristics, Service, services, platform) {
  return function (device) {
    var CurrentHeatingCoolingState = Characteristics.CurrentHeatingCoolingState,
        TargetHeatingCoolingState = Characteristics.TargetHeatingCoolingState,
        CurrentTemperature = Characteristics.CurrentTemperature,
        TargetTemperature = Characteristics.TargetTemperature,
        TemperatureDisplayUnits = Characteristics.TemperatureDisplayUnits;

    var model = [{
      controlService: new Service.Thermostat(device.name),
      characteristics: [CurrentHeatingCoolingState, TargetHeatingCoolingState, CurrentTemperature, TargetTemperature, TemperatureDisplayUnits]
    }];

    var accessory = new SinopeThermostatAccessory(log, model);
    accessory.getServices = function () {
      return services(accessory);
    };

    accessory.platform = platform;
    accessory.remoteAccessory = device;
    accessory.id = device.id;
    accessory.name = device.name;
    accessory.model = '' + device.model;
    accessory.manufacturer = 'Sinope technologies';
    accessory.serialNumber = device.mac;
    return accessory;
  };
}

function SinopeThermostatAccessory(log, services) {
  this.log = log;
  this.services = services;
}

module.exports = sinopePlatform;
