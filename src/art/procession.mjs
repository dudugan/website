// The loader: nine right-facing beings walking in a March of Progress line —
// raven, caveman, jumping spider, boy, dolphin, pequeniño, robot, Homo naledi, elephant.
//
// Drawn as bone-white ink on black. Two things make it feel hand-drawn:
//   - line boil: a displacement filter whose noise seed flips ~7 times a second, the
//     shimmer of redrawn frames in early hand animation (McCay);
//   - one small gesture per figure, passing down the line as a wave, each settling back.
// One loop is 3.6 s.
//
// Each figure is drawn in its own coordinates: feet on y = 0, facing +x.
// Build-time only: this module exports an SVG string that is inlined into the layout.

const GROUND = 245;

// Drawing vocabulary.
const shape = (d) => `<path class="o" d="${d}"/>`; //  outlined, filled with the background
const line = (d) => `<path class="l" d="${d}"/>`; //   ink line
const hatch = (d) => `<path class="h" d="${d}"/>`; //  thin ink line: texture, hatching
const thick = (d) => `<path class="l k" d="${d}"/>`; // heavier ink line
const fill = (d) => `<path class="f" d="${d}"/>`; //   background fill, no outline (hides lines behind)
const dot = (x, y, r) => `<circle class="s" cx="${x}" cy="${y}" r="${r}"/>`;
const ring = (x, y, r) => `<circle class="o" cx="${x}" cy="${y}" r="${r}"/>`;
// A limb: an ink stroke with a narrower background stroke inside it, so it reads as an outline.
const tube = (d, w) => `<path class="t" style="--w:${w}" d="${d}"/><path class="ti" style="--w:${w}" d="${d}"/>`;
const part = (cls, ...body) => `<g class="part ${cls}">${body.join('')}</g>`;

const figure = (i, x, cls, ...body) =>
  `<g transform="translate(${x} ${GROUND})"><g class="fig ${cls}" style="--i:${i}">${body.join('')}</g></g>`;

// ---------- 1. raven ----------
const raven = [
  line('M-2,-18 L-4,-2 M-4,-2 L3,0 M-4,-2 L1,1 M-4,-2 L-10,-1'),
  line('M6,-19 L7,-2 M7,-2 L14,0 M7,-2 L12,1 M7,-2 L1,-1'),
  shape(
    'M24,-70 C20,-76 10,-78 4,-73 C-2,-68 -6,-60 -10,-52 C-16,-42 -26,-32 -36,-24 L-52,-14 L-48,-9 ' +
      'C-38,-12 -28,-14 -20,-16 C-10,-17 0,-16 8,-19 C16,-24 20,-34 20,-44 ' +
      'L23,-47 L19,-50 L24,-53 L21,-56 L25,-59 L24,-61 Z',
  ),
  shape('M10,-50 C0,-50 -12,-42 -22,-33 C-30,-26 -40,-19 -50,-12 C-38,-15 -26,-17 -14,-22 C-2,-27 8,-36 10,-50 Z'),
  hatch('M-8,-30 C-20,-24 -32,-19 -44,-14 M-2,-36 C-14,-30 -26,-23 -38,-17 M4,-42 C-4,-38 -10,-34 -16,-30'),
  hatch('M2,-60 C-2,-56 -4,-52 -6,-48 M8,-64 C4,-60 2,-56 0,-52 M14,-40 C12,-34 10,-28 6,-24'),
  shape(
    'M23,-70 C31,-71.5 40,-68 46,-61.5 C46.5,-60 45.5,-58.5 44.5,-58.5 C44,-59.5 43,-60 41,-60 C35,-60 29,-60 23,-60.5 Z',
  ),
  line('M25,-64.5 C31,-64 36,-63 42,-61'),
  hatch('M24,-68 L30,-67.5'),
  dot(16, -66, 1.9),
];

