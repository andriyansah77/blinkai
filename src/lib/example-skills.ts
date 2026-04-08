// Example skills that can be created
export const EXAMPLE_SKILLS = [
  {
    name: "Web Scraper",
    description: "Extract content from web pages",
    category: "web",
    tags: ["scraping", "web", "data"],
    code: `
async function webScraper(params) {
  const { url, selector } = params;
  
  try {
    // In a real implementation, this would use a web scraping library
    const response = await fetch(url);
    const html = await response.text();
    
    // Simple text extraction (in production, use proper DOM parsing)
    const content = html.match(/<title>(.*?)<\/title>/)?.[1] || "No title found";
    
    return {
      success: true,
      url,
      content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

return webScraper(params);
    `
  },
  {
    name: "Data Analyzer",
    description: "Analyze and summarize data sets",
    category: "analysis",
    tags: ["data", "analysis", "statistics"],
    code: `
async function dataAnalyzer(params) {
  const { data, analysisType } = params;
  
  if (!Array.isArray(data)) {
    return { success: false, error: "Data must be an array" };
  }
  
  const results = {};
  
  if (analysisType === 'statistics' || !analysisType) {
    const numbers = data.filter(item => typeof item === 'number');
    if (numbers.length > 0) {
      results.statistics = {
        count: numbers.length,
        sum: numbers.reduce((a, b) => a + b, 0),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers)
      };
    }
  }
  
  if (analysisType === 'frequency' || !analysisType) {
    const frequency = {};
    data.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });
    results.frequency = frequency;
  }
  
  return {
    success: true,
    results,
    dataSize: data.length,
    timestamp: new Date().toISOString()
  };
}

return dataAnalyzer(params);
    `
  },
  {
    name: "Text Processor",
    description: "Process and transform text content",
    category: "text",
    tags: ["text", "processing", "nlp"],
    code: `
async function textProcessor(params) {
  const { text, operation } = params;
  
  if (!text) {
    return { success: false, error: "Text is required" };
  }
  
  const results = {};
  
  switch (operation) {
    case 'analyze':
      results.analysis = {
        length: text.length,
        words: text.split(/\\s+/).length,
        sentences: text.split(/[.!?]+/).length - 1,
        paragraphs: text.split(/\\n\\s*\\n/).length
      };
      break;
      
    case 'clean':
      results.cleaned = text
        .replace(/\\s+/g, ' ')
        .replace(/[^\\w\\s.,!?-]/g, '')
        .trim();
      break;
      
    case 'extract_emails':
      const emailRegex = /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g;
      results.emails = text.match(emailRegex) || [];
      break;
      
    case 'extract_urls':
      const urlRegex = /https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/g;
      results.urls = text.match(urlRegex) || [];
      break;
      
    default:
      results.original = text;
  }
  
  return {
    success: true,
    operation,
    results,
    timestamp: new Date().toISOString()
  };
}

return textProcessor(params);
    `
  }
];