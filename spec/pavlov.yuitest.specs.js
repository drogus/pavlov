var standardYUITestRan = false;

YUI({combine: true, timeout: 10000}).use("node", "test",function (Y) {
  pavlov.Y = Y;

  Y.namespace("example.test");
  Y.example.test.DataTestCase = new Y.Test.Case({
    name : "Example tests",
    testName : function () {
        standardYUITestRan = true;
        Y.assert(true);
    }
  });

  Y.example.test.ExampleSuite = new Y.Test.Suite("Example Suite");
  Y.example.test.ExampleSuite.add(Y.example.test.DataTestCase);

  Y.Test.Runner.add(Y.example.test.ExampleSuite);
  Y.Test.Runner.run();

  pavlov("Pavlov", function() {

      describe("a pavlov()", function() {
          it("should throw exception if name or fn params not passed", function(){
              assert(function(){
                  pavlov(function(){});
              }).throwsException("both 'name' and 'fn' arguments are required");
              assert(function(){
                  pavlov("description");
              }).throwsException("both 'name' and 'fn' arguments are required");
          });
          
          it("should set the document title to spec name + ' Specifications'", function() {
              assert(document.title).isEqualTo("Pavlov Specifications");
          });

          it("should run the spec lambda", function() {
              // implicitly true by virtue of having executed            
              assert.pass();
          });

          it("should run the resulting flattened tests", function() {
              // implicitly true by virtue of having executed            
              assert.pass();
          });

          it("should not pollute the global namespace", function() {
              var methods = "describe,it,wait,assert,before,after,given".split(',');
              for(var i = 0; i < methods.length; i++) {
                  assert(window[String(methods[i])]).isUndefined();
              }
          });

          it("should be able to run alongside standard YUI Test modules and tests", function() {
              assert(standardYUITestRan).isTrue();
          });
      });

      describe("a describe()", function() {
          var variableDefinedInDescribe = "y";
          var beforeCalls = [];
          var afterCalls = [];

          var beforeCallCount = 0;
          before(function() {
              beforeCallCount++;
              beforeCalls.push('x');
          });

          var afterCallCount = 0;
          after(function() {
              afterCallCount++;
              afterCalls.push('y');
          });
          
          it("should throw exception if not passed a description and fn", function(){
              assert(function(){
                  describe("some description");                                
              }).throwsException("both 'description' and 'fn' arguments are required");
              assert(function(){
                  describe(function(){});                                
              }).throwsException("both 'description' and 'fn' arguments are required");
          });
          
          it("should throw exception when before() not passed an fn", function(){
              assert(function(){
                  before();
              }).throwsException("'fn' argument is required")
          });
          
          it("should throw exception when after() not passed an fn", function(){
              assert(function(){
                  after();
              }).throwsException("'fn' argument is required")            
          });

          it("should execute lambda", function() {
              // implicitly true by virtue of this running
              assert.pass();
          });

          it("should execute before() before each it()", function() {
              assert(beforeCallCount).equals(5);
              assert(afterCallCount).equals(4);
          });

          it("should execute after() after each it()", function() {
              assert(beforeCallCount).equals(6);
              assert(afterCallCount).equals(5);
          });

          describe("with a nested describe()", function() {
              var variableDefinedInNestedDescribe = "x";

              before(function() {
                  beforeCalls.push('a');
              });

              after(function() {
                  afterCalls.push('b');
              });

              it("should execute all before()s from outside-in", function() {
                  assert(beforeCalls).isSameAs(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a']);
                  assert(afterCalls).isSameAs(['y', 'y', 'y', 'y', 'y', 'y', 'y']);
              });

              it("should execute all after()s from inside-out", function() {
                  assert(beforeCalls).isSameAs(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a', 'x', 'a']);
                  assert(afterCalls).isSameAs(['y', 'y', 'y', 'y', 'y', 'y', 'y', 'b', 'y']);
              });

              it("should have access to own describe scope", function() {
                  assert(variableDefinedInNestedDescribe).isDefined();
              });

              it("should have access to parent describe scope", function() {
                  assert(variableDefinedInDescribe).isDefined();
              });
          });

          it("should have access to describe scope", function() {
              assert(variableDefinedInDescribe).isDefined();
          });
      });

      describe("an it()", function() {
          it("should throw exception if not passed at least a specification", function(){
              assert(function(){
                  it();                                
              }).throwsException("'specification' argument is required");          
          });
          
          it("should generate and run a test", function() {
              pavlov.Y.assert(true);  // implicitly true by virtue of this running           
          });

          describe("when not passed a test lambda", function(){

              it("should generate a failing (todo) test when not passed a lambda", function(){
                  var originalIt = it;
                  var args;
                  try{
                      // mock up an it
                      // when passed single arg, let Pavlov do it's job (to test it)
                      // when passed 2 args, intercept and capture the response to 
                      // keep Pavlov from doing its job
                      // later, will verify the correct behavior happened with 1 arg.
                      it = function() {
                          if(arguments.length === 2) {
                              args = $.makeArray(arguments);
                          } else {
                              originalIt.apply(this,arguments);
                          }
                      };

                      // run the method under test
                      it("no lambda");

                      var todoGeneratingFn = args[1];

                      var originalFail = assert.fail;
                      var failMessage = null;
                      try
                      {
                          assert.fail = function(message) {
                              failMessage = message;
                          };
                          todoGeneratingFn();
                      } finally {
                          assert.fail = originalFail;
                      }

                  } finally {
                      it = originalIt;
                  }
                  assert(args[0]).equals("no lambda");
                  assert(args.length).equals(2);
                  assert(failMessage).equals("Not Implemented");
              });

          });

          describe("after a given()", function() {
              
              it("should throw exception when given() not passed at least an arg", function(){
                  assert(function(){
                      given();
                  }).throwsException("at least one argument is required");
              });

              var singleArgGivenCount = 0;

              given(1, 2, 3).
                  it("should test for each of given()'s args when passed flat args", function(x) {
                      assert(x).equals(singleArgGivenCount + 1);
                      singleArgGivenCount++;
              });

              var multiArgGivenCount = 0;

              given([1, 2, 3], [4, 5, 6], [7, 8, 9]).
                  it("should test for each of given()'s args when passed array arguments", function(x, y, z) {
                      assert(x).equals(multiArgGivenCount * 3 + 1, "some message");
                      assert(y).equals(multiArgGivenCount * 3 + 2);
                      assert(z).equals(multiArgGivenCount * 3 + 3);
                      multiArgGivenCount++;
              });
          });

          describe("with a wait()", function() {
              
              it("should throw exception if not passed both fn and ms", function(){
                  assert(function(){
                      wait();                                        
                  }).throwsException("both 'ms' and 'fn' arguments are required")
                  assert(function(){
                      wait(54);                                        
                  }).throwsException("both 'ms' and 'fn' arguments are required")
                  assert(function(){
                      wait(function(){});                                        
                  }).throwsException("both 'ms' and 'fn' arguments are required")
              });

              it("should stop(), run a setTimeout() for duration, then execute lambda and start()", function() {
                  var original = {
                      stop: stop,
                      start: start,
                      setTimeout: window.setTimeout                                        
                  };
                  var calls = [];
                  var setTimeoutMs = 0;
                  var waitLambdaCalled = false;

                  try{
                      // mock timing functions to capture their calls from wait()
                      stop = function() { calls.push('stop'); };
                      start = function() { calls.push('start'); };
                      window.setTimeout = function(fn, ms) {
                          calls.push('settimeout');
                          setTimeoutMs = ms;
                          fn();
                      };
                      
                      // call wait
                      wait(40, function(){
                          calls.push('waitlambda');
                      });
                      
                  } finally {
                      // undo mocking
                      stop = original.stop;
                      start = original.start;
                      window.setTimeout = original.setTimeout;                                        
                  }
                  
                  // check if calls to mocked fn's occurred correctly
                  assert(calls).isSameAs(['stop','settimeout','waitlambda','start']);
                  assert(setTimeoutMs).equals(40);
              });

          });
      });



      describe("assertions", function() {

          /* quick and dirty mocking of native yui test functions
           * temporarily replaces a method in Y namespace with one
           * that just gathers and returns the values of passed arguments
           * undoes mocking after scope completes
           */
          var mockYUITestAssertion = function(method, scope){
              var originalMethod = pavlov.Y[method];
              var args = [];
              try {
                  pavlov.Y[method] = function(){
                      args = $.makeArray(arguments);
                  };
                  scope();
              } finally {
                  pavlov.Y[method] = originalMethod;
              }
              return args;
          };
      
          describe("equals()", function() {

              it("should pass === value of arguments to yui test's assert()", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(4).equals(2, "some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([4 === 2,"some message"]);
              });

          });

          describe("isEqualTo()", function() {

              it("should pass === value of arguments to yui test's assert", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(4).isEqualTo(2, "some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test 
                  assert(passedArgs).isSameAs([4 === 2,"some message"]);
              });

          });

          describe("isNotEqualTo()", function(){

              it("should pass true to yui test assert() when actual !== expected", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(4).isNotEqualTo(2, "some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"some message"]);
              });

              it("should pass false to yui test assert() when actual === expected", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(2).isNotEqualTo(2, "some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"some message"]);
              });

          });

          describe("isSameAs()", function() {

              it("should pass arguments to equiv and result to assert()", function() {
                  var originalEquiv = pavlov.equiv;
                  var calls = [];
                  try {
                      pavlov.equiv = function(actual, expected) {
                          calls.push($.makeArray(arguments));
                          return true;
                      };
                      var passedArgs = mockYUITestAssertion('assert', function(){
                          // run spec assertion while underlying yui test assertion is mocked
                          assert(4).isSameAs(2, "some message");
                      });
                  }finally{
                      pavlov.equiv = originalEquiv;    
                  }

                  // make sure equiv was called
                  assert(calls).isSameAs([[4,2]]);
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"some message"]);
              });

          });

          describe("isNotSameAs()", function(){
              
              var originalEquiv;
              var equivActual;
              var equivExpected;
              
              
              before(function(){
                  originalEquiv = pavlov.equiv;
                  equivActual = null;
                  equivExpected = null;                
              });

              it("should pass true when !pavlov.equiv of arguments is true to yui test's assert()", function() {
                  try {
                      pavlov.equiv = function(actual, expected) {
                          equivActual = actual;
                          equivExpected = expected;
                          return false;                        
                      };
                      var passedArgs = mockYUITestAssertion('assert', function(){
                          // run spec assertion while underlying yui test assertion is mocked
                          assert(4).isNotSameAs(2, "some message");
                      });                    
                  } finally {
                      pavlov.equiv = originalEquiv;
                  }
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"some message"]);
                  assert(equivActual).equals(4);
                  assert(equivExpected).equals(2);
              });
              
              it("should pass false when !pavlov.equiv of arguments is false to yui test's assert()", function() {
                  try {
                      pavlov.equiv = function(actual, expected) {
                          equivActual = actual;
                          equivExpected = expected;
                          return true;                        
                      };
                      var passedArgs = mockYUITestAssertion('assert', function(){
                          // run spec assertion while underlying yui test assertion is mocked
                          assert(4).isNotSameAs(2, "some message");
                      });                    
                  } finally {
                      pavlov.equiv = originalEquiv;
                  }
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"some message"]);
                  assert(equivActual).equals(4);
                  assert(equivExpected).equals(2);
              });            

          });

          describe("isTrue()", function() {

              it("should pass argument to yui test's assert()", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(true).isTrue("some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"some message"]);
              });

          });

          describe("isFalse()", function(){

              it("should pass true to yui test's assert() when expr is false", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(false).isFalse("some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"some message"]);
              });

              it("should pass false to yui test's assert() when expr is true", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(true).isFalse("some message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"some message"]);
              });
          });
          
          describe("isNull()", function() {

              it("should pass true to yui test's ok() when actual === null", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(null).isNull("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });

              it("should pass false to yui test' assert when actual !== null", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(0).isNull("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);
              });

          });

          describe("isNotNull()", function(){

              it("should pass true to yui test's assert when actual !== null", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(0).isNotNull("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });

              it("should pass false to yui test's ok when actual === null", function() {
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(null).isNotNull("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);
              });

          });
          
          describe("isDefined()", function() {

              it("should pass true to yui test's assert when typeof(argument) !== 'undefined'", function() {
                  var x = "something";
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(x).isDefined("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });

              it("should pass false to yui test's assert when typeof(argument) === 'undefined'", function() {
                  var x;
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(x).isDefined("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);
              });

          });

          describe("isUndefined()", function(){

              it("should pass true to yui test's assert when typeof(argument) === 'undefined'", function() {
                  var x;
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(x).isUndefined("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });

              it("should pass false to yui test assert when typeof(argument) !== 'undefined'", function() {
                  var x = 1;
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(x).isUndefined("message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);
              });

          });
          
          
          describe("pass()", function(){
              
              it("should pass true to yui test's assert()", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert().pass("message");
                  });              

                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });
              
              it("should also be called from assert.pass()", function(){
                  
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert.pass("message");
                  });              

                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);                
                                  
              });
                          
          });

          describe("fail()", function(){
              
              it("should pass false to yui test's assert()", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert().fail("message");
                  });              

                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);
              });
                          
              it("should also be called from assert.false()", function(){
                  
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert.fail("message");
                  });              

                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);                
                                  
              });
                          
          });
          
          describe("throwsException()", function(){
              
              it("should pass true to yui test's assert() when function throws exception", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(function(){
                          // should throw undefined exceptions
                          var totalPrice = unitPrice * quantity;
                      }).throwsException();
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,undefined]);
              });
              
              it("should pass false to yui test's assert() when function does not throw exception", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(function(){
                          var unitPrice = 10;
                          var quantity = 4;
                          var totalPrice = unitPrice * quantity;
                      }).throwsException();
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,undefined]);                
              });
              
              it("should pass true to yui test's assert() when function throws exception with expected description", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(function(){
                          throw("expected description");
                      }).throwsException("expected description", "message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([true,"message"]);
              });
              
              it("should pass false to yui test's assert() when function throws exception with unexpected description", function(){
                  var passedArgs = mockYUITestAssertion('assert', function(){
                      // run spec assertion while underlying yui test assertion is mocked
                      assert(function(){
                          throw("some other error description");
                      }).throwsException("expected description", "message");
                  });
                  
                  // verify correct arguments would have been passed to yui test
                  assert(passedArgs).isSameAs([false,"message"]);                
              });
          });
          
          describe("custom assertions", function(){

              it("should be able to be added via pavlov.extendAssertions with 3 arg asserts", function(){
                  var gtArgs, ltArgs;
                  pavlov.extendAssertions({
                      isGreaterThan: function(actual, expected, message) {
                          gtArgs = $.makeArray(arguments);
                      },
                      isLessThan: function(actual, expected, message) {
                          ltArgs = $.makeArray(arguments);
                      }
                  });

                  assert(4).isGreaterThan(2,"some message");
                  assert(2).isLessThan(4,"some message");

                  assert(gtArgs).isSameAs([4,2,"some message"]);
                  assert(ltArgs).isSameAs([2,4,"some message"]);
              });

              it("should be able to be added via pavlov.extendAssertions with 2 arg asserts", function(){
                  var purpleArgs, yellowArgs;
                  pavlov.extendAssertions({
                      isPurple: function(actual, message) {
                          purpleArgs = $.makeArray(arguments);
                      },
                      isYellow: function(actual, message) {
                          yellowArgs = $.makeArray(arguments);
                      }
                  });

                  assert(4).isPurple("some message");
                  assert(2).isYellow("some message");

                  assert(purpleArgs).isSameAs([4,"some message"]);
                  assert(yellowArgs).isSameAs([2,"some message"]);
              });

          });
      });
  });

});
