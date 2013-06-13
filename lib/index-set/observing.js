var toString = Object.prototype.toString,
    slice = Array.prototype.slice,
    META_KEY = '__js-index_set__' + (new Date().getTime()),
    T_FUNCTION = '[object Function]',
    T_STRING   = '[object String]',
    T_NUMBER   = '[object Number]',
    T_BOOLEAN  = '[object Boolean]',
    T_OBJECT   = '[object Object]',
    uuid = 0,
    st = {}; // string cache

function meta(o, create) {
  var info = o && o[META_KEY];
  if (create && info == null) {
    info = o[META_KEY] = {};
  }
  return info;
}

function destroy(o) {
  if (o != null) {
    delete o[META_KEY];
  }
}

function metaPath(o, path, value) {
  var i = 0, len = path ? path.length : 0,
      m;

  if (arguments.length === 3) {
    m = meta(o, true);
    for (; i < len - 1; i++) {
      o = m[path[i]] || {};
      m[path[i]] = o;
      m = o;
    }
    m[path[len - 1]] = value;
    m = value;
  } else {
    m = meta(o);
    for (; i < len; i++) {
      m = m ? m[path[i]] : undefined;
    }
  }
  return m;
}

function guidFor(o) {
  if (o === null) return '(null)';
  if (o === void(0)) return '(undefined)';

  var cache, result, m,
      type = toString.call(o);

  switch(type) {
  case T_NUMBER:
    result = 'nu' + o;
    break;
  case T_STRING:
    result = st[o];
    if (!result) result = st[o] = 'st' + (uuid++);
    break;
  case T_BOOLEAN:
    result = o ? '(true)' : '(false)';
    break;
  default:
    if (o === Object) return '{}';
    if (o === Array) return '[]';
    m = meta(o, true);
    result = m.guid;
    if (!result) result = m.guid = 'cr' + (uuid++);
  }
  return result;
}

function set(hostObject, key, value) {
  var currentValue = hostObject[key];

  // Only set values if they have changed
  if (currentValue !== value) {
    trigger(hostObject, key + ':before', value);
    hostObject[key] = value;
    trigger(hostObject, key + ':change', value);
  }
}

function on(hostObject, event, target, method) {
  if (toString.call(method) !== T_FUNCTION) {
    throw new TypeError(method + ' is not callable.');
  }

  metaPath(hostObject, ['events', event, guidFor(target), guidFor(method)], {
    method: method,
    target:  target
  });
}

function off(hostObject, event, target, method) {
  var m = metaPath(hostObject, ['events', event, guidFor(target)]);

  if (m) {
    delete m[guidFor(method)];
  }
}

function trigger(hostObject, event, value) {
  var targetSets = metaPath(hostObject, ['events', event]),
      args = slice.call(arguments),
      subscription,
      set,
      subscriptions, k;

  if (targetSets) {
    for (set in targetSets) {
      subscriptions = targetSets[set];
      for (k in subscriptions) {
        subscription = subscriptions[k];

        subscription.method.apply(subscription.target, args);
      }
    }
  }
}

export { set, on, off, trigger, destroy };
