"use strict";

var postcss = require("postcss"),
    
    assign = require("lodash.assign"),
    
    message     = require("../lib/message"),
    composition = require("../lib/composition"),
    inheritance = require("../lib/inheritance"),
    identifiers = require("../lib/identifiers"),
    
    plugin = "postcss-modular-css-inheritance";

function base(exported, selector) {
    var found;
    
    Object.keys(exported).some(function(key) {
        if(exported[key].indexOf(selector) > -1) {
            found = key;
        }
        
        return found;
    });
    
    return found;
}

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var opts = result.opts,
            out, child, parent;
        
        // Check for an @inherit rule and use it to determine the parent
        css.walkAtRules("inherit", function(node) {
            parent = opts.files[inheritance(opts.from, node)].exports;
            
            node.remove();
        });
        
        // No @inherits means this plugin should no-op
        if(!parent) {
            return;
        }
        
        child = message(result, "classes");
        
        // Start out by just aping parent's exports
        out = assign({}, parent);
        
        // Default to exporting the
        css.walkRules(function(rule) {
            var selectors = identifiers.parse(rule.selector),
                composed;
            
            // See if this rule has any composes: * from super declarations
            rule.walkDecls("composes", function(decl) {
                var details = composition.decl(opts.from, decl);

                // Not a super composition, ignore
                if(!details.source || details.source !== "super") {
                    return false;
                }
                
                composed = true;
                
                // Remove the declaration so it doesn't run afoul of composition
                return decl.remove();
            });
            
            selectors.forEach(function(selector) {
                var key = base(child, selector);
                
                // Doesn't compose a parent selector, reset it
                out[key] = composed ? parent[key].concat(child[key]) : child[key];
            });
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : out
        });
    };
});
