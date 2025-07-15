/**
 * Performs text analysis operations, such as counting characters, words, and sentences,
 * with proper support for internationalization.
 */
export class TextAnalyzer {
    graphemeSegmenter;
    wordSegmenter;
    sentenceSegmenter;
    /**
     * Initializes the TextAnalyzer for a specific locale.
     * @param locale A BCP 47 language tag, e.g., "en-US" or "ko-KR".
     */
    constructor(locale = 'en-US') {
        // Initialize segmenters for different granularities
        this.graphemeSegmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
        this.wordSegmenter = new Intl.Segmenter(locale, { granularity: 'word' });
        this.sentenceSegmenter = new Intl.Segmenter(locale, { granularity: 'sentence' });
    }
    /**
     * Counts the number of user-perceived characters (grapheme clusters) in a string.
     * @param text The text to analyze.
     * @returns The total number of characters.
     */
    countCharacters(text) {
        if (!text) {
            return 0;
        }
        const segments = this.graphemeSegmenter.segment(text);
        return [...segments].length;
    }
    /**
     * Counts the number of words in a string.
     * @param text The text to analyze.
     * @returns The total number of words.
     */
    countWords(text) {
        if (!text) {
            return 0;
        }
        const segments = this.wordSegmenter.segment(text);
        return [...segments].filter(segment => segment.isWordLike).length;
    }
    /**
     * Counts the number of alphabetic letters (a-z, A-Z) in a string.
     * @param text The text to analyze.
     * @returns The total number of alphabetic letters.
     */
    countLetters(text) {
        if (!text) {
            return 0;
        }
        // Use regex to match only alphabetic characters
        const letters = text.match(/[a-zA-Z]/g);
        return letters ? letters.length : 0;
    }
    /**
     * Counts the number of paragraphs in a string.
     * Paragraphs are defined as text segments separated by double line breaks.
     * @param text The text to analyze.
     * @returns The total number of paragraphs.
     */
    countParagraphs(text) {
        if (!text || text.trim() === '') {
            return 0;
        }
        // Split by double line breaks (handles both \n\n and \r\n\r\n)
        const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/);
        // Filter out empty paragraphs after splitting
        const nonEmptyParagraphs = paragraphs.filter(paragraph => paragraph.trim() !== '');
        return nonEmptyParagraphs.length;
    }
    /**
     * Counts the number of sentences in a string.
     *
     * Note: This method uses Intl.Segmenter with sentence granularity, which follows
     * the Unicode Text Segmentation (UAX #29) standard. This has some limitations:
     * - Abbreviations like "Dr.", "Mr.", "U.S.A." may be treated as sentence boundaries
     * - Ellipses are treated as single sentence boundaries, not multiple
     * - Complex linguistic patterns may not be handled perfectly
     *
     * @param text The text to analyze.
     * @returns The total number of sentences.
     */
    countSentences(text) {
        // Handle empty, null, undefined, or whitespace-only strings
        if (!text || text.trim() === '') {
            return 0;
        }
        // Use the iterator pattern to count segments efficiently
        // Filter out whitespace-only segments to handle newlines properly
        let count = 0;
        for (const segment of this.sentenceSegmenter.segment(text)) {
            if (segment.segment.trim() !== '') {
                count++;
            }
        }
        return count;
    }
    /**
     * Performs comprehensive text analysis, returning counts for all supported metrics.
     * @param text The text to analyze.
     * @returns An object containing all text analysis metrics.
     */
    analyzeText(text) {
        return {
            wordCount: this.countWords(text),
            letterCount: this.countLetters(text),
            characterCount: this.countCharacters(text),
            sentenceCount: this.countSentences(text),
            paragraphCount: this.countParagraphs(text),
        };
    }
}
