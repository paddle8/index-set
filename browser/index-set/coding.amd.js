define(
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
