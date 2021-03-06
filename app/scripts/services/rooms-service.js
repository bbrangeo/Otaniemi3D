'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Rooms
 * @description
 * # Rooms
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Rooms', function ($rootScope, $q, SensorData) {

    //Can be used inside this service to reference this service's public
    //properties and functions (e.g. self.dict).
    var self = this;

    /*
    * Return dictionary object where all room objects are stored.
    */
    this.dict = {};

    /*
    * Return room dictionary as a list.
    */
    this.asList = function() {
      var roomList = [];

      var keys = Object.keys(self.dict);
      for (var i = 0; i < keys.length; i++) {
        var room = self.dict[keys[i]];
        room.id = keys[i];
        roomList.push(room);
      }

      return roomList;
    };

    /*
     * Fetch new sensor data from the server and update every room's
     * sensor information.
     */
    this.updateRoomInfo = function() {
      SensorData.get();
    };

    /*
    * Add new room object to the list
    */
    this.add = function(id, name, node, floor) {
      self.dict[id] = {
        name: name,
        floor: floor,
        node: node,
        sensors: [],
        pulse: null
      };
    };

    /*
    * Find spesific room from room.list and return its information to
    * the new list.
    */
    this.findRoom = function(roomName) {
      var room = null;

      for (var key in self.dict) {
        if (self.dict.hasOwnProperty(key)) {
          if (self.dict[key].name === roomName){
            room = self.dict[key];
          }
        }
      }

      if (room !== null) {
        var roomInfo = [];
        var roomType, roomValue;
        for (var i = 0; i < room.sensors.length; i++) {
          switch (room.sensors[i].type) {
            case 'temperature':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].values[0].value + ' °C' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'humidity':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].values[0].value + ' %' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'co2':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].values[0].value + ' ppm' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'pir':
              var occupancyState;
              if (room.sensors[i].values[0].value > 0) {occupancyState = 'yes';} else {occupancyState = 'no';}
              roomType = 'occupied';
              roomValue = occupancyState;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'light':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].values[0].value + ' lux' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
          }
        }
        return roomInfo;
      }
      return null;
    };

    /*
    * Find room for panorama-tooltip and return information with []-tags
    * (krpano recognize these tags as HTML-tags).
    */
    this.krpanoHTML = function(roomName){
      var roomInfo = self.findRoom(roomName);
      var roomHTML = '';
      var tableInfo = null;
      roomHTML = '[table class= "tooltip-table"]';
      roomHTML += '[tr] [th]Room[/th] [td]' +  roomName + '[/td] [/tr]';
      if (roomInfo !== null){
        for (var i = 0; i < roomInfo.length; i++){
          tableInfo = '[tr]';
          tableInfo += '[th]' + roomInfo[i].type+ '[/th]' + '[td]' + roomInfo[i].value + '[/td]';
          tableInfo += '[/tr]';
          roomHTML += tableInfo;
        }
      }
      roomHTML += '[/table]';
      return roomHTML;
    };

    /*
     * Watch for new sensor data sent by SensorData service.
     */
    $rootScope.$on('sensordata-new', function(event, data) {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var room = self.dict[keys[i]];
        if (room) {
          //Update only sensor info if room already exists. This way
          //the svg nodes stored in room objects won't reset.
          room.sensors = data[keys[i]].sensors;
        } else {
          //Room doesn't yet exist in the dictionary.
          self.dict[keys[i]] = data[keys[i]];
        }
      }
      $rootScope.$broadcast('sensordata-update', self.dict);
    });

    /*
     * Watch for changes made into the self.dict object.
     */
    $rootScope.$watch(function() { return self.dict; }, function() {
      if (Object.keys(self.dict).length > 0) {
        $rootScope.$broadcast('sensordata-update', self.dict);
      }
    });

  });
