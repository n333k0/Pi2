export enum AppState {
  IDLE = 'IDLE',
  ANIMATING = 'ANIMATING',
  COMPLETE = 'COMPLETE'
}

export interface GeminiResponse {
  text: string;
}
