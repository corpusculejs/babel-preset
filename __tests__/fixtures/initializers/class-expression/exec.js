function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

const Cls =
  @dec
  class {};

const cls = new Cls();

expect(cls.foo).toBe('bar');
