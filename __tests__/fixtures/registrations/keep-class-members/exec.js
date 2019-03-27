const fooSpy = jest.fn();

function dec(cls) {
  cls.__registrations.push(target => {
    target.foo = 'bar';
  });
}

@dec
class Cls {
  static get foo() {
    return this.__foo;
  }

  static set foo(v) {
    this.__foo = v;
    fooSpy();
  }

  static baz() {
    return this.foo;
  }
}

expect(Cls.foo).toBe('bar');
expect(Cls.baz()).toBe('bar');
expect(fooSpy).toHaveBeenCalledTimes(1);
