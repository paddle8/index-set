import { ENV } from "index-set/env";

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

export { rangeStartForIndex };
