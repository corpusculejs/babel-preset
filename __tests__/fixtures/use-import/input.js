function dec(cls) {
  cls.__injectors.push(self => {
    self.foo = 'bar';
  });
}

@dec
class Cls {}
