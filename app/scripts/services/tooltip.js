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

    //Tooltip selection is initially an empty selection.
    var tooltip = d3.select('');

    /**
     * Set tooltip to refer to specific html element.
     * @param {String} tooltipId - Id of the html element that is used as a tooltip.
     */
    this.init = function(tooltipId) {

      tooltip = d3.select('.' + tooltipId)
        .style('display','flex')
        .style('flex-flow','column')
        .style('visibility', 'hidden');

    };
      

    /**
     * Make tooltip follow mouse movement.
     */
    function mouseMove (skipSelectedCheck) {

      if (!skipSelectedCheck && scope.selectedRoom) {
        return;
      }

      if (d3.event.pageY > window.innerHeight / 2) {
        tooltip.style('bottom', (window.innerHeight-d3.event.pageY)+'px');
        tooltip.style('top', 'auto');
      } else {
        tooltip.style('top', (d3.event.pageY-10)+'px');
        tooltip.style('bottom', 'auto');
      }

      if (d3.event.pageX > window.innerWidth / 2) {
        tooltip.style('right', (window.innerWidth - d3.event.pageX) + 'px');
        tooltip.style('left', 'auto');
      } else {
        tooltip.style('left', (d3.event.pageX) + 'px');
        tooltip.style('right', 'auto');
      }

    }

    
    /**
     * Empty tooltip and make it invisible.
     */
    function mouseOut (skipSelectedCheck) {

      if (!skipSelectedCheck && scope.selectedRoom) {
        return;
      }

      tooltip
        .select('#infocontent').remove()
        .style('visibility', null)
          .select('#panobtn')
          .style('display', 'none');

    }


    /**
     * Add event listener to the room that shows tooltip on mouseover.
     * @param {Object} room - Room to which the tooltip event listener is added.
     */
    function addToRoom(room) {

      //Add room-specific information to the tooltip and make tooltip visible
      function mouseOver (skipSelectedCheck) {

        if (!skipSelectedCheck && scope.selectedRoom) {
          return;
        }
        
        //Pass the room name to controller function
        scope.$parent.room = room.name;

        var infocontent = tooltip
          .append('div')
          .attr('id', 'infocontent');

        infocontent
          .append('h4')
          .text(room.name);

        infocontent
          .append('ul');

        //Show sensor values listed in the tooltip
        for (var i = 0; i < room.sensors.length; i++) {

          var sensorInfo = infocontent
            .append('li')
            .attr('class','roominfo')
            .text(room.sensors[i].type + ': ' + room.sensors[i].value);

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

        for(var i = 0; i < roomsWithPanorama.length; i++){
          if(room.name === roomsWithPanorama[i]){
            tooltip.select('#panobtn').style('display', 'block');
          }
        }

        tooltip.style('visibility', 'visible');

      } //end mouseOver()
      

      function clicked () {

        if (scope.highlightedRoom) {
          clearInterval(scope.highlightedRoom.pulse);
          scope.highlightedRoom = null;
        }

        // Ignore the click since this was called after dragend
        if (d3.event.defaultPrevented) {
          mouseOut(false);
          mouseOver(false);
          mouseMove(false);
        } else {
          mouseOut(true);
          scope.selectedRoom = room;
          mouseOver(true);
          mouseMove(true);
        }

      }

      //Set mouse events to the room node
      if (room.node) {
        d3.select(room.node)
          .on('mouseover', mouseOver)
          .on('mousemove', mouseMove)
          .on('mouseout', mouseOut)
          .on('click', clicked);
      }

    } //end addTooltip()


    /**
     * This is the public tooltip element. Element is initially an empty d3 selection.
     */
    this.elem = function () {
      return tooltip;
    };

  });
