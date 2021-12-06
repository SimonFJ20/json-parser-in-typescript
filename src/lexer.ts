
export enum TokenType {
    STRING      = 'STRING',
    NUMBER      = 'NUMBER',
    FALSE       = 'FALSE',
    TRUE        = 'TRUE',
    NULL        = 'NULL',
    LBRACE      = 'LBRACE',
    RBRACE      = 'RBRACE',
    LBRACKET    = 'LBRACKET',
    RBRACKET    = 'RBRACKET',
    COLON       = 'COLON',
    COMMA       = 'COMMA',
    EOF         = 'EOF',
}

export class Token {
    public type: TokenType;
    public value?: string;

    constructor (type: TokenType, value?: string) {
        this.type = type;
        this.value = value;
    }
}

const ESCAPED_CHARS: {[key: string]: string} = {
    'n': '\n',
    't': '\t',
};

export class Lexer {

    private text: string;
    private index: number;

    constructor (text: string) {
        this.text = text;
        this.index = 0;
    }
    
    public tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.char(true) !== undefined) {
            if ([' ', '\t', '\n'].find(c => c === this.char()!) !== undefined) {
                this.step();
                continue;
            } else if (/\d/.test(this.char()!)) {
                tokens.push(this.makeNumberToken());
            } else if (/[a-z]/.test(this.char()!)) {
                tokens.push(this.makeIdentifierToken())
            } else {
                switch (this.char()) {
                    case '"': tokens.push(this.makeStringToken()); break;
                    case '{': tokens.push(new Token(TokenType.LBRACE, this.char()!)); this.step(); break;
                    case '}': tokens.push(new Token(TokenType.RBRACE, this.char()!)); this.step(); break;
                    case '[': tokens.push(new Token(TokenType.LBRACKET, this.char()!)); this.step(); break;
                    case ']': tokens.push(new Token(TokenType.RBRACKET, this.char()!)); this.step(); break;
                    case ':': tokens.push(new Token(TokenType.COLON, this.char()!)); this.step(); break;
                    case ',': tokens.push(new Token(TokenType.COMMA, this.char()!)); this.step(); break;
                    default:
                        throw new Error(`LexerError: Unexpected character '${this.char()}'`)
                }
            }
        }
        tokens.push(new Token(TokenType.EOF, '\0'));
        return tokens;
    }

    private makeNumberToken(): Token {
        let value = this.char();
        this.step();
        let dots = 0;
        while (/\d/.test(this.char()!)) {
            if (this.char()! === '.')
                dots++;
            if (dots > 1)
                throw new Error('LexerError: Number cant have multiple \'.\'s')
            value += this.char()!;
            this.step();
        }
        return new Token(TokenType.NUMBER, value);
    }

    private makeStringToken(): Token {
        let value = '';
        let escaped = false;
        this.step();
        while (!(this.char() === '"' && !escaped)) {
            if (escaped) {
                if (this.char()! in ESCAPED_CHARS)
                    value += ESCAPED_CHARS[this.char()!]
                else
                    value += this.char();
                escaped = false;
            } else if (this.char() === '\\')
                escaped = true;
            else
                value += this.char();
            this.step();
        }
        this.step();
        return new Token(TokenType.STRING, value);
    }

    private makeIdentifierToken(): Token {
        let value = '';
        while (/[a-z]/.test(this.char()!)) {
            value += this.char();
            this.step();
        }
        switch (value) {
            case 'null':
                return new Token(TokenType.NULL, value);
            case 'false':
                return new Token(TokenType.FALSE, value);
            case 'true':
                return new Token(TokenType.TRUE, value);
            default:
                throw new Error(`LexerError: Unknown identifier '${value}'`);
        }
    }

    private checkIndexAndTextLength(allowOverflow: boolean) {
        if (this.text.length < this.index)
            if (allowOverflow)
                return undefined
            else
                throw new Error('LexerError: Expected token, got none');
    }

    private char(allowUndefined: boolean = false) {
        this.checkIndexAndTextLength(allowUndefined);
        const char = this.text.charAt(this.index);
        return char === '' ? undefined : char;
    }

    private step() {
        this.index++;
    }

}
