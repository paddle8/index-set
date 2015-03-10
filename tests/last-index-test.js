var set;
module("IndexSet#lastIndex", {
  setup: function () {
    set = new IndexSet();
  }
});

test("newly created index", function() {
  equal(set.lastIndex, -1, 'there are no indexes in the set');
});

test("after adding one range", function() {
  set.addIndexesInRange(4, 2);
  equal(set.lastIndex, 5);
});

test("after adding range then removing part of range", function() {
  set.addIndexesInRange(4, 4)
     .removeIndexesInRange(6, 4);
  equal(set.lastIndex, 5);
});

test("after adding range several disjoint ranges", function() {
  set.addIndexesInRange(4, 4)
     .addIndexesInRange(6000, 1);
  equal(set.lastIndex, 6000);
});

test("after removing disjoint range", function() {
  set.addIndexesInRange(4, 2)
     .addIndex(6000)
     .removeIndexesInRange(5998, 10);
  equal(set.lastIndex, 5);
});

test("after removing all ranges", function() {
  set.addIndexesInRange(4, 2)
     .addIndex(6000)
     .removeIndexesInRange(3, 6200);
  equal(set.lastIndex, -1);
});