// ---------- 2. caveman ----------
const caveman = [
  tube('M-3,-140 C-10,-124 -15,-110 -13,-94', 9),
  ring(-13, -91, 4.5),
  tube('M1,-90 C-1,-68 -6,-42 -13,-13 L-3,-4', 11),
  tube('M12,-90 C18,-66 25,-40 29,-9 L42,-7', 11),
  shape(
    'M-10,-146 C0,-152 16,-152 26,-144 C31,-126 28,-104 24,-80 L19,-74 L15,-80 L10,-73 L5,-80 L0,-74 L-4,-80 L-9,-75 ' +
      'C-12,-100 -15,-128 -10,-146 Z',
  ),
  hatch('M-3,-132 l3,4 M8,-124 l3,4 M-5,-112 l3,4 M12,-104 l3,4 M16,-132 l3,4 M3,-98 l3,4 M20,-116 l3,4 M-7,-96 l3,4'),
  part(
    'nod',
    shape(
      'M4,-150 C-2,-160 -2,-176 8,-182 C16,-187 26,-183 28,-175 L31,-171 L28,-168 C30,-165 33,-162 32,-159 ' +
        'C31,-157 29,-157 28,-156 C28,-150 24,-146 16,-146 C10,-146 6,-148 4,-150 Z',
    ),
    shape(
      'M29,-177 L31,-181 L26,-182 L27,-187 L21,-186 L19,-191 L14,-188 L10,-192 L7,-188 L1,-190 L0,-185 L-6,-185 ' +
        'L-5,-180 L-10,-177 L-8,-172 L-12,-168 L-9,-164 L-12,-160 L-7,-158 L-10,-152 L-4,-153 L-2,-147 L2,-154 ' +
        'C2,-164 6,-172 14,-176 C20,-178 25,-178 29,-177 Z',
    ),
    shape(
      'M29,-157 C30,-151 29,-146 26,-140 L23,-143 L20,-137 L17,-142 L13,-138 L11,-144 C8,-146 7,-150 8,-153 ' +
        'C14,-151 22,-153 29,-157 Z',
    ),
    line('M19,-172.5 L30,-172'),
    dot(24.5, -168.5, 1.6),
  ),
  shape(
    'M25.4,-101 C29,-90 31,-80 34.3,-71.2 C36,-64 37.5,-56 39.1,-49 C40,-42 47,-38 51,-40 C56,-42 59,-49 54.9,-55 ' +
      'C51,-62 47,-68 43.7,-74.8 C39,-84 34,-94 30.6,-103 C29.5,-104.5 26.5,-104 25.4,-101 Z',
  ),
  hatch('M40,-62 l3,1 M46,-53 l2,2 M37,-79 l2,1 M50,-46 l2,-1'),
  tube('M17,-138 C22,-122 26,-110 30,-98', 9),
  ring(31, -95, 5),
];

