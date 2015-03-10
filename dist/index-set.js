(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.IndexSet = factory()
}(this, function () { 'use strict';

  var ENV = {
    // The size of the space where we mark hints
    // to increase the performance of `rangeStartForIndex`.
    HINT_SIZE: 256,

    // A constant indicating the end of the IndexSet
    END_OF_SET: 0
  };

  function rangeStartForIndex(indexSet, index) {
    var ranges = indexSet.__ranges__,
        lastIndex = indexSet.lastIndex + 1,
        rangeStart,
        next,
        hint;

    // If the index is the lastIndex or past it,
    // then the last index is the start of the range.
    if (index >= lastIndex) {
      return lastIndex;
    }

    // The index provided is a range boundary
    if (Math.abs(ranges[index]) > index) {
      return index;
    }

    // Lookup the hint index and see if we have
    // a hit where the start of the range is
    hint = index - (index % ENV.HINT_SIZE);
    rangeStart = ranges[hint];

    // If the hint was negative, we hit a boundary;
    // if the hint was greater than the index we requested,
    // we need to backtrack from the hint index to
    // find the start of the range.
    if (rangeStart < 0 || rangeStart > index) {
      rangeStart = hint;
    }

    next = ranges[rangeStart];

    // We are searching in the middle of a range;
    // recurse to find the starting index of this range
    if (typeof next === "undefined") {
      if (typeof rangeStart !== "undefined") {
        rangeStart = rangeStartForIndex(indexSet, rangeStart);
      } else {
        rangeStart = 0;
      }
      next = Math.abs(ranges[rangeStart]);

    // We don't care whether we're in a hole or not
    } else {
      next = Math.abs(next);
    }

    // If there was a malformed index set, where there
    // were filled indexes, but no items in the set,
    // make that known and clean up the index set
    if (next === ENV.END_OF_SET) {
      indexSet.removeAllIndexes();
      return -1;
    }

    // Step through the ranges in our set until we
    // find the start of range that contains our index
    while (next < index) {
      rangeStart = next;
      next = Math.abs(ranges[rangeStart]);
    }

    return rangeStart;
  }

  var enumeration__END_OF_SET = ENV.END_OF_SET;

  function forEach(indexSet, fn, scope) {
    var ranges = indexSet.__ranges__,
        cursor = 0,
        next   = ranges[cursor];

    if (typeof scope === "undefined") {
      scope = null;
    }

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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
      value = initialValue;
      isValueSet = true;
    }

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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

    while (next !== enumeration__END_OF_SET) {
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

  function addHintFor(indexSet, rangeStart, rangeLength) {
    var ranges = indexSet.__ranges__,
        skip   = ENV.HINT_SIZE,
        next   = Math.abs(ranges[rangeStart]),
        hintLocation = rangeStart - (rangeStart % skip) + skip,
        limit  = rangeStart + rangeLength;

    while (hintLocation < limit) {
      // Ensure we are in the current range
      while (next !== ENV.END_OF_SET && next <= hintLocation) {
        rangeStart = next;
        next = Math.abs(ranges[rangeStart]);
      }

      // We're past the end of the set
      if (next === ENV.END_OF_SET) {
        if (rangeStart === 0) {
          indexSet.__ranges__ = [0];
        } else if (ranges.hasOwnProperty(hintLocation)) {
          delete ranges[hintLocation];
        }

      // Don't mark a hint if it's a range boundary
      } else if (hintLocation !== rangeStart &&
                 rangeStart !== ENV.END_OF_SET) {
        ranges[hintLocation] = rangeStart;
      }

      hintLocation += skip;
    }
  }

  var observing__toString = Object.prototype.toString,
      observing__slice = Array.prototype.slice,
      META_KEY = '__js-index_set__' + (new Date().getTime()),
      T_FUNCTION = '[object Function]',
      T_STRING   = '[object String]',
      observing__T_NUMBER   = '[object Number]',
      T_BOOLEAN  = '[object Boolean]',
      uuid = 0,
      st = {}; // string cache

  function meta(o, create) {
    var info = o && o[META_KEY];
    if (create && info == null) {
      info = o[META_KEY] = {};
    }
    return info;
  }

  function destroy(o) {
    if (o != null) {
      delete o[META_KEY];
    }
  }

  function metaPath(o, path, value) {
    var i = 0, len = path ? path.length : 0,
        m;

    if (arguments.length === 3) {
      m = meta(o, true);
      for (; i < len - 1; i++) {
        o = m[path[i]] || {};
        m[path[i]] = o;
        m = o;
      }
      m[path[len - 1]] = value;
      m = value;
    } else {
      m = meta(o);
      for (; i < len; i++) {
        m = m ? m[path[i]] : undefined;
      }
    }
    return m;
  }

  function guidFor(o) {
    if (o === null) { return '(null)'; }
    if (o === void(0)) { return '(undefined)'; }

    var result, m,
        type = observing__toString.call(o);

    switch(type) {
    case observing__T_NUMBER:
      result = 'nu' + o;
      break;
    case T_STRING:
      result = st[o];
      if (!result) { result = st[o] = 'st' + (uuid++); }
      break;
    case T_BOOLEAN:
      result = o ? '(true)' : '(false)';
      break;
    default:
      if (o === Object) { return '{}'; }
      if (o === Array) { return '[]'; }
      m = meta(o, true);
      result = m.guid;
      if (!result) { result = m.guid = 'obj' + (uuid++); }
    }
    return result;
  }

  function set(hostObject, key, value) {
    var currentValue = hostObject[key];

    // Only set values if they have changed
    if (currentValue !== value) {
      trigger(hostObject, key + ':before', value);
      hostObject[key] = value;
      trigger(hostObject, key + ':change', value);
    }
  }

  function on(hostObject, event, target, method) {
    if (observing__toString.call(method) !== T_FUNCTION) {
      throw new TypeError(method + ' is not callable.');
    }

    metaPath(hostObject, ['events', event, guidFor(target), guidFor(method)], {
      method: method,
      target:  target
    });
  }

  function off(hostObject, event, target, method) {
    var m = metaPath(hostObject, ['events', event, guidFor(target)]);

    if (m) {
      delete m[guidFor(method)];
    }
  }

  function trigger(hostObject, event) {
    var targetSets = metaPath(hostObject, ['events', event]),
        args = observing__slice.call(arguments),
        subscription,
        set,
        subscriptions, k;

    if (targetSets) {
      for (set in targetSets) {
        subscriptions = targetSets[set];
        for (k in subscriptions) {
          subscription = subscriptions[k];

          subscription.method.apply(subscription.target, args);
        }
      }
    }
  }

  var addition__END_OF_SET = ENV.END_OF_SET;

  /**
    @private
    @method addIndex
    @param  indexSet {IndexSet} The target index set to add the index to.
    @param  index    {Number}   The index to add to the target index set.
   */
  function addIndex(indexSet, index) {
    addIndexesInRange(indexSet, index, 1);
  }

  function addRange(rangeStart, rangeLength) {
    addIndexesInRange(this, rangeStart, rangeLength);
  }

  /**
    @private
    @method addIndexes
    @param  indexSet {IndexSet} The target index set to add the indexes to.
    @param  indexes  {IndexSet} The indexes to add to the target index set.
   */
  function addIndexes(indexSet, indexes) {
    forEachRange(indexes, addRange, indexSet);
  }

  /**
    @private
    @method addIndexesInRange
    @param  indexSet    {IndexSet}
    @param  rangeStart  {Number}
    @param  rangeLength {Number}
   */
  function addIndexesInRange(indexSet, rangeStart, rangeLength) {
    var lastIndex = indexSet.lastIndex + 1,
        ranges    = indexSet.__ranges__,
        cursor, next, delta;

    // The start of the range we're adding is the same as the
    // last index of the set
    if (rangeStart === lastIndex) {

      // We have an empty index set and are adding from 0;
      // Mark the first index in our index set as a filled range
      // until the end of this range
      if (rangeStart === addition__END_OF_SET) {
        ranges[lastIndex] = lastIndex = rangeLength;
        delta = rangeLength;
      } else {
        // Find the start and end of the range that ends with
        // the last index in the index set
        cursor = rangeStartForIndex(indexSet, rangeStart - 1);
        next   = ranges[cursor];

        // We found a range in the set
        if (next > 0) {
          // Calculate the change in length
          delta = rangeStart - lastIndex + rangeLength;

          // Clean up the previous lastIndex
          delete ranges[lastIndex];
          // and set the start of the set to be the end
          // of the new range
          ranges[cursor] = lastIndex = rangeStart + rangeLength;
          rangeStart = cursor;

        // The previous range was not in the set;
        // Append the set to the end of the set
        } else {
          ranges[lastIndex] = lastIndex = rangeStart + rangeLength;
          delta = rangeLength;
        }
      }

      // Mark the last index in the range as the end of the set
      ranges[lastIndex] = addition__END_OF_SET;
      set(indexSet, 'lastIndex', lastIndex - 1);
      set(indexSet, 'length',    indexSet.length + delta);

      rangeLength = lastIndex - rangeStart;

    // The start of the range being added starts beyond
    // the current last index of the set.
    } else if (rangeStart > lastIndex) {
      // Mark from the current end of the set to the start
      // of this range as a hole.
      ranges[lastIndex] = 0 - rangeStart;
      // Mark the start of the range as a filled until the
      // end of the range.
      ranges[rangeStart] = rangeStart + rangeLength;
      // Mark the end of the index set.
      ranges[rangeStart + rangeLength] = addition__END_OF_SET;

      set(indexSet, 'lastIndex', rangeStart + rangeLength - 1);
      set(indexSet, 'length',    indexSet.length + rangeLength);

      delta = rangeLength;

      // The affected range for hinting goes from
      // the start of the range to the end of the set.
      rangeLength = rangeStart + rangeLength - lastIndex;
      rangeStart  = lastIndex;

    // Merge the range into the set.
    } else {
      // Find the nearest starting range
      cursor = rangeStartForIndex(indexSet, rangeStart);
      next   = ranges[cursor];

      var rangeEnd = rangeStart + rangeLength;
      delta = 0;

      // The range boundary that we found was the same as
      // the start of the range being inserted;
      // jump back to the range before the indicated hole
      if (rangeStart > 0 && cursor === rangeStart && next <= 0) {
        cursor = rangeStartForIndex(indexSet, rangeStart - 1);
        next   = ranges[cursor];
      }

      // The start of the range we found is a hole
      if (next < 0) {
        // Set the end of the hole to be the start of
        // range being added.
        ranges[cursor] = 0 - rangeStart;

        // The hole extends beyond the range being added
        if (Math.abs(next) > rangeEnd) {
          // Mark the start and end of the set.
          ranges[rangeStart] = 0 - rangeEnd;
          ranges[rangeEnd] = next;

        // The end of the range has already been taken care of
        } else {
          ranges[rangeStart] = next;
        }

      // The start of the range we found was filled
      } else {
        // Normalize variables so we can merge ranges together
        rangeStart = cursor;
        if (next > rangeEnd) {
          rangeEnd = next;
        }
      }

      // Walk ranges until we end up past the end of the
      // range being added
      var value;
      cursor = rangeStart;
      while (cursor < rangeEnd) {
        // Find the next boundary location.
        value = ranges[cursor];

        // We reached the end of the set;
        // Mark the end of the range as the end of the set
        if (value === addition__END_OF_SET) {
          ranges[rangeEnd] = addition__END_OF_SET;
          next = rangeEnd;
          delta += rangeEnd - cursor;

        } else {
          next = Math.abs(value);

          // The start of the next range is after
          // the end of the range being added
          if (next > rangeEnd) {
            ranges[rangeEnd] = value;
            next = rangeEnd;
          }

          // The range has been added;
          // Add to the delta if we have any new indexes
          if (value < 0) {
            delta += next - cursor;
          }
        }

        // Delete the range boundary.
        delete ranges[cursor];

        // Iterate to the next range boundary in the set
        cursor = next;
      }

      // The cursor should be the end of range being added.
      // If the range following the cursor is in the index set,
      // clean up the redundant boundary
      cursor = ranges[rangeEnd];
      if (cursor > 0) {
        delete ranges[rangeEnd];
        rangeEnd = cursor;
      }

      // Finally, mark the beginning of the range as filled
      ranges[rangeStart] = rangeEnd;

      if (rangeEnd > lastIndex) {
        set(indexSet, 'lastIndex', rangeEnd - 1);
      }

      // Adjust the length
      set(indexSet, 'length', indexSet.length + delta);

      // Compute the hint range
      rangeLength = rangeEnd - rangeStart;
    }

    // The firstIndex of the set might've changed
    if (delta > 0) {
      cursor = ranges[0];

      // No indexes for there to be a firstIndex
      if (cursor === addition__END_OF_SET) {
        set(indexSet, 'firstIndex', -1);
      // We have a filled range starting at 0
      } else if (cursor > 0) {
        set(indexSet, 'firstIndex', 0);
      // Use the pointer to the first filled range
      } else {
        set(indexSet, 'firstIndex', Math.abs(cursor));
      }
    }

    addHintFor(indexSet, rangeStart, rangeLength);
  }

  var removal__END_OF_SET = ENV.END_OF_SET;

  /**
    @private
    @method removeIndex
    @param  indexSet {IndexSet} The target index set to remove the index from.
    @param  index    {Number}   The index to remove from the target index set.
   */
  function removeIndex(indexSet, index) {
    removeIndexesInRange(indexSet, index, 1);
  }

  function removeRange(rangeStart, rangeLength) {
    removeIndexesInRange(this, rangeStart, rangeLength);
  }

  /**
    @private
    @method removeIndexes
    @param  indexSet {IndexSet} The target index set to remove the indexes from.
    @param  indexes  {IndexSet} The indexes to remove from the target index set.
   */
  function removeIndexes(indexSet, indexes) {
    forEachRange(indexes, removeRange, indexSet);
  }

  function removeIndexesInRange(indexSet, rangeStart, rangeLength) {
    var lastIndex = indexSet.lastIndex + 1,
        ranges    = indexSet.__ranges__,
        rangeEnd  = rangeStart + rangeLength,
        cursor,
        next,
        delta = 0;

    // The range being removed isn't in the set
    if (rangeStart >= lastIndex) {
      return this;
    }

    cursor = rangeStartForIndex(indexSet, rangeStart);
    next   = ranges[cursor];

    // The start of the range to remove is on a range boundary;
    // iterate back to the previous range
    if (rangeStart > 0 && cursor === rangeStart && next > 0) {
      cursor = rangeStartForIndex(indexSet, rangeStart - 1);
      next   = ranges[cursor];
    }

    // We found a range in the set
    if (next > 0) {
      ranges[cursor] = rangeStart;

      // The range extends beyond the range being added
      if (next > rangeEnd) {
        // Mark the start and end of the set.
        ranges[rangeStart] = rangeEnd;
        ranges[rangeEnd]   = next;

      // The end of the hole has already been taken care of
      } else {
        ranges[rangeStart] = next;
      }

    // The range we found is a hole
    } else {
     // Normalize variables so we can split ranges apart
      rangeStart = cursor;
      next       = Math.abs(next);
      if (next > rangeEnd) {
        rangeEnd = next;
      }
    }

    // Walk ranges until we end up past the end of the
    // range being removed
    var value;
    cursor = rangeStart;
    while (cursor < rangeEnd) {
      // Find the next boundary location.
      value = ranges[cursor];

      // We reached the end of the set;
      // Mark the end of the range as the end of the set
      if (value === removal__END_OF_SET) {
        ranges[rangeEnd] = removal__END_OF_SET;
        next = rangeEnd;

      } else {
        next = Math.abs(value);

        // The start of the next range is after
        // the end of the range being removed
        if (next > rangeEnd) {
          ranges[rangeEnd] = value;
          next = rangeEnd;
        }

        // The range has been removed;
        // Add to the delta if we have any indexes removed
        if (value > 0) {
          delta += next - cursor;
        }
      }

      // Delete the range boundary.
      delete ranges[cursor];

      // Iterate to the next range boundary in the set
      cursor = next;
    }

    // The cursor should be the end of range being added.
    // If the range following the cursor is a hole,
    // clean up the redundant boundary
    cursor = ranges[rangeEnd];
    if (cursor < 0) {
      delete ranges[rangeEnd];
      rangeEnd = Math.abs(cursor);
    }

    // If the next range is the end of the set,
    // move the end of the set to be the start of the
    // range being removed.
    if (ranges[rangeEnd] === removal__END_OF_SET) {
      delete ranges[rangeEnd];
      ranges[rangeStart] = removal__END_OF_SET;
      set(indexSet, 'lastIndex', rangeStart - 1);

    // Finally, mark the beginning of the range as a hole
    } else {
      ranges[rangeStart] = 0 - rangeEnd;
    }

    set(indexSet, 'length', indexSet.length - delta);

    // Compute hint length
    rangeLength = rangeEnd - rangeStart;

    addHintFor(indexSet, rangeStart, rangeLength);

    // The firstIndex of the set might've changed
    if (delta !== 0) {
      cursor = ranges[0];

      // No indexes for there to be a firstIndex
      if (cursor === removal__END_OF_SET) {
        set(indexSet, 'firstIndex', -1);
      // We have a filled range starting at 0
      } else if (cursor > 0) {
        set(indexSet, 'firstIndex', 0);
      // Use the pointer to the first filled range
      } else {
        set(indexSet, 'firstIndex', Math.abs(cursor));
      }
    }
  }

  function serializer(rangeStart, rangeLength) {
    if (rangeLength === 1) {
      this.push(rangeStart);
    } else {
      this.push(rangeStart + "-" + (rangeStart + rangeLength - 1));
    }
  }

  function serialize(indexSet) {
    var buffer = [];
    forEachRange(indexSet, serializer, buffer);
    return buffer.join(',');
  }

  function deserialize(indexSet, string, strict) {
    // Handle an empty set
    if (string === '') {
      return indexSet;
    }

    var ranges = string.split(','),
        range,
        rangeStart,
        rangeEnd;

    for (var i = 0, len = ranges.length; i < len; i++) {
      range = ranges[i];
      if (range.indexOf('-') !== -1) {
        range = range.split('-');
        rangeStart = parseInt(range[0], 10);
        rangeEnd   = parseInt(range[1], 10);

        if (isNaN(rangeEnd)) {
          if (strict) {
            throw new SyntaxError('Expected a complete range, instead got "' + ranges[i] + '".');
          }
          rangeEnd = rangeStart;
        }

        if (rangeEnd < rangeStart) {
          if (strict) {
            throw new SyntaxError('Expected an ascending range, instead got a descending one: "' + ranges[i] + '".');
          }

          var swap = rangeEnd;
          rangeEnd   = rangeStart;
          rangeStart = swap;
        } else if (rangeEnd === rangeStart && strict) {
          throw new SyntaxError('Expected a range, not a no-op range: "' + ranges[i] + '".');
        }

        // Include the rangeEnd
        rangeEnd += 1;

        indexSet.addIndexesInRange(rangeStart, rangeEnd - rangeStart);
      } else {
        rangeStart = parseInt(range, 10);
        if (!isNaN(rangeStart)) {
          indexSet.addIndex(rangeStart);
        } else if (strict) {
          throw new SyntaxError('Expected an index, but got non-number: "' + range + '".');
        }
      }
    }
    return indexSet;
  }

  var queries__END_OF_SET = ENV.END_OF_SET;

  function containsIndex(indexSet, index) {
    return containsIndexesInRange(indexSet, index, 1);
  }

  function containsRange(rangeStart, rangeLength) {
    return containsIndexesInRange(this, rangeStart, rangeLength);
  }

  function containsIndexes(indexSet, indexes) {
    // Fast path if the objects are the same
    if (indexSet === indexes) {
      return true;
    }

    return everyRange(indexes, containsRange, indexSet);
  }

  function containsIndexesInRange(indexSet, rangeStart, rangeLength) {
    var ranges = indexSet.__ranges__,
        cursor,
        next;

    cursor = rangeStartForIndex(indexSet, rangeStart);
    if (isFinite(cursor)) {
      next = ranges[cursor];

      return next > 0 &&
             cursor <= rangeStart &&
             next >= rangeStart + rangeLength;
    } else {
      return true;
    }
  }

  function intersectsIndex(indexSet, index) {
    return intersectsIndexesInRange(indexSet, index, 1);
  }

  function intersectsRange(rangeStart, rangeLength) {
    return intersectsIndexesInRange(this, rangeStart, rangeLength);
  }

  function intersectsIndexes(indexSet, indexes) {
    // Fast path if the objects are the same
    if (indexSet === indexes) {
      return true;
    }

    return someRange(indexes, intersectsRange, indexSet);
  }

  function intersectsIndexesInRange(indexSet, rangeStart, rangeLength) {
    var ranges = indexSet.__ranges__,
        cursor = rangeStartForIndex(indexSet, rangeStart),
        next   = ranges[cursor],
        limit  = rangeStart + rangeLength;

    while (cursor < limit) {
      if (next === queries__END_OF_SET) {
        return false;
      }
      if (next > 0 && next > rangeStart) {
        return true;
      }
      cursor = Math.abs(next);
      next   = ranges[cursor];
    }
    return false;
  }

  function equals(aIndexSet, bIndexSet) {
    if (aIndexSet === bIndexSet) {
      return true;
    }
    if (bIndexSet == null ||
        bIndexSet.lastIndex !== aIndexSet.lastIndex ||
        bIndexSet.length    !== aIndexSet.length) {
      return false;
    }

    var aRanges = aIndexSet.__ranges__,
        bRanges = bIndexSet.__ranges__,
        cursor  = 0,
        next    = aRanges[cursor];

    do {
      if (bRanges[cursor] !== next) {
        return false;
      }
      cursor = Math.abs(next);
      next   = aRanges[cursor];
    } while (cursor !== queries__END_OF_SET);
    return true;
  }

  var indexes__END_OF_SET = ENV.END_OF_SET;

  function indexLessThanIndex(indexSet, index) {
    return indexLessThanOrEqualToIndex(indexSet, index - 1);
  }

  function indexLessThanOrEqualToIndex(indexSet, index) {
    // No indexes before 0
    if (index <= 0) {
      return -1;
    }

    var ranges     = indexSet.__ranges__,
        lastIndex  = indexSet.lastIndex + 1,
        cursor     = rangeStartForIndex(indexSet, index);

    while (cursor === lastIndex || ranges[cursor] < 0) {
      // There are no indexes before this index
      if (cursor === indexes__END_OF_SET) {
        return -1;
      }
      index  = cursor - 1;
      cursor = rangeStartForIndex(indexSet, index);

      if (cursor === -1) {
        return cursor;
      }
    }

    return index;
  }

  function indexGreaterThanIndex(indexSet, index) {
    return indexGreaterThanOrEqualToIndex(indexSet, index + 1);
  }

  function indexGreaterThanOrEqualToIndex(indexSet, index) {
    var ranges     = indexSet.__ranges__,
        lastIndex  = indexSet.lastIndex + 1,
        cursor,
        next;

    // No indexes after the last index
    if (index >= lastIndex) {
      return -1;
    }

    cursor = rangeStartForIndex(indexSet, index);
    next   = ranges[cursor];

    // Until we find the next filled range
    while (next < 0) {
      // No items after the end of this set
      if (next === indexes__END_OF_SET) {
        return -1;
      }

      index = cursor = Math.abs(next);
      next  = ranges[cursor];
    }

    return index;
  }

  var index_set__slice = Array.prototype.slice,
      index_set__toString = Object.prototype.toString,
      index_set__T_NUMBER = '[object Number]',
      index_set__END_OF_SET = ENV.END_OF_SET;

  /**
    @private
    Routes a function call from the overloaded method to the
    concrete method call by doing argument checking.

    @method invokeConcreteMethodFor
    @param indexSet {IndexSet}
    @param fnName
   */
  function invokeConcreteMethodFor(indexSet, fnName, args) {
    if (args.length === 1) {
      if (args[0] instanceof IndexSet) {
        return indexSet[fnName + "Indexes"](args[0]);
      } else if (index_set__toString.call(args[0]) === index_set__T_NUMBER) {
        return indexSet[fnName + "Index"](args[0]);
      }
    } else if (args.length === 2) {
      return indexSet[fnName + "IndexesInRange"](args[0], args[1]);
    }
  }

  /**
    An IndexSet represents a collection of unique unsigned integers,
    known as **indexes** because of the way they are used. This collection
    is referred to as an **index set**.

    You use index sets in your code to store indexes into some other
    data structure. For example, given an array, you could use an index
    set to identify a subset of objects in that array.

    You should not use index sets to store an arbitrary collection of
    integer values because index sets store indexes as sorted ranges.
    This makes them more efficient than storing a collection of individual
    integers. It also means that each index value can only appear once in
    the index set.

    Index sets are a concept from [Cocoa][1], and are useful in managing
    ordered collections, such as views or data sets.

    ### Implementation Notes

    The internal data structure is a jump list, where the following rules
    indicate how to find ranges:

    - a positive integer indicates a filled range
    - a negative integer indicates a hole
    - `0` indicates the end of the set

    In addition, there are search accelerator for increasing the performance
    of insertion and querying. These values are stored in the jump list
    and indicate the start of the nearest range.

    **NOTE**: Infinite ranges are currently unsupported.

    [1]: http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/Collections/Articles/ "Cocoa Collections"

    @class IndexSet
   */
  function IndexSet() {
    var args = index_set__slice.call(arguments);

    // Optimize creating a cloned index set
    if (args.length === 1 && args[0] instanceof IndexSet) {
      var source = args[0];

      // Copy over properties rather than
      // manually adding them.
      //
      // This results in a faster clone for
      // very large index sets.
      this.__ranges__ = source.__ranges__.slice();
      this.length = source.length;
      this.firstIndex = source.firstIndex;
      this.lastIndex = source.lastIndex;

    } else {
      this.__ranges__ = [index_set__END_OF_SET];
      invokeConcreteMethodFor(this, 'add', args);
    }
  }

  IndexSet.prototype = {

    /**
      The size of the indicates. This is the number
      of indexes currently stored in the set.

      @property length
      @readOnly
      @type Number
      @default 0
     */
    length: 0,

    /**
      The first index in the set, or -1 if there
      are no indexes in the set.

      @property firstIndex
      @readOnly
      @type Number
      @default -1
     */
    firstIndex: -1,

    /**
      The last index in the set, or -1 if there
      are no indexes in the set.

      @property lastIndex
      @readOnly
      @type Number
      @default -1
     */
    lastIndex: -1,

    // .............................................
    // Mutable IndexSet methods
    //

    /**
      Add a single index to the `IndexSet`.
      This index must be a natural number.

      @method addIndex
      @chainable
      @param index {Number}
     */
    addIndex: function (index) {
      addIndex(this, index);
      return this;
    },

    /**
      Add a collection of indexes to the `IndexSet`.

      @method addIndexes
      @chainable
      @param indexSet {IndexSet}
     */
    addIndexes: function (indexSet) {
      addIndexes(this, indexSet);
      return this;
    },

    /**
      Add a range of indexes to the `IndexSet`.
      The range values provided indicate the start
      of the range and the length of the range.

      @method addIndexesInRange
      @chainable
      @param rangeStart  {Number} A natural number that indicates the start of the range to add.
      @param rangeLength {Number} A natural number that indicates the length of the range.
     */
    addIndexesInRange: function (rangeStart, rangeLength) {
      addIndexesInRange(this, rangeStart, rangeLength);
      return this;
    },

    /**
      Remove a single index from the `IndexSet`.
      The index must be a natural number.

      @method removeIndex
      @chainable
      @param index {Number}
     */
    removeIndex: function (index) {
      removeIndex(this, index);
      return this;
    },

    /**
      Remove a collection of indexes from the `IndexSet`.

      @method removeIndexes
      @chainable
      @param indexSet {IndexSet}
     */
    removeIndexes: function (indexSet) {
      removeIndexes(this, indexSet);
      return this;
    },

    /**
      Remove all indexes stored in the index set.

      @method removeAllIndexes
      @chainable
     */
    removeAllIndexes: function () {
      trigger(this, 'length:before',      0);
      trigger(this, 'firstIndex:before', -1);
      trigger(this, 'lastIndex:before',  -1);

      this.__ranges__ = [0];
      this.length     = 0;
      this.firstIndex = -1;
      this.lastIndex  = -1;

      trigger(this, 'length:change',      0);
      trigger(this, 'firstIndex:change', -1);
      trigger(this, 'lastIndex:change',  -1);

      return this;
    },

    /**
      Remove a range of indexes from the `IndexSet`.
      The range values provided indicate the start
      of the range and the length of the range.

      @method addIndexesInRange
      @chainable
      @param rangeStart  {Number} A natural number that indicates the start of the range to remove.
      @param rangeLength {Number} A natural number that indicates the length of the range.
     */
    removeIndexesInRange: function (rangeStart, rangeEnd) {
      removeIndexesInRange(this, rangeStart, rangeEnd);
      return this;
    },

    // .............................................
    // Set membership
    //

    /**
      @method containsIndex
      @param index {Number}
      @return {Boolean} Whether or not
        the set contains the index passed in.
     */
    containsIndex: function (index) {
      return containsIndex(this, index);
    },

    /**
      @method containsIndexes
      @param indexSet {IndexSet}
      @return {Boolean} Whether or not
        the set contains the index set.
     */
    containsIndexes: function (indexSet) {
      return containsIndexes(this, indexSet);
    },

    /**
      @method containsIndexes
      @param rangeStart  {Number}
      @param rangeLength {Number}
      @return {Boolean} Whether or not
        the set contains the range of indexes passed in.
     */
    containsIndexesInRange: function (rangeStart, rangeLength) {
      return containsIndexesInRange(this, rangeStart, rangeLength);
    },

    /**
      @method intersectsIndex
      @param index {Number}
      @return {Boolean} Whether or not
        the index intersects any indexes in the set.
     */
    intersectsIndex: function (index) {
      return intersectsIndex(this, index);
    },

    /**
      @method intersectsIndexes
      @param indexSet {IndexSet}
      @return {Boolean} Whether or not
        any indexes in the passed set are included in the set.
     */
    intersectsIndexes: function (indexSet) {
      return intersectsIndexes(this, indexSet);
    },

    /**
      @method intersectsIndexesInRange
      @param rangeStart  {Number}
      @param rangeLength {Number}
      @return {Boolean} Whether or not
        the range contains any indexes in the set.
     */
    intersectsIndexesInRange: function (rangeStart, rangeEnd) {
      return intersectsIndexesInRange(this, rangeStart, rangeEnd);
    },

    // .............................................
    // Getting indexes
    //

    /**
      @method indexGreaterThanIndex
      @param index {Number}
      @return {Number} The first index in the set that is
        greater than the index provided.
     */
    indexGreaterThanIndex: function (index) {
      return indexGreaterThanIndex(this, index);
    },

    /**
      @method indexGreaterThanOrEqualToIndex
      @param index {Number}
      @return {Number} The first index in the set that is
        greater than the index provided, or the index
        if it is within the set.
     */
    indexGreaterThanOrEqualToIndex: function (index) {
      return indexGreaterThanOrEqualToIndex(this, index);
    },

    /**
      @method indexLessThanIndex
      @param index {Number}
      @return {Number} The first index in the set that is
        less than the index provided.
     */
    indexLessThanIndex: function (index) {
      return indexLessThanIndex(this, index);
    },

    /**
      @method indexLessThanOrEqualToIndex
      @param index {Number}
      @return {Number} The first index in the set that is
        less than the index provided, or the index
        if it is within the set.
     */
    indexLessThanOrEqualToIndex: function (index) {
      return indexLessThanOrEqualToIndex(this, index);
    },

    /**
      For a given index, this will return the index
      that indicates the start of the range the index
      is contained in. Note that this range may be
      a filled range or a hole.

      @private
      @method rangeStartForIndex
      @param index {Number}
      @return Number
     */
    rangeStartForIndex: function (index) {
      return rangeStartForIndex(this, index);
    },

    // .............................................
    // Simplified JS interface
    //

    /**
      Add indexes to the index set. This method will
      take a single index, a index range, or an `IndexSet`.

      @method add
      @chainable
     */
    add: function () {
      invokeConcreteMethodFor(this, 'add', index_set__slice.call(arguments));
      return this;
    },

    /**
      Remove indexes the index set. This method will
      take a single index, a index range, or an `IndexSet`.

      @method remove
      @chainable
     */
    remove: function () {
      invokeConcreteMethodFor(this, 'remove', index_set__slice.call(arguments));
      return this;
    },

    /**
      @method intersects
      @return {Boolean} Whether the indexes provided
         intersect the IndexSet.
     */
    intersects: function () {
      return invokeConcreteMethodFor(this, 'intersects', index_set__slice.call(arguments));
    },

    /**
      @method contains
      @return {Boolean} Whether the IndexSet contains
         the provided indexes.
     */
    contains: function () {
      return invokeConcreteMethodFor(this, 'contains', index_set__slice.call(arguments));
    },

    /**
      @method equals
      @param indexSet {IndexSet}
        The IndexSet to test against.
      @return {Boolean} Whether the two IndexSets
        are equivalent.
     */
    equals: function (indexSet) {
      return equals(this, indexSet);
    },

    /**
      @method indexBefore
      @param index {Number} The index start searching from.
      @return {Number} The first index in the set
        before the given index.
     */
    indexBefore: function (index) {
      return indexLessThanIndex(this, index);
    },

    /**
      @method indexAfter
      @param index {Number} The index start searching from.
      @return {Number} The first index in the set
        after the given index.
     */
    indexAfter: function (index) {
      return indexGreaterThanIndex(this, index);
    },

    /**
      Allows the garbage collector to reclaim memory of the
      index set.

      @method destroy
     */
    destroy: function () {
      destroy(this);
      this.removeAllIndexes();
    },

    // .............................................
    // Copying
    //

    /**
      @method copy
      @return {IndexSet} A copy of the set.
     */
    copy: function () {
      return new IndexSet(this);
    },

    // .............................................
    // Coding
    //

    /**
      @method serialize
      @return {String} The set serialized as a string.
     */
    serialize: function () {
      return serialize(this);
    },

    // .............................................
    // Observing
    //

    /**
      Listen to property changes on the IndexSet
      by adding an event listener.

      For get notifications when the length
      of the IndexSet will change, the event
      is `length:change`. To be notified before
      the property changes, the event is
      `length:before`:

          var set = new IndexSet();
          set.on('length:before', null, function (set, event, length) {
            console.log('The IndexSet will have ' + length + ' indexes.');
          });
          set.on('length:change', null, function (set, event, length) {
            console.log('The IndexSet now has ' + length + ' indexes.');
          });

      @method on
      @param key {String}
        The event to listen to.
      @param target {*}
        The target object to scope the method.
      @param method {Function}
        The function to be called when the event
        gets triggered.
     */
    on: function (key, target, method) {
      return on(this, key, target, method);
    },

    /**
      Remove an event listener. To remove a
      listener, this should be called with the
      same arguments as `on`.

      @method on
      @param key {String}
        The event to stop listening to.
      @param target {*}
        The target object used to scope the method.
      @param method {Function}
        The function that was used to
        listen to events.
     */
    off: function (key, target, method) {
      return off(this, key, target, method);
    },

    // .............................................
    // Enumeration
    //

    /**
      Loop over every index in this set.
      This is compatible with ECMAScript
      implementations.

      @method forEach
      @param fn    {Function} The function to call
        for each iteration of the loop
      @param scope {*} The scope to call the function with.
     */
    forEach: function (fn, scope) {
      forEach(this, fn, scope);
    },

    /**
      @method map
      @param fn
      @param scope {*} The scope to call the function with.
     */
    map: function (fn, scope) {
      return map(this, fn, scope);
    },

    /**
      @method reduce
      @param fn
      @param [initialValue] {*} The initial value to
        call the reducer function with
     */
    reduce: function () {
      var args = index_set__slice.call(arguments);
      args.unshift(this);
      return reduce.apply(null, args);
    },

    /**
      @method some
      @param fn
      @param scope {*} The scope to call the function with.
      @return {Boolean} Whether any of the
        indexes in the set satisfied the
        function provided.
     */
    some: function (fn, scope) {
      return some(this, fn, scope);
    },

    /**
      @method every
      @param fn
      @param scope {*} The scope to call the function with.
      @return {Boolean} Whether all of the
        indexes in the set satisfied the
        function provided.
     */
    every: function (fn, scope) {
      return every(this, fn, scope);
    },

    /**
      Loop over every range in this set.

      @method forEachRange
      @param fn    {Function} The function to call
        for each iteration of the loop
      @param scope {*} The scope to call the function with.
     */ 
    forEachRange: function (fn, scope) {
      forEachRange(this, fn, scope);
    },

    /**
      @method someRange
      @param fn
      @param scope {*} The scope to call the function with.
      @return {Boolean} Whether any of the
        ranges in the set satisfied the
        function provided.
     */
    someRange: function (fn, scope) {
      someRange(this, fn, scope);
    },

    /**
      @method everyRange
      @param fn
      @param scope {*} The scope to call the function with.
      @return {Boolean} Whether all of the
        ranges in the set satisfied the
        function provided.
     */
    everyRange: function (fn, scope) {
      everyRange(this, fn, scope);
    }
  };

  /**
    @method deserialize
    @static
    @param string {String} The string to deserialize.
    @param strict {Boolean} Whether errors should be thrown if the serialization is invalid.
    @return {IndexSet} The string represented as an IndexSet.
   */
  IndexSet.deserialize = function (string, strict) {
    return deserialize(new IndexSet(), string, strict);
  };

  IndexSet.ENV = ENV;

  var index_set = IndexSet;

  return index_set;

}));