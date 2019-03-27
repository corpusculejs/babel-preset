function dec(cls) {
  cls.__customInitializers.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {}

const cls = new Cls();

expect(cls.foo).toBe('bar');
