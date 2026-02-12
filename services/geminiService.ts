
import { GoogleGenAI, Type } from "@google/genai";
import { 
  CLASSIFIER_SYSTEM_INSTRUCTION, 
  CONFIG_GENERATOR_SYSTEM_INSTRUCTION,
  SECURITY_SYSTEM_INSTRUCTION, 
  HEALER_SYSTEM_INSTRUCTION 
} from "../constants";
import { DetectedStack, SecurityFinding, HealingAnalysis, Configs } from "../types";

// Note: process.env.API_KEY is handled by the platform
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export class GeminiService {
  static async classifyStack(fileList: string[], readmeSnippet: string): Promise<DetectedStack> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Project Files:\n${fileList.join("\n")}\n\nREADME Excerpt:\n${readmeSnippet}`,
      config: {
        systemInstruction: CLASSIFIER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            framework: { type: Type.STRING },
            database: { type: Type.STRING },
            entry_point: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["language", "framework", "database", "entry_point", "confidence", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  static async generateConfigs(stack: DetectedStack): Promise<Configs> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Context: A project using ${stack.language} with ${stack.framework}. Database: ${stack.database}. Entry point: ${stack.entry_point}.`,
      config: {
        systemInstruction: CONFIG_GENERATOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dockerfile: { type: Type.STRING },
            workflow: { type: Type.STRING }
          },
          required: ["dockerfile", "workflow"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  static async scanSecurity(fileContents: { path: string, content: string }[]): Promise<SecurityFinding[]> {
    const ai = getAI();
    const contentStr = fileContents.map(f => `File: ${f.path}\nContent:\n${f.content}`).join("\n\n---\n\n");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Scan these files for secrets and dependencies:\n${contentStr}`,
      config: {
        systemInstruction: SECURITY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["secret", "vulnerability"] },
              severity: { type: Type.STRING, enum: ["critical", "high", "medium", "low"] },
              title: { type: Type.STRING },
              file: { type: Type.STRING },
              line: { type: Type.NUMBER },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ["type", "severity", "title", "file", "description", "recommendation"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  }

  static async analyzeBuildFailure(log: string, stack: DetectedStack): Promise<HealingAnalysis> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Project Context: ${stack.language}/${stack.framework}\n\nFAILED LOG:\n${log}`,
      config: {
        systemInstruction: HEALER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING },
            fixType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            suggestedFix: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                target: { type: Type.STRING },
                change: { type: Type.STRING }
              }
            }
          },
          required: ["rootCause", "fixType", "confidence", "explanation", "suggestedFix"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }
}
