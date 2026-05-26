export type CharacterTraits = {
  bodyColor: string;
  maneColor: string;
  eyeColor: string;
  horn: string;
  wings: string;
  tail: string;
  accessory: string;
  species: string;
};

export type ExpressionRule = {
  id: string;
  zh: string;
  en: string;
  count: number;
  text: string;
  rule: string;
};

export const emptyTraits: CharacterTraits = {
  bodyColor: '',
  maneColor: '',
  eyeColor: '',
  horn: '',
  wings: '',
  tail: '',
  accessory: '',
  species: '',
};

export const styleSpec = {
  version: 'V1/V2',
  v1Count: 22,
  v2Count: 3,
  name: 'Loose Chibi Pony Reaction Sticker',
  composition:
    '2A avatar / half-body sticker format. Head, face, mane and clear front pony hooves are the main focus. Body, horn, wings, tail and accessory are secondary and small.',
  linework:
    'Loose dark navy / near-black hand-drawn uneven sketch lines. Casual, slightly wobbly, expressive, not polished or commercial.',
  coloring:
    'Pure flat low-saturation pastel fills only. No shading, no highlights, no gradients, no volume rendering.',
  background: 'Soft plain pastel background, never pure white, no complex decorative background.',
  text: 'Short casual handwritten English reaction text near the character, not covering facial features.',
  hardNegative: [
    'no pixel art',
    'no blocky contours',
    'no stair-step edges',
    'no source-image geometry',
    'no direct tracing or repainting of the pixel source',
    'no full-body side-view illustration',
    'no generic My Little Pony commercial cartoon look',
    'no polished poster illustration',
    'no pure white background',
    'no shadows',
    'no highlights',
    'no gradients',
    'no extra props',
    'no extra character features',
    'no human hands or human arm gestures',
    'no shapeless hoof blobs',
    'front hooves must be clear pony hooves and separated from the face',
  ],
};

export const initialExpressions: ExpressionRule[] = [
  { id: 'laughing', zh: '大笑', en: 'Laughing', count: 1, text: 'LOL!', rule: 'closed crescent smile eyes, big open laughing mouth, soft blush, raised front hooves near chest' },
  { id: 'happy', zh: '开心', en: 'Happy', count: 1, text: 'Yay', rule: 'relaxed closed smile eyes, small warm smile, soft blush' },
  { id: 'cool', zh: '耍帅', en: 'Cool', count: 1, text: 'Cool~', rule: 'half-lidded eyes, side glance, raised brow, confident smirk' },
  { id: 'smug', zh: '得意', en: 'Smug', count: 0, text: 'Heh', rule: 'half-lidded side-eye, asymmetrical smirk, one brow raised' },
  { id: 'speechless', zh: '无语', en: 'Speechless', count: 1, text: '...', rule: 'deadpan half-closed eyes, flat mouth, tired calm expression' },
  { id: 'shocked', zh: '震惊', en: 'Shocked', count: 0, text: 'Oh!', rule: 'big round eyes, tiny pupils, O-mouth, raised brows' },
  { id: 'confused', zh: '疑惑', en: 'Confused', count: 4, text: 'Huh?', rule: 'one brow raised, side glance, small open wry mouth' },
  { id: 'aggrieved', zh: '委屈', en: 'Aggrieved', count: 0, text: 'Why...', rule: 'watery downturned big eyes, small downturned mouth, worried brows' },
  { id: 'shy', zh: '害羞', en: 'Shy', count: 0, text: 'Hehe', rule: 'averted half-closed eyes, small smile, strong blush' },
  { id: 'angry', zh: '生气', en: 'Angry', count: 0, text: 'Hmph', rule: 'narrow eyes, lowered brows, pout or tiny teeth' },
  { id: 'refusing', zh: '拒绝', en: 'Refusing', count: 0, text: 'Nope', rule: 'closed or half-closed eyes, head turned away, small frown' },
  { id: 'inlove', zh: '喜欢', en: 'In-love', count: 0, text: 'Aww', rule: 'soft eyes, visible blush, warm little smile' },
  { id: 'sarcastic', zh: '阴阳怪气', en: 'Sarcastic', count: 0, text: 'Sure~', rule: 'half-lidded side-eye, asymmetric smile' },
  { id: 'proud', zh: '骄傲', en: 'Proud', count: 1, text: 'Yep~', rule: 'raised head, satisfied closed or half-lidded eyes, proud smile' },
  { id: 'playful', zh: '调皮', en: 'Playful', count: 0, text: 'Oops', rule: 'playful wink or sly eyes, cute lively smile' },
  { id: 'surprisedJoy', zh: '惊喜', en: 'Surprised Joy', count: 0, text: 'Wow!', rule: 'wide happy eyes, slightly open smiling mouth, excited pleasant surprise' },
  { id: 'mischievous', zh: '坏笑', en: 'Mischievous', count: 3, text: 'Hehe~', rule: 'half-lidded eyes, one mouth corner raised, cute sly expression' },
  { id: 'thinking', zh: '思考', en: 'Thinking', count: 5, text: 'Hmm...', rule: 'one clear pony hoof near chin, eyes looking aside, focused brows' },
  { id: 'awkward', zh: '尴尬', en: 'Awkward', count: 0, text: 'Ahaha...', rule: 'stiff smile, eyes looking away, blush, withdrawn posture' },
  { id: 'tsundere', zh: '傲娇', en: 'Tsundere', count: 0, text: 'Hmph!', rule: 'head turned away, blush, small pout, secretly caring side-eye' },
];

export function pickLowestCountExpression(list: ExpressionRule[]) {
  const min = Math.min(...list.map((x) => x.count));
  const candidates = list.filter((x) => x.count === min);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const extractionRulesText = `
Pixel-source extraction rules:
1. The uploaded pixel source image is for structured information extraction only. It must never become final visual style, geometry, pose, contour or composition reference.
2. Ignore background color first.
3. Body color: usually the largest non-background color block.
4. Mane/hair: must have both correct position and enough area. Correct regions are head-top, middle-top, upper neck/back-of-neck. If no clear mane block exists, mane/hair color = body color.
5. Horn: judge strongly by position. A small distinct head-top/right-top protruding block is horn even if similar to background, mane, or body. Once classified as horn, it cannot be mane/hair.
6. Wings: require a clearly protruding upper/upper-side body-colored block that reads as a wing. If ambiguous, mark absent/not visible.
7. Tail: requires clear rear/left-lower protruding appendage in tail position. If ambiguous, mark absent/not visible.
8. Eye color: inherit only if a visible single eye-color block is recognizable.
9. Accessory: at most one accessory. Only classify as accessory if it forms clear horse tack such as muzzle/halter/bridle/collar/bell/pendant. Neck or lower internal blocks can be accessory only if the structure is clear; otherwise no accessory.
10. Species: no horn + no wings = pony; horn + no wings = unicorn; no horn + wings = pegasus; horn + wings = alicorn.
`;
