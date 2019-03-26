import _injectDecoratorInitializer from "@corpuscule/babel-preset/lib/runtime-injector";

function dec(cls) {
  cls.__injectors.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {
  constructor() {
    _injectDecoratorInitializer(this, Cls.__injectors);
  }

  static __injectors = [];
}
