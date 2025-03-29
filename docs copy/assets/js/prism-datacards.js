/**
 * Prism syntax highlighting for DataCards code blocks
 */
Prism.languages.datacards = {
  'comment': {
    pattern: /(^|\n)\/\/.*(?=\n|$)/,
    lookbehind: true,
    greedy: true
  },
  'settings-header': {
    pattern: /(^|\n)\/\/ Settings/,
    lookbehind: true,
    greedy: true
  },
  'keyword': {
    pattern: /\b(?:TABLE|FROM|WHERE|SORT|GROUP BY|FLATTEN|LIMIT|ASC|DESC|AS|OR|AND|NOT|CONTAINS|file\.(?:name|path|folder|link|ctime|mtime|size|cday|mday|tags|etags|outlinks|inlinks|day|week|month|year))\b/i,
    greedy: true
  },
  'dataview-field': {
    pattern: /\b(?:[a-zA-Z0-9_]+)(?=:)/,
    greedy: true
  },
  'operator': {
    pattern: /(?:>=|<=|=|>|<|\+|-|\*|\/|\(|\)|\[|\]|\.|\,|!|%)/,
    greedy: true
  },
  'string': {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  'property': {
    pattern: /\b[a-zA-Z0-9_\-\.]+(?=:)/,
    greedy: true
  },
  'setting-value': {
    pattern: /:\s*[^,\n]+/,
    greedy: true,
    inside: {
      'number': /\b\d+(?:\.\d+)?\b/,
      'boolean': /\b(?:true|false)\b/i,
      'string': /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      'constant': /\b[A-Z_][A-Z0-9_]*\b/
    }
  },
  'function': {
    pattern: /\b[a-zA-Z0-9_]+\s*\(/,
    greedy: true,
    inside: {
      'punctuation': /\(/
    }
  },
  'tag': {
    pattern: /#[a-zA-Z0-9_\/\-]+/,
    greedy: true
  },
  'number': /\b\d+(?:\.\d+)?\b/,
  'boolean': /\b(?:true|false)\b/i,
  'punctuation': /[{}[\];(),.:]/
};

// Add dataquery alias to reuse dataview syntax highlighting
Prism.languages.dataview = Prism.languages.datacards; 