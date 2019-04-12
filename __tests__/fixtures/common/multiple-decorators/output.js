var _class, _class2, _temp;

import _injectDecoratorInitializer from "@corpuscule/babel-preset/lib/runtime-injector";

function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'one';
  });
}

function dec2(cls) {
  cls.__initializers.push(self => {
    self.bar = 'two';
  });
}

function dec3(cls) {
  cls.__initializers.push(self => {
    self.baz = 'three';
  });
}

let Cls = dec(_class = dec2(_class = dec3(_class = (_temp = _class2 = class Cls {
  constructor() {
    _injectDecoratorInitializer(this, Cls.__initializers);
  }

}, _class2.__initializers = [], _class2.__registrations = [], _temp)) || _class) || _class) || _class;

_injectDecoratorInitializer(Cls, Cls.__registrations);

const cls = new Cls();
