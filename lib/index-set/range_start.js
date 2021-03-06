import ENV from "./env";

function rangeStartForIndex(indexSet, index) {
  var ranges = indexSet.__ranges__,
      lastIndex = indexSet.lastIndex + 1,
      rangeStart,
      next;

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
  rangeStart = index;
  next = ranges[rangeStart];

  // We are searching in the middle of a range;
  // recurse to find the starting index of this range
  if (typeof next === "undefined") {
    rangeStart = 0;
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

export default rangeStartForIndex;
