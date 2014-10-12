import IndexSet from "index-set";

var set;

module("IndexSet#addIndexesInRange", {
  setup: function () {
    set = new IndexSet();
  }
});

function K(value) { return value; }

// ..........................................................
// BASIC ADDS
//

test("adding a range to end of set", function () {
  set.addIndexesInRange(1000, 5);
  equal(set.length, 5);
  equal(set.lastIndex, 1004);
  deepEqual(set.map(K), [1000, 1001, 1002, 1003, 1004]);
});

test("addding a range into middle of empty range", function () {
  set.addIndexesInRange(100, 2);
  equal(set.firstIndex, 100);

  set.addIndexesInRange(10, 1);
  equal(set.length, 3, 'the length should be increased by one');
  equal(set.lastIndex, 101, "the lastIndex shouldn't have changed");
  deepEqual(set.map(K), [10, 100, 101]);
});

test("add range overlapping front edge of range", function () {
  set.addIndexesInRange(100, 2);
  equal(set.firstIndex, 100);

  set.addIndexesInRange(99, 2);
  equal(set.length, 3);
  equal(set.lastIndex, 101);
  deepEqual(set.map(K), [99, 100, 101]);
});

test("add range overlapping last edge of range", function () {
  set.addIndexesInRange(100, 2);
  set.addIndexesInRange(200, 2);
  deepEqual(set.map(K), [100, 101, 200, 201]);

  set.addIndexesInRange(101, 2);
  equal(set.length, 5);
  equal(set.lastIndex, 201);
  deepEqual(set.map(K), [100, 101, 102, 200, 201], 'should include 101..102');
});

test("add range overlapping two ranges, merging into one", function () {
  set.addIndexesInRange(100, 2);
  set.addIndexesInRange(110, 2);
  deepEqual(set.map(K), [100, 101, 110, 111]);

  // now add overlapping range
  set.addIndexesInRange(101, 10);
  equal(set.length, 12);
  equal(set.lastIndex, 111);
  deepEqual(set.map(K), [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111], 'should include one range 100..111');
});

test("add range overlapping three ranges, merging into one", function () {
  set.addIndexesInRange(100, 2)
     .addIndexesInRange(105, 2)
     .addIndexesInRange(110, 2);
  deepEqual(set.map(K), [100, 101, 105, 106, 110, 111]);

  // now add overlapping range
  set.addIndexesInRange(101, 10);
  equal(set.length, 12);
  equal(set.lastIndex, 111);
  deepEqual(set.map(K), [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111], 'should include one range 100..111');
});

test("add range partially overlapping one range and replacing another range, merging into one", function () {
  set.addIndexesInRange(100, 2).addIndexesInRange(105, 2);
  deepEqual(set.map(K), [100, 101, 105, 106], 'should have two sets');

  // now add overlapping range
  set.addIndexesInRange(101, 10);
  equal(set.length, 11, 'new set.length');

  equal(set.lastIndex, 110);
  deepEqual(set.map(K), [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110], 'should include one range 100..110');
});

test("add range overlapping last index", function () {
  set.addIndexesInRange(100, 2);
  equal(set.firstIndex, 100, 'precond - first index is 100');

  // now add second range
  set.addIndexesInRange(101, 2);
  equal(set.length, 3, 'should have extra length');
  equal(set.lastIndex, 102);
  deepEqual(set.map(K), [100, 101, 102]);
});

test("add range matching existing range", function () {
  set.addIndexesInRange(100, 5);
  equal(set.firstIndex, 100, 'precond - first index is 100');

  // now add second range
  set.addIndexesInRange(100,5);
  equal(set.length, 5, 'should not change');
  equal(set.lastIndex, 104);
  deepEqual(set.map(K), [100, 101, 102, 103, 104]);
});

// ..........................................................
// Other behaviors
//

test("appending a range to end should merge into last range", function () {
  set = new IndexSet();
  set.addIndex(2);
  set.addIndex(3);
  equal(set.lastIndex, 3);
  equal(set.length, 2);

  set = new IndexSet();
  set.addIndexesInRange(2000, 1000);
  set.addIndexesInRange(3000, 1000);
  equal(set.lastIndex, 3999);
  equal(set.length, 2000);
});

test("appending range to start of empty set should create a single range", function () {
  set = new IndexSet();
  set.addIndexesInRange(0, 2);
  equal(set.length, 2);
  equal(set.lastIndex, 1);

  set = new IndexSet();
  set.addIndexesInRange(0, 2000);
  equal(set.length, 2000);
  equal(set.lastIndex, 1999);
});

// ..........................................................
// NORMALIZED PARAMETER CASES
//

test("add with no params should do nothing", function () {
  set.add();
  deepEqual(set.map(K), []);
});

test("add with single number should add index only", function () {
  set.addIndex(2);
  deepEqual(set.map(K), [2]);
});

test("add with index set should add indexes in set", function() {
  set.addIndexes(new IndexSet().add(2, 2).add(10, 2));
  deepEqual(set.map(K), [2,3,10,11]);
});

// ..........................................................
// SPECIAL CASES
//
// demonstrate fixes for specific bugs here.

test("adding ranges within the set shouldn't change the overall size of the set", function () {
  set = new IndexSet();
  set.addIndexesInRange(1, 4);
  equal(set.length, 4);

  set.addIndexesInRange(1, 3);
  equal(set.length, 4);

  set.addIndexesInRange(1, 2);
  equal(set.length, 4);
});
