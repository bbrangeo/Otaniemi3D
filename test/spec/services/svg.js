'use strict';

describe('Service: Svg', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Svg;
  beforeEach(inject(function (_Svg_) {
    Svg = _Svg_;
  }));

  it('should do something', function () {
    expect(!!Svg).toBe(true);
  });

});
