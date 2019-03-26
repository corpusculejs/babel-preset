const fooSpy = jest.fn();

function dec(cls) {
  cls.__injectors.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {
  get foo() {
    return this.__foo;
  }

  set foo(v) {
    this.__foo = v;
    fooSpy();
  }

  baz() {
    return this.foo;
  }
}

const cls = new Cls();

expect(cls.foo).toBe('bar');
expect(cls.baz()).toBe('bar');
expect(fooSpy).toHaveBeenCalledTimes(1);
