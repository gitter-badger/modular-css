"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("postcss"),
    assign  = require("lodash.assign"),
    
    scoping     = require("../src/plugins/scoping"),
    inheritance = require("../src/plugins/inheritance");

describe("/plugins", function() {
    describe("/inheritance.js", function() {
        var process;
        
        beforeEach(function() {
            var processor = postcss([ scoping, inheritance ]);
            
            process = function(css, opts) {
                var files = {};
                
                files[path.resolve("./test/specimens/super.css")] = {
                    exports : {
                        a : [ "a" ]
                    }
                };
                
                return processor.process(css, assign({
                    namer : function(file, selector) {
                        return file ? path.basename(file, path.extname(file)) + "_" + selector : selector;
                    },
                    from  : "./test/specimens/inheritance.css",
                    files : files
                }, opts));
            };
        });
        
        
        it("should export parent identifiers directly", function() {
            assert.deepEqual(
                process("@inherit \"./super.css\";").messages[1],
                {
                    type    : "modularcss",
                    plugin  : "postcss-modular-css-inheritance",
                    classes : {
                        a : [ "a" ]
                    }
                }
            );
        });
        
        it("should allow extending parent identifiers", function() {
            assert.deepEqual(
                process("@inherit \"./super.css\"; .a { composes: a from super; color: red; }").messages[1],
                {
                    type    : "modularcss",
                    plugin  : "postcss-modular-css-inheritance",
                    classes : {
                        a : [ "a", "inheritance_a" ]
                    }
                }
            );
        });
        
        it("should allow overriding parent identifiers", function() {
            assert.deepEqual(
                process("@inherit \"./super.css\"; .a { color: red; }").messages[1],
                {
                    type    : "modularcss",
                    plugin  : "postcss-modular-css-inheritance",
                    classes : {
                        a : [ "inheritance_a" ]
                    }
                }
            );
        });
        
        it("should allow adding child-specific identifiers", function() {
            assert.deepEqual(
                process("@inherit \"./super.css\"; .b { color: red; }").messages[1],
                {
                    type    : "modularcss",
                    plugin  : "postcss-modular-css-inheritance",
                    classes : {
                        a : [ "a" ],
                        b : [ "inheritance_b" ]
                    }
                }
            );
        });
    });
});
