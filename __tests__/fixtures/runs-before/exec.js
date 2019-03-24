/* eslint-disable no-plusplus, no-new */

const constructorSpy = jest.fn();
const superConstructorSpy = jest.fn();

function dec(cls) {
  cls.__injectors = [
    function() {
      this.foo = 'bar';
    },
  ];
}

class Super {
  constructor() {
    superConstructorSpy();
  }
}

@dec
class Cls extends Super {
  constructor() {
    super();
    constructorSpy(this.foo);
  }
}

new Cls();
expect(constructorSpy).toHaveBeenCalledWith('bar');
