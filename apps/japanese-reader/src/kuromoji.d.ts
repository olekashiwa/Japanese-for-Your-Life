declare module 'kuromoji' {
  interface Tokenizer {
    tokenize(text: string): Token[];
  }
  interface Token {
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    reading: string;
    basic_form: string;
  }
  interface Builder {
    build(callback: (error: any, tokenizer: Tokenizer) => void): void;
  }
  function builder(options: { dicPath: string }): Builder;
}
