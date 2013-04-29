var set;

module("IndexSet#copy", {
  setup: function () {
    set = new IndexSet();
  }
});

test("copy should return new object with same key properties", function () {
  set.add(100, 100)
     .add(200, 100);

  var copyCat = set.copy();
  ok(copyCat !== set,     'the clone should not === the original set');
  ok(set.equals(copyCat), 'the clone and the original set should have the same content');

  equal(copyCat.length,     set.length,     'the clone should have same length');
  equal(copyCat.firstIndex, set.firstIndex, 'the clone should have same firstIndex');
  equal(copyCat.lastIndex,  set.lastIndex,  'the clone should have same lastIndex');
});

test("copying index sets should be quick", function () {
  var sets = 50000;
  while (sets--) {
    set.add(sets * 4, Math.floor(Math.random() * 4));
  }

  var startTime = new Date().getTime(),
      endTime;

  set.copy();
  endTime = new Date().getTime();

  ok(endTime - startTime < 50);
});
