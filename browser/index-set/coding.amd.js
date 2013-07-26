define(
  ["index-set/enumeration","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var forEachRange = __dependency1__.forEachRange;

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

    function deserialize(indexSet, string) {
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
          rangeEnd   = parseInt(range[1], 10) + 1;
          if (isNaN(rangeEnd)) {
            indexSet.addIndex(rangeStart);
          } else {
            indexSet.addIndexesInRange(rangeStart, rangeEnd - rangeStart);
          }
        } else {
          rangeStart = parseInt(range, 10);
          if (!isNaN(rangeStart)) {
            indexSet.addIndex(rangeStart);        
          }
        }
      }
      return indexSet;
    }


    __exports__.serialize = serialize;
    __exports__.deserialize = deserialize;
  });
