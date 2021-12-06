import { Lexer } from "./lexer";
import { Parser } from "./parser";

const main = () => {
    const lexer = new Lexer('{ "abc": {"bruh": null}, "asd": false, "bruh": [123, "sad", {"brui": 213.234}] }')
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const result = parser.parse();
    console.log(result);
}

main();
