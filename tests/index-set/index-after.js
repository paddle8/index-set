var set;

module("IndexSet#indexGreaterThanIndex", {
  setup: function () {
    set = new IndexSet(5).add(10, 5).add(100);
  }
});

test("no earlier index in set", function () {
  equal(set.indexGreaterThanIndex(3), 5);
});

test("with index after end of set", function () {
  equal(set.indexGreaterThanIndex(1000), -1);
});

test("inside of multi-index range", function () {
  equal(set.indexGreaterThanIndex(12), 13);
});

test("end of multi-index range", function () {
  equal(set.indexGreaterThanIndex(14), 100);
});

test("single index range", function () {
  equal(set.indexGreaterThanIndex(5), 10);
});


module("IndexSet#indexGreaterThanOrEqualToIndex", {
  setup: function () {
    set = new IndexSet(5).add(10, 5).add(100);
  }
});

test("no earlier index in set", function () {
  equal(set.indexGreaterThanOrEqualToIndex(3), 5);
});

test("with index after end of set", function () {
  equal(set.indexGreaterThanOrEqualToIndex(1000), -1);
});

test("inside of multi-index range", function () {
  equal(set.indexGreaterThanOrEqualToIndex(12), 12);
});

test("end of multi-index range", function () {
  equal(set.indexGreaterThanOrEqualToIndex(14), 14);
});

test("single index range", function () {
  equal(set.indexGreaterThanOrEqualToIndex(5), 5);
});
