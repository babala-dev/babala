import { CharacterTraits, ExpressionRule, styleSpec } from './rules';

export function buildImagePrompt(traits: CharacterTraits, expression: ExpressionRule) {
  return `Generate exactly ONE new chibi pony reaction sticker. Use ONLY the structured character traits below. Do NOT use any uploaded pixel source image as visual, style, pose, contour, geometry, or composition reference. The pixel source has already been converted into text traits; discard all pixel-image geometry.

CHARACTER TRAITS FROM CURRENT PIXEL SOURCE:
- Body color: ${traits.bodyColor || '[missing]'}
- Mane/hair color: ${traits.maneColor || '[missing]'}
- Eye color: ${traits.eyeColor || '[missing]'}
- Horn: ${traits.horn || '[missing]'}
- Wings: ${traits.wings || '[missing]'}
- Tail: ${traits.tail || '[missing]'}
- Accessory: ${traits.accessory || '[missing]'}
- Species: ${traits.species || '[missing]'}

EXPRESSION:
- Expression: ${expression.zh} / ${expression.en}
- Expression rule: ${expression.rule}
- Handwritten English reaction text: ${expression.text}

STYLE LIBRARY ${styleSpec.version}: ${styleSpec.name}
- Composition: ${styleSpec.composition}
- Linework: ${styleSpec.linework}
- Coloring: ${styleSpec.coloring}
- Background: ${styleSpec.background}
- Text: ${styleSpec.text}

ABSOLUTE CONSTRAINTS:
- Final output must be a 2A avatar / half-body chibi pony reaction sticker.
- Head, face, mane and clear pony front hooves are the main focus.
- Horn, wings, tail and accessory are secondary and should not dominate.
- Pure flat colors only. No shading, no highlights, no gradients.
- Use muted low-saturation pastel versions of extracted colors, never change hue.
- Front hooves must look like clear pony hooves, not hands, fists, blobs, or merged lumps.
- Add the short handwritten text "${expression.text}" near the character without covering the face.

HARD NEGATIVE CONSTRAINTS: ${styleSpec.hardNegative.join('; ')}.`;
}
