import * as Lint from "tslint";
import * as ts from "typescript";

class NoImportsWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        const fix = new Lint.Replacement(node.getStart(), node.getWidth(), "");
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING, fix));
        super.visitImportDeclaration(node);
    }
}

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "import statement forbidden";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
    }
}
