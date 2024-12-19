import Prism from 'prismjs';

Prism.languages.liquid = {
  'comment': {
    pattern: /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/,
    greedy: true
  },
  'liquid-tag': {
    pattern: /\{%-?\s*.*?-?%\}/,
    inside: {
      'keyword': {
        pattern: /\b(?:if|else|elsif|unless|case|when|for|in|break|continue|limit|offset|range|reversed|raw|endraw|capture|endcapture|comment|endcomment|include|render|section|style|endstyle|form|endform|liquid|assign|echo|cycle|increment|decrement)\b/,
        greedy: true
      },
      'function': /\b[a-z0-9_]+(?=\()/i,
      'string': {
        pattern: /"[^"]*"|'[^']*'/,
        greedy: true
      },
      'variable': {
        pattern: /\b(?:settings|shop|product|collection|page|customer|cart|template|request)\.[a-zA-Z0-9_.]+\b/,
        greedy: true
      },
      'operator': /\|\s*[a-z]+|\band\b|\bor\b|\bcontains\b|\b==\b|\b!=\b|\b>=\b|\b<=\b|\b>\b|\b<\b|\bnot\b/,
    }
  },
  'delimiter': {
    pattern: /\{\{-?|\{%-?|-?%\}|-?\}\}/,
    alias: 'punctuation'
  },
  'string': {
    pattern: /"[^"]*"|'[^']*'/,
    greedy: true
  },
  'tag': {
    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/,
    greedy: true,
    inside: {
      'tag': {
        pattern: /^<\/?[^\s>\/]+/,
        inside: {
          'punctuation': /^<\/?/,
          'namespace': /^[^\s>\/:]+:/
        }
      },
      'attr-value': {
        pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/,
        inside: {
          'punctuation': [/^=/, {
            pattern: /(^|[^\\])["']/,
            lookbehind: true
          }]
        }
      },
      'punctuation': /\/?>/,
      'attr-name': /[^\s>\/]+/
    }
  }
}; 