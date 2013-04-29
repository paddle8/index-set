define(
  ["index-set/range_start","index-set/enumeration","index-set/env","index-set/hint","index-set/observing","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var rangeStartForIndex = __dependency1__.rangeStartForIndex;
    var forEachRange = __dependency2__.forEachRange;
    var ENV = __dependency3__.ENV;
    var addHintFor = __dependency4__.addHintFor;
    var set = __dependency5__.set;

    var END_OF_SET = ENV.END_OF_SET;

    /**
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
      @method removeIndexes
      @param  indexSet {IndexSet} The target index set to remove the indexes from.
      @param  indexes  {IndexSet} The indexes to remove from the target index set.
     */
    function removeIndexes(indexSet, indexes) {
      forEachRange(indexes, addRange, indexSet);
    }

    function removeIndexesInRange(indexSet, rangeStart, rangeLength) {
      var lastIndex = indexSet.lastIndex + 1,
          ranges    = indexSet.__ranges__,
          rangeEnd  = rangeStart + rangeLength,
          cursor,
          next,
          delta;

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
        if (value === END_OF_SET) {
          ranges[rangeEnd] = END_OF_SET;
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
      if (ranges[rangeEnd] === END_OF_SET) {
        delete ranges[rangeEnd];
        ranges[rangeStart] = END_OF_SET;
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
        if (cursor === END_OF_SET) {
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


    __exports__.removeIndex = removeIndex;
    __exports__.removeIndexes = removeIndexes;
    __exports__.removeIndexesInRange = removeIndexesInRange;
  });
