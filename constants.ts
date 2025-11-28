import { AspectRatio, NicheType } from "./types";

export const ASPECT_RATIO_OPTIONS = [
  { value: AspectRatio.LANDSCAPE_16_9, label: '16:9 (YouTube Standard)', icon: 'crop_16_9' },
  { value: AspectRatio.PORTRAIT_9_16, label: '9:16 (Shorts/Reels)', icon: 'crop_portrait' },
  { value: AspectRatio.SQUARE, label: '1:1 (Square)', icon: 'crop_square' },
  { value: AspectRatio.LANDSCAPE_4_3, label: '4:3 (Classic)', icon: 'crop_landscape' },
  { value: AspectRatio.PORTRAIT_3_4, label: '3:4 (Portrait)', icon: 'crop_portrait' },
];

export const DEFAULT_ASPECT_RATIO = AspectRatio.LANDSCAPE_16_9;

export const NICHE_PRESETS: Record<NicheType, { label: string; icon: string; prompt: string }> = {
  NONE: {
    label: 'Viral / General',
    icon: 'auto_awesome',
    prompt: 'Psychological Trigger: INTRIGUE & AWE. Emotion: The "Mystery Box" feeling. Visuals: High contrast, cinematic lighting, centralized subject. Goal: Evoke a "Must Know" response via visual hyperbole and exaggerated reality.'
  },
  GAMING: {
    label: 'Gaming',
    icon: 'sports_esports',
    prompt: 'Psychological Trigger: ANTICIPATION & ADRENALINE. Emotion: The split-second before victory or defeat. Visuals: Hyper-saturated neon contrast (Hot Pink vs Electric Blue). Subject expression: Extreme focus or screaming victory. Background: Chaos/Explosion but blurred to reduce cognitive load.'
  },
  TECH: {
    label: 'Tech',
    icon: 'devices',
    prompt: 'Psychological Trigger: DESIRE & FUTURISM. Emotion: "I need this" (Anticipation of Ownership). Visuals: Sleek, matte black/white, glowing accents. Lighting: Hard rim light to separate product from background. Vibe: Premium, exclusive, game-changing.'
  },
  VLOG: {
    label: 'Vlog',
    icon: 'videocam',
    prompt: 'Psychological Trigger: NOSTALGIA & INTIMACY. Emotion: Warmth, connection, or raw drama. Visuals: Golden hour lighting, subtle film grain, close-up faces. Vibe: Unfiltered access to a life event.'
  },
  EDUCATION: {
    label: 'Docu/Edu',
    icon: 'school',
    prompt: 'Psychological Trigger: INTELLECTUAL INTRIGUE. Emotion: "Everything I knew is wrong". Visuals: Split contrast (Light vs Dark), historical textures, mystery elements (question marks, magnifying glasses). Vibe: Detective story.'
  },
  FINANCE: {
    label: 'Finance',
    icon: 'attach_money',
    prompt: 'Psychological Trigger: GREED & FEAR (Anticipation of Loss/Gain). Emotion: Urgency. Visuals: Red downward arrows (Fear) or Green stacks (Greed). Facial expression: Serious concern or wild excitement. Color Palette: Trustworthy Navy Blue mixed with Urgent Red/Green.'
  },
  FITNESS: {
    label: 'Fitness',
    icon: 'fitness_center',
    prompt: 'Psychological Trigger: ASPIRATION & PAIN. Emotion: The struggle and the glory. Visuals: Gritty texture, sweat, dramatic "Rembrandt" lighting to sculpt muscle. Vibe: Hard work pays off.'
  },
  REACTION: {
    label: 'Reaction',
    icon: 'face',
    prompt: 'Psychological Trigger: SHOCK & MIRRORING. Emotion: Disbelief. Visuals: Extreme facial close-up (pores visible), eyes wide, mouth open. Background: Blurred screenshot of the content. Colors: Maximum saturation, thick white outlines.'
  }
};