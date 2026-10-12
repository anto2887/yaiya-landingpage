/**
 * YAIYA landing page: all copy and product data.
 *
 * Components read from this file and contain no strings of their own.
 * Lines changed from the mockup carry a comment with the claim ID from
 * guide/docs/07-copy-and-claims.md. Do not restore mockup wording without
 * the founder's written approval.
 *
 * Slugs and ids are used in analytics and in the database. Never rename one.
 */

export const FLAVORS = [
  {
    slug: "strawberry-peach",
    name: "Strawberry Peach",
    descriptors: "Juicy. Fruity. Refreshing.",
    image: "/images/flavor-strawberry-peach.jpg",
    tone: "strawberry",
  },
  {
    slug: "chocolate-silk",
    name: "Chocolate Silk",
    descriptors: "Rich. Smooth. Satisfying.",
    image: "/images/flavor-chocolate-silk.jpg",
    tone: "chocolate",
  },
  {
    slug: "matcha-yuzu",
    name: "Matcha Yuzu",
    descriptors: "Bright. Citrusy. Uplifting.", // C-16
    image: "/images/flavor-matcha-yuzu.jpg",
    tone: "matcha",
  },
] as const;

export const OCCASION_OPTIONS = [
  { id: "between-meetings", label: "Between meetings" },
  { id: "between-classes", label: "Between classes" },
  { id: "afternoon-snack", label: "Afternoon snack" },
  { id: "commute", label: "Commute" },
  { id: "travel", label: "Travel" },
  { id: "before-workout", label: "Before a workout" },
  { id: "after-workout", label: "After a workout" },
  { id: "out-the-door", label: "On the way out the door" },
  { id: "hungry-not-meal", label: "Hungry but not ready for a meal" },
] as const;

export const PACK_OPTIONS = [
  {
    id: "variety-4-6",
    label: "A 4–6 pouch variety pack",
    detail: "Best for trying multiple flavors",
  },
  {
    id: "case-12",
    label: "A 12-pouch stock-up case",
    detail: "Best value for keeping YAIYA on hand",
  },
] as const;

/** One definition of each headline number, reused wherever it appears. */
const TARGETS = {
  protein: "15g",
  whey: "11g", // Q-01 answered 10 Oct
  collagen: "4g", // Q-01 answered 10 Oct
  caffeine: "80mg", // Matcha Yuzu only. Q-16 answered 10 Oct
  fiber: "3g",
  sugar: "0g",
  dailyValue: "25%",
} as const;

const TARGETS_NOTE =
  "*Recipe targets. Final nutrition and ingredients confirmed before launch.";

