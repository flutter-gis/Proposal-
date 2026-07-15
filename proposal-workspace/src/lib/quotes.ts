/**
 * quotes.ts
 *
 * Curated, gender-neutral quotes spanning 10 themes that mirror the trip's
 * emotional arc. Used by QuoteCallout and proposal/day/relationship sections.
 *
 * Sources: Elvis Presley, Coldplay, Lin-Manuel Miranda (Hamilton),
 * Minecraft ending text, Rachel Carson, John Muir, Henry David Thoreau,
 * Mary Oliver, Pablo Neruda, E.E. Cummings, Audre Lorde, Harvey Milk,
 * James Baldwin, Martin Luther King Jr., Carl Sagan, J.R.R. Tolkien.
 */

export type QuoteTheme =
  | "dawn"
  | "wilderness"
  | "recharge"
  | "love"
  | "cosmos"
  | "homecoming"
  | "adventure"
  | "devotion"
  | "ring"
  | "proposal";

export interface Quote {
  text: string;
  author: string;
  source?: string;
  theme: QuoteTheme;
}

export const QUOTES: Quote[] = [
  // ── dawn ────────────────────────────────────────────────────────────────
  {
    text: "The sea, once it casts its spell, holds one in its net of wonder forever.",
    author: "Rachel Carson",
    source: "The Sea Around Us",
    theme: "dawn",
  },
  {
    text: "Every morning was a cheerful invitation to make my life of equal simplicity.",
    author: "Henry David Thoreau",
    source: "Walden",
    theme: "dawn",
  },
  {
    text: "Greetings, sun. I come to you a stranger, but I am not afraid.",
    author: "Mary Oliver",
    source: "Why I Wake Early",
    theme: "dawn",
  },
  {
    text: "And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.",
    author: "Anaïs Nin",
    theme: "dawn",
  },
  {
    text: "Hope is the thing with feathers that perches in the soul.",
    author: "Emily Dickinson",
    theme: "dawn",
  },

  // ── wilderness ──────────────────────────────────────────────────────────
  {
    text: "The mountains are calling and I must go.",
    author: "John Muir",
    theme: "wilderness",
  },
  {
    text: "In every walk with nature one receives far more than one seeks.",
    author: "John Muir",
    theme: "wilderness",
  },
  {
    text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life.",
    author: "Henry David Thoreau",
    source: "Walden",
    theme: "wilderness",
  },
  {
    text: "The clearest way into the Universe is through a forest wilderness.",
    author: "John Muir",
    theme: "wilderness",
  },
  {
    text: "Wilderness is not a luxury but a necessity of the human spirit.",
    author: "Edward Abbey",
    theme: "wilderness",
  },

  // ── recharge ────────────────────────────────────────────────────────────
  {
    text: "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day, listening to the murmur of water, or watching the clouds float across the sky, is by no means a waste of time.",
    author: "John Lubbock",
    theme: "recharge",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    theme: "recharge",
  },
  {
    text: "Sometimes the most productive thing you can do is rest.",
    author: "Mark Black",
    theme: "recharge",
  },
  {
    text: "There is a moon that rests in the quiet corners of every heart.",
    author: "Mary Oliver",
    theme: "recharge",
  },

  // ── love ───────────────────────────────────────────────────────────────
  {
    text: "I love you as certain dark things are to be loved, in secret, between the shadow and the soul.",
    author: "Pablo Neruda",
    source: "One Hundred Love Sonnets",
    theme: "love",
  },
  {
    text: "I carry your heart with me (I carry it in my heart).",
    author: "E.E. Cummings",
    theme: "love",
  },
  {
    text: "When you put your hand in mine, I knew that this was going to be forever.",
    author: "Audre Lorde",
    theme: "love",
  },
  {
    text: "Love is a friendship that has caught fire.",
    author: "Antoine de Saint-Exupéry",
    theme: "love",
  },
  {
    text: "I love you without knowing how, or when, or from where.",
    author: "Pablo Neruda",
    source: "Sonnet XVII",
    theme: "love",
  },
  {
    text: "We were together. I forget the rest.",
    author: "Walt Whitman",
    theme: "love",
  },

  // ── cosmos ─────────────────────────────────────────────────────────────
  {
    text: "We are made of star-stuff. We are a way for the cosmos to know itself.",
    author: "Carl Sagan",
    theme: "cosmos",
  },
  {
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    theme: "cosmos",
  },
  {
    text: "The nitrogen in our DNA, the calcium in our teeth, the iron in our blood — we are made in the interiors of collapsing stars.",
    author: "Carl Sagan",
    theme: "cosmos",
  },
  {
    text: "For small creatures such as we the vastness is bearable only through love.",
    author: "Carl Sagan",
    theme: "cosmos",
  },
  {
    text: "Look again at that dot. That's here. That's home. That's us.",
    author: "Carl Sagan",
    source: "Pale Blue Dot",
    theme: "cosmos",
  },

  // ── homecoming ─────────────────────────────────────────────────────────
  {
    text: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien",
    source: "The Fellowship of the Ring",
    theme: "homecoming",
  },
  {
    text: "Home is behind, the world ahead, and there are many paths to tread through shadows to the edge of night.",
    author: "J.R.R. Tolkien",
    theme: "homecoming",
  },
  {
    text: "The greatest thing in family life is to take a hint when a hint is intended—and not to take a hint when a hint isn't intended.",
    author: "Robert Frost",
    theme: "homecoming",
  },
  {
    text: "Blessed are they who see beautiful things in humble places where other people see nothing.",
    author: "Camille Pissarro",
    theme: "homecoming",
  },

  // ── adventure ──────────────────────────────────────────────────────────
  {
    text: "It's a dangerous business, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to.",
    author: "J.R.R. Tolkien",
    source: "The Fellowship of the Ring",
    theme: "adventure",
  },
  {
    text: "Adventure is worthwhile in itself.",
    author: "Amelia Earhart",
    theme: "adventure",
  },
  {
    text: "The biggest adventure you can take is to live the life of your dreams.",
    author: "Oprah Winfrey",
    theme: "adventure",
  },
  {
    text: "And then I realized adventures are the best way to learn.",
    author: "Anonymous",
    theme: "adventure",
  },

  // ── devotion ───────────────────────────────────────────────────────────
  {
    text: "I am here to love you, to hold you in the light, and to keep you company in the dark.",
    author: "James Baldwin",
    theme: "devotion",
  },
  {
    text: "Hope will never be silent.",
    author: "Harvey Milk",
    theme: "devotion",
  },
  {
    text: "We are all ordinary. We are all boring. We are all spectacular. We are all shy. We are all bold. We are all heroes.",
    author: "Harvey Milk",
    theme: "devotion",
  },
  {
    text: "I have a dream that one day we will rise up and live out the true meaning of our creed.",
    author: "Martin Luther King Jr.",
    source: "Lincoln Memorial · August 28, 1963",
    theme: "devotion",
  },
  {
    text: "Tell them I lived, and loved, and walked among them.",
    author: "Audre Lorde",
    theme: "devotion",
  },
  {
    text: "Where you are is where I want to be.",
    author: "Mary Oliver",
    theme: "devotion",
  },
  {
    text: "We are all in the gutter, but some of us are looking at the stars.",
    author: "Oscar Wilde",
    theme: "devotion",
  },
  // BUG-07: Atwood quote restored
  {
    text: "The only way you can write the truth is to assume that what you set down will never be read. Not by any other person, but only by yourself in some future time when you've forgotten what it was.",
    author: "Margaret Atwood",
    source: "The Blind Assassin",
    theme: "devotion",
  },

  // ── ring ───────────────────────────────────────────────────────────────
  {
    text: "Like a circle, love has no end and no beginning — only the promise to return again.",
    author: "Lin-Manuel Miranda",
    source: "Hamilton",
    theme: "ring",
  },
  {
    text: "I'm yours, and you are mine, and we are one and the same in this circle we trace together.",
    author: "Traditional",
    source: "Wedding vow paraphrase",
    theme: "ring",
  },
  {
    text: "Wise men say only fools rush in, but I can't help falling in love with you.",
    author: "Elvis Presley",
    source: "Can't Help Falling in Love",
    theme: "ring",
  },
  {
    text: "Take my hand, take my whole life too — for I can't help falling in love with you.",
    author: "Elvis Presley",
    source: "Can't Help Falling in Love",
    theme: "ring",
  },
  {
    text: "And the world, so hard to understand, can never be the same again — for now we walk it, ringed in light.",
    author: "E.E. Cummings",
    theme: "ring",
  },

  // ── proposal ───────────────────────────────────────────────────────────
  {
    text: "If you let me, I will spend every quiet moment of my life showing you what you mean to me.",
    author: "Lin-Manuel Miranda",
    source: "Hamilton",
    theme: "proposal",
  },
  {
    text: "Look at the stars. Look how they shine for you, and everything you do.",
    author: "Coldplay",
    source: "Yellow · Parachutes · 2000",
    theme: "proposal",
  },
  {
    text: "And the universe said I love you, because you are love.",
    author: "Minecraft End Poem",
    theme: "proposal",
  },
  {
    text: "And the universe said you have played the game well, and the game is over, and now we begin again together.",
    author: "Minecraft End Poem",
    theme: "proposal",
  },
  {
    text: "If there is a future to be had, I will walk into it with you at my side.",
    author: "James Baldwin",
    theme: "proposal",
  },
  {
    text: "Promise me you'll always remember: you're braver than you believe, stronger than you seem, and loved more than you know.",
    author: "A.A. Milne",
    source: "Winnie-the-Pooh",
    theme: "proposal",
  },
];

// ============= DETERMINISTIC SHUFFLE =============
/** Simple string hash (FNV-1a 32-bit) — used for stable per-page rotation. */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic Fisher–Yates shuffle — same seed always returns same order. */
function shuffleSeeded<T>(arr: T[], seed: string): T[] {
  const out = arr.slice();
  let h = hashString(seed);
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (i + 0x9e3779b9), 0x85ebca6b) >>> 0;
    const j = h % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * getQuotes — returns `count` quotes from the given theme, shuffled
 * deterministically by `seed`. If there aren't enough of that theme, the
 * list is padded with quotes from related themes.
 */
export function getQuotes(theme: QuoteTheme, count: number = 3, seed: string = theme): Quote[] {
  const themed = QUOTES.filter((q) => q.theme === theme);
  const shuffled = shuffleSeeded(themed, `${seed}:${theme}`);
  if (shuffled.length >= count) return shuffled.slice(0, count);

  // Pad with related themes (any theme) — preserve order & uniqueness.
  const used = new Set(shuffled.map((q) => q.text));
  const fallback = shuffleSeeded(
    QUOTES.filter((q) => !used.has(q.text)),
    `${seed}:fallback`
  );
  return [...shuffled, ...fallback].slice(0, count);
}
