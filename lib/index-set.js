import { addIndex, addIndexes, addIndexesInRange } from "index-set/addition";
import { removeIndex, removeIndexes, removeIndexesInRange } from "index-set/removal";
import { ENV } from "index-set/env";
import { serialize, deserialize } from "index-set/coding";
import { forEach, map, reduce, some, every, forEachRange, someRange, everyRange } from "index-set/enumeration";
import { equals, containsIndex, containsIndexes, containsIndexesInRange, intersectsIndex, intersectsIndexes, intersectsIndexesInRange } from "index-set/queries";
import { indexLessThanIndex, indexLessThanOrEqualToIndex, indexGreaterThanIndex, indexGreaterThanOrEqualToIndex } from "index-set/indexes";
import { rangeStartForIndex } from "index-set/range_start";

var slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    T_NUMBER = '[object Number]',
    END_OF_SET = ENV.END_OF_SET;

function invokeMethodFor(indexSet, method, args) {
  if (args.length === 1) {
    if (args[0] instanceof IndexSet) {
      return indexSet[method + "Indexes"](args[0]);
    } else if (toString.call(args[0]) === T_NUMBER) {
      return indexSet[method + "Index"](args[0]);
    }
  } else if (args.length === 2) {
    return indexSet[method + "IndexesInRange"](args[0], args[1]);
  }
}

/**
  An IndexSet represents a collection of unique unsigned integers,
  known as **indexes** because of the way they are used. this collection
  is referred to as an **index set**.

  You use index sets in your code to store indexes into some other
  data structure. For example, given an array, you could use an index
  set to identify a subset of objects in that array.

  You should not use index sets to stor an arbitrary collection of
  integer values because index sets store indexes as sorted ranges.
  This makes them more efficient than storing a collection of individual
  integers. It also means that each index value can only appear once in
  the index set.

  Index sets are a concept from [Cocoa][1], and are useful in managing
  ordered collections, such as views or data sets.

  [1] http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/Collections/Articles/

  ### Implementation Notes

  The internal data structure is a jump list, where the following rules
  indicate how to find ranges:

  - a positive integer indicates a filled range
  - a negative integer indicates a hole
  - `0` indicates the end of the set

  In addition, there are search accelerator for increasing the performance
  of insertion and querying. These values are stored in the jump list
  and indicate the start of the nearest range.

  @class IndexSet
 */
function IndexSet() {
  this.__ranges__ = [END_OF_SET];
  invokeMethodFor(this, 'add', slice.call(arguments));
};

IndexSet.prototype = {

  /**
    The size of the indicates. This is the number
    of indexes currently stored in the set.

    @property length
    @type Number
    @default 0
   */
  length: 0,

  /**
    The first index in the set, or -1 if there
    are no indexes in the set.

    @property firstIndex
    @type Number
    @default -1
   */
  firstIndex: -1,

  /**
    The last index in the set, or -1 if there
    are no indexes in the set.

    @property lastIndex
    @type Number
    @default -1
   */
  lastIndex: -1,

  // .............................................
  // Mutable IndexSet methods
  //

  addIndex: function (index) {
    addIndex(this, index);
    return this;
  },

  addIndexes: function (indexSet) {
    addIndexes(this, indexSet);
    return this;
  },

  addIndexesInRange: function (rangeStart, rangeEnd) {
    addIndexesInRange(this, rangeStart, rangeEnd);
    return this;
  },

  removeIndex: function (index) {
    removeIndex(this, index);
    return this;
  },

  removeIndexes: function (indexSet) {
    removeIndexes(this, indexSet);
    return this;
  },

  /**
    Remove all indexes stored in the index set.

    @method removeAllIndexes
   */
  removeAllIndexes: function () {
    this.__ranges__ = [0];
    this.length     = 0;
    this.firstIndex = -1;
    this.lastIndex  = -1;
    return this;
  },

  removeIndexesInRange: function (rangeStart, rangeEnd) {
    removeIndexesInRange(this, rangeStart, rangeEnd);
    return this;
  },

  // .............................................
  // Set membership
  //

  containsIndex: function (index) {
    return containsIndex(this, index);
  },

  containsIndexes: function (indexSet) {
    return containsIndexes(this, indexSet);
  },

  containsIndexesInRange: function (rangeStart, rangeEnd) {
    return containsIndexesInRange(this, rangeStart, rangeEnd);
  },

  intersectsIndex: function (index) {
    return intersectsIndex(this, index);
  },

  intersectsIndexes: function (indexSet) {
    return intersectsIndexes(this, indexSet);
  },

  intersectsIndexesInRange: function (rangeStart, rangeEnd) {
    return intersectsIndexesInRange(this, rangeStart, rangeEnd);
  },

  // .............................................
  // Getting indexes
  //

  indexGreaterThanIndex: function (index) {
    return indexGreaterThanIndex(this, index);
  },

  indexGreaterThanOrEqualToIndex: function (index) {
    return indexGreaterThanOrEqualToIndex(this, index);
  },

  indexLessThanIndex: function (index) {
    return indexLessThanIndex(this, index);
  },

  indexLessThanOrEqualToIndex: function (index) {
    return indexLessThanOrEqualToIndex(this, index);
  },

  rangeStartForIndex: function (index) {
    return rangeStartForIndex(this, index);
  },

  // .............................................
  // Simplified JS interface
  //

  add: function () {
    invokeMethodFor(this, 'add', slice.call(arguments));
    return this;
  },

  remove: function () {
    invokeMethodFor(this, 'remove', slice.call(arguments));
    return this;
  },

  intersects: function () {
    return invokeMethodFor(this, 'intersects', slice.call(arguments));
  },

  contains: function () {
    return invokeMethodFor(this, 'contains', slice.call(arguments));
  },

  equals: function (indexSet) {
    return equals(this, indexSet);
  },

  indexBefore: function (index) {
    return indexLessThanIndex(this, index);
  },

  indexAfter: function (index) {
    return indexGreaterThanIndex(this, index);
  },

  // .............................................
  // Coding
  //

  serialize: function () {
    return serialize(this);
  },


  // .............................................
  // Enumeration
  //

  forEach: function (fn, scope) {
    forEach(this, fn, scope);
  },

  map: function (fn, scope) {
    return map(this, fn, scope);
  },

  reduce: function (fn, initialValue) {
    var args = slice.call(arguments);
    args.unshift(this);
    return reduce.apply(null, args);
  },

  some: function (fn, scope) {
    return some(this, fn, scope);
  },

  every: function (fn, scope) {
    return every(this, fn, scope);
  },

  forEachRange: function (fn, scope) {
    forEachRange(this, fn, scope);
  },

  someRange: function (fn, scope) {
    someRange(this, fn, scope);
  },

  everyRange: function (fn, scope) {
    everyRange(this, fn, scope);
  }
};

IndexSet.deserialize = function (string) {
  return deserialize(new IndexSet(), string);
};

IndexSet.ENV = ENV;

export = IndexSet;
