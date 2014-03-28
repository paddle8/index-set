import ENV from "./env";

var END_OF_SET = ENV.END_OF_SET;

function forEach(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
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

  while (next !== END_OF_SET) {
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

  while (next !== END_OF_SET) {
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

function some(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
    if (next > 0) {
      for (var i = cursor; i < next; i++) {
        if (fn.call(scope, i, indexSet)) {
          return true;
        }
      }
    }
    cursor = Math.abs(next);
    next = ranges[cursor];
  }
  return false;
}

function every(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
    if (next > 0) {
      for (var i = cursor; i < next; i++) {
        if (!fn.call(scope, i, indexSet)) {
          return false;
        }
      }
    }
    cursor = Math.abs(next);
    next = ranges[cursor];
  }
  return true;
}

function forEachRange(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
    if (next > 0) {
      fn.call(scope, cursor, next - cursor, indexSet);
    }
    cursor = Math.abs(next);
    next = ranges[cursor];
  }
}

function someRange(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
    if (next > 0) {
      if (fn.call(scope, cursor, next - cursor, indexSet)) {
        return true;
      }
    }
    cursor = Math.abs(next);
    next = ranges[cursor];
  }
  return false;
}

function everyRange(indexSet, fn, scope) {
  var ranges = indexSet.__ranges__,
      cursor = 0,
      next   = ranges[cursor];

  if (typeof scope === "undefined") {
    scope = null;
  }

  while (next !== END_OF_SET) {
    if (next > 0) {
      if (!fn.call(scope, cursor, next - cursor, indexSet)) {
        return false;
      }
    }
    cursor = Math.abs(next);
    next = ranges[cursor];
  }
  return true;
}

export { forEach, map, reduce, some, every };
export { forEachRange, someRange, everyRange };
