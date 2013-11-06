var set, start, len;
module("IndexSet#rangeStartForIndex", {
  setup: function () {
    start = IndexSet.ENV.HINT_SIZE * 2 + 10;
    len  = Math.floor(IndexSet.ENV.HINT_SIZE * 1.5);
    set = new IndexSet();
    set.addIndexesInRange(start, len);
  }
});

test("index is start of range", function () {
  equal(set.rangeStartForIndex(start), start);
  equal(set.rangeStartForIndex(0), 0);
});

test("index is middle of range", function () {
  equal(set.rangeStartForIndex(start + 20), start);
  equal(set.rangeStartForIndex(start + IndexSet.ENV.HINT_SIZE), start);
  equal(set.rangeStartForIndex(20), 0);
});

test("index last index", function () {
  equal(set.rangeStartForIndex(start + len), start + len);
});

test("index past last index", function () {
  equal(set.rangeStartForIndex(start + len + 20), start + len);
});

test("invalid index sets don't infinitely recurse", function () {
  var set = new IndexSet();

  set.__ranges__ = new Array(155);
  set.__ranges__[0]   = 0;
  set.__ranges__[154] = 0;
  set.firstIndex = -1;
  set.lastIndex  = 153;

  equal(set.indexBefore(178), -1);
  equal(set.lastIndex, -1);
  equal(set.firstIndex, -1);
  equal(set.length, 0);
});

test("creating holes by appending to an existing range should not affect the range start", function () {
  var hintSize = IndexSet.ENV.HINT_SIZE,
      start, set;

  set = new IndexSet();

  set.addIndex(1);
  set.addIndex(hintSize + 1);

  // Before adding 2,
  // the internal data structure looks like:
  // {
  //   0  : -  1,   // Hole until 1
  //   1  :    2,   // End of range is 2
  //   2  : -257,   // Hole until 257
  //   256:    2,   // Hint points at index 2, which is ok.
  //   257:  258,   // End of range is 258
  //   258:    0    // End of index set
  // }
  equal(set.rangeStartForIndex(hintSize),
        set.rangeStartForIndex(hintSize - 1));

  set.addIndex(2);

  // Assuming IndexSet.ENV.HINT_SIZE is 256,
  // the internal data structure looks like:
  // {
  //   0  : -  1,   // Hole until 1
  //   1  :    3,   // End of range is 3
  //   3  : -257,   // Hole until 257
  //   256:    2,   // Hint points at index 2, which is invalid.
  //   257:  258,   // End of range is 258
  //   258:    0    // End of index set
  // }
  equal(set.rangeStartForIndex(hintSize),
        set.rangeStartForIndex(hintSize - 1));
});
