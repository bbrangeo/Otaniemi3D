'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.d3Service
 * @description
 * # d3Service
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('d3Service', function (Rooms, Floorplans, Tooltip, usSpinnerService, twodservice, $interval) {

    /**
     * Download all floorplans from server and append first floorplan
     * to the html document.
     * @param {Object} first - Floorplan that is downloaded and parsed first.
     * @param {Object} containers - Containers for parsing and showing floorplan.
     */
    this.getFloorplans = function(first, containers) {

      //Start the loading spinner
      usSpinnerService.spin('spinner-1');

      for (var i = 0; i < Floorplans.floors.length; i++) {
        getFloorplan(Floorplans.floors[i], containers.parser);
      }

      this.appendFloorplan(first, containers.visible);
      this.updateRoomInfo();

      //Hide loading spinner because all floorplans have been downloaded and parsed.
      usSpinnerService.stop('spinner-1');

    };


    /**
     * Download floorplans svg and parse it.
     * @param {Object} floorplan - Floorplan that is to be downloaded.
     * @param {String} container - Id for the container element.
     */
    function getFloorplan(floorplan, container){

      d3.xml(floorplan.url, 'image/svg+xml', function (xml) {

        if (xml) {
          floorplan.svg = xml.documentElement;
          parseRooms(floorplan, container);
        }
      });
    }


    //Configure dragging and zooming behavior.
    this.zoomListener = d3.behavior.zoom()
      .scaleExtent([0.5, 10]);


    /**
     * Append floorplan to the html document and register zoom listener.
     * @param {Object} floorplan - Floorplan that is appended to the html document.
     * @param {Object} container - Container where the floorplan svg is appended.
     * @param {Boolean} zoomReset - True if zoom level is reseted.
     */
    this.appendFloorplan = function(floorplan, container) {

      //Container tells if svg should be visible or if it's only appended
      //for parsing
      var containerNode = d3.select('#' + container).node();

      //Empty container from old floorplan
      while (containerNode.firstChild) {
        containerNode.removeChild(containerNode.firstChild);
      }

      //Add new floorplan
      var svg = containerNode
        .appendChild(floorplan.svg);

      svg = d3.select(svg)
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('pointer-events', 'all');

      svg.selectAll('path').each(function() {

        var elem = d3.select(this);

        if (elem.attr('class') !== floorplan.roomArea) {
          elem.attr('pointer-events', 'none');
        }

      });

      svg.selectAll('text').attr('pointer-events', 'none');

      this.zoomListener
        .scale(floorplan.scale)
        .translate(floorplan.translate)
        .on('zoom', function() {
          svg.select('g').attr('transform', 'translate(' + d3.event.translate +
                               ')scale(' + d3.event.scale + ')');
          floorplan.scale = d3.event.scale;
          floorplan.translate = d3.event.translate;
          Tooltip.elem.style('visibility', 'hidden');
        })
        .event(floorplan.svg);
        
      svg.call(this.zoomListener);

    }; //end appendFloorplan()


    /**
     * Reset floorplans translation and zoom levels.
     * @param {Object} floorplan - Floorplan which is to be reseted.
     */
    this.resetZoom = function (floorplan) {

      floorplan.translate = [0, 0];
      floorplan.scale = 1;

      this.zoomListener
        .scale(floorplan.scale)
        .translate(floorplan.translate)
        .event(floorplan.svg);
    };


    /**
     * Read rooms and their html elements from the floorplan svg
     * and save data to the Rooms service.
     * @param {object} floorplan - Floorplan whose rooms are to be parsed.
     * @param {Object} container - Container where the floorplan svg is appended.
     */
    function parseRooms(floorplan, container) {

      d3.select(floorplan.svg).selectAll('.' + floorplan.roomNumber).each(function () {

        //roomText is the d3 selection of the text element that has room number
        var roomText = this;

        //Iterate through room areas to check if they overlap with the text element
        d3.select(floorplan.svg).selectAll('.' + floorplan.roomArea).each(function () {

          //roomArea is the d3 selection of the room (path or rect element)
          var roomArea = this;

          var textCoords = roomText.getBoundingClientRect();
          var roomCoords = roomArea.getBoundingClientRect();
          var textHeight = textCoords.bottom - textCoords.top;
          var textWidth = textCoords.right - textCoords.left;
          var isInside =
              textCoords.top + textHeight / 2 > roomCoords.top &&
              textCoords.top + textHeight / 2 < roomCoords.bottom &&
              textCoords.left + textWidth / 2 > roomCoords.left &&
              textCoords.left + textWidth / 2 < roomCoords.right;

          //Check if room name overlaps with room rectangle in svg.
          if (isInside) {
            for (var i = 0; i < Floorplans.floors.length; i++) {
              if (Floorplans.floors[i] === floorplan) {
                var roomExists = false;

                for (var j = 0; j < Rooms.list.length; j++) {
                  if (Rooms.list[j].name === roomText.textContent) {
                    roomExists = true;
                    break;
                  }
                }
                if (!roomExists) {
                  Rooms.add(roomText.textContent, roomArea, i);
                  Tooltip.addToRoom(Rooms.list[Rooms.list.length-1]);
                }
              }
            }
          }
        });
      });

      var containerNode = d3.select('#' + container).node();

      if (containerNode === null) { return; }

      //Empty container from old floorplan
      while (containerNode.firstChild) {
        containerNode.removeChild(containerNode.firstChild);
      }

    } //end parseRooms()


    /**
     * Update or add new sensor data to rooms, and then color the rooms 
     * according to the data.
     * @param {Object} data - JSON object that has the sensor data.
     * @param {String} sensorType - Rooms are colored according to the values
                                    of this sensor type. Example: 'Temperature'
     */
    this.updateRoomInfo = function(data, sensorType) {

      if (!data) {
        return;
      }

      var sensorUpdated = false;

      for (var i = 0; i < data.length; i++) {

        var dataItem = data[i];

        for (var j = 0; j < Rooms.list.length; j++) {

          var room = Rooms.list[j];

          if (dataItem.room === room.name) {

            //Check if sensor already exists
            for (var k = 0; k < room.sensors.length; k++) {

              var sensor = room.sensors[k];

              if (sensor.id === dataItem.sensorId &&
                  sensor.type === dataItem.type) {

                sensor.value = dataItem.value;
                sensorUpdated = true;

              }

            }

            //If sensor doesn't yet exist in Rooms service then add it
            if (!sensorUpdated) {

              room.sensors.push({
                id: dataItem.sensorId,
                type: dataItem.type,
                value: dataItem.value
              });

            } else {

              //Reset updated flag
              sensorUpdated = false;

            }

            setRoomColor(room, sensorType);

            break;
          }
        }
      }
    }; //end updateRoomInfo()


    /**
     * Set room color for a room according to its temperature. Color range
     * is from blue to red.
     * @param {Object} room - Room object whose color is to be changed.
     * @param {String} sensorType - Rooms are colored according to the values
                                    of this sensor type. Example: 'Temperature'
     */
    function setRoomColor(room, sensorType) {

      if (room.node) {

        for (var i = 0; i < room.sensors.length; i++) {

          if (room.sensors[i].type.toLowerCase() === sensorType.toLowerCase() ||
              ((room.sensors[i].type.toLowerCase() === 'pir') &&
              (sensorType.toLowerCase() === 'occupancy'))) {

            var color = twodservice.getColor(room.sensors[i].type, room.sensors[i].value);

            d3.select(room.node)
              .style('fill', color.rgb)
              .style('fill-opacity', color.opacity);
          }
        }
      }
    }


    /**
     * Pulse the room highlight until it is not selected anymore.
     * @param {Object} room - Room that is to be highlighted.
     * @returns {Promise} Promise object that contains the pulsing animation.
     */
    this.highlightRoom = function(room) {

      var duration = 3000;
      var pulseColor = 'grey';
      var initialColor = d3.select(room.node).style('fill');

      if (initialColor === 'none') {
        initialColor = 'rgb(255,255,255)';
      }

      //Color it first, fade away and color again because the first
      //iteration of setInterval takes a while...
      d3.select(room.node).style('fill', pulseColor);

      d3.select(room.node)
        .transition()
        .duration(duration*2/3)
        .style('fill', initialColor);

      d3.select(room.node)
        .transition()
        .delay(duration*2/3)
        .duration(duration*2/3)
        .style('fill', pulseColor);

      d3.select(room.node)
        .transition()
        .delay(duration*4/3)
        .duration(duration*2/3)
        .style('fill', initialColor);

      var pulsing = $interval(function() {
        d3.select(room.node)
          .transition()
          .duration(duration)
          .style('fill', pulseColor)
          .transition()
          .delay(duration)
          .duration(duration)
          .style('fill', initialColor);
      }, duration * 2);

      return pulsing;

    };

  });
