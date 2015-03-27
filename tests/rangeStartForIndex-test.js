var set, startIdx, len;
module("IndexSet#rangeStartForIndex", {
  setup: function () {
    startIdx = 256 * 2 + 10;
    len  = Math.floor(256 * 1.5);
    set = new IndexSet();
    set.addIndexesInRange(startIdx, len);
  }
});

test("index is start of range", function () {
  equal(set.rangeStartForIndex(startIdx), startIdx);
  equal(set.rangeStartForIndex(0), 0);
});

test("index is middle of range", function () {
  equal(set.rangeStartForIndex(startIdx + 20), startIdx);
  equal(set.rangeStartForIndex(startIdx + 256), startIdx);
  equal(set.rangeStartForIndex(20), 0);
});

test("index last index", function () {
  equal(set.rangeStartForIndex(startIdx + len), startIdx + len);
});

test("index past last index", function () {
  equal(set.rangeStartForIndex(startIdx + len + 20), startIdx + len);
});

test("index sets don't infinitely recurse", function () {
  var set = new IndexSet();

  set.__ranges__ = new Array(542);
  set.__ranges__[0]   =   50;
  set.__ranges__[50]  = -516;
  set.__ranges__[256] =   25;
  set.__ranges__[512] =   25;
  set.__ranges__[516] =  541;
  set.__ranges__[541] =    0;

  set.firstIndex =   0;
  set.lastIndex  = 540;
  set.length     =  75;

  equal(set.rangeStartForIndex(540), 516);
  equal(set.lastIndex, 540);
  equal(set.firstIndex, 0);
  equal(set.length, 75);
});

test("creating holes by appending to an existing range should not affect the range start", function () {
  var hintSize = 256,
      set;

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
