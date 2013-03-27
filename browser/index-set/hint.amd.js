define(
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
