define(
  ["index-set/range_start","index-set/enumeration","index-set/env","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var rangeStartForIndex = __dependency1__.rangeStartForIndex;
    var someRange = __dependency2__.someRange;
    var everyRange = __dependency2__.everyRange;
    var ENV = __dependency3__.ENV;

    var END_OF_SET = ENV.END_OF_SET;

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
        if (next === END_OF_SET) {
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



    __exports__.containsIndex = containsIndex;
    __exports__.containsIndexes = containsIndexes;
    __exports__.containsIndexesInRange = containsIndexesInRange;
    __exports__.intersectsIndex = intersectsIndex;
    __exports__.intersectsIndexes = intersectsIndexes;
    __exports__.intersectsIndexesInRange = intersectsIndexesInRange;
  });
