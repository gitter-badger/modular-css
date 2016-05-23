"use strict";

var assert = require("assert"),
    path   = require("path"),
    
    postcss = require("postcss"),

    inheritance = require("../src/lib/inheritance");

describe("/lib", function() {
    describe("/inheritance.js", function() {
        var from = path.resolve("./test/specimens/simple.css");
            
        function parse(css) {
            return postcss.parse(css).first;
        }
        
        it("should throw on errors", function() {
            assert.throws(function() {
                inheritance(from, parse("@inherit ./super.css;"));
            }, /Invalid @inherit value/);
            
            assert.throws(function() {
                inheritance(from, parse("@inherit \"./fake.css\";"));
            }, /Unable to locate/);
        });
        
        it("should return the parent file", function() {
            assert.equal(
                path.resolve("./test/specimens/super.css"),
                inheritance(from, parse("@inherit \"./super.css\";"))
            );
        });
    });
});
