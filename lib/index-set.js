import { addIndex, addIndexes, addIndexesInRange } from "index-set/addition";
import { ENV } from "index-set/env";
import { serialize, deserialize } from "index-set/coding";
import { forEach, map, reduce, forEachRange } from "index-set/enumeration";

var slice = Array.prototype.slice;

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

  @class IndexSet
 */
function IndexSet() {
  // Initialize the index set with a marker at index '0'
  // indicating that it is the end of the set.
  this.__ranges__ = [0];
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
  },

  removeIndexes: function (indexSet) {
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

  forEachRange: function (fn, scope) {
    forEachRange(this, fn, scope);
  }
};

IndexSet.deserialize = function (string) {
  return deserialize(new IndexSet(), string);
};

IndexSet.ENV = ENV;

export = IndexSet;
