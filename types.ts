export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_16_9 = '16:9',
  PORTRAIT_3_4 = '3:4',
  PORTRAIT_9_16 = '9:16',
}

export type NicheType = 'NONE' | 'GAMING' | 'TECH' | 'VLOG' | 'EDUCATION' | 'FINANCE' | 'FITNESS' | 'REACTION';

export interface GeneratedImage {
  id: string;
  url: string; // Data URL
  prompt: string;
  timestamp: number;
  aspectRatio: AspectRatio;
  niche?: NicheType;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  ERROR = 'ERROR',
}