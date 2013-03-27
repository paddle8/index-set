/*global module test equal */

var set;
module("IndexSet#lastIndex", {
  setup: function () {
    set = new IndexSet.IndexSet();
  }
});

test("newly created index", function() {
  equal(set.lastIndex, 0, 'lastIndex should be 0');
});

test("after adding one range", function() {
  set.addIndexesInRange(4, 2);
  equal(set.lastIndex, 6, 'lastIndex should be one greater than lastIndex index');
});
/*
test("after adding range then removing part of range", function() {
  set.addIndexesInRange(4,4).remove(6,4);
  equal(set.lastIndex,6, 'lastIndex should be one greater than lastIndex index');
});
*/
test("after adding range several disjoint ranges", function() {
  set.addIndexesInRange(4, 4)
     .addIndexesInRange(6000, 1);
  equal(set.lastIndex, 6001, 'lastIndex should be one greater than lastIndex index');
});
/*
test("after removing disjoint range", function() {
  set.addIndexesInRange(4,2).addIndexesInRange(6000).remove(5998,10);
  equal(set.lastIndex,6, 'lastIndex should be one greater than lastIndex index');
});

test("after removing all ranges", function() {
  set.addIndexesInRange(4,2).addIndexesInRange(6000).remove(3,6200);
  equal(set.lastIndex, 0, 'lastIndex should be back to 0 with no content');
});
*/