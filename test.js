var should = require('should')
  , dependencyPromise = require('./dependency_promise');

function Node () {}

for (var k in dependencyPromise) {
  Node.prototype[k] = dependencyPromise[k];
}

module.exports = {
  'a parent should not be able to trigger if any of its children are untriggered': function () {
    var parent = new Node()
      , childOne = new Node()
      , childTwo = new Node();
    parent.dependsOn('loaded', [childOne, childTwo]);
    parent.trigger('loaded').should.be.false;
  },

  'a parent should automatically trigger itself once its last child has been triggered': function () {
    var parent = new Node()
      , childOne = new Node()
      , childTwo = new Node();
    parent.dependsOn('loaded', [childOne, childTwo]);
    childOne.trigger('loaded');
    childOne.isTriggered('loaded').should.be.true;
    childTwo.trigger('loaded');
    childTwo.isTriggered('loaded').should.be.true;
    parent.isTriggered('loaded').should.be.true;
  },

  'a parent should not automatically trigger itself until all children have been triggered': function () {
    var parent = new Node()
      , childOne = new Node()
      , childTwo = new Node();
    parent.dependsOn('loaded', [childOne, childTwo]);
    childOne.trigger('loaded');
    childOne.isTriggered('loaded').should.be.true;
    childTwo.isTriggered('loaded').should.be.false;
    parent.isTriggered('loaded').should.be.false;
  },

  'triggering should be transitive': function () {
    var grandpa = new Node()
      , mama = new Node()
      , kid = new Node();
    grandpa.dependsOn('loaded', [mama]);
    mama.dependsOn('loaded', [kid]);
    kid.trigger('loaded');
    kid.isTriggered('loaded').should.be.true;
    mama.isTriggered('loaded').should.be.true;
    grandpa.isTriggered('loaded').should.be.true;
  },

  'assigned callbacks should be invoked by a trigger': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    parent.on('loaded', function () {
      counter++;
    });
    parent.dependsOn('loaded', [child]);
    child.trigger('loaded');
    counter.should.equal(1);
  },

  'assigned callbacks should run immediately if the event has already been triggered': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    parent.dependsOn('loaded', [child]);
    child.trigger('loaded');
    parent.on('loaded', function () {
      counter++;
    });
    counter.should.equal(1);
  },

  'triggering should be able to pass along arguments to callbacks': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    parent.dependsOn('loaded', [child]);
    child.on('loaded', function (a, b) {
      counter = a + b;
    });
    child.trigger('loaded', 5, 2);
    counter.should.equal(7);
  },

  'arguments passed to a trigger should be remembered and passed to callbacks declared after a trigger': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    parent.dependsOn('loaded', [child]);
    child.trigger('loaded', 5, 2);
    child.on('loaded', function (a, b) {
      counter = a + b;
    });
    counter.should.equal(7);
  },

  'callbacks can be associated with a scope': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    child.on('loaded', function (a, b) {
      counter = a + b + this.y + this.z;
    }, {y: 100, z: 50});
    parent.dependsOn('loaded', [child]);
    child.trigger('loaded', 5, 2);
    counter.should.equal(157);
  },

  'triggering twice should not trigger callbacks twice': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    parent.dependsOn('loaded', [child]);
    parent.on('loaded', function () {
      counter++;
    });
    child.trigger('loaded').should.be.true;
    counter.should.equal(1);
    child.trigger('loaded').should.be.false;
    counter.should.equal(1);
  },

  'test transitive relationship with callbacks': function () {
    var grandpa = new Node()
      , mama = new Node()
      , kid = new Node()
      , counter = 0;
    grandpa.on('loaded', function () {
      counter++;
    });
    mama.on('loaded', function () {
      counter++;
    });
    kid.on('loaded', function () {
      counter++;
    });

    grandpa.dependsOn('loaded', [mama]);
    mama.dependsOn('loaded', [kid]);
    kid.trigger('loaded');
    counter.should.equal(3);
  },

  'a parent should be able to get its dependencies': function () {
    var parent = new Node()
      , childOne = new Node()
      , childTwo = new Node();
    parent.dependsOn('loaded', [childOne, childTwo]);
    parent.dependenciesFor('loaded').should.eql([childOne, childTwo]);
  },

  'depending on a child after the child has triggered the event should work': function () {
    var parent = new Node()
      , child = new Node()
      , counter = 0;
    child.trigger('loaded');
    parent.on('loaded', function () {
      counter++;
    });
    parent.dependsOn('loaded', [child]);
    counter.should.equal(1);
  }
};
