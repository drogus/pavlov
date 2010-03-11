/**
 * pavlov - Behavioral API over JavaScript Test Frameworks
 * YUI Test adapter
 * 
 * version 0.3.0pre
 * 
 * http://michaelmonteleone.net/projects/pavlov
 * http://github.com/mmonteleone/pavlov
 *
 * Copyright (c) 2010 Michael Monteleone
 * Licensed under terms of the MIT License (README.markdown)
 */

/**
 * YUI Test adapter for Pavlov to allow Pavlov examples to be run against YUI Test
 */
pavlov.extend({
    /**
     * Implements assert
     */
    assert: function(expr, msg) { this.Y.assert(expr, msg); },
    /**
     * Check equvalence
     */
    equivalent: function(a, b) { 
      return pavlov.equiv(a, b);
    },
    /**
     * Implementes async start
     */
    start: function() { throw("not implemented yet"); },
    /**
     * Implements async stop
     */
    stop: function(){ throw("not implemented yet"); },

    /**
     * Compiles nested set of examples into flat array of test cases
     * returned bound up in a single callable function 
     * @param {Array} examples Array of possibly nested Example instances
     * @returns function of which, when called, will execute all YUI Test test cases
     */
    compile: function(examples) {
        var Y = this.Y;
        var testCases = [],
            each = pavlov.helpers.each;

        var suite = new Y.Test.Suite(this.name);

        /**
         * Comples a single example and its children into YUI Test test cases
         * @param {Example} example Single example instance 
         * possibly with nested instances
         */
        var compileDescription = function(example) {
            // get before and after rollups
            var befores = example.befores(),
                afters = example.afters();

            // prepare template for test case
            var template = {
              name: example.name,
              setUp:    function() {
                          each(befores, function(){ this(); });
                        },
              tearDown: function(){
                          each(afters, function(){ this(); });
                        }
            }


            // attach each "it" examples to template
            each(example.specs, function(){
              var spec = this;
              template["test: " + spec[0]] = spec[1];
            });

            // create test case and attach it to test cases
            var testCase = new Y.Test.Case(template);
            testCases.push(testCase);

            // recurse through example's nested examples
            each(example.children, function() {
                compileDescription(this);
            });
        };

        // compile all root examples
        each(examples, function() {
            compileDescription(this, testCases);
        });

        // return a single function which, when called,
        // runs test suite
        return function(){ 
            each(testCases, function(){
              suite.add(this);
            });

            Y.Test.Runner.add(suite);
            //run the tests
            Y.Test.Runner.run();
        };
    }
});
