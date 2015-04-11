'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.tooltipService
 * @description
 * # tooltipService
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Tooltip', function () {

    /* 
     * Tooltip selection is initially an empty selection. Use
     * Tooltip.elem() to access it outside this service.
     */
    //var tooltip = d3.select();

    /*
     * Room object where the mouse is hovering. Can be retrieved
     * with Tooltip.room() when called outside this service.
     */
    var mouseOverRoom = null;

    /**
     * Set tooltip to refer to specific html element.
     * @param {String} tooltipId - Id of the html element that is used as a tooltip.
     */
    //this.init = function(tooltipId) {

    var tooltip = d3.select('#' + 'mouse-tooltip')
      .style('display','flex')
      .style('flex-flow','column')
      .style('visibility', 'hidden');

    //};
      

    /**
     * Make tooltip follow mouse movement.
     */
    this.move = function() {
      
      if (d3.event.pageY > window.innerHeight / 2) {
        tooltip
          .style('bottom', (window.innerHeight - d3.event.pageY) + 'px')
          .style('top', 'auto');
      } else {
        tooltip
          .style('top', (d3.event.pageY - 10) + 'px')
          .style('bottom', 'auto');
      }

      if (d3.event.pageX > window.innerWidth / 2) {
        tooltip
          .style('right', (window.innerWidth - d3.event.pageX) + 'px')
          .style('left', 'auto');
      } else {
        tooltip
          .style('left', (d3.event.pageX) + 'px')
          .style('right', 'auto');
      }

    };

    


    /**
     * Empty tooltip and make it invisible.
     */
    this.hide = function() {
      tooltip
        .select('#infocontent').html('')
        .style('visibility', null)
          .select('#panobtn')
          .style('display', 'none');

    };


    /**
     * Show tooltip with sensor data.
     * @param {Object} room - Room whose sensor data is shown in the tooltip.
     */
    this.show = function(room) {
      var infocontent = tooltip.select('#infocontent');

      infocontent
        .append('h4')
        .text(room.name);

      infocontent
        .append('ul');

      //Show sensor values listed in the tooltip
      for (var i = 0; i < room.sensors.length; i++) {

        //Capitalize sensor name
        var sensorName = room.sensors[i].type.charAt(0).toUpperCase() +
                         room.sensors[i].type.slice(1);

        var sensorInfo = infocontent
          .append('li')
          .attr('class','roominfo')
          .text(sensorName + ': ' + room.sensors[i].value);

        switch (room.sensors[i].type) {
          case 'temperature':
            sensorInfo.text(sensorInfo.text() + ' °C');
            break;

          case 'humidity':
            sensorInfo.text(sensorInfo.text() + ' %');
            break;

          case 'co2':
            sensorInfo.text(sensorInfo.text() + ' ppm');
            break;

          case 'pir':
            var occupancyState;
            if (room.sensors[i].value > 0) {occupancyState = 'yes';} else {occupancyState = 'no';}
            sensorInfo.text('Occupied' + ': ' + occupancyState);
            break;

          case 'light':
            sensorInfo.text(sensorInfo.text() + ' lux');
            break;
        }

      }
      
      var roomsWithPanorama = [
        '238d','237c','235','232b','232a',
        '2nd Floor Corridor Start',
        '2nd Floor Corridor Middle',
        '2nd Floor Corridor End',
        'Corridor Cafeteria Side',
        'Corridor Entrance Side',
        'Cafeteria',
        'Entrance'
        ];

      for(var k = 0; k < roomsWithPanorama.length; k++){
        if(room.name === roomsWithPanorama[k]){
          tooltip.select('#panobtn').style('display', 'block');
        }
      }

      tooltip.style('visibility', 'visible');

    };
      
      /*
      function clicked () {

        // Ignore the click since this was called after dragend
        if (d3.event.defaultPrevented) {
          mouseOut(false);
          mouseOver(false);
          mouseMove(false);
        } else {
          mouseOut(true);
          mouseOver(true);
          mouseMove(true);
        }

      }
      */


    /**
     * This is the public tooltip element. Element is initially an empty d3 selection.
     * @returns {Object} D3 selection of the tooltip element.
     */
    this.elem = function () {
      return tooltip;
    };


    /**
     * This is used to access the room that is hovered over with the mouse.
     * @returns {Object} Room object where the mouse is hovering over.
     */
    this.room = function () {
      return mouseOverRoom;
    };

  });
