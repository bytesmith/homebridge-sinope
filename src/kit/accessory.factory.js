'use strict';

var R = require('ramda');

var _require = require('../services/sinope.gateway'),
    request = _require.request;

function accessories(log, accessoryMaker, loginPromise) {
  return function (homeBridgeCallback) {

    loginPromise.then(function (authData) {
      var session = authData.session;

      request({
        method: 'GET',
        path: ['gateway'],
        sessionId: session
      }).then(function (gateway) {
        var extractGatewayId = R.pipe(R.head, R.prop('id'));
        var queryString = {
          gatewayId: extractGatewayId(gateway)
        };

        return request({
          method: 'GET',
          path: ['device'],
          sessionId: session,
          queryString: queryString
        });
      }).then(function (devices) {
        R.call(homeBridgeCallback, R.map(accessoryMaker, devices));
      });
    });
  };
}

function getInformationService(_ref, Service) {
  var Name = _ref.Name,
      Manufacturer = _ref.Manufacturer,
      Model = _ref.Model,
      SerialNumber = _ref.SerialNumber;

  return function (_ref2) {
    var name = _ref2.name,
        manufacturer = _ref2.manufacturer,
        model = _ref2.model,
        serialNumber = _ref2.serialNumber;

    var informationService = new Service.AccessoryInformation();
    var setCharacteristic = function setCharacteristic(key, value) {
      return informationService.setCharacteristic(key, value);
    };
    R.zipWith(setCharacteristic, [Name, Manufacturer, Model, SerialNumber], [name, manufacturer, model, serialNumber]);
    return informationService;
  };
}

function getServices(log, pickCharacteristic) {

  return function (homebridgeAccessory) {
    var platform = homebridgeAccessory.platform;

    var services = [platform.getInformationService(homebridgeAccessory)];
    R.forEach(function (service) {
      var controlService = service.controlService;

      services.push(controlService);
      R.forEach(function (serviceCharacterics) {
        var characteristic = controlService.getCharacteristic(serviceCharacterics);
        if (characteristic == undefined) characteristic = controlService.addCharacteristic(serviceCharacterics);
        pickCharacteristic(characteristic, homebridgeAccessory);
      }, service.characteristics);
    }, homebridgeAccessory.services);
    return services;
  };
}

function identify(log) {
  return function (callback) {
    log('Identifying');
    callback();
  };
}

module.exports = {
  accessories: accessories,
  getServices: getServices,
  getInformationService: getInformationService,
  identify: identify
};
