"use strict";

var values = require("postcss-value-parser"),
    
    resolve = require("./resolve");

module.exports = function(file, node) {
    var parsed = values(node.params);
                
    if(parsed.nodes[0].type !== "string") {
        throw node.error("Invalid @inherit value: " + node.params, { word : node.params });
    }
    
    return resolve(file, parsed.nodes[0].value);
};