// ---------- 3. jumping spider ----------
const spider = [
  hatch('M2,-24 L12,-40 L22,-12 M-6,-24 L-16,-40 L-28,-10 M26,-26 C34,-40 42,-40 47,-34'),
  shape('M-12,-30 C-14,-42 -30,-50 -42,-42 C-52,-35 -50,-19 -38,-15 C-26,-11 -12,-18 -12,-30 Z'),
  hatch('M-18,-43 C-26,-36 -34,-32 -47,-32 M-20,-24 l-3,-2 M-44,-24 l-3,1'),
  dot(-28, -37, 2.3),
  dot(-36, -25, 1.9),
  dot(-22, -22, 1.6),
  thick('M-6,-24 C-14,-38 -22,-42 -27,-38 C-33,-27 -39,-12 -45,-1'),
  thick('M0,-24 C-4,-38 -10,-44 -15,-40 C-19,-29 -23,-14 -25,-1'),
  thick('M8,-24 C12,-38 20,-44 25,-40 C29,-29 31,-14 31,-1'),
  hatch('M-20,-40 l-1,-3 M-31,-24 l-3,-1 M-10,-41 l-1,-3 M-20,-22 l-3,-1 M18,-41 l1,-3 M28,-22 l3,-1'),
  shape('M-14,-26 C-16,-38 -10,-50 4,-52 C16,-54 26,-50 32,-44 C36,-38 36,-28 32,-22 C22,-18 2,-18 -14,-26 Z'),
  hatch('M-8,-44 l-2,-3 M-2,-48 l-1,-3 M-12,-34 l-3,-1 M-6,-24 l-1,3 M4,-22 l0,3'),
  dot(4, -46, 1.6),
  dot(12, -48, 1.5),
  dot(12, -40, 2),
  tube('M18,-26 L22,-19 L21,-14', 2.6),
  tube('M28,-26 L32,-20 L31,-15', 2.6),
  hatch('M17,-17 l-2,1 M24,-16 l2,1 M29,-18 l-2,1 M34,-17 l2,1'),
  tube('M22,-24 C30,-34 38,-34 42,-28 C46,-20 46,-10 46,-1', 3.2),
  hatch('M32,-33 l0,-3 M39,-32 l2,-2 M44,-22 l3,0 M45,-12 l3,0'),
  ring(31, -36.5, 5.6),
  ring(21, -36, 6.8),
  dot(18.8, -38.6, 2),
  dot(29.4, -39, 1.5),
];

// ---------- 4. boy ----------
const boy = [
  tube('M9,-94 C14,-84 18,-76 23,-68', 5.5),
  ring(24, -66, 3),
  tube('M-1,-54 C-4,-40 -7,-28 -11,-13', 6.5),
  shape('M-16,-15 C-18,-9 -12,-5 -3,-6 C-1,-8 -3,-12 -8,-14 C-11,-16 -14,-16 -16,-15 Z'),
  tube('M8,-54 C11,-40 15,-26 17,-10', 6.5),
  shape('M12,-9 C12,-3 16,-1 27,-1 C29,-3 27,-7 22,-8 C19,-10 15,-11 12,-9 Z'),
  line('M-10,-26 L-3,-25 M11,-25 L18,-26'),
  shape('M-10,-68 C-2,-70 10,-70 17,-67 C18,-60 19,-54 18,-49 L10,-48 L6,-56 L2,-48 L-9,-49 C-10,-56 -11,-62 -10,-68 Z'),
  shape('M-8,-98 C-2,-102 10,-102 15,-98 C19,-88 19,-76 17,-66 C8,-63 -2,-63 -9,-66 C-11,-76 -11,-88 -8,-98 Z'),
  hatch('M-9,-90 C0,-89 10,-89 18,-90 M-10,-82 C0,-81 10,-81 18.5,-82 M-10,-74 C0,-73 10,-73 18,-74'),
  shape('M-8,-112 C-10,-124 -2,-133 8,-132 C17,-131 22,-124 21,-117 L24,-114 L21,-112 C21,-106 16,-101 8,-101 C0,-101 -6,-105 -8,-112 Z'),
  shape('M-9,-114 C-11,-126 -3,-135 8,-134 C16,-134 21,-129 22,-122 C18,-124 14,-125 10,-124 L8,-128 L6,-123 C2,-122 -2,-118 -4,-112 Z'),
  line('M2,-134 C0,-139 4,-141 6,-138'),
  line('M-1,-117 C-4,-117 -4,-110 -1,-110'),
  dot(15, -117, 1.5),
  line('M17,-107 C18,-106 19,-106 20,-107'),
  tube('M4,-95 C0,-86 -4,-78 -9,-71', 5.5),
  ring(-10, -69, 3),
];

