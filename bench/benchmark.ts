#!/usr/bin/env node

import { performance } from 'perf_hooks';
import { TextAnalyzer } from '../src/analyzer/TextAnalyzer.js';

interface BenchmarkResult {
  method: string;
  words: number;
  elapsedMs: number;
  passed: boolean;
  threshold: number;
}

/**
 * Generate realistic text sample with specified word count
 */
function generateTestText(wordCount: number): string {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];
  
  const sentences = [];
  let currentSentence = [];
  let wordsGenerated = 0;
  
  while (wordsGenerated < wordCount) {
    currentSentence.push(words[Math.floor(Math.random() * words.length)]);
    wordsGenerated++;
    
    // End sentence every 8-15 words
    if (currentSentence.length >= 8 && Math.random() < 0.3) {
      sentences.push(currentSentence.join(' ') + '.');
      currentSentence = [];
      
      // Add paragraph break every 3-5 sentences
      if (sentences.length % 4 === 0 && Math.random() < 0.6) {
        sentences.push(''); // Empty line for paragraph break
      }
    }
  }
  
  // Close any remaining sentence
  if (currentSentence.length > 0) {
    sentences.push(currentSentence.join(' ') + '.');
  }
  
  return sentences.join(' ').replace(/ {2,}/g, ' ').trim();
}

/**
 * Benchmark a specific analyzer method
 */
async function benchmarkMethod(
  analyzer: TextAnalyzer,
  methodName: keyof TextAnalyzer,
  text: string,
  threshold: number = 100
): Promise<BenchmarkResult> {
  const method = analyzer[methodName] as (text: string) => number;
  
  // Warm-up run to eliminate JIT cost
  method.call(analyzer, text);
  
  // Timed run
  const start = performance.now();
  method.call(analyzer, text);
  const elapsed = performance.now() - start;
  
  return {
    method: methodName as string,
    words: text.split(/\s+/).length,
    elapsedMs: Math.round(elapsed * 100) / 100,
    passed: elapsed < threshold,
    threshold
  };
}

/**
 * Main benchmark runner
 */
async function main() {
  console.log('🚀 Starting wordcount-mcp performance benchmarks...\n');
  
  // Generate 10,000-word test text
  const testText = generateTestText(10_000);
  const actualWordCount = testText.split(/\s+/).length;
  
  console.log(`📝 Generated test text: ${actualWordCount} words, ${testText.length} characters`);
  console.log(`📊 Performance threshold: <100ms per operation\n`);
  
  const analyzer = new TextAnalyzer();
  const results: BenchmarkResult[] = [];
  
  // Test all 5 methods
  const methods: Array<keyof TextAnalyzer> = [
    'countWords',
    'countLetters', 
    'countCharacters',
    'countSentences',
    'countParagraphs'
  ];
  
  for (const method of methods) {
    try {
      const result = await benchmarkMethod(analyzer, method, testText);
      results.push(result);
      
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.method}: ${result.elapsedMs}ms (threshold: ${result.threshold}ms)`);
    } catch (error) {
      console.error(`❌ ${method}: ERROR - ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
  
  // Summary
  const allPassed = results.every(r => r.passed);
  const avgTime = results.reduce((sum, r) => sum + r.elapsedMs, 0) / results.length;
  const maxTime = Math.max(...results.map(r => r.elapsedMs));
  
  console.log('\n📈 Performance Summary:');
  console.log(`   Average time: ${Math.round(avgTime * 100) / 100}ms`);
  console.log(`   Maximum time: ${maxTime}ms`);
  console.log(`   All tests passed: ${allPassed ? '✅' : '❌'}`);
  
  // Export results as JSON for CI integration
  const output = {
    timestamp: new Date().toISOString(),
    textLength: testText.length,
    wordCount: actualWordCount,
    results,
    summary: {
      allPassed,
      avgTime: Math.round(avgTime * 100) / 100,
      maxTime
    }
  };
  
  console.log('\n📋 JSON Results:');
  console.log(JSON.stringify(output, null, 2));
  
  // Exit with error code if any test failed
  if (!allPassed) {
    console.error('\n❌ Some performance tests failed - see results above');
    process.exitCode = 1;
  } else {
    console.log('\n✅ All performance benchmarks passed!');
  }
}

// Run benchmarks
main().catch(err => {
  console.error('💥 Benchmark failed:', err);
  process.exit(1);
});