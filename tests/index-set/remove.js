var set;

module("IndexSet#remove", {
  setup: function () {
    set = new IndexSet();
  }
});

function K(value) { return value; }

// ..........................................................
// BASIC REMOVES
// 

test("remove a range after end of set", function () {
  equal(set.length, 0);

  set.remove(1000, 5);
  equal(set.length, 0);
  equal(set.lastIndex, -1);
  deepEqual(set.map(K), []);
});

test("remove range in middle of an existing range", function () {
  set.add(100, 4);
  deepEqual(set.map(K), [100, 101, 102, 103]);

  set.remove(101, 2);
  equal(set.length, 2);
  equal(set.lastIndex, 103);
  deepEqual(set.map(K), [100, 103]);
});

test("remove range overlapping front edge of range", function () {
  set.add(100, 2);
  equal(set.map(K)[0], 100);
  
  // remove half the range
  set.remove(99, 2);
  equal(set.length, 1);
  equal(set.lastIndex, 101);
  deepEqual(set.map(K), [101]);
});

test("remove range overlapping last edge of range", function () {
  set.add(100, 2)
     .add(200, 2);

  deepEqual(set.map(K), [100, 101, 200, 201]);
  
  // remove one part of the range
  set.remove(101, 2);
  equal(set.length, 3);
  equal(set.lastIndex, 201);
  deepEqual(set.map(K), [100, 200, 201]);
});

test("remove range overlapping two ranges, remove parts of both", function () {
  set.add(100, 2)
     .add(110, 2);
  deepEqual(set.map(K), [100, 101, 110, 111]);
  
  // remove a range that intersects both ranges
  set.remove(101, 10);
  equal(set.length, 2);
  equal(set.lastIndex, 111);
  deepEqual(set.map(K), [100, 111]);
});

test("remove range overlapping three ranges, removing one and parts of the others", function () {
  set.add(100, 2)
     .add(105, 2)
     .add(110, 2);

  deepEqual(set.map(K), [100, 101, 105, 106, 110, 111]);
  
  // remove a range that intersects two ranges and overlaps one
  set.remove(101, 10);
  equal(set.length, 2);
  equal(set.lastIndex, 111);
  deepEqual(set.map(K), [100, 111]);
});

test("remove range partially overlapping one range and replacing another range", function () {
  set.add(100, 2)
     .add(105, 2);

  deepEqual(set.map(K), [100, 101, 105, 106]);
  
  // remove a part of one; and the rest of the other
  set.remove(101, 10);
  equal(set.length, 1);

  equal(set.lastIndex, 100);
  deepEqual(set.map(K), [100]);
});

test("remove range overlapping last index", function () {
  set.add(100, 2);
  equal(set.map(K)[0], 100);
  
  // remove lastIndex
  set.remove(101, 2);
  equal(set.length, 1);
  equal(set.lastIndex, 100);
  deepEqual(set.map(K), [100]);
});

test("remove range matching existing range", function () {
  set.add(100, 5);
  deepEqual(set.map(K), [100, 101, 102, 103, 104]);
  
  // remove complete range
  set.remove(100, 5);
  equal(set.length, 0);
  equal(set.lastIndex, -1);
  deepEqual(set.map(K), []);  
});

// ..........................................................
// NORMALIZED PARAMETER CASES
// 

test("remove with no params should do nothing", function () {
  set.add(10, 2).remove();
  deepEqual(set.map(K), [10, 11]);
});

test("remove with single number should add index only", function () {
  set.add(10, 2).remove(10);
  deepEqual(set.map(K), [11]);
});

test("remove with index set should add indexes in set", function () {
  var otherSet = new IndexSet(2, 2);
  otherSet.add(10, 2);

  set.add(0, 14).remove(otherSet);
  deepEqual(set.map(K), [0, 1, 4, 5, 6, 7, 8, 9, 12, 13]);
});


// ..........................................................
// OTHER BEHAVIORS
//

test("remove a range should trigger an observer notification", function () {
  var callCnt = 0;
  set.add(10, 20);
  
  set.on('length:change', null, function () { callCnt++; });
  set.remove(10, 10);
  equal(callCnt, 1, 'should have called observer once');
});

test("removing a non-existent range should not trigger observer notification", function () {
  var callCnt = 0;
  
  set.on('length:change', null, function () { callCnt++; });
  set.remove(10, 10);
  equal(callCnt, 0);
});

test("removing a clone of the same index set should leave an empty set", function () {
  var set  = new IndexSet(0, 2),
      set2 = set.copy();

  ok(set.equals(set2));
  set.remove(set2);
  equal(set.length, 0);
});

test("removing an index range outside of target range (specific bug)", function () {
  var set  = new IndexSet(10, 3),
      set2 = new IndexSet(0, 3);
  
  set.remove(set2);
  equal(set.length, 3, 'length should not change');
});
