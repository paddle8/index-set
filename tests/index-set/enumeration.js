var set;

module("IndexSet#forEach", {
  setup: function () {
    set = new IndexSet(5).add(200, 5);
  }
});

test("iterates through each index in the set", function () {
  var indices = [5, 200, 201, 202, 203, 204, 205],
      i = 0;
  set.forEach(function (index) {
    equal(index, indices[i++]);
  });
});

test("the scope of the passed function can be changed", function () {
  set.forEach(function () {
    equal(set, this);
  }, set);
});

test("the iterator gets passed the index and the indexSet", function () {
  set.forEach(function (index, indexSet) {
    equal(indexSet, set);
  });
});

module("Index#forEachRange", {
  setup: function () {
    set = new IndexSet(5).add(200, 100);
  }
});

test("iterates through each range in the set", function () {
  var ranges = [{ start:   5, length:   1 },
                { start: 200, length: 100 }],
      i = 0;
  set.forEachRange(function (start, length) {
    var range = ranges[i++];
    equal(start, range.start);
    equal(length, range.length);
  });
});

test("the scope of the passed function can be changed", function () {
  set.forEachRange(function () {
    equal(set, this);
  }, set);
});

test("the iterator gets passed the range and the indexSet", function () {
  set.forEachRange(function (start, length, indexSet) {
    equal(indexSet, set);
  });
});
