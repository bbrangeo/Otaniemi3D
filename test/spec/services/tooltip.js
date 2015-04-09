'use strict';

describe('Service: Tooltip', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Tooltip;
  beforeEach(inject(function (_Tooltip_) {
    Tooltip = _Tooltip_;
  }));

  it('should do something', function () {
    expect(!!Tooltip).toBe(true);
  });

});
