export default function _injectDecoratorInitializer(target, callbacks) {
  if (Array.isArray(callbacks)) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](target);
    }
  }
}
