function dec(cls) {
  cls.__injectors = [
    function() {
      this.foo = 'bar';
    },
  ];
}

@dec
class Cls {}
