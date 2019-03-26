export default function _injectDecoratorInitializer(instance, injectors) {
  if (Array.isArray(injectors)) {
    for (var i = 0; i < injectors.length; i++) {
      injectors[i](instance);
    }
  }
}