// ---------- 5. dolphin, mid-leap ----------
const dolphin = [
  line('M-96,-1 C-86,-4 -78,-4 -70,-1 C-62,2 -54,2 -46,-1 M-30,-1 C-22,-4 -14,-4 -6,-1 C2,2 10,2 18,-1 M34,-1 C42,-4 50,-4 58,-1 C66,2 74,2 82,-1'),
  line('M-78,-4 C-74,-10 -66,-11 -62,-5'),
  shape('M-66,-16 C-64.5,-19 -64,-21 -63.5,-23 C-62.5,-21 -62,-19 -62,-16.5 C-62,-15 -63,-14 -64,-14 C-65.5,-14 -66,-15 -66,-16 Z'),
  shape('M-75,-22 C-74,-25 -73.5,-26 -73,-28 C-72,-26 -71.5,-24 -71.5,-22 C-71.5,-20.5 -72.5,-20 -73.3,-20 C-74.3,-20 -75,-21 -75,-22 Z'),
  shape('M-56,-12 C-55,-14 -54.6,-15 -54.3,-16.5 C-53.5,-15 -53.2,-14 -53.2,-12.5 C-53.2,-11.5 -53.8,-11 -54.6,-11 C-55.5,-11 -56,-11.5 -56,-12 Z'),
  part(
    'arc',
    shape('M-53,-49 C-60,-52 -70,-54 -79,-53 C-73,-48 -69,-44 -65,-42 C-65,-36 -64,-31 -63,-26 C-59,-34 -55,-42 -51,-45 Z'),
    shape('M14,-106 C10,-116 2,-124 -12,-128 C-10,-118 -12,-110 -16,-101 Z'),
    shape(
      'M66,-72 C62,-74 58,-76 55,-77 C53,-84 49,-92 40,-98 C30,-104 16,-108 2,-107 C-12,-105 -26,-96 -36,-84 ' +
        'C-44,-74 -50,-62 -56,-52 L-51,-44 C-44,-52 -36,-62 -26,-68 C-12,-76 6,-78 22,-74 C34,-71 44,-68 52,-68 ' +
        'C58,-68 63,-70 66,-72 Z',
    ),
    hatch('M44,-79 C30,-84 12,-86 -6,-84 C-22,-80 -34,-70 -44,-57'),
    hatch('M34,-96 l-2,5 M24,-100 l-2,5 M14,-101 l-2,5 M4,-101 l-2,5 M-6,-99 l-2,5 M-16,-95 l-2,5 M-26,-88 l-2,5 M-34,-79 l-2,5 M-41,-69 l-2,5'),
    shape('M32,-74 C28,-66 22,-60 14,-56 C22,-58 30,-62 38,-70 Z'),
    line('M65,-72 C60,-73 54,-73.5 48,-75'),
    hatch('M30,-104 l3,1'),
    dot(46, -82, 1.7),
  ),
];

// ---------- 6. pequeniño (Speaker for the Dead) ----------
const pequenino = [
  tube('M4,-82 C-2,-72 -6,-64 -9,-56', 6),
  ring(-10, -54, 3),
  tube('M-3,-44 C-6,-32 -9,-20 -12,-8 L-4,-4', 8),
  tube('M7,-44 C10,-32 12,-20 14,-8 L23,-5', 8),
  shape('M-10,-84 C-4,-90 10,-90 16,-84 C21,-72 20,-56 15,-42 C6,-38 -4,-38 -9,-42 C-14,-56 -15,-72 -10,-84 Z'),
  line('M-11,-80 L-15,-78 L-12,-74 L-16,-71 L-13,-67 L-17,-63 L-13,-60 L-16,-56 L-12,-53'),
  hatch('M0,-74 l2,3 M8,-66 l2,3 M2,-58 l2,3 M10,-52 l2,3 M-4,-64 l2,3'),
  tube('M28,-104 C27,-70 25,-36 24,-1', 3),
  line('M27.5,-94 C31,-98 34,-100 37,-100'),
  shape('M36,-100 C40,-104 44,-102 44,-99 C41,-97 38,-98 36,-100 Z'),
  shape('M28,-104 C27,-110 30,-114 33,-113 C33,-109 31,-106 28,-104 Z'),
  part('ears', shape('M0,-113 C-2,-121 -1,-127 2,-131 C5,-125 7,-119 6,-114 Z'), hatch('M2,-126 L3,-117')),
  shape(
    'M-6,-92 C-10,-104 -4,-116 8,-117 C16,-118 22,-112 23,-106 C26,-106 30,-106 33,-104 C35,-100 34,-96 31,-95 ' +
      'C27,-94 24,-94 21,-92 C16,-86 4,-85 -6,-92 Z',
  ),
  line('M-7,-100 L-11,-102 L-8,-97 L-12,-96 L-8,-93'),
  hatch('M-2,-112 l-2,-3 M4,-115 l-1,-3'),
  shape('M33,-104.5 C35.2,-104.5 35.6,-95.5 33,-95.5 C30.8,-95.5 30.8,-104.5 33,-104.5 Z'),
  dot(33.4, -102, 0.9),
  dot(33.4, -98, 0.9),
  line('M20,-93 C24,-92.5 27,-93 29,-94'),
  hatch('M12,-110.5 L18,-110'),
  dot(15, -106, 1.6),
  tube('M8,-82 C12,-72 16,-66 24,-62', 6),
  ring(26, -62, 3.6),
];

