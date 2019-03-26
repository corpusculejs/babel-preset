const superConstructorSpy = jest.fn();

function dec(cls) {
  cls.__injectors.push(function() {
    this.foo = 'bar';
  });
}

class Super {
  constructor() {
    superConstructorSpy();
  }
}

@dec
class Cls extends Super {}

const cls = new Cls();

expect(cls.foo).toBe('bar');
expect(superConstructorSpy).toHaveBeenCalled();
