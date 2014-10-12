import IndexSet from "index-set";

var set;

module("IndexSet#indexLessThanIndex", {
  setup: function () {
    set = new IndexSet(5).add(10, 5).add(100);
  }
});

test("no earlier index in set", function (){
  equal(set.indexLessThanIndex(4), -1);
});

test("with index after end of set", function () {
  equal(set.indexLessThanIndex(1000), 100);
});

test("inside of multi-index range", function () {
  equal(set.indexLessThanIndex(12), 11);
});

test("beginning of multi-index range", function () {
  equal(set.indexLessThanIndex(10), 5);
});

test("single index range", function () {
  equal(set.indexLessThanIndex(100), 14);
});


module("IndexSet#indexLessThanOrEqualToIndex", {
  setup: function () {
    set = new IndexSet(5).add(10, 5).add(100);
  }
});

test("no earlier index in set", function (){
  equal(set.indexLessThanOrEqualToIndex(4), -1);
});

test("with index after end of set", function () {
  equal(set.indexLessThanOrEqualToIndex(1000), 100);
});

test("inside of multi-index range", function () {
  equal(set.indexLessThanOrEqualToIndex(12), 12);
});

test("beginning of multi-index range", function () {
  equal(set.indexLessThanOrEqualToIndex(10), 10);
});

test("single index range", function () {
  equal(set.indexLessThanOrEqualToIndex(100), 100);
});