// ---------- 7. robot (after C-3PO) ----------
const robot = [
  tube('M8,-150 C12,-138 12,-128 11,-120 L25,-110', 7),
  line('M27,-109 L32,-107 M27,-110 L32,-112 M26,-108 L30,-104'),
  tube('M-1,-94 L-4,-52 L-6,-14', 10),
  shape('M-15,-13 L5,-13 C8,-9 8,-3 6,0 L-15,0 C-17,-4 -17,-9 -15,-13 Z'),
  ring(-4, -52, 5),
  tube('M9,-94 L13,-52 L14,-14', 10),
  shape('M6,-13 L24,-13 C28,-10 29,-3 27,0 L6,0 C4,-4 4,-9 6,-13 Z'),
  ring(13, -52, 5.5),
  hatch('M8,-34 L20,-34 M-10,-34 L1,-34 M8,-72 L20,-72 M-9,-72 L2,-72'),
  shape('M-10,-108 L17,-108 L15,-94 C9,-88 -3,-88 -8,-94 Z'),
  hatch('M-9,-102 L16,-102'),
  line('M-9,-123 C-9,-116 -9,-112 -8,-107 M18,-123 C19,-116 19,-112 17,-107'),
  hatch('M-5,-123 C-6,-116 -4,-112 -5,-107 M1,-123 C3,-116 0,-112 2,-107 M7,-123 C6,-116 9,-112 8,-107 M13,-123 C14,-116 12,-112 14,-107'),
  shape('M-12,-158 C-4,-164 14,-164 22,-156 C26,-146 25,-132 19,-122 L-9,-122 C-14,-134 -16,-148 -12,-158 Z'),
  hatch('M6,-150 L17,-150 L16,-137 L7,-137 Z M9,-146 L14,-146 M9,-142 L14,-142'),
  tube('M4,-170 L6,-160', 7),
  hatch('M0,-166 L10,-166 M1,-163 L11,-163'),
  part(
    'tilt',
    shape('M-4,-176 C-8,-188 -6,-200 4,-205 C14,-209 24,-205 26,-195 L28,-192 C27,-188 26,-184 24,-182 L24,-175 C18,-170 4,-170 -4,-176 Z'),
    line('M14,-195 C18,-197 22,-197 26,-195'),
    ring(20, -190, 4.4),
    dot(21, -190, 2),
    ring(2, -187, 4.2),
    dot(2, -187, 1.3),
    hatch('M8,-176 C12,-174 16,-174 20,-176'),
    line('M19,-178.5 L25,-178'),
  ),
  tube('M3,-150 C0,-140 -2,-130 -1,-120 L14,-108', 7),
  ring(3, -151, 7),
  line('M16,-108 L21,-106 M16,-109 L21,-110 M15,-107 L19,-103'),
];

