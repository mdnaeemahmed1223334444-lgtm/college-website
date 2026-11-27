export type AiProvider = "google" | "custom";

export interface GoogleAiKeyItem {
  id: string;
  name?: string;
  apiKey: string;
  isActive: boolean;
  addedAt: string;
}

export interface EmailAiConfig {
  provider: AiProvider;
  googleKeys: GoogleAiKeyItem[];
  googleModel: string;
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  defaultTone: "institutional" | "urgent" | "celebration" | "clean";
  enabled: boolean;
}

export const defaultEmailAiConfig: EmailAiConfig = {
  provider: "google",
  googleKeys: [],
  googleModel: "gemini-3.8-flash",
  customBaseUrl: "https://api.openai.com/v1",
  customApiKey: "",
  customModel: "gpt-4o-mini",
  defaultTone: "institutional",
  enabled: true,
};
