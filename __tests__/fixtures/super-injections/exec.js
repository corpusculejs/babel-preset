function dec(property, value) {
  return cls => {
    cls.__injectors = [
      function() {
        this[property] = value;
      },
    ];
  };
}

@dec('foo', 'bar')
class Cls1 {}

@dec('foo1', 'bar1')
class Cls2 extends Cls1 {}

const cls = new Cls2();

expect(cls.foo).toBe('bar');
expect(cls.foo1).toBe('bar1');
