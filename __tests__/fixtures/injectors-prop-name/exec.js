function dec(cls) {
  cls.__customInjectors.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {}

const cls = new Cls();

expect(cls.foo).toBe('bar');
