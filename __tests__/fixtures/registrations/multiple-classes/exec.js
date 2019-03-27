function dec(value) {
  return cls => {
    cls.__registrations.push(target => {
      target.foo = value;
    });
  };
}

@dec('bar1')
class Cls1 {}

@dec('bar2')
class Cls2 {}

@dec('bar3')
class Cls3 extends Cls2 {}

expect(Cls1.foo).toBe('bar1');
expect(Cls2.foo).toBe('bar2');
expect(Cls3.foo).toBe('bar3');
