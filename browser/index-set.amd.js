define(
  ["index-set/addition","index-set/removal","index-set/env","index-set/coding","index-set/enumeration","index-set/queries","index-set/indexes","index-set/range_start","index-set/observing"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__) {
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
    var trigger = __dependency9__.trigger;
    var on = __dependency9__.on;
    var off = __dependency9__.off;
    var destroy = __dependency9__.destroy;

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
      known as **indexes** because of the way they are used. This collection
      is referred to as an **index set**.

      You use index sets in your code to store indexes into some other
      data structure. For example, given an array, you could use an index
      set to identify a subset of objects in that array.

      You should not use index sets to store an arbitrary collection of
      integer values because index sets store indexes as sorted ranges.
      This makes them more efficient than storing a collection of individual
      integers. It also means that each index value can only appear once in
      the index set.

      Index sets are a concept from [Cocoa][1], and are useful in managing
      ordered collections, such as views or data sets.

      ### Implementation Notes

      The internal data structure is a jump list, where the following rules
      indicate how to find ranges:

      - a positive integer indicates a filled range
      - a negative integer indicates a hole
      - `0` indicates the end of the set

      In addition, there are search accelerator for increasing the performance
      of insertion and querying. These values are stored in the jump list
      and indicate the start of the nearest range.

      **NOTE**: Infinite ranges are currently unsupported.

      [1]: http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/Collections/Articles/ "Cocoa Collections"

      @class IndexSet
     */
    function IndexSet() {
      var args = slice.call(arguments);

      // Optimize creating a cloned index set
      if (args.length == 1 && args[0] instanceof IndexSet) {
        var source = args[0];

        // Copy over properties rather than
        // manually adding them.
        //
        // This results in a faster clone for
        // very large index sets.
        this.__ranges__ = source.__ranges__.slice();
        this.length = source.length;
        this.firstIndex = source.firstIndex;
        this.lastIndex = source.lastIndex;

      } else {
        this.__ranges__ = [END_OF_SET];
        invokeConcreteMethodFor(this, 'add', args);
      }
    };

    IndexSet.prototype = {

      /**
        The size of the indicates. This is the number
        of indexes currently stored in the set.

        @property length
        @readOnly
        @type Number
        @default 0
       */
      length: 0,

      /**
        The first index in the set, or -1 if there
        are no indexes in the set.

        @property firstIndex
        @readOnly
        @type Number
        @default -1
       */
      firstIndex: -1,

      /**
        The last index in the set, or -1 if there
        are no indexes in the set.

        @property lastIndex
        @readOnly
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
        @chainable
        @param index {Number}
       */
      addIndex: function (index) {
        addIndex(this, index);
        return this;
      },

      /**
        Add a collection of indexes to the `IndexSet`.

        @method addIndexes
        @chainable
        @param indexSet {IndexSet}
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
        @chainable
        @param rangeStart  {Number} A natural number that indicates the start of the range to add.
        @param rangeLength {Number} A natural number that indicates the length of the range.
       */
      addIndexesInRange: function (rangeStart, rangeLength) {
        addIndexesInRange(this, rangeStart, rangeLength);
        return this;
      },

      /**
        Remove a single index from the `IndexSet`.
        The index must be a natural number.

        @method removeIndex
        @chainable
        @param index {Number}
       */
      removeIndex: function (index) {
        removeIndex(this, index);
        return this;
      },

      /**
        Remove a collection of indexes from the `IndexSet`.

        @method removeIndexes
        @chainable
        @param indexSet {IndexSet}
       */
      removeIndexes: function (indexSet) {
        removeIndexes(this, indexSet);
        return this;
      },

      /**
        Remove all indexes stored in the index set.

        @method removeAllIndexes
        @chainable
       */
      removeAllIndexes: function () {
        trigger(this, 'length:before',      0);
        trigger(this, 'firstIndex:before', -1);
        trigger(this, 'lastIndex:before',  -1);

        this.__ranges__ = [0];
        this.length     = 0;
        this.firstIndex = -1;
        this.lastIndex  = -1;

        trigger(this, 'length:change',      0);
        trigger(this, 'firstIndex:change', -1);
        trigger(this, 'lastIndex:change',  -1);

        return this;
      },

      /**
        Remove a range of indexes from the `IndexSet`.
        The range values provided indicate the start
        of the range and the length of the range.

        @method addIndexesInRange
        @chainable
        @param rangeStart  {Number} A natural number that indicates the start of the range to remove.
        @param rangeLength {Number} A natural number that indicates the length of the range.
       */
      removeIndexesInRange: function (rangeStart, rangeEnd) {
        removeIndexesInRange(this, rangeStart, rangeEnd);
        return this;
      },

      // .............................................
      // Set membership
      //

      /**
        @method containsIndex
        @param index {Number}
        @return {Boolean} Whether or not
          the set contains the index passed in.
       */
      containsIndex: function (index) {
        return containsIndex(this, index);
      },

      /**
        @method containsIndexes
        @param indexSet {IndexSet}
        @return {Boolean} Whether or not
          the set contains the index set.
       */
      containsIndexes: function (indexSet) {
        return containsIndexes(this, indexSet);
      },

      /**
        @method containsIndexes
        @param rangeStart  {Number}
        @param rangeLength {Number}
        @return {Boolean} Whether or not
          the set contains the range of indexes passed in.
       */
      containsIndexesInRange: function (rangeStart, rangeLength) {
        return containsIndexesInRange(this, rangeStart, rangeLength);
      },

      /**
        @method intersectsIndex
        @param index {Number}
        @return {Boolean} Whether or not
          the index intersects any indexes in the set.
       */
      intersectsIndex: function (index) {
        return intersectsIndex(this, index);
      },

      /**
        @method intersectsIndexes
        @param indexSet {IndexSet}
        @return {Boolean} Whether or not
          any indexes in the passed set are included in the set.
       */
      intersectsIndexes: function (indexSet) {
        return intersectsIndexes(this, indexSet);
      },

      /**
        @method intersectsIndexesInRange
        @param rangeStart  {Number}
        @param rangeLength {Number}
        @return {Boolean} Whether or not
          the range contains any indexes in the set.
       */
      intersectsIndexesInRange: function (rangeStart, rangeEnd) {
        return intersectsIndexesInRange(this, rangeStart, rangeEnd);
      },

      // .............................................
      // Getting indexes
      //

      /**
        @method indexGreaterThanIndex
        @param index {Number}
        @return {Number} The first index in the set that is
          greater than the index provided.
       */
      indexGreaterThanIndex: function (index) {
        return indexGreaterThanIndex(this, index);
      },

      /**
        @method indexGreaterThanOrEqualToIndex
        @param index {Number}
        @return {Number} The first index in the set that is
          greater than the index provided, or the index
          if it is within the set.
       */
      indexGreaterThanOrEqualToIndex: function (index) {
        return indexGreaterThanOrEqualToIndex(this, index);
      },

      /**
        @method indexLessThanIndex
        @param index {Number}
        @return {Number} The first index in the set that is
          less than the index provided.
       */
      indexLessThanIndex: function (index) {
        return indexLessThanIndex(this, index);
      },

      /**
        @method indexLessThanOrEqualToIndex
        @param index {Number}
        @return {Number} The first index in the set that is
          less than the index provided, or the index
          if it is within the set.
       */
      indexLessThanOrEqualToIndex: function (index) {
        return indexLessThanOrEqualToIndex(this, index);
      },

      /**
        For a given index, this will return the index
        that indicates the start of the range the index
        is contained in. Note that this range may be
        a filled range or a hole.

        @private
        @method rangeStartForIndex
        @param index {Number}
        @return Number
       */
      rangeStartForIndex: function (index) {
        return rangeStartForIndex(this, index);
      },

      // .............................................
      // Simplified JS interface
      //

      /**
        Add indexes to the index set. This method will
        take a single index, a index range, or an `IndexSet`.

        @method add
        @chainable
       */
      add: function () {
        invokeConcreteMethodFor(this, 'add', slice.call(arguments));
        return this;
      },

      /**
        Remove indexes the index set. This method will
        take a single index, a index range, or an `IndexSet`.

        @method remove
        @chainable
       */
      remove: function () {
        invokeConcreteMethodFor(this, 'remove', slice.call(arguments));
        return this;
      },

      /**
        @method intersects
        @return {Boolean} Whether the indexes provided
           intersect the IndexSet.
       */
      intersects: function () {
        return invokeConcreteMethodFor(this, 'intersects', slice.call(arguments));
      },

      /**
        @method contains
        @return {Boolean} Whether the IndexSet contains
           the provided indexes.
       */
      contains: function () {
        return invokeConcreteMethodFor(this, 'contains', slice.call(arguments));
      },

      /**
        @method equals
        @param indexSet {IndexSet}
          The IndexSet to test against.
        @return {Boolean} Whether the two IndexSets
          are equivalent.
       */
      equals: function (indexSet) {
        return equals(this, indexSet);
      },

      /**
        @method indexBefore
        @param index {Number} The index start searching from.
        @return {Number} The first index in the set
          before the given index.
       */
      indexBefore: function (index) {
        return indexLessThanIndex(this, index);
      },

      /**
        @method indexAfter
        @param index {Number} The index start searching from.
        @return {Number} The first index in the set
          after the given index.
       */
      indexAfter: function (index) {
        return indexGreaterThanIndex(this, index);
      },

      /**
        Allows the garbage collector to reclaim memory of the
        index set.

        @method destroy
       */
      destroy: function () {
        destroy(this);
        this.removeAllIndexes();
      },

      // .............................................
      // Copying
      //

      /**
        @method copy
        @return {IndexSet} A copy of the set.
       */
      copy: function () {
        return new IndexSet(this);
      },

      // .............................................
      // Coding
      //

      /**
        @method serialize
        @return {String} The set serialized as a string.
       */
      serialize: function () {
        return serialize(this);
      },

      // .............................................
      // Observing
      //

      /**
        Listen to property changes on the IndexSet
        by adding an event listener.

        For get notifications when the length
        of the IndexSet will change, the event
        is `length:change`. To be notified before
        the property changes, the event is
        `length:before`:

            var set = new IndexSet();
            set.on('length:before', null, function (set, event, length) {
              console.log('The IndexSet will have ' + length + ' indexes.');
            });
            set.on('length:change', null, function (set, event, length) {
              console.log('The IndexSet now has ' + length + ' indexes.');
            });

        @method on
        @param key {String}
          The event to listen to.
        @param target {*}
          The target object to scope the method.
        @param method {Function}
          The function to be called when the event
          gets triggered.
       */
      on: function (key, target, method) {
        return on(this, key, target, method);
      },

      /**
        Remove an event listener. To remove a
        listener, this should be called with the
        same arguments as `on`.

        @method on
        @param key {String}
          The event to stop listening to.
        @param target {*}
          The target object used to scope the method.
        @param method {Function}
          The function that was used to
          listen to events.
       */
      off: function (key, target, method) {
        return off(this, key, target, method);
      },

      // .............................................
      // Enumeration
      //

      /**
        Loop over every index in this set.
        This is compatible with ECMAScript
        implementations.

        @method forEach
        @param fn    {Function} The function to call
          for each iteration of the loop
        @param scope {*} The scope to call the function with.
       */
      forEach: function (fn, scope) {
        forEach(this, fn, scope);
      },

      /**
        @method map
        @param fn
        @param scope {*} The scope to call the function with.
       */
      map: function (fn, scope) {
        return map(this, fn, scope);
      },

      /**
        @method reduce
        @param fn
        @param [initialValue] {*} The initial value to
          call the reducer function with
       */
      reduce: function (fn, initialValue) {
        var args = slice.call(arguments);
        args.unshift(this);
        return reduce.apply(null, args);
      },

      /**
        @method some
        @param fn
        @param scope {*} The scope to call the function with.
        @return {Boolean} Whether any of the
          indexes in the set satisfied the
          function provided.
       */
      some: function (fn, scope) {
        return some(this, fn, scope);
      },

      /**
        @method every
        @param fn
        @param scope {*} The scope to call the function with.
        @return {Boolean} Whether all of the
          indexes in the set satisfied the
          function provided.
       */
      every: function (fn, scope) {
        return every(this, fn, scope);
      },

      /**
        Loop over every range in this set.

        @method forEachRange
        @param fn    {Function} The function to call
          for each iteration of the loop
        @param scope {*} The scope to call the function with.
       */ 
      forEachRange: function (fn, scope) {
        forEachRange(this, fn, scope);
      },

      /**
        @method someRange
        @param fn
        @param scope {*} The scope to call the function with.
        @return {Boolean} Whether any of the
          ranges in the set satisfied the
          function provided.
       */
      someRange: function (fn, scope) {
        someRange(this, fn, scope);
      },

      /**
        @method everyRange
        @param fn
        @param scope {*} The scope to call the function with.
        @return {Boolean} Whether all of the
          ranges in the set satisfied the
          function provided.
       */
      everyRange: function (fn, scope) {
        everyRange(this, fn, scope);
      }
    };

    /**
      @method deserialize
      @static
      @param string {String} The string to deserialize.
      @return {IndexSet} The string represented as an IndexSet.
     */
    IndexSet.deserialize = function (string) {
      return deserialize(new IndexSet(), string);
    };

    IndexSet.ENV = ENV;


    return IndexSet;
  });
