(function() {
var define, require;

(function () {
  var registry = {}, seen = {};

  define = function (name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  require = function require(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(require(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();

define("index-set/addition",
  ["index-set/range_start","index-set/env","index-set/hint","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var rangeStartForIndex = __dependency1__.rangeStartForIndex;
    var ENV = __dependency2__.ENV;
    var addHintFor = __dependency3__.addHintFor;

    var END_OF_SET = ENV.END_OF_SET;

    /**
      @method addIndex
      @param  indexSet {IndexSet} The target index set to add the index to.
      @param  index    {Number}   The index to add to the target index set.
     */
    function addIndex(indexSet, index) {
      addIndexesInRange(indexSet, index, 1);
    }

    /**
      @method addIndexes
      @param  indexSet {IndexSet} The target index set to add the indexes to.
      @param  indexes  {IndexSet} The indexes to add to the target index set.
     */
    function addIndexes(indexSet, indexes) {
      var ranges = indexes.__ranges__,
          cursor,
          next;

      if (ranges != null) {
        cursor = 0;
        next = ranges[ptr];

        // Iterate until we've reached the end of the index set
        while (next !== 0) {
          if (next > 0) {
            addIndexesInRange(indexSet, cursor, next - cursor);
          }
          cursor = Math.abs(cursor);
          next   = ranges[cursor];
        }
      }
    }

    /**
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
        if (rangeStart === END_OF_SET) {
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
        ranges[lastIndex] = END_OF_SET;
        indexSet.lastIndex = lastIndex - 1;
        indexSet.length   += delta;

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
        ranges[rangeStart + rangeLength] = END_OF_SET;

        indexSet.lastIndex = rangeStart + rangeLength - 1;
        indexSet.length += rangeLength;

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

        var endOfRange = rangeStart + rangeLength;
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
          if (Math.abs(next) > endOfRange) {
            // Mark the start and end of the set.
            ranges[rangeStart] = 0 - endOfRange;
            ranges[endOfRange] = next;

          // The end of the range has already been taken care of
          } else {
            ranges[rangeStart] = next;
          }

        // The start of the range we found was filled
        } else {
          // Normalize variables so we can merge ranges together
          rangeStart = cursor;
          if (next > endOfRange) {
            endOfRange = next;
          }
        }

        // Walk ranges until we end up past the end of the
        // range being added
        var value;
        cursor = rangeStart;
        while (cursor < endOfRange) {
          // Find the next boundary location.
          value = ranges[cursor];

          // We reached the end of the set;
          // Mark the end of the range as the end of the set
          if (value === END_OF_SET) {
            ranges[endOfRange] = END_OF_SET;
            next = endOfRange;
            delta += endOfRange - cursor;

          } else {
            next = Math.abs(value);

            // The start of the next range is after
            // the end of the range being added
            if (next > endOfRange) {
              ranges[endOfRange] = value;
              next = endOfRange;
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
        cursor = ranges[endOfRange];
        if (cursor > 0) {
          delete ranges[endOfRange];
          endOfRange = cursor;
        }

        // Finally, mark the beginning of the
        // set as a filled range
        ranges[rangeStart] = endOfRange;

        if (endOfRange > lastIndex) {
          indexSet.lastIndex = endOfRange - 1;
        }

        // Adjust the length
        indexSet.length += delta;

        // Compute the hint range
        rangeLength = endOfRange - rangeStart;
      }

      // The firstIndex of the set might've changed
      if (delta > 0) {
        cursor = ranges[0];

        // No indexes for there to be a firstIndex
        if (cursor === END_OF_SET) {
          indexSet.firstIndex = -1;
        // We have a filled range starting at 0
        } else if (cursor > 0) {
          indexSet.firstIndex = 0;
        // Use the pointer to the first filled range
        } else {
          indexSet.firstIndex = Math.abs(cursor);
        }
      }

      addHintFor(indexSet, rangeStart, rangeLength);
    }


    __exports__.addIndex = addIndex;
    __exports__.addIndexes = addIndexes;
    __exports__.addIndexesInRange = addIndexesInRange;
  });

define("index-set/coding",
  ["index-set/enumeration","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var forEachRange = __dependency1__.forEachRange;

    function serializer(rangeStart, rangeLength) {
      if (rangeLength === 1) {
        this.push(rangeStart);
      } else {
        this.push(rangeStart + ".." + (rangeStart + rangeLength));
      }
    }

    function serialize(indexSet) {
      var buffer = [];
      forEachRange(indexSet, serializer, buffer);
      return buffer.join(',');
    }

    function deserialize(indexSet, string) {
      var ranges = string.split(','),
          range,
          rangeStart,
          rangeEnd;

      for (var i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        if (range.indexOf('..') !== -1) {
          range = range.split('..');
          rangeStart = parseInt(range[0], 10);
          rangeEnd   = parseInt(range[1], 10);
          indexSet.addIndexesInRange(rangeStart, rangeEnd - rangeStart);
        } else {
          indexSet.addIndex(parseInt(range, 10));
        }
      }
      return indexSet;
    }


    __exports__.serialize = serialize;
    __exports__.deserialize = deserialize;
  });

define("index-set/enumeration",
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

define("index-set/env",
  ["exports"],
  function(__exports__) {
    "use strict";
    var ENV = {
      // The size of the space where we mark hints
      // to increase the performance of `rangeStartForIndex`.
      HINT_SIZE: 256,

      // A constant indicating the end of the IndexSet
      END_OF_SET: 0
    };


    __exports__.ENV = ENV;
  });

define("index-set/hint",
  ["index-set/env","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ENV = __dependency1__.ENV;

    function addHintFor(indexSet, rangeStart, rangeLength) {
      var ranges = indexSet.__ranges__,
          skip   = ENV.HINT_SIZE,
          next   = Math.abs(ranges[rangeStart]),
          hintLocation = rangeStart - (rangeStart % skip) + rangeStart,
          limit  = rangeStart + rangeLength;

      while (hintLocation < limit) {
        // Ensure we are in the current range
        while (next !== 0 && next <= hintLocation) {
          rangeStart = next;
          next = Math.abs(ranges[rangeStart]);
        }

        // We're past the end of the set
        if (next === ENV.END_OF_SET) {
          delete ranges[hintLocation];

        // Don't mark a hint if it's a range boundary
        } else if (hintLocation !== rangeStart) {
          ranges[hintLocation] = rangeStart;
        }

        hintLocation += skip;
      }
    }


    __exports__.addHintFor = addHintFor;
  });

define("index-set/range_start",
  ["index-set/env","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ENV = __dependency1__.ENV;

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
        next = rangeStartForIndex(indexSet, rangeStart);

      // We don't care whether we're in a hole or not
      } else {
        next = Math.abs(next);
      }

      // Step through the ranges in our set until we
      // find the start of range that contains our index
      while (next < index) {
        rangeStart = next;
        next = Math.abs(ranges[rangeStart]);
      }

      return rangeStart;
    }


    __exports__.rangeStartForIndex = rangeStartForIndex;
  });

define("index-set/removal",
  [],
  function() {
    "use strict";
    /**
      @method removeIndex
      @param  indexSet {IndexSet} The target index set to remove the index from.
      @param  index    {Number}   The index to remove from the target index set.
     */
    function removeIndex (indexSet, index) {
      removeIndexesInRange(indexSet, index, 1);
    }

    /**
      @method removeIndexes
      @param  indexSet {IndexSet} The target index set to remove the indexes from.
      @param  indexes  {IndexSet} The indexes to remove from the target index set.
     */
    function removeIndexes (indexSet, indexes) {
    }

    function removeIndexesInRange (indexSet, rangeStart, rangeLength) {
    }

  });

define("index-set",
  ["index-set/addition","index-set/env","index-set/coding","index-set/enumeration"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__) {
    "use strict";
    var addIndex = __dependency1__.addIndex;
    var addIndexes = __dependency1__.addIndexes;
    var addIndexesInRange = __dependency1__.addIndexesInRange;
    var ENV = __dependency2__.ENV;
    var serialize = __dependency3__.serialize;
    var deserialize = __dependency3__.deserialize;
    var forEach = __dependency4__.forEach;
    var map = __dependency4__.map;
    var reduce = __dependency4__.reduce;
    var forEachRange = __dependency4__.forEachRange;

    var slice = Array.prototype.slice;

    /**
      An IndexSet represents a collection of unique unsigned integers,
      known as **indexes** because of the way they are used. this collection
      is referred to as an **index set**.

      You use index sets in your code to store indexes into some other
      data structure. For example, given an array, you could use an index
      set to identify a subset of objects in that array.

      You should not use index sets to stor an arbitrary collection of
      integer values because index sets store indexes as sorted ranges.
      This makes them more efficient than storing a collection of individual
      integers. It also means that each index value can only appear once in
      the index set.

      Index sets are a concept from [Cocoa][1], and are useful in managing
      ordered collections, such as views or data sets.

      [1] http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/Collections/Articles/

      @class IndexSet
     */
    function IndexSet() {
      // Initialize the index set with a marker at index '0'
      // indicating that it is the end of the set.
      this.__ranges__ = [0];
    };

    IndexSet.prototype = {

      /**
        The size of the indicates. This is the number
        of indexes currently stored in the set.

        @property length
        @type Number
        @default 0
       */
      length: 0,

      /**
        The first index in the set, or -1 if there
        are no indexes in the set.

        @property firstIndex
        @type Number
        @default -1
       */
      firstIndex: -1,

      /**
        The last index in the set, or -1 if there
        are no indexes in the set.

        @property lastIndex
        @type Number
        @default -1
       */
      lastIndex: -1,

      // .............................................
      // Mutable IndexSet methods
      //

      addIndex: function (index) {
        addIndex(this, index);
        return this;
      },

      addIndexes: function (indexSet) {
        addIndexes(this, indexSet);
        return this;
      },

      addIndexesInRange: function (rangeStart, rangeEnd) {
        addIndexesInRange(this, rangeStart, rangeEnd);
        return this;
      },

      removeIndex: function (index) {
      },

      removeIndexes: function (indexSet) {
      },

      /**
        Remove all indexes stored in the index set.

        @method removeAllIndexes
       */
      removeAllIndexes: function () {
        this.__ranges__ = [0];
        this.length     = 0;
        this.firstIndex = -1;
        this.lastIndex  = 0;
        return this;
      },

      removeIndexesInRange: function (rangeStart, rangeEnd) {
      },

      // .............................................
      // Coding
      //

      serialize: function () {
        return serialize(this);
      },


      // .............................................
      // Enumeration
      //

      forEach: function (fn, scope) {
        forEach(this, fn, scope);
      },

      map: function (fn, scope) {
        return map(this, fn, scope);
      },

      reduce: function (fn, initialValue) {
        var args = slice.call(arguments);
        args.unshift(this);
        return reduce.apply(null, args);
      },

      forEachRange: function (fn, scope) {
        forEachRange(this, fn, scope);
      }
    };

    IndexSet.deserialize = function (string) {
      return deserialize(new IndexSet(), string);
    };

    IndexSet.ENV = ENV;


    return IndexSet;
  });

window.IndexSet = require('index-set');
})();
