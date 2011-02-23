var dependencyPromise = module.exports = {
  dependsOn: function (event, children) {
    var events = this.events || (this.events = {})
      , e = events[event] || (events[event] = {})
      , childs = e.children || (e.children = [])
      , i = children.length, cevents, ce
      , parents, numChildrenTriggered;
    while (i--) {
      cevents = children[i].events || (children[i].events = {});
      ce = cevents[event] || (cevents[event] = {});
      parents = cevents[event].parents || (cevents[event].parents = []);
      parents.push(this); // TODO Double counting check
    }
    childs.push.apply(childs, children);
    e.numChildrenTriggered || (e.numChildrenTriggered = 0);
    return this;
  },
  isTriggered: function (event) {
    return !!this.events && !!this.events[event] && !!this.events[event].triggered;
  },
  trigger: function (event) {
    if (!this.events) return false;
    var e = this.events[event]
      , childs, i, child, parents, parent;
    if (e.triggered) return false;

    // Check that all children have been triggered
    if (childs = e.children) {
      i = childs.length;
      while (i--) {
        child = childs[i];
        if (!child.events[event] || !child.events[event].triggered) {
          // All children must be triggered before I can be triggered
          return false;
        }
      }
    }
    // Mark myself as triggered
    e.triggered = true;

    // Run my callbacks
    e.callbackArgs = Array.prototype.slice.call(arguments, 1);
    if (e.callbacks) for (var j = 0, l = e.callbacks.length; j < l; j++)
      e.callbacks[j][0].apply(e.callbacks[j][1], e.callbackArgs)

    // Notify my parents that I've been triggered
    parents = e.parents;
    if (parents) {
      i = parents.length;
      while (i--) {
        parent = parents[i];
        e = parent.events[event];
        e.numChildrenTriggered++;
        if (e.numChildrenTriggered === e.children.length)
          parent.trigger(event);
      }
    }
    return true;
  },
  on: function (event, fn, scope) {
    if (this.isTriggered(event)) return fn.apply(scope, this.events[event].callbackArgs);
    else {
      this.events || (this.events = {});
      this.events[event] || (this.events[event] = {});
      this.events[event].callbacks || (this.events[event].callbacks = []);
      this.events[event].callbacks.push([fn, scope]);
    }
    return this;
  }
};
