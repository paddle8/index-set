define(
  ["index-set/addition","index-set/removal","index-set/env","index-set/coding","index-set/enumeration","index-set/queries","index-set/range_start"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__) {
    "use strict";
    var addIndex = __dependency1__.addIndex;
    var addIndexes = __dependency1__.addIndexes;
    var addIndexesInRange = __dependency1__.addIndexesInRange;
    var removeIndex = __dependency2__.removeIndex;
    var removeIndexes = __dependency2__.removeIndexes;
    var removeIndexesInRange = __dependency2__.removeIndexesInRange;
    var ENV = __dependency3__.ENV;
    var serialize = __dependency4__.serialize;
    var deserialize = __dependency4__.deserialize;
    var forEach = __dependency5__.forEach;
    var map = __dependency5__.map;
    var reduce = __dependency5__.reduce;
    var some = __dependency5__.some;
    var every = __dependency5__.every;
    var forEachRange = __dependency5__.forEachRange;
    var someRange = __dependency5__.someRange;
    var everyRange = __dependency5__.everyRange;
    var containsIndex = __dependency6__.containsIndex;
    var containsIndexes = __dependency6__.containsIndexes;
    var containsIndexesInRange = __dependency6__.containsIndexesInRange;
    var intersectsIndex = __dependency6__.intersectsIndex;
    var intersectsIndexes = __dependency6__.intersectsIndexes;
    var intersectsIndexesInRange = __dependency6__.intersectsIndexesInRange;
    var rangeStartForIndex = __dependency7__.rangeStartForIndex;

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

      rangeStartForIndex: function (index) {
        return rangeStartForIndex(this, index);
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


    return IndexSet;
  });
