"use strict";

var postcss = require("postcss"),

    composition = require("../lib/composition"),
    inheritance = require("../lib/inheritance"),
    resolve     = require("../lib/resolve");

function parse(options, field, rule) {
    var parsed = composition.parse(rule[field]),
        file;
    
    if(!parsed.source || parsed.source === "super") {
        return;
    }
    
    file = resolve(options.from, parsed.source);
    
    // Add any compositions to the dependency graph
    options.graph.addNode(file);
    options.graph.addDependency(options.from, file);
}

module.exports = postcss.plugin("postcss-modular-css-graph-nodes", function() {
    return function(css, result) {
        var options = result.opts;
        
        // @inherit rules are more complicated since they don't match the normal composition pattern
        css.walkAtRules("inherit", function(node) {
            var parent = inheritance(options.from, node);
                
            // add the parent to the graph
            options.graph.addNode(parent);
            options.graph.addDependency(options.from, parent);
        });
        
        // These are easy by comparison!
        css.walkAtRules("value", parse.bind(null, options, "params"));
        css.walkDecls("composes", parse.bind(null, options, "value"));
    };
});
