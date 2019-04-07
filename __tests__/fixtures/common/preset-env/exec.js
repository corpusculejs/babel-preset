/* eslint-disable no-plusplus, no-new */

const beforeSuperSpy = jest.fn();
const superConstructorSpy = jest.fn();

function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

let counter = 0;

class Super {
  constructor() {
    superConstructorSpy(counter++);
  }
}

@dec
class Cls extends Super {
  constructor() {
    beforeSuperSpy(counter++);
    super();
  }
}

new Cls();

expect(beforeSuperSpy).toHaveBeenCalledWith(0);
expect(superConstructorSpy).toHaveBeenCalledWith(1);
