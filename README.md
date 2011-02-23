dependency-promise
===================

Add the Deferrable Pattern to Your Dependency Graphs

Only 70 Lines of Code.

## Installation
    npm install dependency-promise

## How to use
Dependency promise is structured as a mixin.

You can use dependency promise by mixing it into your objects:
    
    function SomeClass () {}
    for (var k in dependencyPromise) {
      SomeClass.prototype[k] = dependencyPromise[k];
    }

## Explanation
Deferrable-promise is perfect for the following scenario:
    You have an object that depends on other objects.
    You want to defer a function from being invoked until
    all of a parent's objects child objects fire an event.

One example domain is resolving dependencies between files.
Suppose you want to compile a top-level file and its
dependencies into a single file. You can use dependency-promise
to set up a dependency graph between all the files and then load
the files asynchronously. Consider a single file in this hierarchy.
As each of its children files is loaded into memory, each child file
fires off a 'loaded' event and notifies the parent file that it has been
'loaded'. When that single file's dependencies are ALL loaded,
that single file will be notified. Upon notification that all
it's dependencies have been 'loaded', that file will also fire a 'loaded'
event. This will result in it firing any callbacks related to the 'loaded'
event. Moreover, if any files depend on this file, then it will notify
its own parent files that it has been loaded. Each of those parent files
will behave in the same way, too. And so on and so forth.

## Example
    var dependencyPromise = require('dependency-promise');
    function File () {}
    
    // dependencyPromise is a mixin
    for (var k in dependencyPromise) {
      File.prototype[k] = dependencyPromise[k];
    }
    
    var parentFile = new File()
      , childFileOne = new File()
      , childFileTwo = new File();
    
    parentFile.dependsOn('loaded', [childFileOne, childFileTwo]);
    
    parentFile.on('loaded', function () {
      console.log("parentFile loaded");
      console.log("All files loaded!!!!");
    });
   
    // Triggering an event before all of your
    // dependencies have triggered will not
    // trigger anything. Hence the false return value
    // below. 
    parentFile.trigger('loaded'); // => false
    parentFile.isTriggered('loaded'); // => false

    childFileOne.on('loaded', function () {
      console.log("childFileOne loaded");
    });

    childFileTwo.trigger('loaded'); // => true
    console.log( childFileTwo.isTriggered('loaded') ); // true

    childFileOne.trigger('loaded');
    // Triggering an event triggers its callbacks
    // console.log -> "childFileOne loaded"
    
    // parentFile triggers 'loaded', automatically
    // because it depends only on childOne and childTwo
    // console.log -> "parentFile loaded"
    // console.log -> "All files loaded!!!!"
    
    console.log( parentFile.isTriggered('loaded') ); // true
    
    // Like a regular promise, you can add a callback AFTER
    // an event has been triggered, and the callback will
    // immediately be invoked
    childFileTwo.on('loaded', function () {
      console.log("childFileTwo loaded");
    });
    // console.log -> "childFileTwo loaded"


## API

- `dependsOn(event, children)`
  Sets up the dependency relationship between `this` and the `children` Array
  based around the `event` string. Each member of `children` must also have
  dependency-promise mixed in
- `trigger(event[, args..])`
  Triggers the event with name `event`. You can optionally pass in
  variable-length arguments. Triggering the event will do 2 things.
  First, it will fire any callbacks for the `event`, passing any
  arguments that may also have been passed to `trigger(...)`
  Second, it will notify `this`'s parents that `this` has been triggered.
- `isTriggered(event)`
  Returns true/false, specifying whether `this` has had `event` triggered.
- `on(event, callback, scope)`
  Associates a `callback` and `scope` to be invoked when `this` triggers
  said `event`.
- `dependenciesFor(event)`
  Returns the Array of dependencies (children) for the given `event`.

## Tests
To run tests:
    make test

### Contributors
- [Brian Noguchi](https://github.com/bnoguchi)

### License
MIT License

---
### Author
Brian Noguchi
