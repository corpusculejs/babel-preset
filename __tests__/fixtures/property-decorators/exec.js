function dec({constructor: cls}, key) {
  cls.__injectors = [
    function() {
      this[key] = 'bar';
    },
  ];
}

class Cls {
  @dec prop;
}

const cls = new Cls();

expect(cls.prop).toBe('bar');
