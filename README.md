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
    You want to defer a function from being invoked
    until all of a parent's objects child objects fire an
    event.

One example domain is resolving dependencies between files.
Suppose you want to compile a top-level file and its
dependencies into a single file. You can use dependency-promise
to set up a dependency graph between all the files and then load
the files asynchronously. As each file is loaded into memory,
you can fire off 'loaded' events. When a single file's dependencies
are all loaded, that file will be notified. Upon notification that all
it's dependencies have been 'loaded', that file will also fire a 'loaded'
event. This will result in it firing any callbacks related to the 'loaded'
event. Moreover, if any files depend on this file, then it will notify
those parent files that it has been loaded. And so on and so forth.

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
- `trigger(event[, args..])`
- `isTriggered(event)`
- `on(event, callback, scope)`

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
