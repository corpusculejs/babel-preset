function dec(cls) {
  cls.__customRegistrations.push(target => {
    target.foo = 'bar';
  });
}

@dec
class Cls {}

expect(Cls.foo).toBe('bar');
