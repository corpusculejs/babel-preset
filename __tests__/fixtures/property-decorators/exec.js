function dec({constructor: cls}, key) {
  cls.__initializers.push(self => {
    self[key] = 'bar';
  });
}

class Cls {
  @dec prop;
}

const cls = new Cls();

expect(cls.prop).toBe('bar');
