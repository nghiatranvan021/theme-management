Prism.languages.liquid = {
    'comment': {
        pattern: /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/,
        greedy: true
    },
    'delimiter': {
        pattern: /^\{(?:\{|%-?)\s*|\s*(?:-?%|\})\}$/,
        alias: 'punctuation'
    },
    'string': {
        pattern: /"[^"]*"|'[^']*'/,
        greedy: true,
        color: '#a8ff60'
    },
    'keyword': {
        pattern: /\b(?:if|else|elsif|unless|case|when|for|in|break|continue|limit|offset|range|reversed|raw|endraw|capture|endcapture|comment|endcomment|include|render|section|style|endstyle|form|endform|liquid|assign|echo|cycle|increment|decrement)\b/,
        color: '#ff3a83'
    },
    'attribute': {
        pattern: /\b(?:href|class|rel|name|content|type|charset|http-equiv|crossorigin)\b/,
        color: '#9eff80'
    },
    'variable': {
        pattern: /\b(?:settings|shop|product|collection|page|customer|cart|template|request)\.[a-zA-Z0-9_.]+\b/,
        color: '#96cbfe'
    },
    'operator': /\|\s*[a-z]+|\band\b|\bor\b|\bcontains\b|\b==\b|\b!=\b|\b>=\b|\b<=\b|\b>\b|\b<\b|\bnot\b/,
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
            'special-attr': [],
            'attr-value': {
                pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/,
                inside: {
                    'punctuation': [
                        /^=/,
                        {
                            pattern: /(^|[^\\])["']/,
                            lookbehind: true
                        }
                    ]
                }
            },
            'punctuation': /\/?>/,
            'attr-name': {
                pattern: /[^\s>\/]+/,
                color: '#9eff80'
            }
        }
    }
}; 