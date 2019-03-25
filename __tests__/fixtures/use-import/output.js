import _injectDecoratorInitializer from "@corpuscule/babel-preset/lib/runtime-injector";

function dec(cls) {
  cls.__injectors = [function () {
    this.foo = 'bar';
  }];
}

@dec
class Cls {
  constructor() {
    _injectDecoratorInitializer(this, Cls.__injectors);
  }

}
