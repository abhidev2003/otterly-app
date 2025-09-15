// src/lib/emotion.ts
import type { Pipeline } from '@xenova/transformers';

class EmotionClassifier {
  private static instance: Pipeline | null = null;

  static async getInstance() {
    if (this.instance === null) {
      try {
        const { pipeline, env } = await import('@xenova/transformers');
        
        // ** THE DEFINITIVE FIX **
        // Disable web workers to prevent bundler conflicts.
        env.allowWebWorkers = false;
        
        this.instance = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
          quantized: true,
        });

      } catch (error) {
        console.error("Failed to load emotion analysis model:", error);
        return null;
      }
    }
    return this.instance;
  }
}

export async function analyzeEmotions(text: string): Promise<{ label: string; score: number }[]> {
  const classifier = await EmotionClassifier.getInstance();
  if (!classifier) {
    return []; 
  }
  const results = await classifier(text, { topk: 5 });
  return results.filter(result => result.score > 0.5) as { label: string; score: number }[];
}