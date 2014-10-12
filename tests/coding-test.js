import IndexSet from "index-set";

var set;

module("IndexSet#serialize", {
  setup: function () {
    set = new IndexSet();
  }
});

test("an empty set", function () {
  equal(set.serialize(), '');
});

test("single indexes are listed as comma separated values", function () {
  set.add(1).add(5).add(7);
  equal(set.serialize(), '1,5,7');
});

test("index ranges are listed as values separated by `-`", function () {
  set.add(1, 5);
  equal(set.serialize(), '1-5');
});

test("index ranges and single values are displayed correctly together", function () {
  set.add(1).add(3, 7).add(22, 2).add(30);
  equal(set.serialize(), '1,3-9,22-23,30');
});


module("IndexSet#deserialize");

function K(value) { return value; }

test("deserializing an empty set", function () {
  deepEqual(IndexSet.deserialize("").map(K), []);
});

test("deserializing a single index", function () {
  deepEqual(IndexSet.deserialize("1").map(K), [1]);
});

test("deserializing multiple indexes", function () {
  deepEqual(IndexSet.deserialize("1,5,7").map(K), [1, 5, 7]);
});

test("deserializing a single range", function () {
  deepEqual(IndexSet.deserialize("1-5").map(K), [1, 2, 3, 4, 5]);
});

test("deserializing multiple ranges", function () {
  deepEqual(IndexSet.deserialize("3-9,22-23").map(K), [3, 4, 5, 6, 7, 8, 9, 22, 23]);
});

test("deserializing mixed ranges and indexes", function () {
  deepEqual(IndexSet.deserialize("1,3-9,22-23,30").map(K), [1, 3, 4, 5, 6, 7, 8, 9, 22, 23, 30]);
});

test("deserializing out of order ranges and indexes", function () {
  deepEqual(IndexSet.deserialize("30,3-4,22,7,5,49-52").map(K), [3, 4, 5, 7, 22, 30, 49, 50, 51, 52]);
});

test("deserializing lists with trailing commas", function () {
  deepEqual(IndexSet.deserialize("30,3-4,").map(K), [3, 4, 30]);
});

test("deserializing incomplete ranges", function () {
  deepEqual(IndexSet.deserialize("30,3-").map(K), [3, 30]);
});

test("deserializing inverted ranges", function () {
  deepEqual(IndexSet.deserialize("30,3-1").map(K), [1, 2, 3, 30]);
});

test("deserializing zero-length ranges", function () {
  deepEqual(IndexSet.deserialize("30,3-3").map(K), [3, 30]);
});


module("IndexSet#deserialize (strict)");

test("deserializing lists with trailing commas throws an error", function () {
  throws(function () {
    IndexSet.deserialize("30,3-4,", true);
  }, SyntaxError);
});

test("deserializing incomplete ranges throws an error", function () {
  throws(function () {
    IndexSet.deserialize("30,3-", true);
  }, SyntaxError);
});

test("deserializing inverted ranges throws an error", function () {
  throws(function () {
    IndexSet.deserialize("30,3-1", true);
  }, SyntaxError);
});

test("deserializing zero-length ranges throws an error", function () {
  throws(function () {
    IndexSet.deserialize("30,3-3", true);
  }, SyntaxError);
});
