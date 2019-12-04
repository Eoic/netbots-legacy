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
var TypeScript = require("typescript");
var FAILURE_STRING_PARAMS = "All parameters should have types";
var FAILURE_STRING_RETURN = "Method should have a return type";
var ReturnTypeWalker = /** @class */ (function (_super) {
    __extends(ReturnTypeWalker, _super);
    function ReturnTypeWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Checks if declared method is public
     * @param node AST node
     */
    ReturnTypeWalker.isMethodPublic = function (node) {
        if (!node.modifiers) {
            return true;
        }
        return ReturnTypeWalker.hasNonPublicModifiers(node.modifiers);
    };
    /**
     * Checks whether given modifiers are non public
     * @param modifiers Method modifiers (e.g. private, public)
     */
    ReturnTypeWalker.hasNonPublicModifiers = function (modifiers) {
        var nonPublicModifiers = [
            TypeScript.SyntaxKind.PrivateKeyword,
            TypeScript.SyntaxKind.ProtectedKeyword,
        ];
        return modifiers.map(function (modifier) { return modifier.kind; })
            .filter(function (kind) { return nonPublicModifiers.includes(kind); }).length === 0;
    };
    /**
     * Checks if all parameters of method declaration is typed
     * and return type is declared (excluding any)
     * @param node AST node
     */
    ReturnTypeWalker.prototype.visitMethodDeclaration = function (node) {
        var _this = this;
        if (ReturnTypeWalker.isMethodPublic(node)) {
            var parametersNotTyped = !node.parameters.every(function (parameter) {
                return _this.isTyped(parameter) || Boolean(parameter.dotDotDotToken);
            });
            if (parametersNotTyped) {
                this.addFailureAtNode(node, FAILURE_STRING_PARAMS);
            }
            if (!this.isTyped(node)) {
                this.addFailureAtNode(node, FAILURE_STRING_RETURN);
            }
        }
        _super.prototype.visitMethodDeclaration.call(this, node);
    };
    /**
     * Checks if method has declared return type.
     * @param node AST node
     */
    ReturnTypeWalker.prototype.isTyped = function (node) {
        return Boolean(node.type && (node.type.kind !== TypeScript.SyntaxKind.AnyKeyword));
    };
    return ReturnTypeWalker;
}(Lint.RuleWalker));
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ReturnTypeWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
