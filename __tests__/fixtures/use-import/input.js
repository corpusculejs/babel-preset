function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {}
