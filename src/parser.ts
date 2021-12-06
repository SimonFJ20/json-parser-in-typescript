import { Token, TokenType } from "./lexer";

/*

main    -> object | list

object  -> LBRACE (pair (COMMA pair)*)? RBRACE

pair    -> string COLON value

list    -> LBRACKET (value (COMMA value)*)? RBRACKET

value   -> STRING | NUMBER | NULL | FALSE | TRUE | object | list

*/


type PResult = PObject | PList;

type PObject = {[key: string]: PValue};

type PPair = {key: string, value: PValue};

type PList = PValue[];

type PValue = string | number | null | boolean | PObject | PList;

export class Parser {

    private tokens: Token[];
    private index: number;

    constructor (tokens: Token[]) {
        this.tokens = tokens;
        this.index = 0;
    }

    public parse(): PResult {
        if (this.token().type === TokenType.LBRACE)
            return this.makeObject();
        else if (this.token().type === TokenType.LBRACKET)
            return this.makeList();
        else
            this.failUnexpectedToken(this.token());
    }

    private makeObject(): PObject {
        this.step();
        const res: PObject = {};
        if (this.token().type !== TokenType.RBRACE) {
            const {key, value} = this.makePair();
            res[key] = value;
            while (this.token().type !== TokenType.RBRACE) {
                this.matchCurrent(TokenType.COMMA);
                this.step();
                const {key, value} = this.makePair();
                res[key] = value;
            }
        }
        this.step();
        return res;
    }

    private makePair(): PPair {
        this.matchCurrent(TokenType.STRING);
        const key = this.token().value!;
        this.step();
        this.matchCurrent(TokenType.COLON);
        this.step();
        const value = this.makeValue();
        this.step();
        return {key, value};
    }

    private makeList(): PList {
        this.step();
        const res: PList = [];
        if (this.token().type !== TokenType.RBRACKET) {
            res.push(this.makeValue())
            this.step();
            while (this.token().type !== TokenType.RBRACKET) {
                this.matchCurrent(TokenType.COMMA);
                this.step();
                res.push(this.makeValue())
                this.step();
            }
        }
        return res;
    }

    private makeValue(): PValue {
        switch (this.token().type) {
            case TokenType.STRING:
                return this.token().value!;
            case TokenType.NUMBER:
                if (/\./.test(this.token().value!)) 
                    return parseFloat(this.token().value!)
                else
                    return parseInt(this.token().value!);
            case TokenType.NULL:
                return null;
            case TokenType.FALSE:
                return false;
            case TokenType.TRUE:
                return true;
            case TokenType.LBRACE:
                return this.makeObject();
            case TokenType.LBRACKET:
                return this.makeList();
            default:
                this.failUnexpectedToken(this.token());
        }
    }

    private failUnexpectedToken(token: Token, expected?: TokenType): never {
        const errStr = `ParserError: Unexpected token [${token.type}:${token.value}]`;
        const expStr = expected ? `, expected type [${expected}]` : '';
        throw new Error(errStr + expStr);
    }

    private match(token: Token, type: TokenType) {
        if (token.type !== type)
            this.failUnexpectedToken(token, type);
    }

    private matchCurrent(type: TokenType) {
        this.match(this.token(), type);
    }

    private checkIndexAndTokensLength(allowOverflow: boolean) {
        if (this.tokens.length < this.index)
            if (allowOverflow)
                return undefined
            else
                throw new Error('LexerError: Expected token, got none');
    }

    private token(allowUndefined: boolean = false) {
        this.checkIndexAndTokensLength(allowUndefined);
        return this.tokens[this.index];
    }

    private step() {
        this.index++;
    }

}
