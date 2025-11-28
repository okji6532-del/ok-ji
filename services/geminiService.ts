import { GoogleGenAI } from "@google/genai";
import { AspectRatio, NicheType } from "../types";
import { NICHE_PRESETS } from "../constants";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * STRATEGIST AGENT: Converts a simple title (e.g., "I spent 24h...") into a visual scene.
 */
const enhancePromptWithIdeas = async (userInput: string, niche: NicheType): Promise<string> => {
  try {
    const prompt = `
      You are a world-class YouTube thumbnail designer and behavioral psychologist.
      Your job is to generate ultra-clickable, high-CTR thumbnails based on the user’s prompt.
      You understand color psychology, emotional triggers, thumbnail composition, view-flow direction, and YouTube algorithm signals.

      ✔ OUTPUT REQUIREMENTS
      1. Always generate thumbnails that:
      Immediately capture attention within 0.2 seconds
      Translate clearly even when small
      Have a strong subject and center of focus
      Use clear, dramatic storytelling in one frame
      Work for global audiences
      Are optimized for mobile first (70% YouTube traffic)

      ✔ COLOR + PSYCHOLOGY RULES
      Use color intentionally:
      Red → urgency, danger, excitement
      Yellow → attention-grabbing, curiosity
      Blue → trust, technology, professionalism
      Orange → energy, action
      Black/Gold → luxury, premium storytelling
      White → clarity, contrast
      Always keep high contrast between subject & background.

      ✔ DESIGN PRINCIPLES YOU MUST APPLY
      Large face expressions (surprise, confusion, shock)
      Big typography with fewer than 3 words
      Diagonal composition to guide the eye
      Strong foreground + blurred background depth
      Rim lighting around subjects
      Clear emotion or tension
      No clutter — remove unnecessary objects
      Bold storytelling with 1–3 visual elements only

      ✔ THUMBNAIL PSYCHOLOGY RULES
      Every generated thumbnail must follow these psychological triggers:
      1. Curiosity Gap – Show something surprising or incomplete. Make viewers ask: "What’s happening here?"
      2. Tension – Conflict, danger, or impossible moment
      3. Human Emotion – Dramatic facial expressions, Eye contact with camera
      4. Pattern Break – Unexpected colors, Strange objects, Unusual sizes
      5. Simplicity – One idea, one story, one emotional hook

      EMOTIONAL & PSYCHOLOGICAL LAYERS (Must Include):
      - Identify the primary emotional hook based on the niche (e.g., Anticipation for Gaming, Nostalgia for Vlogs, Intrigue for Edu).
      - Describe lighting and composition that amplifies this emotion (e.g., "Golden Hour" for Nostalgia, "Hard Shadows" for Intrigue).
      - If the title implies a journey, focus on the "Transformation" or "Result".

      CONTEXT:
      - Niche: ${NICHE_PRESETS[niche].label}
      - Input: "${userInput}"

      ✔ STRUCTURED OUTPUT FORMAT
      Always output in this structure:

      [THUMBNAIL PROMPT]

      MAIN SUBJECT:
      Describe the main subject, pose, facial expression, angle.

      BACKGROUND:
      Describe colors, environment, mood, depth, blur style.

      LIGHTING:
      Describe cinematic lighting style and color grading.

      COLORS:
      Specify dominant colors + psychology reasons.

      TEXT STYLE:
      What text appears? (max 3 words). What font style? What placement?

      EMOTION:
      What feeling should the viewer get instantly?

      COMPOSITION:
      Describe depth, foreground, midground, background, and focal point.

      STYLE:
      Hyper-realistic, 8K, sharp, high dynamic range, extreme clarity.

      SPECIAL EFFECTS:
      Glow, rim light, particles, tension elements, arrows, highlights, etc.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.7, // Allow creativity for brainstorming
      }
    });

    const enhancedPrompt = response.text?.trim();
    return enhancedPrompt || userInput;

  } catch (error) {
    console.warn("Prompt enhancement failed, using original input:", error);
    return userInput;
  }
};

/**
 * Construct the technical prompt based on the enhanced visual concept and niche presets.
 */
const constructPrompt = (visualConcept: string, niche: NicheType, learnedStyle?: string): string => {
    const nicheRules = NICHE_PRESETS[niche].prompt;
    
    let styleInstruction = `
    PSYCHOLOGICAL FRAMEWORK:
    ${nicheRules}
    `;
    
    // If the user "trained" the AI, override/enhance the niche rules with the learned style
    if (learnedStyle) {
      styleInstruction += `
      
      VISUAL DNA OVERRIDE (STYLE MATCHING):
      Blend the scene described below with this specific artistic style:
      "${learnedStyle}"
      `;
    }

    return `
      You are a Master Digital Artist and 3D Renderer (Unreal Engine 5).
      
      YOUR TASK:
      Generate a high-CTR YouTube thumbnail based on this structured brief.
      
      ${styleInstruction}

      VISUAL BRIEF: 
      "${visualConcept}"
      
      CRITICAL RENDER RULES:
      1. COMPOSITION: Center the action. Ensure clear silhouette separation.
      2. LIGHTING: Use "Rim Lighting" (Backlight) to pop the subject off the background. 
      3. COLOR: High saturation, complementary colors.
      4. CLARITY: No blurry text. If text is implied in the prompt (like a score), render it clearly, otherwise avoid text.
      5. FACE: If a face is present, the eyes must be sharp, focused, and expressive.
      
      Technical Specs: 8K resolution, ray-tracing, hyper-detailed textures.
    `.trim();
};

/**
 * Analyzes a set of reference images to extract a style description.
 */
export const extractStyleFromReferences = async (base64Images: string[]): Promise<string> => {
  try {
    const parts = base64Images.map(img => {
      const cleanBase64 = img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const mimeType = img.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';
      return { inlineData: { data: cleanBase64, mimeType } };
    });

    const promptText = `
      Act as a Lead Technical Artist and Director of Photography.
      Analyze these reference images to reverse-engineer their exact visual formula (Visual DNA).
      
      I need a highly technical configuration string to reproduce this style.
      
      Analyze:
      1. Render Engine & Aesthetic
      2. Lighting Setup (Softbox, Hard Rim, God Rays)
      3. Color Palette & Grading (Teal/Orange, Desaturated, Neon)
      4. Camera & Lens (Focal length, Depth of Field)
      5. Textures (Grain, Gloss, Matte)
      6. Composition (Rule of Thirds, Symmetry)

      Output ONLY the raw comma-separated keywords.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...parts, { text: promptText }]
      },
      config: {
        temperature: 0.1,
      }
    });

    return response.text || "High quality, professional style, cinematic lighting, 8k resolution.";
  } catch (error) {
    console.error("Error analyzing style:", error);
    throw new Error("Failed to analyze reference images.");
  }
};

