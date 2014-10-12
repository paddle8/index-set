import IndexSet from "index-set";

var set,
    event = function (hostObject, _event) {
      event.args = Array.prototype.slice.call(arguments);
      event.scope = this;
      event.called++;

      var key = _event.split(':')[0];
      event.state = {};
      event.state[key] = hostObject[key];
    };

event.reset = function () {
  delete this.scope;
  this.called = 0;
  this.args = [];
};

module("IndexSet#on(length:before)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('length:before', module, event);
  }
});

test("gets called once when the length changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.length, 0);

  deepEqual(event.args, [set, 'length:before', 5]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(2, 5);
  event.reset();
  set.add(4);

  equal(event.called, 0);
});


module("IndexSet#on(length:change)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('length:change', module, event);
  }
});

test("gets called once when the length changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.length, 5);

  deepEqual(event.args, [set, 'length:change', 5]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(2, 5);
  event.reset();
  set.add(4);

  equal(event.called, 0);
});


module("IndexSet#on(firstIndex:before)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('firstIndex:before', module, event);
  }
});

test("gets called once when the firstIndex changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.firstIndex, -1);

  deepEqual(event.args, [set, 'firstIndex:before', 1000]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(2, 5);
  event.reset();
  set.add(4, 20);

  equal(event.called, 0);
});


module("IndexSet#on(firstIndex:change)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('firstIndex:change', module, event);
  }
});

test("gets called once when the firstIndex changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.firstIndex, 1000);

  deepEqual(event.args, [set, 'firstIndex:change', 1000]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(2, 5);
  event.reset();
  set.add(4, 20);

  equal(event.called, 0);
});


module("IndexSet#on(lastIndex:before)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('lastIndex:before', module, event);
  }
});

test("gets called once when the lastIndex changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.lastIndex, -1);

  deepEqual(event.args, [set, 'lastIndex:before', 1004]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(100, 5);
  event.reset();
  set.add(4, 20);

  equal(event.called, 0);
});


module("IndexSet#on(lastIndex:change)", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('lastIndex:change', module, event);
  }
});

test("gets called once when the lastIndex changes", function () {
  set.add(1000, 5);
  equal(event.called, 1);
  equal(event.scope, module);
  equal(event.state.lastIndex, 1004);

  deepEqual(event.args, [set, 'lastIndex:change', 1004]);
});

test("doesn't get called when the length remains the same", function () {
  set.add(100, 5);
  event.reset();
  set.add(4, 20);

  equal(event.called, 0);
});


module("IndexSet#off", {
  setup: function () {
    set = new IndexSet();
    event.reset();
    set.on('lastIndex:change', module, event);
  }
});

test("doesn't get called after the event is removed", function () {
  set.add(13, 5);
  event.reset();
  set.off('lastIndex:change', module, event);
  set.add(4, 20);

  equal(event.called, 0);
});
