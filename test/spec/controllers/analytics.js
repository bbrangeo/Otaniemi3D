'use strict';

describe('Controller: analytics', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var AnalyticsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AnalyticsCtrl = $controller('analytics', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
