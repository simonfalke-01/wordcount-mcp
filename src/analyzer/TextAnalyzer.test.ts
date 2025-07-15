import { TextAnalyzer, TextAnalysisResult } from './TextAnalyzer.js';

describe('TextAnalyzer', () => {
  let analyzer: TextAnalyzer;

  beforeEach(() => {
    analyzer = new TextAnalyzer();
  });

  describe('constructor', () => {
    it('should be instantiable', () => {
      expect(analyzer).toBeInstanceOf(TextAnalyzer);
    });

    it('should accept a locale parameter', () => {
      const koreanAnalyzer = new TextAnalyzer('ko-KR');
      expect(koreanAnalyzer).toBeInstanceOf(TextAnalyzer);
    });
  });

  describe('countCharacters', () => {
    it('should return 0 for empty string', () => {
      expect(analyzer.countCharacters('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(analyzer.countCharacters(null as any)).toBe(0);
      expect(analyzer.countCharacters(undefined as any)).toBe(0);
    });

    it('should count simple ASCII characters', () => {
      expect(analyzer.countCharacters('hello')).toBe(5);
      expect(analyzer.countCharacters('hello world')).toBe(11);
    });

    it('should count emojis as single characters', () => {
      expect(analyzer.countCharacters('🚀')).toBe(1);
      expect(analyzer.countCharacters('🚀✨')).toBe(2);
      expect(analyzer.countCharacters('Hello 🚀 World')).toBe(13);
    });

    it('should count grapheme clusters correctly', () => {
      // é as composed character (e + combining accent)
      expect(analyzer.countCharacters('e\u0301')).toBe(1);
      // Family emoji (man + woman + girl + boy + ZWJ)
      expect(analyzer.countCharacters('👨‍👩‍👧‍👦')).toBe(1);
    });

    it('should handle unicode properly', () => {
      expect(analyzer.countCharacters('한글')).toBe(2); // Korean characters
      expect(analyzer.countCharacters('你好')).toBe(2); // Chinese characters
    });
  });

  describe('countWords', () => {
    it('should return 0 for empty string', () => {
      expect(analyzer.countWords('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(analyzer.countWords(null as any)).toBe(0);
      expect(analyzer.countWords(undefined as any)).toBe(0);
    });

    it('should count simple words', () => {
      expect(analyzer.countWords('hello')).toBe(1);
      expect(analyzer.countWords('hello world')).toBe(2);
      expect(analyzer.countWords('the quick brown fox')).toBe(4);
    });

    it('should handle multiple spaces', () => {
      expect(analyzer.countWords('hello    world')).toBe(2);
      expect(analyzer.countWords('  hello  world  ')).toBe(2);
    });

    it('should handle punctuation correctly', () => {
      expect(analyzer.countWords('hello, world!')).toBe(2);
      expect(analyzer.countWords('hello-world')).toBe(2); // hyphenated words
      expect(analyzer.countWords("don't can't won't")).toBe(3); // contractions
    });

    it('should handle unicode text', () => {
      expect(analyzer.countWords('안녕하세요 세계')).toBe(2); // Korean
      expect(analyzer.countWords('你好 世界')).toBe(2); // Chinese
    });

    it('should handle mixed punctuation and text', () => {
      expect(analyzer.countWords('Hello, world! How are you?')).toBe(5);
      expect(analyzer.countWords('123 456 789')).toBe(3); // Numbers
    });
  });

  describe('countLetters', () => {
    it('should return 0 for empty string', () => {
      expect(analyzer.countLetters('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(analyzer.countLetters(null as any)).toBe(0);
      expect(analyzer.countLetters(undefined as any)).toBe(0);
    });

    it('should count only alphabetic letters', () => {
      expect(analyzer.countLetters('hello')).toBe(5);
      expect(analyzer.countLetters('Hello World')).toBe(10);
      expect(analyzer.countLetters('ABC')).toBe(3);
    });

    it('should exclude numbers and punctuation', () => {
      expect(analyzer.countLetters('hello123')).toBe(5);
      expect(analyzer.countLetters('hello, world!')).toBe(10);
      expect(analyzer.countLetters('123 456 789')).toBe(0);
      expect(analyzer.countLetters('!@#$%')).toBe(0);
    });

    it('should handle mixed content', () => {
      expect(analyzer.countLetters('Hello, World! 123')).toBe(10);
      expect(analyzer.countLetters('Test123$#@ABC')).toBe(7); // Test + ABC
      expect(analyzer.countLetters('a1b2c3')).toBe(3);
    });

    it('should exclude unicode non-Latin characters', () => {
      // Only counting a-z, A-Z as specified in PRD
      expect(analyzer.countLetters('hello 世界')).toBe(5); // Only 'hello'
      expect(analyzer.countLetters('café')).toBe(3); // Only 'caf' (excluding é)
      expect(analyzer.countLetters('🚀hello')).toBe(5); // Only 'hello'
    });

    it('should handle whitespace correctly', () => {
      expect(analyzer.countLetters('  hello  world  ')).toBe(10);
      expect(analyzer.countLetters('\n\t\rtest')).toBe(4);
    });
  });

  describe('countParagraphs', () => {
    it('should return 0 for empty string', () => {
      expect(analyzer.countParagraphs('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(analyzer.countParagraphs(null as any)).toBe(0);
      expect(analyzer.countParagraphs(undefined as any)).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(analyzer.countParagraphs('   ')).toBe(0);
      expect(analyzer.countParagraphs('\n\n\n')).toBe(0);
      expect(analyzer.countParagraphs('\t\r\n  ')).toBe(0);
    });

    it('should count single paragraph', () => {
      expect(analyzer.countParagraphs('This is a single paragraph.')).toBe(1);
      expect(analyzer.countParagraphs('Single line of text')).toBe(1);
    });

    it('should count multiple paragraphs separated by double newlines', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(3);
    });

    it('should handle paragraphs with varying whitespace', () => {
      const text = 'First paragraph.\n \n Second paragraph.\n  \n  Third paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(3);
    });

    it('should handle Windows line endings', () => {
      const text = 'First paragraph.\r\n\r\nSecond paragraph.\r\n\r\nThird paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(3);
    });

    it('should handle mixed line endings', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\r\n\r\nThird paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(3);
    });

    it('should ignore single line breaks', () => {
      const text = 'This is one paragraph\nwith a single line break\nbut still one paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(1);
    });

    it('should handle paragraphs with multiple empty lines', () => {
      const text = 'First paragraph.\n\n\n\nSecond paragraph.';
      expect(analyzer.countParagraphs(text)).toBe(2);
    });

    it('should handle leading and trailing whitespace', () => {
      const text = '\n\nFirst paragraph.\n\nSecond paragraph.\n\n';
      expect(analyzer.countParagraphs(text)).toBe(2);
    });

    it('should handle complex real-world example', () => {
      const text = `Introduction paragraph.

This is the first main point with some details.
It continues on multiple lines.

This is the second main point.

Conclusion paragraph with final thoughts.`;
      expect(analyzer.countParagraphs(text)).toBe(4);
    });
  });

  describe('countSentences', () => {
    it('should return 0 for empty string', () => {
      expect(analyzer.countSentences('')).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(analyzer.countSentences(null as any)).toBe(0);
      expect(analyzer.countSentences(undefined as any)).toBe(0);
    });

    it('should count sentences with standard punctuation', () => {
      expect(analyzer.countSentences('First sentence.')).toBe(1);
      expect(analyzer.countSentences('First sentence. Second sentence!')).toBe(2);
      expect(analyzer.countSentences('First sentence. Second! Third?')).toBe(3);
    });

    it('should handle abbreviations according to UAX #29 standard', () => {
      // Note: Intl.Segmenter treats abbreviations as sentence boundaries per UAX #29
      expect(analyzer.countSentences('Dr. Smith lives on Main St. near the library.')).toBe(2);
      expect(analyzer.countSentences('Mr. Jones went to the U.S.A. last year.')).toBe(2);
      expect(analyzer.countSentences('She has a Ph.D. in Computer Science.')).toBe(1);
    });

    it('should handle text with no terminators', () => {
      expect(analyzer.countSentences('Just a phrase without punctuation')).toBe(1);
      expect(analyzer.countSentences('Hello world')).toBe(1);
    });

    it('should handle multiple spaces and newlines', () => {
      expect(analyzer.countSentences('Sentence one.   \n\n  Sentence two.')).toBe(2);
      expect(analyzer.countSentences('First.\n\nSecond.\n\nThird.')).toBe(3);
    });

    it('should handle unicode text', () => {
      // Japanese text with proper sentence terminators
      expect(analyzer.countSentences('こんにちは。元気ですか。')).toBe(2);
      // Chinese text
      expect(analyzer.countSentences('你好。你好吗？')).toBe(2);
    });

    it('should handle mixed punctuation scenarios', () => {
      expect(analyzer.countSentences('Really? Yes! Absolutely.')).toBe(3);
      expect(analyzer.countSentences('What time is it? It is 3:30 p.m. now.')).toBe(2);
    });

    it('should handle edge cases with ellipses', () => {
      // Note: Intl.Segmenter treats ellipses as single sentence boundaries per UAX #29
      expect(analyzer.countSentences('Wait... what happened?')).toBe(1);
      expect(analyzer.countSentences('I was thinking... maybe we should go.')).toBe(1);
    });
  });

  describe('analyzeText', () => {
    it('should return all zero counts for empty string', () => {
      const result = analyzer.analyzeText('');
      expect(result).toEqual({
        wordCount: 0,
        letterCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
      });
    });

    it('should return all zero counts for null/undefined', () => {
      const resultNull = analyzer.analyzeText(null as any);
      expect(resultNull).toEqual({
        wordCount: 0,
        letterCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
      });
    });

    it('should analyze simple text correctly', () => {
      const result = analyzer.analyzeText('Hello, world!');
      expect(result).toEqual({
        wordCount: 2,          // "Hello", "world"
        letterCount: 10,       // H-e-l-l-o-w-o-r-l-d
        characterCount: 13,    // all characters including punctuation and space
        sentenceCount: 1,      // one sentence
        paragraphCount: 1,     // one paragraph
      });
    });

    it('should analyze complex multi-paragraph text', () => {
      const text = `First paragraph with multiple sentences. This is sentence two! And a question?

Second paragraph here.

Third paragraph with numbers 123 and symbols @#$.`;
      
      const result = analyzer.analyzeText(text);
      expect(result).toEqual({
        wordCount: 22,         // Total words across all paragraphs
        letterCount: 118,      // Only a-z, A-Z characters
        characterCount: 153,   // All characters including spaces, punctuation, numbers
        sentenceCount: 5,      // Five sentences total
        paragraphCount: 3,     // Three paragraphs
      });
    });

    it('should handle text with emojis and unicode', () => {
      const result = analyzer.analyzeText('Hello 🚀 world! 你好');
      expect(result).toEqual({
        wordCount: 3,          // "Hello", "world", "你好"
        letterCount: 10,       // Only H-e-l-l-o-w-o-r-l-d (excludes 你好)
        characterCount: 17,    // All characters including emoji and Chinese
        sentenceCount: 2,      // Two sentences (split after "!")
        paragraphCount: 1,     // One paragraph
      });
    });

    it('should handle text with abbreviations', () => {
      const result = analyzer.analyzeText('Dr. Smith lives on Main St. He is nice.');
      expect(result).toEqual({
        wordCount: 9,          // All words
        letterCount: 28,       // Only alphabetic letters
        characterCount: 39,    // All characters including spaces and punctuation
        sentenceCount: 3,      // "Dr. ", "Smith lives on Main St. ", "He is nice."
        paragraphCount: 1,     // One paragraph
      });
    });

    it('should maintain consistency with individual methods', () => {
      const text = 'Test text for consistency check.\n\nSecond paragraph.';
      const result = analyzer.analyzeText(text);
      
      // Verify each field matches its corresponding method
      expect(result.wordCount).toBe(analyzer.countWords(text));
      expect(result.letterCount).toBe(analyzer.countLetters(text));
      expect(result.characterCount).toBe(analyzer.countCharacters(text));
      expect(result.sentenceCount).toBe(analyzer.countSentences(text));
      expect(result.paragraphCount).toBe(analyzer.countParagraphs(text));
    });
  });
});