export const site = {
  meta: {
    title: "YAIYA | A new kind of protein jelly snack",
    description:
      "Soft, squeezable jelly with protein, collagen, fiber and vitamins. Join the waitlist for early access.",
    ogImage: "/images/og.jpg",
  },

  features: {
    ingredientTabs: true, // Q-09
    stickyMobileCta: true, // Q-13
  },

  a11y: {
    skipLink: "Skip to content",
    benefitsLabel: "Why YAIYA",
  },

  /** Wobbie's speech bubbles when tapped. Approved lines only (07-copy-and-claims). */
  wobbie: {
    lines: ["Protein is in its soft jelly era.", "Good ingredients. Good stories."],
  },

  nav: {
    wordmarkAlt: "YAIYA",
    links: [
      { label: "Our Story", href: "#story" },
      { label: "Ingredients", href: "#inside" },
      { label: "Flavors", href: "#flavors" },
      { label: "FAQs", href: "#faq" },
    ],
    cta: { label: "Join the Waitlist", href: "#waitlist" },
  },

  hero: {
    eyebrow: "A new kind of protein jelly snack.",
    headline: ["Your cravings.", "Meet your", "good intentions."],
    kicker: "Big on flavor. Built for more.",
    body: `Soft, squeezable jelly with ${TARGETS.protein} protein*, collagen, fiber, and vitamins. For people who want their snack to taste good and do a little more.`,
    primaryCta: { label: "Join the Waitlist", href: "#waitlist" },
    secondaryCta: { label: "Explore the Flavors", href: "#flavors" },
    note: "A softer snack for brighter days.",
    image: {
      // Desktop: the founder's scene as supplied; the copy sits on its open wall (D-25).
      // Mobile: photo first, a tight crop around the pouches (scripts/extend-hero.mjs, D-37).
      desktop: "/images/hero-scene.jpg",
      mobile: "/images/hero-phone.jpg",
      alt: "Three YAIYA pouches in Strawberry Peach, Chocolate Silk and Matcha Yuzu on a sunny desk, with the jelly mascot Wobbie peeking out of a tote bag.",
    },
  },

  /** Scrolling flavor strip under the hero. Approved lines only (07-copy-and-claims). Decorative. */
  ticker: [
    "Strawberry Peach",
    "Soft, squeezable jelly",
    "Chocolate Silk",
    `${TARGETS.protein} protein*`,
    "Matcha Yuzu",
    "No fridge, no spoon",
    "Pocket-sized",
  ],

  benefits: [
    {
      id: "konjac",
      title: "Soft Konjac Jelly",
      line: "A uniquely satisfying, chewy texture.",
    },
    {
      id: "protein",
      // C-01: mockup said "15g Plant Protein".
      title: `${TARGETS.protein} Protein*`,
      // C-02: mockup said "Helps keep you full and energized."
      line: "Meaningful protein in a soft, squeezable snack.",
    },
    {
      id: "flavors",
      // C-08: mockup said "Real, Delicious Flavors".
      title: "Seriously Good Flavors",
      // C-08: mockup said "Made with real ingredients you can taste."
      line: "Strawberry Peach, Chocolate Silk and Matcha Yuzu.",
    },
    {
      id: "pocket",
      title: "Pocket-Sized Snack",
      line: "Ready anywhere. No fridge, no spoon needed.",
    },
  ],

  flavors: {
    eyebrow: "Three flavors. So much to love.",
    heading: "Feel-good flavor, anywhere you go.",
    prompt: "Which would you try first? Tap one.",
    groupLabel: "Which would you try first?",
    selectedTag: "Your pick",
    items: FLAVORS,
    /**
     * The breakout panel shown when a flavor is picked.
     * TODO(founder): review the taste descriptions; they stay within the flavor names.
     * Matcha Yuzu caffeine shown here at the founder's request (11 Oct), replacing D-20's
     * "FAQ and Matcha tab only".
     */
    detail: {
      notesLabel: "Tastes like",
      factsLabel: "Per pouch",
      sweetener: "Sweetened with allulose and monk fruit, never artificial sweeteners.",
      ctaPrefix: "Be first to try",
      sharedFacts: [
        { id: "protein", value: TARGETS.protein, label: "protein*" },
        { id: "fiber", value: TARGETS.fiber, label: "fiber*" },
        { id: "sugar", value: TARGETS.sugar, label: "sugar*" },
      ],
      footnote: "*Recipe targets. Final nutrition confirmed before launch.",
      flavors: {
        "strawberry-peach": {
          description: "Sweet strawberry and soft, juicy peach in a bright, refreshing jelly.",
          notes: ["Strawberry", "Peach"],
          extraFacts: [],
          extraNote: "",
        },
        "chocolate-silk": {
          description: "Smooth, rich chocolate in a silky jelly. A little treat that feels like one.",
          notes: ["Cocoa", "Chocolate"],
          extraFacts: [],
          extraNote: "",
        },
        "matcha-yuzu": {
          description: "Earthy matcha meets bright, citrusy yuzu in a clean, uplifting jelly.",
          notes: ["Matcha", "Yuzu"],
          extraFacts: [{ id: "caffeine", value: TARGETS.caffeine, label: "caffeine*" }],
          extraNote: "The only YAIYA flavor with caffeine.",
        },
      },
    },
  },

  nutrition: {
    heading: "Good for more than your taste buds.",
    // Founder 11 Oct: was "Real nutritional purpose." ("real" breaks 07 rule 3).
    sub: "Feel-good flavor. Nutrition with a purpose.",
    stats: [
      {
        id: "protein",
        value: TARGETS.protein,
        label: "protein*",
        line: "For your everyday strength", // C-15
        // Q-01 answered 10 Oct. Approved: "11g from whey protein and 4g from collagen".
        split: [
          { label: "whey", value: TARGETS.whey, grams: 11 },
          { label: "collagen", value: TARGETS.collagen, grams: 4 },
        ],
      },
      {
        id: "fiber",
        value: TARGETS.fiber,
        label: "fiber*",
        // C-05: mockup said "A little more for your gut".
        line: "From tapioca fiber and konjac",
      },
      {
        id: "sugar",
        value: TARGETS.sugar,
        label: "sugar*",
        line: "Our sweet spot",
        detail: "Sweetened with allulose and monk fruit, never artificial sweeteners.", // D-12, approved
      },
      {
        id: "daily-value",
        value: TARGETS.dailyValue,
        label: "daily value*",
        line: "Selected vitamins & minerals", // C-13
      },
    ],
    perPouch: "Recipe targets, per pouch",
    footnote: TARGETS_NOTE,
  },

  occasions: {
    heading: "One pouch. Plenty of ways to make it yours.",
    body: "For people who want their food to taste good and contribute something. Here's where YAIYA fits.",
    scrollerLabel: "Ways to enjoy YAIYA",
    momentsLabel: "Great for",
    // Founder supplied lifestyle photos with people on 11 Oct (replaces D-23).
    // `moments` reuse OCCASION_OPTIONS ids.
    personas: [
      {
        id: "protein-regular",
        name: "The Protein Regular",
        line: "Your protein routine. A fresh plot twist.",
        image: "/images/occasion-protein-regular-v2.jpg",
        alt: "A woman in workout clothes smiling on a sunny hilltop, holding a Chocolate Silk pouch.",
        moments: ["before-workout", "after-workout", "afternoon-snack"],
      },
      {
        id: "busy-day",
        name: "The Busy-Day Multitasker",
        line: "Between meetings. Between everything.",
        image: "/images/occasion-busy-day-v2.jpg",
        alt: "A man at a sunny office desk with his laptop, holding up a Matcha Yuzu pouch.",
        moments: ["between-meetings", "commute", "hungry-not-meal"],
      },
      {
        id: "wellness-snacker",
        name: "The Everyday Wellness Snacker",
        line: "Something sweet. Something more.",
        image: "/images/occasion-wellness-snacker-v2.jpg",
        alt: "Strawberry Peach, Chocolate Silk and Matcha Yuzu pouches packed in a beach bag with fruit and sunglasses.",
        moments: ["travel", "out-the-door", "afternoon-snack"],
      },
    ],
    conveniences: [
      // C-11: mockup said "Shelf-stable and ready when you are."
      { id: "no-fridge", title: "No fridge.", line: "Ready when you are." },
      { id: "pocket", title: "Pocket-sized.", line: "Easy to take anywhere." },
      { id: "no-spoon", title: "No spoon.", line: "Just tear, squeeze and enjoy." },
    ],
  },

  /**
   * Giving pledge (founder, 11 Oct). Amount and cause are not decided, so this
   * states an intention only: no number, no named charity, no "every purchase" promise.
   * TODO(founder): add the share and the cause before launch, then tighten the copy.
   */
  giving: {
    eyebrow: "Snacks that give back.",
    // Not "good for you": reads as a health claim (07, banned "better for you").
    heading: "A snack you can feel good about.",
    body: "We're building giving into YAIYA from day one. As we grow, part of what we earn will go to a cause that matters.",
    points: [
      { id: "built-in", title: "Built in from day one.", line: "Giving is part of the plan, not an afterthought." },
      { id: "transparent", title: "Out in the open.", line: "We'll share where it goes and how much." },
      { id: "together", title: "Shared with you.", line: "Waitlist members hear the details first." },
    ],
  },

  story: {
    eyebrow: "Old roots. A fresh kind of joy.",
    // C-03: mockup said "Rooted in tradition. Backed by science."
    heading: ["Rooted in tradition.", "Made for right now."],
    // C-04: mockup body made a digestive-health statement. Replaced.
    body: "Konjac is a plant that has been part of Asian food culture for centuries, and the jelly made from it is a convenience-store favorite across Japan and Korea. It gives YAIYA its soft, springy bite and lets the flavor come through clean and bright.",
    note: "Good ingredients. Good stories.",
    image: {
      src: "/images/story-konjac-v2.jpg",
      alt: "Pieces of konjac jelly piled on a woven bamboo tray.",
    },
    /**
     * Founder copy, 11 Oct, safe version (D-11 kept): heritage and texture only.
     * Not used: "backed by science", clinical, cholesterol, digestive and medicine claims (C-03, C-04).
     */
    heritage: [
      {
        id: "roots",
        kicker: "01 · Old roots",
        title: "A kitchen staple for generations",
        line: "For generations, konjac has had a place in kitchens across Asia.",
      },
      {
        id: "favorite",
        kicker: "02 · Everyday favorite",
        title: "A convenience-store classic",
        line: "Konjac jelly is a convenience-store favorite across Japan and Korea.",
      },
    ],
    fiber: {
      kicker: "Glucomannan: the fiber inside konjac",
      title: "Water-loving fiber",
      line: "Glucomannan holds water and forms a gel, the quality behind konjac's distinctive texture.",
    },
    why: {
      kicker: "Why we love it",
      line: "Konjac helps create YAIYA's soft jelly texture. Protein, added fiber and vitamins bring a little more to the pouch.",
      cta: { label: "Explore what's inside", href: "#inside" },
    },
  },

  inside: {
    heading: "What's inside.",
    // C-07: mockup said "Real ingredients. Real purpose."
    sub: "Good ingredients. Clear purpose.",
    items: [
      {
        id: "konjac",
        name: "Konjac Jelly",
        line: "For a soft, satisfying texture",
        icon: "konjac",
      },
      {
        id: "protein",
        // C-01: mockup said "Plant Protein". It is whey and collagen. Never say plant.
        name: "Protein",
        line: `${TARGETS.protein} per pouch*`,
        icon: "protein",
      },
      {
        id: "collagen",
        name: "Collagen",
        // C-06: mockup said "for skin & connective tissue".
        line: `${TARGETS.collagen} of the ${TARGETS.protein} protein*`,
        icon: "collagen",
      },
      {
        id: "fiber",
        name: "Fiber",
        line: `${TARGETS.fiber} per pouch*`,
        icon: "fiber",
      },
      {
        id: "vitamins",
        name: "Vitamins & Minerals",
        // C-09: mockup said "C, D, B vitamins, magnesium, zinc and more."
        line: "Selected vitamins and minerals, including magnesium*",
        icon: "vitamins",
      },
      {
        id: "flavors",
        // C-08: mockup said "Real Flavors / from fruits, cocoa and tea".
        name: "Flavors",
        line: "Strawberry peach, chocolate and matcha yuzu",
        icon: "flavors",
      },
    ],
  },

  /**
   * From the prototype's DATA object. Postbiotics removed; emoji removed.
   * C-20: wording is the founder's own from the prototype. Confirm it is current.
   * Q-01: the protein tab names whey and bovine collagen.
   */
  ingredientTabs: {
    eyebrow: "A little knowledge goes a long way.",
    heading: "Good ingredients. Better understood.",
    tabs: [
      {
        id: "protein",
        label: "Protein",
        value: TARGETS.protein,
        valueLabel: "total protein target per pouch",
        title: "Useful protein. A softer format.",
        body: `Each pouch has ${TARGETS.whey} of whey protein and ${TARGETS.collagen} of bovine collagen peptides.`,
        note: "Contains milk. Final formulation and protein quality require finished-product testing.",
      },
      {
        id: "konjac",
        label: "Fiber & konjac",
        value: TARGETS.fiber,
        valueLabel: "fiber target per pouch",
        title: "The fiber inside the jelly.",
        body: "The recipe combines added soluble tapioca fiber with a konjac-containing jelly base.",
        note: "Fiber content is a recipe target and will be confirmed by testing.",
      },
      {
        id: "collagen",
        label: "Collagen",
        value: TARGETS.collagen,
        valueLabel: `of the ${TARGETS.protein} protein target`,
        title: "Collagen, built into the pouch.",
        body: `${TARGETS.collagen} of bovine collagen peptides are part of every pouch's protein.`,
        note: `Collagen contributes to total protein; it is not an extra ${TARGETS.protein}.`,
      },
      {
        id: "vitamins",
        label: "Vitamins",
        value: TARGETS.dailyValue,
        valueLabel: "selected daily value targets",
        title: "Selected vitamins & minerals.",
        body: "The current development brief includes selected vitamins and minerals at meaningful target levels.",
        note: "Final levels depend on finished-product testing.",
        // Founder 11 Oct chose the softer, role-based wording over benefit headlines
        // (no immune/energy/skin/bone headlines, no skin card). Roles carry an asterisk.
        // TODO(founder): Q-06 / C-09 confirm C, D, B vitamins, zinc and magnesium are in the recipe.
        groups: [
          {
            id: "c-d-zinc",
            nutrients: "Vitamins C + D · Zinc",
            title: "Part of the daily mix",
            body: "These nutrients play roles in normal immune function.*",
          },
          {
            id: "b-magnesium",
            nutrients: "B vitamins + Magnesium",
            title: "From food to fuel",
            body: "B vitamins help your body use energy from food.*",
          },
          {
            id: "d-magnesium",
            nutrients: "Vitamin D + Magnesium",
            title: "Everyday essentials",
            body: "Vitamin D helps your body absorb calcium.*",
          },
        ],
        groupsNote: `*Recipe targets: selected vitamins and minerals at ${TARGETS.dailyValue} daily value per pouch. Final levels confirmed by testing before launch.`,
      },
      {
        id: "magnesium",
        label: "Magnesium",
        value: TARGETS.dailyValue,
        valueLabel: "daily value target",
        title: "Magnesium in the mix.",
        body: "Magnesium is included in the current micronutrient plan.",
        note: "Final levels depend on finished-product testing.",
      },
      {
        id: "sweeteners",
        label: "Sweeteners",
        value: TARGETS.sugar,
        valueLabel: "sugar target",
        title: "A different sweet spot.",
        body: "Sweetened with allulose and monk fruit, never artificial sweeteners.",
        note: "Final Nutrition Facts depend on the commercial formula.",
      },
      {
        id: "energy",
        label: "Matcha energy",
        value: TARGETS.caffeine,
        valueLabel: "caffeine target in Matcha Yuzu",
        title: "A little matcha moment.",
        body: `Matcha Yuzu has the same ${TARGETS.protein} protein target as the other flavors, plus ${TARGETS.caffeine} of caffeine.`,
        note: "Only Matcha Yuzu contains caffeine. Final caffeine content will be measured and labeled.",
      },
    ],
  },

  /**
   * Founder table, 11 Oct. Replaces the bar/shake mockup table and the enjoyment row (C-10).
   * Competitor columns are single published products, unnamed.
   * TODO(founder): keep each competitor's source page and the date checked on file (C-12).
   * TODO(founder): confirm the calorie estimate (68–94 kcal) and the 110g pouch target.
   * Flavor list uses "Chocolate Silk" (D-13), not "Milk Chocolate".
   */
  comparison: {
    heading: "A better snack routine.",
    sub: "See how YAIYA compares.",
    caption: "How YAIYA compares with a meal shake, a protein bar and a konjac snack, per serving",
    rowHeader: "Per serving",
    columns: [
      { id: "yaiya", name: "YAIYA", kind: "Jelly snack", status: "In development", highlight: true },
      { id: "shake", name: "Meal shake", kind: "Published chocolate example", status: "", highlight: false },
      { id: "bar", name: "Protein bar", kind: "Published chocolate sea salt example", status: "", highlight: false },
      { id: "konjac", name: "Konjac snack", kind: "Published peach example", status: "", highlight: false },
    ],
    rows: [
      {
        id: "protein",
        label: "Protein",
        cells: [
          { main: `${TARGETS.protein}*`, sub: "Our formulation target" },
          { main: "20g", sub: "" },
          { main: "12g", sub: "" },
          { main: "Snack-focused", sub: "No high-protein claim on the product page" },
        ],
      },
      {
        id: "calories",
        label: "Calories",
        cells: [
          { main: "68–94 kcal*", sub: "Estimate; depends on flavor" },
          { main: "400 kcal", sub: "" },
          { main: "200 kcal", sub: "" },
          { main: "10 kcal", sub: "" },
        ],
      },
      {
        id: "sugar",
        label: "Total sugar",
        cells: [
          { main: `${TARGETS.sugar}*`, sub: "Target" },
          { main: "2g", sub: "" },
          { main: "14g", sub: "0g added sugar" },
          { main: "0g", sub: "" },
        ],
      },
      {
        id: "fiber",
        label: "Fiber",
        cells: [
          { main: `${TARGETS.fiber}*`, sub: "Added fiber + jelly base" },
          { main: "8g", sub: "" },
          { main: "5g", sub: "" },
          { main: "Konjac in the ingredients", sub: "Grams not stated on the product page" },
        ],
      },
      {
        id: "serving",
        label: "Serving size",
        cells: [
          { main: "110g pouch*", sub: "Target" },
          { main: "500ml bottle", sub: "" },
          { main: "52g bar", sub: "" },
          { main: "150ml pouch", sub: "" },
        ],
      },
      {
        id: "source",
        label: "Protein source",
        cells: [
          { main: "Whey + bovine collagen", sub: "Protein quality testing pending" },
          { main: "Pea protein", sub: "Plus protein from other plant ingredients" },
          { main: "Egg whites", sub: "Also contains almonds and cashews" },
          { main: "No high-protein positioning", sub: "" },
        ],
      },
      {
        id: "mouthfeel",
        label: "Mouthfeel",
        cells: [
          { main: "Soft, ready-to-eat jelly", sub: "" },
          { main: "Creamy liquid shake", sub: "" },
          { main: "Chewy solid bar", sub: "" },
          { main: "Chewy fruit jelly", sub: "" },
        ],
      },
      {
        id: "prep",
        label: "Preparation",
        cells: [
          { main: "No mixing", sub: "Ready-to-eat format" },
          { main: "No mixing", sub: "Ready-to-drink format" },
          { main: "Unwrap and eat", sub: "" },
          { main: "Squeeze to break up the jelly", sub: "Before opening the pouch" },
        ],
      },
      {
        id: "purpose",
        label: "What it's made for",
        cells: [
          { main: "Protein, collagen, fiber & micronutrients in a jelly snack", sub: "" },
          { main: "A complete meal", sub: "27 vitamins & minerals" },
          { main: "A protein-containing snack", sub: "" },
          { main: "A low-calorie jelly snack", sub: "Vitamin C and collagen-booster positioning" },
        ],
      },
      {
        id: "experience",
        label: "The experience",
        cells: [
          { main: "Three signature pairings", sub: "Strawberry Peach · Chocolate Silk · Matcha Yuzu" },
          { main: "Drink from a bottle", sub: "Chocolate example" },
          { main: "Chew a bar", sub: "Chocolate sea salt example" },
          { main: "Squeeze and chew", sub: "Peach example" },
        ],
      },
    ],
    footnote:
      "*YAIYA figures are recipe targets and estimates; YAIYA is in development. Other columns are single published products, compared from their own published information; products and recipes change.",
  },

  /** C-19: answers marked DRAFT need founder review before launch. */
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        id: "konjac",
        q: "What is konjac jelly?",
        a: "Konjac is a traditional Asian food ingredient. Its fiber absorbs water and helps create the soft, springy jelly texture.",
      },
      {
        id: "taste",
        q: "What does it taste like?",
        // DRAFT
        a: "Like the flavor on the front: Strawberry Peach, Chocolate Silk or Matcha Yuzu, in a soft jelly you squeeze straight from the pouch. We're still perfecting the recipes, and waitlist members will be the first to try them.",
      },
      {
        id: "when",
        q: "When would I eat YAIYA?",
        // DRAFT
        a: "Whenever you'd reach for a snack: between meetings, on the commute, before or after a workout, or any time you're hungry but not ready for a meal.",
      },
      {
        id: "fridge",
        q: "Does it need refrigeration?",
        a: "YAIYA is being developed to be shelf-stable, so no fridge needed. Final storage instructions will be confirmed before launch.",
      },
      {
        id: "meal",
        q: "Is it a meal replacement?",
        a: "No. YAIYA is a snack.",
      },
      {
        id: "matcha",
        q: "What makes Matcha Yuzu different?",
        // Q-02 and Q-16 answered 10 Oct: protein and 80mg caffeine.
        a: `Matcha Yuzu has the same protein as our other flavors, plus caffeine. Our recipe target is ${TARGETS.caffeine} per pouch. The other two flavors have none.`,
      },
      {
        id: "protein",
        q: "How much protein is in each pouch?",
        // DRAFT. Applies to all three flavors (Q-02).
        a: `Our recipe target is ${TARGETS.protein} per pouch: ${TARGETS.whey} from whey protein and ${TARGETS.collagen} from collagen. YAIYA contains milk. Final nutrition will be confirmed before launch.`,
      },
      {
        id: "sugar",
        q: "Is it sweetened with sugar?",
        // DRAFT, D-12
        a: `No. Our recipe target is ${TARGETS.sugar} sugar. YAIYA is sweetened with allulose and monk fruit, never artificial sweeteners.`,
      },
      {
        id: "buy",
        q: "Where can I buy it?",
        // DRAFT
        a: "YAIYA isn't on sale yet. Join the waitlist and we'll email you when samples and the first batch are ready.",
      },
      {
        id: "final",
        q: "Are the numbers final?",
        a: "Not yet. The nutrition values on this page are recipe targets and will be confirmed before launch.",
      },
    ],
  },

  waitlist: {
    eyebrow: "Be the first to snack happier.",
    heading: "Get early access to YAIYA.",
    body: "Join for launch updates, exclusive offers, and be the first to try our flavors.", // C-14
    emailLabel: "Your email address",
    emailPlaceholder: "Your email address",
    button: "Join the Waitlist",
    buttonLoading: "Joining...",
    reassurance: "No spam. Just good snacks.",
    consent: {
      before: "By joining, you agree to receive emails from YAIYA. Unsubscribe anytime.",
      linkLabel: "Privacy",
      linkHref: "/privacy",
    },
    errors: {
      invalid_email: "That email doesn't look right. Check it and try again.",
      rate_limited: "Too many tries. Please wait a few minutes and try again.",
      server: "Something went wrong on our side. Please try again.",
      network: "We couldn't reach the server. Check your connection and try again.",
    },
  },

  stickyCta: {
    regionLabel: "Join the waitlist",
    line: "Be first to try YAIYA.",
    button: "Join the Waitlist",
  },

  footer: {
    disclaimer:
      "*Recipe targets. YAIYA is in development. Final nutrition, ingredients and caffeine content will be confirmed before launch.",
    copyright: "© 2026 YAIYA",
    links: [{ label: "Privacy", href: "/privacy" }],
  },

  thankYou: {
    heading: "You're on the list.",
    body: "We'll email you when samples are ready. Got 20 seconds? These are optional and help us plan the first batch.",
    noSession: "Thanks for stopping by.",
    submit: "Send my answers",
    skip: "Skip for now",
    done: "Thank you. That really helps.",
    back: { label: "Back to YAIYA", href: "/" },
    saveError: "We couldn't save that. Please try again.",
    questions: {
      flavor: {
        id: "flavor_preference",
        label: "Which flavor would you want first?",
        options: FLAVORS.map((f) => ({ id: f.slug, label: f.name })),
      },
      occasions: {
        id: "occasion_preferences",
        label: "When would you most likely eat YAIYA?",
        options: OCCASION_OPTIONS,
      },
      pack: {
        id: "pack_preference",
        label: "When we launch, how would you prefer to stock up?",
        options: PACK_OPTIONS,
      },
      snack: {
        id: "snack_instead",
        label: "What do you usually snack on instead?",
        placeholder: "Protein bar, yogurt, nothing...",
        maxLength: 200,
      },
    },
  },

  /** Draft. See guide/docs/pages/privacy.md. Bracketed parts are TODO(founder). */
  privacy: {
    title: "Privacy",
    updated: "[DATE]",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "YAIYA is a snack brand in development, run by [LEGAL ENTITY NAME], [LOCATION]. You can reach us at [CONTACT EMAIL].",
        ],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "Your email address, when you join the waitlist.",
          "Your answers to the optional questions after you join.",
          "How you arrived at the site: the link you followed and its campaign tags.",
          "How the site is used: pages viewed, buttons tapped, and anonymized recordings of sessions in which anything you type is hidden.",
        ],
      },
      {
        heading: "Why we collect it",
        paragraphs: [
          "To email you about YAIYA: launch news, samples and offers.",
          "To learn which flavors and ideas people like, so we can make a better product.",
          "To measure whether our ads work.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We use a small number of service providers to run the site: Railway (hosting and database), PostHog (site analytics) and Meta (ad measurement). To measure ads, we may send Meta a scrambled, one-way version of your email address. We do not sell your information.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use first-party cookies to remember how you arrived, and Meta and PostHog set cookies to measure visits and ad performance.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "We keep waitlist details until you unsubscribe or ask us to delete them.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can unsubscribe using the link in any email, or ask us to see or delete your information by writing to [CONTACT EMAIL].",
        ],
      },
      {
        heading: "Changes",
        paragraphs: ["If this notice changes, we will update the date above."],
      },
    ],
  },
} as const;

export type FlavorSlug = (typeof FLAVORS)[number]["slug"];
export type OccasionId = (typeof OCCASION_OPTIONS)[number]["id"];
export type PackId = (typeof PACK_OPTIONS)[number]["id"];

export const FLAVOR_SLUGS = FLAVORS.map((f) => f.slug) as readonly FlavorSlug[];
export const OCCASION_IDS = OCCASION_OPTIONS.map((o) => o.id) as readonly OccasionId[];
export const PACK_IDS = PACK_OPTIONS.map((p) => p.id) as readonly PackId[];
