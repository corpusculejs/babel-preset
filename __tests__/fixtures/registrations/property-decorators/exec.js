function dec(cls, key) {
  cls.__registrations.push(target => {
    target[key] = 'bar';
  });
}

class Cls {
  @dec static prop;
}

expect(Cls.prop).toBe('bar');
