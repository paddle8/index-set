test("newly created index", function() {
  var set = new IndexSet();
  equal(set.firstIndex, -1);
});

test("after adding one range", function() {
  var set = new IndexSet();
  set.addIndexesInRange(4, 2);
  equal(set.firstIndex, 4);
});

test("after adding range then removing part of range", function() {
  var set = new IndexSet();
  set.addIndexesInRange(4, 4)
     .removeIndexesInRange(2, 4);
  equal(set.firstIndex, 6);
});

test("after adding range several disjoint ranges", function() {
  var set = new IndexSet();
  set.addIndex(6000)
     .addIndexesInRange(4, 4);
  equal(set.firstIndex, 4);
});

test("after removing disjoint range", function() {
  var set = new IndexSet();
  set.addIndexesInRange(4, 2)
     .addIndex(6000)
     .removeIndexesInRange(2, 10);
  equal(set.firstIndex, 6000);
});

test("after removing all ranges", function() {
  var set = new IndexSet();
  set.addIndexesInRange(4, 2)
     .addIndex(6000)
     .removeIndexesInRange(3, 6200);
  equal(set.firstIndex, -1);
});


test("newly created index, clearing and then adding", function() {
  var set = new IndexSet();
  set.addIndexesInRange(4, 2);
  equal(set.firstIndex, 4);

	set.removeAllIndexes();
  equal(set.firstIndex, -1);

	set.addIndexesInRange(7, 3);
  equal(set.firstIndex, 7);
});

