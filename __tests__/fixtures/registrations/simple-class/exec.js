function dec(cls) {
  cls.__registrations.push(target => {
    target.foo = 'bar';
  });
}

@dec
class Cls {}

expect(Cls.foo).toBe('bar');
