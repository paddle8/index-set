import ENV from "./env";
import rangeStartForIndex from "./range_start";

var END_OF_SET = ENV.END_OF_SET;

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
    if (cursor === END_OF_SET) {
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
    if (next === END_OF_SET) {
      return -1;
    }

    index = cursor = Math.abs(next);
    next  = ranges[cursor];
  }

  return index;
}

export { indexLessThanIndex, indexLessThanOrEqualToIndex };
export { indexGreaterThanIndex, indexGreaterThanOrEqualToIndex };
