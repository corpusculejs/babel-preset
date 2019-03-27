function dec(cls) {
  cls.__registrations.push(target => {
    target.foo = 'bar';
  });
}

class Super {}

@dec
class Cls extends Super {}

expect(Cls.foo).toBe('bar');