/**
 * Generates a thumbnail using Gemini/Imagen.
 */
export const generateThumbnailImage = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  niche: NicheType,
  referenceImage?: string | null,
  learnedStyle?: string
): Promise<string> => {
  try {
    // STEP 1: BRAINSTORM VISUAL CONCEPT
    // We send the user's raw input (which might just be a title) to Gemini to get a visual description.
    const visualConcept = await enhancePromptWithIdeas(prompt, niche);

    // STEP 2: BUILD TECHNICAL PROMPT
    const finalPrompt = constructPrompt(visualConcept, niche, learnedStyle);

    // STRATEGY 1: Face/Reference Image Provided -> Use Gemini 2.5 Flash Image
    if (referenceImage) {
       const cleanBase64 = referenceImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
       const mimeType = referenceImage.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';
       
       const faceSwapPrompt = `
       ${finalPrompt}
       
       CRITICAL INSTRUCTION (IDENTITY TRANSFER): 
       The image MUST feature a person as the main subject. 
       Swap the face of this person with the face provided in the input image.
       The result must be a seamless, photorealistic face swap with matching lighting and skin tone.
       `;

       const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: cleanBase64, mimeType: mimeType } },
              { text: faceSwapPrompt },
            ],
          },
          config: { imageConfig: { aspectRatio: aspectRatio } },
       });

       const parts = response.candidates?.[0]?.content?.parts || [];
       const imagePart = parts.find(p => p.inlineData);

       if (imagePart && imagePart.inlineData) {
           return `data:image/png;base64,${imagePart.inlineData.data}`;
       }
       throw new Error("No image generated from face input.");
    }

    // STRATEGY 2: Text (and optionally Learned Style) -> Use Imagen 4.0
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images generated.");
    }

    return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;

  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};

/**
 * Edits an existing thumbnail using Gemini 2.5 Flash Image.
 * Supports text-based editing and optional face swapping using a reference image.
 */
export const editThumbnailImage = async (base64Image: string, editPrompt: string, referenceFaceImage?: string | null): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png';

    const parts: any[] = [
        { inlineData: { data: cleanBase64, mimeType: mimeType } }
    ];

    let instruction = `Edit this thumbnail image. Instruction: ${editPrompt}. Maintain the high CTR psychological triggers.`;

    if (referenceFaceImage) {
        const faceBase64 = referenceFaceImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
        const faceMime = referenceFaceImage.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';
        
        parts.push({ inlineData: { data: faceBase64, mimeType: faceMime } });
        
        instruction += `
        CRITICAL FACE SWAP INSTRUCTION:
        Swap the face of the main subject in the image with the face provided in the second reference image.
        Ensure seamless integration, matching lighting, skin tone, and angle.
        `;
    }

    parts.push({ text: instruction });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = responseParts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Error editing thumbnail:", error);
    throw error;
  }
};