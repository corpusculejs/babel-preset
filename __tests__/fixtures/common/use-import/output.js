import _injectDecoratorInitializer from "@corpuscule/babel-preset/lib/runtime-injector";

function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {
  constructor() {
    _injectDecoratorInitializer(this, Cls.__initializers);
  }

  static __initializers = [];
  static __registrations = [];
}

_injectDecoratorInitializer(Cls, Cls.__registrations);
