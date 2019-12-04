"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var FAILURE_STRING_PARAMS = "All parameters should have types";
var FAILURE_STRING_RETURN = "Method should have a return type";
var NumberIteratorPrefix = /** @class */ (function (_super) {
    __extends(NumberIteratorPrefix, _super);
    function NumberIteratorPrefix() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Checks if declared method is public
     * @param node AST node
     */
    NumberIteratorPrefix.startsAsIterator = function (node) {
        return (node.name.getText().substring(0, 1) === "i");
    };
    /**
     * Checks if all parameters of method declaration is typed
     * and return type is declared (excluding any)
     * @param node AST node
     */
    NumberIteratorPrefix.prototype.visitVariableDeclaration = function (node) {
        if (!NumberIteratorPrefix.startsAsIterator(node)) {
            this.addFailureAtNode(node, "Does not start with i.");
        }
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    return NumberIteratorPrefix;
}(Lint.RuleWalker));
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NumberIteratorPrefix(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
