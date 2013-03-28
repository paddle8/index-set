/*global module test equal context ok same notest */

var set;

// ..........................................................
// SINGLE INDEX
//

module("IndexSet#intersectsIndex", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000, 1);
  }
});

test("handle index in set", function () {
  equal(set.intersectsIndex(1001), true);
  equal(set.intersectsIndex(1009), true);
  equal(set.intersectsIndex(2000), true);
});

test("handle index not in set", function () {
  equal(set.intersectsIndex(0),    false);
  equal(set.intersectsIndex(10),   false);
  equal(set.intersectsIndex(1100), false);
});

test("handle index past end of set", function () {
  equal(set.intersectsIndex(3000), false);
});

// ..........................................................
// RANGE
//

module("IndexSet#intersectsIndexesInRange", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000, 1);
  }
});

test("handle range inside set", function () {
  equal(set.intersectsIndexesInRange(1001, 4), true);
});

test("handle range outside of set", function () {
  equal(set.intersectsIndexesInRange(100, 4), false);
});

test("handle range partially inside set", function () {
  equal(set.intersectsIndexesInRange(998, 4), true);
});

// ..........................................................
// INDEX SET
//

module("IndexSet#intersectsIndexes", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000, 1);
  }
});

test("handle set inside IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(1001, 4)
      .addIndexesInRange(1005, 2);
  equal(set.intersectsIndexes(test), true);
});

test("handle range outside of IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(100, 4)
      .addIndexesInRange(105, 2);
  equal(set.intersectsIndexes(test), false);
});

test("handle range partially inside IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(1001, 4)
      .addIndexesInRange(100, 2);
  equal(set.intersectsIndexes(test), true);
});

test("handle self", function () {
  equal(set.intersectsIndexes(set), true);
});
