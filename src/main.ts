import { Lexer } from "./lexer";
import { Parser } from "./parser";

const main = () => {
    const lexer = new Lexer('{ "abc": 123, "asd": false, "bruh": [123, "sad"] }')
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const result = parser.parse();
    console.log(result);
}

main();