// ---------- 8. Homo naledi ----------
const naledi = [
  tube('M9,-128 C15,-116 20,-100 23,-80', 7),
  line('M22,-80 C23,-74 25,-72 27,-74 M24,-80 C26,-76 28,-75 29,-77'),
  tube('M-1,-86 C-3,-66 -6,-46 -9,-28 C-11,-20 -14,-14 -16,-10 L-4,-4', 9.5),
  tube('M10,-86 C14,-66 19,-46 22,-26 L25,-8 L38,-5', 9.5),
  shape('M-6,-132 C2,-136 12,-135 16,-129 C21,-116 22,-100 18,-84 C8,-80 -2,-80 -7,-84 C-12,-100 -12,-118 -6,-132 Z'),
  hatch('M-8,-126 l-3,3 M-9,-118 l-3,3 M-10,-110 l-3,3 M-10,-102 l-3,3 M-9,-94 l-3,3'),
  hatch('M0,-112 C6,-110 12,-110 17,-112 M1,-106 C7,-104 13,-104 18,-106'),
  shape(
    'M-1,-137 C-9,-142 -10,-153 -3,-158 C5,-162 17,-161 22,-157 L27,-154.5 C25.5,-152 24.5,-151 25.5,-149 ' +
      'C27.5,-147 29,-145 30,-142 C29,-139 26,-137 22,-136 C15,-135 6,-134 -1,-137 Z',
  ),
  hatch('M-6,-154 l-3,-2 M-8,-146 l-3,-1 M-1,-159 l-2,-3 M6,-161 l-1,-3 M12,-161 l0,-3'),
  thick('M15,-155.5 L27,-154.5'),
  dot(20, -151.5, 1.5),
  line('M25.5,-148 C26.5,-147 27,-146 26,-145'),
  line('M23,-140.5 L29,-141'),
  tube('M4,-127 C-2,-114 -8,-98 -11,-74', 7),
  line('M-12,-74 C-14,-68 -12,-64 -9,-66 M-10,-74 C-10,-69 -8,-67 -6,-69'),
];

