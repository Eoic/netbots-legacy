import * as Lint from "tslint";
import * as TypeScript from "typescript";

const FAILURE_STRING_PARAMS = "All parameters should have types";
const FAILURE_STRING_RETURN = "Method should have a return type";

const ia = 10;

class NumberIteratorPrefix extends Lint.RuleWalker {
    /**
     * Checks if declared method is public
     * @param node AST node
     */
    public static startsAsIterator(node: TypeScript.VariableDeclaration): boolean {
        return (node.name.getText().substring(0, 1) === "i");
    }

    /**
     * Checks if all parameters of method declaration is typed
     * and return type is declared (excluding any)
     * @param node AST node
     */
    public visitVariableDeclaration(node: TypeScript.VariableDeclaration): void {
        if (!NumberIteratorPrefix.startsAsIterator(node)) {
            this.addFailureAtNode(node, "Does not start with i.");
        }

        super.visitVariableDeclaration(node);
    }
}

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TypeScript.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NumberIteratorPrefix(sourceFile, this.getOptions()));
    }
}
