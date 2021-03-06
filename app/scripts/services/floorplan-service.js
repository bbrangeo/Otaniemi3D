'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.floorplanService
 * @description
 * # floorplanService
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('floorplanService', function () {

    var self = this;
    
    this.floors = [
      {
        url: 'floorplans/floor1.svg',
        name: 'Floor 1',
        roomNumber: 'st10',
        roomArea: 'st1',
        svg: null,
        isSelected: true,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor2.svg',
        name: 'Floor 2',
        roomNumber: 'st13',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor3.svg',
        name: 'Floor 3',
        roomNumber: 'st11',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor4.svg',
        name: 'Floor 4',
        roomNumber: 'st7',
        roomArea: 'st1',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor5.svg',
        name: 'Floor 5',
        roomNumber: 'st10',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      }
    ];

    this.allLoaded = function() {
      //Returns true or false if all floorplans have been loaded
      for (var i = 0; i < self.floors.length; i++) {
        if (self.floors[i].svg === null) {
          return false;
        } else if (i === self.floors.length - 1) {
          //Loop continues here only if all the floors have a non-null svg attribute
          return true;
        }
      }
    };
  
  });
