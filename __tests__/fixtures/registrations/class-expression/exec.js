function dec(cls) {
  cls.__registrations.push(target => {
    target.foo = 'bar';
  });
}

const Cls =
  @dec
  class {};

expect(Cls.foo).toBe('bar');
