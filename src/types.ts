/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chatbot {
  id: number;
  name: string;
  avatar: string;
  genre: string;
  tags: string[];
  shortDescription: string;
  backstory: string;
  openScene: string;
  playLink: string;
  author?: string;
  length?: string; // e.g., "Dài", "Vừa", "Ngắn"
  views?: number;
  likes?: number;
}

export interface Feedback {
  id: string;
  name: string;
  content: string;
  timestamp: string;
}