// ---------- 9. elephant ----------
const elephant = [
  shape('M20,-100 C18,-70 14,-40 12,-4 L38,-4 C40,-40 44,-70 46,-100 Z'),
  shape('M-78,-100 C-76,-70 -72,-40 -66,-4 L-42,-4 C-46,-40 -48,-70 -50,-100 Z'),
  line('M-110,-122 C-114,-110 -116,-96 -116,-84'),
  hatch('M-116,-84 l-3,6 M-116,-84 l0,7 M-116,-84 l3,6'),
  shape(
    'M-112,-104 C-118,-134 -100,-168 -60,-178 C-20,-188 22,-190 52,-180 C74,-172 86,-150 86,-120 ' +
      'C86,-100 80,-86 70,-80 C30,-74 -40,-74 -96,-80 C-106,-86 -110,-94 -112,-104 Z',
  ),
  hatch('M-60,-100 C-50,-96 -40,-94 -30,-94 M-20,-150 C-10,-146 0,-146 10,-150 M-80,-150 C-74,-140 -72,-130 -74,-118'),
  fill('M-104,-120 L-60,-120 C-58,-80 -64,-40 -62,-2 L-94,-2 C-94,-40 -100,-80 -104,-120 Z'),
  line('M-100,-96 C-97,-70 -93,-40 -94,-2 M-60,-100 C-60,-70 -64,-40 -62,-2 M-96,-1 L-60,-1'),
  hatch('M-92,-6 C-90,-9 -87,-9 -85,-6 M-82,-6 C-80,-9 -77,-9 -75,-6 M-72,-6 C-70,-9 -67,-9 -65,-6'),
  hatch('M-94,-40 C-86,-38 -74,-38 -64,-40 M-94,-50 C-86,-48 -74,-48 -64,-50'),
  fill('M32,-130 L76,-130 C74,-90 74,-40 76,-2 L42,-2 C42,-40 38,-80 32,-130 Z'),
  line('M36,-96 C39,-60 42,-30 42,-2 M74,-84 C73,-50 73,-25 76,-2 M40,-1 L78,-1'),
  hatch('M46,-6 C48,-9 51,-9 53,-6 M56,-6 C58,-9 61,-9 63,-6 M66,-6 C68,-9 71,-9 73,-6'),
  hatch('M42,-40 C50,-38 62,-38 73,-40 M41,-50 C50,-48 62,-48 73,-50'),
  shape('M46,-172 C58,-196 92,-202 108,-184 C118,-172 120,-152 116,-132 C112,-122 100,-118 88,-122 C74,-128 60,-140 52,-152 C48,-158 45,-165 46,-172 Z'),
  part(
    'trunk',
    fill(
      'M100,-140 L117,-136 C120,-110 121,-80 118,-54 C116,-42 117,-33 122,-28 C127,-24 131,-29 129,-34 L124,-32 ' +
        'C118,-38 108,-44 106,-56 C104,-80 104,-110 100,-140 Z',
    ),
    line('M117,-138 C120,-110 121,-80 118,-54 C116,-42 117,-33 122,-28 C127,-24 131,-29 129,-34 C127,-37 124,-36 124,-32'),
    line('M124,-32 C118,-38 108,-44 106,-56 C104,-80 104,-110 102,-128'),
    hatch('M106,-100 L119,-100 M106,-90 L120,-90 M106,-80 L120,-81 M106,-70 L119,-71 M107,-60 L118,-62'),
  ),
  shape('M104,-126 C114,-120 126,-114 138,-120 C130,-110 114,-110 102,-118 Z'),
  part(
    'ear',
    shape('M62,-178 C44,-186 20,-180 12,-160 C6,-142 10,-116 22,-100 C30,-92 40,-96 44,-108 C48,-120 58,-126 64,-140 C68,-152 68,-166 62,-178 Z'),
    hatch('M52,-170 C40,-172 28,-164 24,-150 M50,-156 C40,-156 32,-146 30,-132 M46,-140 C40,-136 36,-126 34,-116'),
  ),
  dot(92, -160, 1.8),
  hatch('M86,-165 C90,-167 95,-166 98,-163 M88,-155 C92,-153 96,-154 98,-157'),
];

const beings = [
  [60, 'hop', raven, 'Corvus corax'],
  [180, 'bob', caveman, 'Homo neanderthalensis'],
  [295, 'hop', spider, 'Phidippus audax'],
  [398, 'bob', boy, 'Homo sapiens'],
  [530, 'bob', dolphin, 'Tursiops truncatus'],
  [668, 'bob', pequenino, 'pequeniño'],
  [775, 'bob', robot, 'robot'],
  [890, 'bob', naledi, 'Homo naledi'],
  [1085, 'bob', elephant, 'Loxodonta africana'],
];
const figures = beings.map(([x, cls, body], i) => figure(i, x, cls, ...body));

// Hover areas, one per being, carrying its name; loader.js sizes each to its figure once the
// drawing is on screen, and shows the hovered name in the single line under the procession.
const hits = beings.map(([x, , , name]) => `<rect class="hit" transform="translate(${x} ${GROUND})" data-name="${name}"/>`);

