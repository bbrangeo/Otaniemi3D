'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', function (Svg, Rooms, Floorplans, Tooltip, usSpinnerService, twodservice) {
    return {
      restrict: 'E',

      scope: {
        plan: '=',
        data: '=',
        highlightedRoom: '=',
        roomValueType: '=',
        resetView: '='
      },

      template: '<div id="floorplan-container" style="display: inline;"></div>' + 
                '<div id="parser" style="visibility: hidden;"></div>',

      link: function (scope) {

        var containers = {
          visible: 'floorplan-container',
          parser: 'parser'
        };

        //Check if svg support. There is not point doing anything
        //if there isn't.
        if (scope.$parent.svgSupport) {

          if (scope.plan.svg === null) {

            Svg.getFloorplans(Floorplans.floors, containers);

          } else {

            Svg.appendFloorplan(scope.plan, containers.visible);
            
            for (var i = 0; i < Rooms.list.length; i++) {
              Tooltip.addToRoom(Rooms.list[i]);
            }
            /*
            usSpinnerService.stop('spinner-1'); //floorplans loaded, hide the spinner
            showFloorplan();
            */
          }
        }
        

        
        
        //    
        //color legend functionality:
        //    
        var barWidth = 20,
            svgWidth = 80,
            x1 = 0,
            y1 = 1;
        var legendLine, legendLineText;
        
        function gradientMouseOver() {
          legendLine.style('visibility', 'visible');
          legendLineText.style('visibility', 'visible');
        }
        
        function gradientMouseOut() {
          legendLine.style('visibility', 'hidden');
          legendLineText.style('visibility', 'hidden');
        }
        
        function gradientMouseMove() {
          var coordinates = [0, 0];
          /*jshint validthis:true */
          coordinates = d3.mouse(this);
          
          /*jshint validthis:true */
          var bBoxHeight = this.getBBox().height;
          var positionOnLegend = ((coordinates[1] - y1) / bBoxHeight); //e.g. 60% if it's just below half way.
          var valueText = twodservice.valueAtPercent(scope.roomValueType.toLowerCase(), positionOnLegend) + twodservice.getValueUnit(scope.roomValueType);
          
          //The line shouldn't go all the way to top or bottom because text would not fit completely inside the svg:
          var yLocation = Math.min((bBoxHeight - 3), Math.max(coordinates[1], 7)); //Always a few pixels away from top and bottom edge.
          legendLine.attr('y1', yLocation).attr('y2', yLocation);
          legendLineText.attr('y', yLocation + 3)
            .text(valueText);
        }
                
        //Make and color the legend svg
        function fillLegend() {     

          var idGradient = 'legendGradient';

          d3.select('#legendBar')
            .append('p')
            .attr('class','legendText')
            .attr('id', 'legendMinText')
            .style('margin', '0px')
            .text(twodservice.temperatureMin + twodservice.getValueUnit('temperature'));
          
          var svgForLegend = d3.select('#legendBar').append('svg')
                              .attr('id', 'legendContainingSvg')
                              .attr('width', svgWidth)
                              .attr('height', '100%');
          
          d3.select('#legendBar')
            .append('p')
            .attr('class','legendText')
            .attr('id', 'legendMaxText')
            .text(twodservice.temperatureMax + twodservice.getValueUnit('temperature'));

          //create the empty gradient that we're going to populate later
          svgForLegend
            .append('g')
            .append('defs')
            .append('linearGradient')
              .attr('id',idGradient)
              .attr('x1','0%')
              .attr('x2','0%')
              .attr('y1','0%')
              .attr('y2','100%');
          
          //create the bar for the legend to go into
          // the "fill" attribute hooks the gradient up to this rect
          svgForLegend
            .append('rect')
            .attr('id', 'gradientRect')
            .attr('fill','url(#' + idGradient + ')')
            .attr('x',x1)
            .attr('y',y1)
            .attr('width',barWidth)
            .attr('height','99%')
            .attr('rx', 10)
            .attr('ry', 10);
          
          //mouseover line with the value of that point in legend
          legendLine = svgForLegend
            .append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x1 + barWidth)
            .attr('y2', y1)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .style('visibility', 'hidden');
          
          legendLineText = svgForLegend 
            .append('text')
            .attr('x', x1 + barWidth)
            .attr('y', y1)
            .style('visibility', 'hidden')
            .text('');
          
          d3.select('#gradientRect')
            .on('mouseover', gradientMouseOver)
            .on('mousemove', gradientMouseMove)
            .on('mouseout', gradientMouseOut);

          //we go from a somewhat transparent blue/green (hue = 160º, opacity = 0.3) to a fully opaque reddish (hue = 0º, opacity = 1)
          var hueStart = 160, hueEnd = 0;
          var opacityStart = 0.3, opacityEnd = 1.0;
          var numberHues = 35;
          var theHue, rgbString, opacity,p;

          var deltaPercent = 1/(numberHues-1);
          var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
          var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

          //kind of out of order, but set up the data here 
          var theData = [];
          for (var i=0;i < numberHues;i++) {
              theHue = hueStart + deltaHue*i;
              //the second parameter, set to 1 here, is the saturation
              // the third parameter is "lightness"    
              rgbString = d3.hsl(theHue,1,0.6).toString();
              opacity = opacityStart + deltaOpacity*i;
              p = 0 + deltaPercent*i;
              //onsole.log("i, values: " + i + ", " + rgbString + ", " + opacity + ", " + p);
              theData.push({rgb:rgbString, opacity:opacity, percent:p});       
          }

          //now the d3 magic (imo) ...
          var stops = d3.select('#' + idGradient).selectAll('stop')
                              .data(theData);

              stops.enter().append('stop');
              stops.attr('offset',function(d) {
                                      return d.percent;
                          })
                          .attr('stop-color',function(d) {
                                      return d.rgb;
                          })
                          .attr('stop-opacity',function(d) {
                                      return d.opacity;
                          });
        }
        
        function changeLegendText() {
          var minText, maxText;
          switch (scope.roomValueType.toLowerCase()) {
            case 'temperature':
              minText = twodservice.temperatureMin;
              maxText = twodservice.temperatureMax;
              break;
            case 'humidity':
              minText = twodservice.humidityMin;
              maxText = twodservice.humidityMax;
              break;
            case 'co2':
              minText = twodservice.co2Min;
              maxText = twodservice.co2Max;
              break;
            case 'pir': //We treat pir as occupancy
              minText = twodservice.occupancyMin;
              maxText = twodservice.occupancyMax;
              break;
            case 'light':
              minText = twodservice.lightMin;
              maxText = twodservice.lightMax;
              break;
            case 'occupancy':
              minText = twodservice.occupancyMin;
              maxText = twodservice.occupancyMax;
              break;
          }
          minText = minText + twodservice.getValueUnit(scope.roomValueType);
          maxText = maxText + twodservice.getValueUnit(scope.roomValueType);
          d3.select('#legendMinText').text(minText);
          d3.select('#legendMaxText').text(maxText);
        }
        
        function changeLegendStyle() {
          //Here the legend would be made bicolor instead of gradient
        }
        
        fillLegend();

        /*
        * Watch for changes in twodviewcontroller's $scope.floorplan and
        * show it in the 2dview. Also downloads the selected floorplan if
        * it hasn't already been downloaded.
        */
        scope.$watch('plan', function () {

          if (scope.plan.svg) {

            Svg.appendFloorplan(scope.plan, containers.visible);

            // Hide the tooltip
            Tooltip.elem()
              .select('#infocontent').remove()
              .style('visibility', null)
                .select('#panobtn')
                .style('display', 'none');

            scope.selectedRoom = null;

            for (var i = 0; i < Rooms.list.length; i++) {
              Tooltip.addToRoom(Rooms.list[i]);
            }

          }

        });

        /*
        * Watch for sensor data updates and update every room's
        * info accordingly.
        */
        scope.$watch('data', function () {

          if (scope.data) {
            Svg.updateRoomInfo(scope.data, scope.$parent.roomValueType);
          }

        });

        scope.$watch('highlightedRoom', function() {

          if (scope.highlightedRoom !== null) {
            scope.plan = Floorplans.floors[scope.highlightedRoom.floor];
            scope.plan.translate = [0, 0];
            scope.plan.scale = 1;
            Svg.appendFloorplan(scope.plan, containers.visible);
            scope.highlightedRoom.pulse = Svg.highlightRoom(scope.highlightedRoom);
          }

        });
        
        scope.$watch('roomValueType', function() {
          changeLegendText();
          changeLegendStyle();
        });

      }//end link: function()
    }; //end return
  }); //end directive
