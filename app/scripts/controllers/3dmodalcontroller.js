'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:3dModalCtrl
 * @description
 * # ModalcontrollerCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('3dModalCtrl', function ($scope, $modalInstance, Rooms, roomInfo) {

    $scope.roomInfo = roomInfo;
    // Close modal.
    $scope.ok = function () {
      $modalInstance.dismiss('ok');
    };
  });
