import { rangeStartForIndex } from "index-set/range_start";
import { forEachRange } from "index-set/enumeration";
import { ENV } from "index-set/env";
import { addHintFor } from "index-set/hint";

var END_OF_SET = ENV.END_OF_SET;

/**
  @method addIndex
  @param  indexSet {IndexSet} The target index set to add the index to.
  @param  index    {Number}   The index to add to the target index set.
 */
function addIndex(indexSet, index) {
  addIndexesInRange(indexSet, index, 1);
}

function addRange(rangeStart, rangeLength) {
  addIndexesInRange(this, rangeStart, rangeLength);
}

/**
  @method addIndexes
  @param  indexSet {IndexSet} The target index set to add the indexes to.
  @param  indexes  {IndexSet} The indexes to add to the target index set.
 */
function addIndexes(indexSet, indexes) {
  forEachRange(indexes, addRange, indexSet);
}

/**
  @method addIndexesInRange
  @param  indexSet    {IndexSet}
  @param  rangeStart  {Number}
  @param  rangeLength {Number}
 */
function addIndexesInRange(indexSet, rangeStart, rangeLength) {
  var lastIndex = indexSet.lastIndex + 1,
      ranges    = indexSet.__ranges__,
      cursor, next, delta;

  // The start of the range we're adding is the same as the
  // last index of the set
  if (rangeStart === lastIndex) {

    // We have an empty index set and are adding from 0;
    // Mark the first index in our index set as a filled range
    // until the end of this range
    if (rangeStart === END_OF_SET) {
      ranges[lastIndex] = lastIndex = rangeLength;
      delta = rangeLength;
    } else {
      // Find the start and end of the range that ends with
      // the last index in the index set
      cursor = rangeStartForIndex(indexSet, rangeStart - 1);
      next   = ranges[cursor];

      // We found a range in the set
      if (next > 0) {
        // Calculate the change in length
        delta = rangeStart - lastIndex + rangeLength;

        // Clean up the previous lastIndex
        delete ranges[lastIndex];
        // and set the start of the set to be the end
        // of the new range
        ranges[cursor] = lastIndex = rangeStart + rangeLength;
        rangeStart = cursor;

      // The previous range was not in the set;
      // Append the set to the end of the set
      } else {
        ranges[lastIndex] = lastIndex = rangeStart + rangeLength;
        delta = rangeLength;
      }
    }

    // Mark the last index in the range as the end of the set
    ranges[lastIndex] = END_OF_SET;
    indexSet.lastIndex = lastIndex - 1;
    indexSet.length   += delta;

    rangeLength = lastIndex - rangeStart;

  // The start of the range being added starts beyond
  // the current last index of the set.
  } else if (rangeStart > lastIndex) {
    // Mark from the current end of the set to the start
    // of this range as a hole.
    ranges[lastIndex] = 0 - rangeStart;
    // Mark the start of the range as a filled until the
    // end of the range.
    ranges[rangeStart] = rangeStart + rangeLength;
    // Mark the end of the index set.
    ranges[rangeStart + rangeLength] = END_OF_SET;

    indexSet.lastIndex = rangeStart + rangeLength - 1;
    indexSet.length += rangeLength;

    delta = rangeLength;

    // The affected range for hinting goes from
    // the start of the range to the end of the set.
    rangeLength = rangeStart + rangeLength - lastIndex;
    rangeStart  = lastIndex;

  // Merge the range into the set.
  } else {
    // Find the nearest starting range
    cursor = rangeStartForIndex(indexSet, rangeStart);
    next   = ranges[cursor];

    var rangeEnd = rangeStart + rangeLength;
    delta = 0;

    // The range boundary that we found was the same as
    // the start of the range being inserted;
    // jump back to the range before the indicated hole
    if (rangeStart > 0 && cursor === rangeStart && next <= 0) {
      cursor = rangeStartForIndex(indexSet, rangeStart - 1);
      next   = ranges[cursor];
    }

    // The start of the range we found is a hole
    if (next < 0) {
      // Set the end of the hole to be the start of
      // range being added.
      ranges[cursor] = 0 - rangeStart;

      // The hole extends beyond the range being added
      if (Math.abs(next) > rangeEnd) {
        // Mark the start and end of the set.
        ranges[rangeStart] = 0 - rangeEnd;
        ranges[rangeEnd] = next;

      // The end of the range has already been taken care of
      } else {
        ranges[rangeStart] = next;
      }

    // The start of the range we found was filled
    } else {
      // Normalize variables so we can merge ranges together
      rangeStart = cursor;
      if (next > rangeEnd) {
        rangeEnd = next;
      }
    }

    // Walk ranges until we end up past the end of the
    // range being added
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
        delta += rangeEnd - cursor;

      } else {
        next = Math.abs(value);

        // The start of the next range is after
        // the end of the range being added
        if (next > rangeEnd) {
          ranges[rangeEnd] = value;
          next = rangeEnd;
        }

        // The range has been added;
        // Add to the delta if we have any new indexes
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
    // If the range following the cursor is in the index set,
    // clean up the redundant boundary
    cursor = ranges[rangeEnd];
    if (cursor > 0) {
      delete ranges[rangeEnd];
      rangeEnd = cursor;
    }

    // Finally, mark the beginning of the range as filled
    ranges[rangeStart] = rangeEnd;

    if (rangeEnd > lastIndex) {
      indexSet.lastIndex = rangeEnd - 1;
    }

    // Adjust the length
    indexSet.length += delta;

    // Compute the hint range
    rangeLength = rangeEnd - rangeStart;
  }

  // The firstIndex of the set might've changed
  if (delta > 0) {
    cursor = ranges[0];

    // No indexes for there to be a firstIndex
    if (cursor === END_OF_SET) {
      indexSet.firstIndex = -1;
    // We have a filled range starting at 0
    } else if (cursor > 0) {
      indexSet.firstIndex = 0;
    // Use the pointer to the first filled range
    } else {
      indexSet.firstIndex = Math.abs(cursor);
    }
  }

  addHintFor(indexSet, rangeStart, rangeLength);
}

export { addIndex, addIndexes, addIndexesInRange };
