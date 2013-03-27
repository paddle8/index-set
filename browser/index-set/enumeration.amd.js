define(
  ["index-set/env","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ENV = __dependency1__.ENV;

    function forEach(indexSet, fn, scope) {
      var ranges = indexSet.__ranges__,
          cursor = 0,
          next   = ranges[cursor];

      if (typeof scope === "undefined") {
        scope = null;
      }

      while (next !== ENV.END_OF_SET) {
        if (next > 0) {
          for (var i = cursor; i < next; i++) {
            fn.call(scope, i, indexSet);
          }
        }
        cursor = Math.abs(next);
        next = ranges[cursor];
      }
    }

    function map(indexSet, fn, scope) {
      var ranges = indexSet.__ranges__,
          cursor = 0,
          next   = ranges[cursor],
          result = [];

      if (typeof scope === "undefined") {
        scope = null;
      }

      while (next !== ENV.END_OF_SET) {
        if (next > 0) {
          for (var i = cursor; i < next; i++) {
            result.push(fn.call(scope, i, indexSet));
          }
        }
        cursor = Math.abs(next);
        next = ranges[cursor];
      }
      return result;
    }

    function reduce(indexSet, fn, initialValue) {
      var ranges = indexSet.__ranges__,
          cursor = 0,
          next   = ranges[cursor],
          isValueSet = false,
          value;

      if (arguments.length > 2) {
        value = initalValue;
        isValueSet = true;
      }

      while (next !== ENV.END_OF_SET) {
        if (next > 0) {
          for (var i = cursor; i < next; i++) {
            if (isValueSet) {
              value = fn(value, i, indexSet);
            } else {
              value = i;
              isValueSet = true;
            }
          }
        }
        cursor = Math.abs(next);
        next = ranges[cursor];
      }

      if (!isValueSet) {
        throw new TypeError('Reduce of empty IndexSet with no initial value');
      }

      return value;
    }

    function forEachRange(indexSet, fn, scope) {
      var ranges = indexSet.__ranges__,
          cursor = 0,
          next   = ranges[cursor];

      if (typeof scope === "undefined") {
        scope = null;
      }

      while (next !== ENV.END_OF_SET) {
        if (next > 0) {
          fn.call(scope, cursor, next - cursor, indexSet);
        }
        cursor = Math.abs(next);
        next = ranges[cursor];
      }
    }


    __exports__.forEach = forEach;
    __exports__.map = map;
    __exports__.reduce = reduce;
    __exports__.forEachRange = forEachRange;
  });
