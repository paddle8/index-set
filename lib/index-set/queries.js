import { rangeStartForIndex } from "index-set/range_start";
import { someRange, everyRange } from "index-set/enumeration";
import { ENV } from "index-set/env";

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


export { containsIndex, containsIndexes, containsIndexesInRange };
export { intersectsIndex, intersectsIndexes, intersectsIndexesInRange };
