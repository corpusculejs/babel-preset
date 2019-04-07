export default function _injectDecoratorInitializer(target, callbacks) {
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i](target);
  }
}
