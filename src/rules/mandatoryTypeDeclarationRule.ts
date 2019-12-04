import * as Lint from "tslint";
import * as TypeScript from "typescript";

const FAILURE_STRING_PARAMS = "All parameters should have types";
const FAILURE_STRING_RETURN = "Method should have a return type";

class ReturnTypeWalker extends Lint.RuleWalker {
    /**
     * Checks if declared method is public
     * @param node AST node
     */
    public static isMethodPublic(node: TypeScript.MethodDeclaration): boolean {
        if (!node.modifiers) {
            return true;
        }

        return ReturnTypeWalker.hasNonPublicModifiers(node.modifiers);
    }

    /**
     * Checks whether given modifiers are non public
     * @param modifiers Method modifiers (e.g. private, public)
     */
    public static hasNonPublicModifiers(modifiers: TypeScript.ModifiersArray): boolean {
        const nonPublicModifiers: TypeScript.SyntaxKind[] = [
            TypeScript.SyntaxKind.PrivateKeyword,
            TypeScript.SyntaxKind.ProtectedKeyword,
        ];

        return modifiers.map((modifier) => modifier.kind)
                        .filter((kind) => nonPublicModifiers.includes(kind)).length === 0;
    }

    /**
     * Checks if all parameters of method declaration is typed
     * and return type is declared (excluding any)
     * @param node AST node
     */
    public visitMethodDeclaration(node: TypeScript.MethodDeclaration): void {
        if (ReturnTypeWalker.isMethodPublic(node)) {
            const parametersNotTyped = !node.parameters.every((parameter) => {
                return this.isTyped(parameter) || Boolean(parameter.dotDotDotToken);
            });

            if (parametersNotTyped) {
                this.addFailureAtNode(node, FAILURE_STRING_PARAMS);
            }

            if (!this.isTyped(node)) {
                this.addFailureAtNode(node, FAILURE_STRING_RETURN);
            }
        }

        super.visitMethodDeclaration(node);
    }

    /**
     * Checks if method has declared return type.
     * @param node AST node
     */
    private isTyped(node: TypeScript.MethodDeclaration | TypeScript.ParameterDeclaration): boolean {
        return Boolean(node.type && (node.type.kind !== TypeScript.SyntaxKind.AnyKeyword));
    }
}

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TypeScript.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ReturnTypeWalker(sourceFile, this.getOptions()));
    }
}
