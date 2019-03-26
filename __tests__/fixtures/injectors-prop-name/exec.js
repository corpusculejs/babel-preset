function dec(cls) {
  cls.__customInjectors.push(function() {
    this.foo = 'bar';
  });
}

@dec
class Cls {}

const cls = new Cls();

expect(cls.foo).toBe('bar');
