"use strict";

var parser  = require("../parsers/parser.js"),
    resolve = require("../lib/resolve.js"),
    
    plugin = "postcss-modular-css-values-namespaced",
    offset = "@value ".length;

// Find @value fooga: wooga entries & catalog/remove them
module.exports = (css, result) => {
    var values = Object.create(null);

    css.walkAtRules("value", (rule) => {
        var parsed, source;
        
        try {
            parsed = parser.parse(rule.params);
        } catch(e) {
            throw rule.error(e.toString(), { index : offset + e.location.start.column });
        }

        if(parsed.type !== "namespace") {
            return;
        }

        try {
            source = result.opts.files[resolve(result.opts.from, parsed.source)];
        } catch(e) {
            // NO-OP
        }

        if(!source) {
            throw rule.error("Unknown composition source", { word : parsed.source });
        }

        values[parsed.name] = source.values;

        rule.remove();
    });
    
    if(Object.keys(values).length > 0) {
        result.messages.push({
            type : "modularcss",
            plugin,
            values
        });
    }
};

module.exports.postcssPlugin = plugin;
