import IndexSet from "index-set";

var set;

// ..........................................................
// SINGLE INDEX
//

module("IndexSet#containsIndex", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000, 1);
  }
});

test("handle index in set", function () {
  equal(set.containsIndex(1001), true);
  equal(set.containsIndex(1009), true);
  equal(set.containsIndex(2000), true);
});

test("handle index not in set", function () {
  equal(set.containsIndex(0), false);
  equal(set.containsIndex(10), false);
  equal(set.containsIndex(1100), false);
});

test("handle index past end of set", function () {
  equal(set.containsIndex(3000), false);
});

// ..........................................................
// RANGE
//

module("IndexSet#containsIndexesInRange", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000,1);
  }
});

test("handle range inside set", function () {
  equal(set.containsIndexesInRange(1001, 4), true);
});

test("handle range outside of set", function () {
  equal(set.containsIndexesInRange(100, 4), false);
});

test("handle range partially inside set", function () {
  equal(set.containsIndexesInRange(998, 4), false);
});

// ..........................................................
// INDEX SET
//

module("IndexSet#containsIndexes", {
  setup: function () {
    set = new IndexSet();
    set.addIndexesInRange(1000, 10)
       .addIndexesInRange(2000,1);
  }
});

test("handle set inside IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(1001, 4)
      .addIndexesInRange(1005, 2);
  equal(set.containsIndexes(test), true);
});

test("handle range outside of IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(100, 4)
      .addIndexesInRange(105, 2);
  equal(set.containsIndexes(test), false);
});

test("handle range partially inside IndexSet", function () {
  var test = new IndexSet();
  test.addIndexesInRange(1001, 4)
      .addIndexesInRange(100, 2);
  equal(set.containsIndexes(test), false);
});

test("handle self", function () {
  equal(set.containsIndexes(set), true);
});
