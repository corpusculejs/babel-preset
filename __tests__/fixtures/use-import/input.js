function dec(cls) {
  cls.__injectors.push(function() {
    this.foo = 'bar';
  });
}

@dec
class Cls {}
