export interface SEOFormData {
  website_name: string;
  website_url?: string;
  website_description: string;
  page_title: string;
  keywords_links: KeywordLink[];
  additional_prompt?: string;
  content_length: string;
  recipient_email: string;
}

export interface KeywordLink {
  keyword: string;
  link: string;
  frequency: number;
}

export interface KeywordAnalysis {
  keyword: string;
  expected: number;
  actual: number;
  link: string;
  linkFound: boolean;
  linkMatches: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  keywordAnalysis: KeywordAnalysis[];
  summary: {
    totalExpected: number;
    totalActual: number;
    linksExpected: number;
    linksFound: number;
  };
  attempts?: number;
}

export interface ValidationResult {
  success: boolean;
  data?: SEOFormData;
  message?: string;
  errors?: string[];
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface ProcessedResponse {
  success: boolean;
  message: string;
  content?: string;
  original_data?: SEOFormData;
  analysis?: ContentAnalysis;
}

export interface APIResponse {
  success: boolean;
  message: string;
  email?: string;
  error_details?: string;
} 