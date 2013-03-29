define(
  ["index-set/addition","index-set/removal","index-set/env","index-set/coding","index-set/enumeration","index-set/queries","index-set/indexes","index-set/range_start"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__) {
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
    var equals = __dependency6__.equals;
    var containsIndex = __dependency6__.containsIndex;
    var containsIndexes = __dependency6__.containsIndexes;
    var containsIndexesInRange = __dependency6__.containsIndexesInRange;
    var intersectsIndex = __dependency6__.intersectsIndex;
    var intersectsIndexes = __dependency6__.intersectsIndexes;
    var intersectsIndexesInRange = __dependency6__.intersectsIndexesInRange;
    var indexLessThanIndex = __dependency7__.indexLessThanIndex;
    var indexLessThanOrEqualToIndex = __dependency7__.indexLessThanOrEqualToIndex;
    var indexGreaterThanIndex = __dependency7__.indexGreaterThanIndex;
    var indexGreaterThanOrEqualToIndex = __dependency7__.indexGreaterThanOrEqualToIndex;
    var rangeStartForIndex = __dependency8__.rangeStartForIndex;

    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        T_NUMBER = '[object Number]',
        END_OF_SET = ENV.END_OF_SET;

    /**
      @private
      Routes a function call from the overloaded method to the
      concrete method call by doing argument checking.

      @method invokeConcreteMethodFor
      @param indexSet {IndexSet}
      @param fnName
     */
    function invokeConcreteMethodFor(indexSet, fnName, args) {
      if (args.length === 1) {
        if (args[0] instanceof IndexSet) {
          return indexSet[fnName + "Indexes"](args[0]);
        } else if (toString.call(args[0]) === T_NUMBER) {
          return indexSet[fnName + "Index"](args[0]);
        }
      } else if (args.length === 2) {
        return indexSet[fnName + "IndexesInRange"](args[0], args[1]);
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
      invokeConcreteMethodFor(this, 'add', slice.call(arguments));
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

      /**
        Add a single index to the `IndexSet`.
        This index must be a natural number.

        @method addIndex
        @param index {Number}
        @return IndexSet
       */
      addIndex: function (index) {
        addIndex(this, index);
        return this;
      },

      /**
        Add a collection of indexes to the `IndexSet`.

        @method addIndexes
        @param indexSet {IndexSet}
        @return IndexSet
       */
      addIndexes: function (indexSet) {
        addIndexes(this, indexSet);
        return this;
      },

      /**
        Add a range of indexes to the `IndexSet`.
        The range values provided indicate the start
        of the range and the length of the range.

        @method addIndexesInRange
        @param rangeStart  {Number} A natural number that indicates the start of the range to add.
        @param rangeLength {Number} A natural number that indicates the length of the range.
        @return IndexSet
       */
      addIndexesInRange: function (rangeStart, rangeLength) {
        addIndexesInRange(this, rangeStart, rangeLength);
        return this;
      },

      /**
        Remove a single index from the `IndexSet`.
        The index must be a natural number.

        @method removeIndex
        @param index {Number}
        @return IndexSet
       */
      removeIndex: function (index) {
        removeIndex(this, index);
        return this;
      },

      /**
        Remove a collection of indexes from the `IndexSet`.

        @method removeIndexes
        @param indexSet {IndexSet}
        @return IndexSet
       */
      removeIndexes: function (indexSet) {
        removeIndexes(this, indexSet);
        return this;
      },

      /**
        Remove all indexes stored in the index set.

        @method removeAllIndexes
        @return IndexSet
       */
      removeAllIndexes: function () {
        this.__ranges__ = [0];
        this.length     = 0;
        this.firstIndex = -1;
        this.lastIndex  = -1;
        return this;
      },

      /**
        Remove a range of indexes from the `IndexSet`.
        The range values provided indicate the start
        of the range and the length of the range.

        @method addIndexesInRange
        @param rangeStart  {Number} A natural number that indicates the start of the range to remove.
        @param rangeLength {Number} A natural number that indicates the length of the range.
        @return IndexSet
       */
      removeIndexesInRange: function (rangeStart, rangeEnd) {
        removeIndexesInRange(this, rangeStart, rangeEnd);
        return this;
      },

      // .............................................
      // Set membership
      //

      /**
        Returns whether or not the set contains the
        index passed in.

        @method containsIndex
        @param index {Number}
        @return Boolean
       */
      containsIndex: function (index) {
        return containsIndex(this, index);
      },

      /**
        Returns whether or not the set contains the
        index set.

        @method containsIndexes
        @param indexSet {IndexSet}
        @return Boolean
       */
      containsIndexes: function (indexSet) {
        return containsIndexes(this, indexSet);
      },

      /**
        Returns whether or not the set contains the
        range of indexes passed in.

        @method containsIndexes
        @param rangeStart  {Number}
        @param rangeLength {Number}
        @return Boolean
       */
      containsIndexesInRange: function (rangeStart, rangeLength) {
        return containsIndexesInRange(this, rangeStart, rangeLength);
      },

      /**
        Returns whether or not the index intersects the
        any indexes in the set.

        @method intersectsIndex
        @param index {Number}
        @return Boolean
       */
      intersectsIndex: function (index) {
        return intersectsIndex(this, index);
      },

      /**
        Returns whether or not any indexes in the passed
        set are included in the set.

        @method intersectsIndexes
        @param indexSet {IndexSet}
        @return Boolean
       */
      intersectsIndexes: function (indexSet) {
        return intersectsIndexes(this, indexSet);
      },

      /**
        Returns whether or not the range contains any
        indexes in the set.

        @method intersectsIndexesInRange
        @param rangeStart  {Number}
        @param rangeLength {Number}
        @return Boolean
       */
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
        invokeConcreteMethodFor(this, 'add', slice.call(arguments));
        return this;
      },

      remove: function () {
        invokeConcreteMethodFor(this, 'remove', slice.call(arguments));
        return this;
      },

      intersects: function () {
        return invokeConcreteMethodFor(this, 'intersects', slice.call(arguments));
      },

      contains: function () {
        return invokeConcreteMethodFor(this, 'contains', slice.call(arguments));
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


    return IndexSet;
  });