const style = `
.procession { --ow: 2.2; --beat: 3.6s; }
.procession .o { fill: var(--bg, #000); stroke: var(--ink, #ece7dc); stroke-width: calc(var(--ow) * 1px); stroke-linejoin: round; stroke-linecap: round; }
.procession .l { fill: none; stroke: var(--ink, #ece7dc); stroke-width: calc(var(--ow) * 1px); stroke-linejoin: round; stroke-linecap: round; }
.procession .k { stroke-width: calc(var(--ow) * 1.4px); }
.procession .h { fill: none; stroke: var(--ink, #ece7dc); stroke-width: calc(var(--ow) * 0.55px); stroke-linecap: round; }
.procession .f { fill: var(--bg, #000); stroke: none; }
.procession .s { fill: var(--ink, #ece7dc); stroke: none; }
.procession .t { fill: none; stroke: var(--ink, #ece7dc); stroke-width: calc(var(--w) * 1px + var(--ow) * 2px); stroke-linejoin: round; stroke-linecap: round; }
.procession .ti { fill: none; stroke: var(--bg, #000); stroke-width: calc(var(--w) * 1px); stroke-linejoin: round; stroke-linecap: round; }
.procession .ground { fill: none; stroke: var(--ink, #ece7dc); stroke-width: calc(var(--ow) * 0.55px); stroke-linecap: round; opacity: 0.7; }

.procession .fig, .procession .part { transform-box: fill-box; animation: var(--beat) ease-in-out infinite; animation-delay: calc(var(--i) * 0.17s + 0.25s); }
.procession .bob { transform-origin: 50% 100%; animation-name: pr-bob; }
.procession .hop { transform-origin: 50% 100%; animation-name: pr-hop; }
.procession .nod { transform-origin: 30% 100%; animation-name: pr-nod; }
.procession .arc { transform-origin: 50% 50%; animation-name: pr-arc; }
.procession .ears { transform-origin: 50% 100%; animation-name: pr-ears; }
.procession .tilt { transform-origin: 45% 100%; animation-name: pr-tilt; }
.procession .trunk { transform-origin: 20% 0%; animation-name: pr-trunk; }
.procession .ear { transform-origin: 85% 15%; animation-name: pr-ear; }
@keyframes pr-bob { 0%, 16%, 100% { transform: none; } 8% { transform: translateY(-3px); } }
@keyframes pr-hop { 0%, 13%, 100% { transform: none; } 3% { transform: scale(1.03, 0.95); } 7% { transform: translateY(-9px); } 11% { transform: scale(1.02, 0.97); } }
@keyframes pr-nod { 0%, 16%, 100% { transform: none; } 8% { transform: rotate(6deg); } }
@keyframes pr-arc { 0%, 18%, 100% { transform: none; } 9% { transform: translateY(-5px) rotate(-4deg); } }
@keyframes pr-ears { 0%, 5%, 11%, 100% { transform: none; } 7% { transform: rotate(-16deg); } 9% { transform: rotate(4deg); } }
@keyframes pr-tilt { 0%, 18%, 100% { transform: none; } 9% { transform: rotate(-8deg); } }
@keyframes pr-trunk { 0%, 20%, 100% { transform: none; } 10% { transform: rotate(6deg); } }
@keyframes pr-ear { 0%, 18%, 100% { transform: none; } 9% { transform: scaleX(0.9); } }

.procession .hit { fill: transparent; pointer-events: all; }

@media (max-width: 700px) { .procession { --ow: 3.4; } }
`;

export default `<svg class="procession" viewBox="0 30 1240 232" role="img" aria-label="A procession of beings walking right: raven, caveman, jumping spider, boy, dolphin, pequeniño, robot, Homo naledi, elephant" xmlns="http://www.w3.org/2000/svg">
<style>${style}</style>
<defs>
  <filter id="pr-ink" x="-2%" y="-6%" width="104%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" result="noise">
      <animate attributeName="seed" values="3;7;11" dur="0.42s" calcMode="discrete" repeatCount="indefinite"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<g filter="url(#pr-ink)">
  <path class="ground" d="M8,${GROUND + 1} C300,${GROUND} 600,${GROUND + 2} 900,${GROUND + 0.5} S1180,${GROUND + 1.5} 1232,${GROUND + 1}"/>
  ${figures.join('\n  ')}
</g>
${hits.join('\n')}
</svg>
<p class="species"></p>`;
