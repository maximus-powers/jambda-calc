enum TokenType {
  LAMBDA = 'lambda',
  DOT = 'dot',
  VARIABLE = 'variable',
  LPAREN = 'lparen',
  RPAREN = 'rparen',
  EOF = 'eof',
}

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

interface AbstractionTerm {
  type: 'abstraction';
  variable: string;
  body: Term;
}

interface ApplicationTerm {
  type: 'application';
  left: Term;
  right: Term;
}

interface VariableTerm {
  type: 'variable';
  name: string;
}

type Term = AbstractionTerm | ApplicationTerm | VariableTerm;

/**
 * Parser for lambda calculus expressions.
 */
export class Parser {
  private source: string;
  private tokens: Token[];
  private position: number;
  private current: Token;

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.position = 0;
    this.current = { type: TokenType.EOF, value: '', pos: 0 };
    this.tokenize();
    this.advance();
  }

  private tokenize(): void {
    if (!this.source || this.source.length === 0) {
      this.tokens.push({ type: TokenType.EOF, value: '', pos: 0 });
      return;
    }
    const maxSourceLength = 100000; // 100K characters max
    if (this.source.length > maxSourceLength) {
      throw new Error(`Source code exceeds maximum length of ${maxSourceLength} characters`);
    }

    let pos = 0;
    while (pos < this.source.length) {
      const char = this.source[pos];

      // handle char types
      if (/\s/.test(char)) {
        // skip whitespace
        pos++;
        continue;
      }
      // lambda symbol
      if (char === 'λ') {
        this.tokens.push({ type: TokenType.LAMBDA, value: 'λ', pos });
        pos++;
        continue;
      }
      // dot
      if (char === '.') {
        this.tokens.push({ type: TokenType.DOT, value: '.', pos });
        pos++;
        continue;
      }
      // parens
      if (char === '(') {
        this.tokens.push({ type: TokenType.LPAREN, value: '(', pos });
        pos++;
        continue;
      }
      if (char === ')') {
        this.tokens.push({ type: TokenType.RPAREN, value: ')', pos });
        pos++;
        continue;
      }

      // vars (alphanumeric and some special)
      if (/[a-zA-Z0-9_'+*\-/]/.test(char)) {
        let value = '';
        const startPos = pos;
        while (pos < this.source.length && /[a-zA-Z0-9_'+*\-/]/.test(this.source[pos])) {
          value += this.source[pos];
          pos++;
        }
        this.tokens.push({ type: TokenType.VARIABLE, value, pos: startPos });
        continue;
      }

      // skip any other character
      pos++;
    }

    this.tokens.push({ type: TokenType.EOF, value: '', pos });
  }

  private advance(): void {
    if (this.position < this.tokens.length) {
      this.current = this.tokens[this.position++];
    }
  }
  private match(type: TokenType): boolean {
    return this.current.type === type;
  }
  private consume(type: TokenType, errorMessage: string): Token {
    if (this.match(type)) {
      const token = this.current;
      this.advance();
      return token;
    }
    throw new Error(`${errorMessage} at position ${this.current.pos}`);
  }

  /**
   * Parse a lambda expression. Converts formal lambda calc into AST for rendering.
   */
  parse(): Term {
    const term = this.parseExpression();
    if (!this.match(TokenType.EOF)) {
      throw new Error(`Unexpected token ${this.current.type} at position ${this.current.pos}`);
    }
    return term;
  }

  /**
   * Parse an expression (abstraction, application, or atomic)
   */
  private parseExpression(): Term {
    if (this.match(TokenType.LAMBDA)) {
      return this.parseAbstraction();
    }
    return this.parseApplication();
  }

  /**
   * Parse a lambda abstraction (λx.body)
   */
  private parseAbstraction(): Term {
    this.consume(TokenType.LAMBDA, 'Expected lambda');
    const variable = this.consume(TokenType.VARIABLE, 'Expected variable after lambda').value;
    this.consume(TokenType.DOT, 'Expected dot after variable in lambda abstraction');
    const body = this.parseExpression();
    return {
      type: 'abstraction',
      variable,
      body,
    };
  }

  /**
   * Parse an application (func arg)
   */
  private parseApplication(): Term {
    // start with atomic term
    let term = this.parseAtomic();

    // keep applying terms as long as we have more atomic terms
    // applications are left-associative
    while (
      !this.match(TokenType.EOF) &&
      !this.match(TokenType.RPAREN) &&
      !this.match(TokenType.DOT)
    ) {
      const argument = this.parseAtomic();
      term = {
        type: 'application',
        left: term,
        right: argument,
      };
    }

    return term;
  }

  /**
   * Parse an atomic expression (variable or parenthesized expression)
   */
  private parseAtomic(): Term {
    if (this.match(TokenType.VARIABLE)) {
      const name = this.current.value;
      this.advance();
      return { type: 'variable', name };
    }

    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, 'Expected closing parenthesis');
      return expr;
    }

    throw new Error(`Unexpected token ${this.current.type} at position ${this.current.pos}`);
  }
}
