/**
 * Utility functions for text processing and formatting
 */

// Words that should not be capitalized in titles (articles, prepositions, conjunctions)
const LOWERCASE_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 
  'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'from', 'into', 'onto', 
  'upon', 'over', 'under', 'above', 'below', 'across', 'through', 'during', 
  'before', 'after', 'until', 'while', 'since'
]);

/**
 * Converts a string to proper title case
 * Capitalizes important words while keeping articles, prepositions, and conjunctions lowercase
 * Always capitalizes the first and last word regardless of type
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  
  const words = str.toLowerCase().split(/\s+/);
  
  return words.map((word, index) => {
    // Always capitalize first and last word
    if (index === 0 || index === words.length - 1) {
      return capitalizeWord(word);
    }
    
    // Check if word should remain lowercase
    if (LOWERCASE_WORDS.has(word)) {
      return word;
    }
    
    return capitalizeWord(word);
  }).join(' ');
}

/**
 * Capitalizes the first letter of a word
 */
function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Generates a random set of podcast topic suggestions
 * Returns 6 topics each time, randomly selected from a larger pool
 */
export function getRandomTopicSuggestions(): string[] {
  const allTopics = [
    'Future of Artificial Intelligence',
    'Climate Change Solutions',
    'Space Exploration',
    'Mental Health Awareness',
    'Renewable Energy',
    'Digital Privacy Rights',
    'Ocean Conservation',
    'Quantum Computing',
    'Gene Therapy Advances',
    'Virtual Reality Evolution',
    'Sustainable Agriculture',
    'Cryptocurrency Impact',
    'Brain-Computer Interfaces',
    'Mars Colonization',
    'Social Media Psychology',
    'Electric Vehicle Revolution',
    'Personalized Medicine',
    'Smart City Development',
    'Biodiversity Crisis',
    'Automation and Jobs',
    'Nuclear Fusion Energy',
    'Memory Enhancement',
    'Vertical Farming',
    'Deepfake Technology',
    'Longevity Research',
    'Microplastic Pollution',
    'Augmented Reality',
    'Carbon Capture Methods',
    'Synthetic Biology',
    'Digital Detox Benefits'
  ];
  
  // Shuffle array and take first 6 items
  const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

/**
 * Generates a summary of a podcast script using OpenAI
 */
export async function generateSummary(script: string, topic: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ script, topic }),
    });

    if (!response.ok) {
      let errorMessage = `Summary generation failed: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.summary) {
      throw new Error('No summary generated');
    }

    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return a fallback summary if API fails
    return `A fascinating discussion between Alex and Evan exploring ${topic.toLowerCase()}. The hosts dive deep into the topic, sharing insights and perspectives that make complex ideas accessible and engaging.`;
  }
}