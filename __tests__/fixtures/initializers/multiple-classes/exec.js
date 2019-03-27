function dec(value) {
  return cls => {
    cls.__initializers.push(self => {
      self.foo = value;
    });
  };
}

@dec('bar1')
class Cls1 {}

@dec('bar2')
class Cls2 {}

@dec('bar3')
class Cls3 extends Cls2 {}

const cls1 = new Cls1();
const cls2 = new Cls2();
const cls3 = new Cls3();

expect(cls1.foo).toBe('bar1');
expect(cls2.foo).toBe('bar2');
expect(cls3.foo).toBe('bar3');
