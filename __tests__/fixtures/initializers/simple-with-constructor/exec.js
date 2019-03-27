const constructorSpy = jest.fn();

function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {
  constructor() {
    constructorSpy();
  }
}

const cls = new Cls();

expect(cls.foo).toBe('bar');
expect(constructorSpy).toHaveBeenCalled();
