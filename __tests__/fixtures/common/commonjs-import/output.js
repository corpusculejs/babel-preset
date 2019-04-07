"use strict";

var _runtimeInjector = _interopRequireDefault(require("@corpuscule/babel-preset/lib/runtime-injector"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {
  constructor() {
    (0, _runtimeInjector.default)(this, Cls.__initializers);
  }

  static __initializers = [];
  static __registrations = [];
}

(0, _runtimeInjector.default)(Cls, Cls.__registrations);
