function dec(cls) {
  cls.__initializers.push(self => {
    self.foo = 'one';
  });
}

function dec2(cls) {
  cls.__initializers.push(self => {
    self.bar = 'two';
  });
}

function dec3(cls) {
  cls.__initializers.push(self => {
    self.baz = 'three';
  });
}

@dec
@dec2
@dec3
class Cls {}

const cls = new Cls();
