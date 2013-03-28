import { ENV } from "index-set/env";

function addHintFor(indexSet, rangeStart, rangeLength) {
  var ranges = indexSet.__ranges__,
      skip   = ENV.HINT_SIZE,
      next   = Math.abs(ranges[rangeStart]),
      hintLocation = rangeStart - (rangeStart % skip) + skip,
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

export { addHintFor };
