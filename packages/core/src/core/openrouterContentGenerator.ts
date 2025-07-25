/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from 'openai';
import { Config } from '../config/config.js';
import { OpenAIContentGenerator } from './openaiContentGenerator.js';

export class OpenRouterContentGenerator extends OpenAIContentGenerator {
  private preferredProvider?: string;

  constructor(
    apiKey: string,
    model: string,
    config: Config,
    provider?: string,
  ) {
    super(apiKey, model, config);
    this.preferredProvider = provider;

    // Override the OpenAI client with OpenRouter-specific configuration
    const timeoutConfig = {
      timeout: 120000,
      maxRetries: 3,
    };

    // Allow config to override timeout settings
    const contentGeneratorConfig = config.getContentGeneratorConfig();
    if (contentGeneratorConfig?.timeout) {
      timeoutConfig.timeout = contentGeneratorConfig.timeout;
    }
    if (contentGeneratorConfig?.maxRetries !== undefined) {
      timeoutConfig.maxRetries = contentGeneratorConfig.maxRetries;
    }

    // Create a new OpenAI client configured for OpenRouter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: timeoutConfig.timeout,
      maxRetries: timeoutConfig.maxRetries,
      defaultHeaders: this.getOpenRouterHeaders(),
    });
  }

  private getOpenRouterHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'HTTP-Referer': 'https://qwen-code.dev',
      'X-Title': 'Qwen Code',
    };

    // Add preferred provider header if specified
    if (this.preferredProvider) {
      headers['X-OR-Provider'] = this.preferredProvider;
    }

    return headers;
  }
}
