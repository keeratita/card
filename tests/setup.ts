// Import Angular compiler for JIT compilation
import '@angular/compiler';

// Mock scrollIntoView for jsdom
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = function () {
    // No-op for testing
  };
}

// Mock getBoundingClientRect for more accurate tests
if (typeof Element !== 'undefined') {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const rect = originalGetBoundingClientRect.call(this);
    // Return a mock rect if the element doesn't have layout
    if (rect.width === 0 && rect.height === 0) {
      return {
        x: 0,
        y: 0,
        top: 0,
        bottom: 40,
        left: 0,
        right: 200,
        width: 200,
        height: 40,
        toJSON: () => '{}'
      };
    }
    return rect;
  };
}