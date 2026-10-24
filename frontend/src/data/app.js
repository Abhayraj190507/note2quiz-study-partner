/** Sample data for every module. Replace each export with an API call when you have a backend. */

export const user = { name: 'Maya Chen', first: 'Maya', college: 'Northfield University' };

export const week = [
  { label: 'Mon', value: 48 }, { label: 'Tue', value: 72 }, { label: 'Wed', value: 55 }, { label: 'Thu', value: 90 },
  { label: 'Fri', value: 64 }, { label: 'Sat', value: 110 }, { label: 'Sun', value: 85 },
];

export const goals = [
  { label: 'Study hours', now: 7.4, max: 10, unit: 'h', tone: 'primary' },
  { label: 'Quizzes', now: 3, max: 4, unit: '', tone: 'accent' },
  { label: 'Flashcards', now: 48, max: 60, unit: '', tone: 'success' },
];

export const subjects = [
  { name: 'Biology', mastery: 82, minutes: 540, tone: 'success' },
  { name: 'Chemistry', mastery: 68, minutes: 410, tone: 'accent' },
  { name: 'Comp. Sci', mastery: 91, minutes: 620, tone: 'primary' },
  { name: 'Physics', mastery: 57, minutes: 330, tone: 'warning' },
  { name: 'Maths', mastery: 74, minutes: 380, tone: 'danger' },
];

export const weakTopics = [
  { topic: 'Thermodynamics: entropy', subject: 'Physics', score: 46 },
  { topic: 'Organic reaction mechanisms', subject: 'Chemistry', score: 54 },
  { topic: 'Integration by parts', subject: 'Maths', score: 61 },
  { topic: 'Meiosis vs mitosis', subject: 'Biology', score: 66 },
];

export const notes = [
  { id: 1, name: 'Cell Biology: Lecture 4.pdf', type: 'PDF', size: '2.4 MB', folder: 'Biology', pages: 18, when: 'Today',
    summary: 'Covers organelle structure and function, with emphasis on how mitochondria produce ATP through the electron transport chain.',
    points: ['Mitochondria make most of the cell’s ATP', 'The inner membrane folds into cristae to increase surface area', 'Ribosomes build proteins; the Golgi packages them'] },
  { id: 2, name: 'Organic Chemistry Summary.docx', type: 'DOCX', size: '860 KB', folder: 'Chemistry', pages: 9, when: 'Yesterday',
    summary: 'A compact review of functional groups and the main substitution and elimination mechanisms.',
    points: ['SN1 is two-step and favours tertiary carbons', 'SN2 is one-step with inversion of configuration', 'Learn the five major functional groups first'] },
  { id: 3, name: 'Thermodynamics Lecture 6.pdf', type: 'PDF', size: '3.1 MB', folder: 'Physics', pages: 24, when: '2 days ago',
    summary: 'Introduces entropy as a measure of dispersal of energy and walks through the second law with worked examples.',
    points: ['Entropy of an isolated system never decreases', 'ΔS = Q / T for a reversible process', 'Heat engines cannot be 100% efficient'] },
  { id: 4, name: 'Algorithms Whiteboard.png', type: 'IMG', size: '1.2 MB', folder: 'Comp. Sci', pages: 1, when: '4 days ago',
    summary: 'Photo of a whiteboard comparing sorting algorithms by time and memory.',
    points: ['Merge sort is O(n log n) but uses extra memory', 'Bubble sort is O(n²)', 'Binary search needs sorted input'] },
  { id: 5, name: 'Calculus Revision.pptx', type: 'PPT', size: '5.8 MB', folder: 'Maths', pages: 32, when: 'Last week',
    summary: 'Slides on limits, derivatives and integration techniques with practice problems.',
    points: ['Integration by parts: ∫u dv = uv − ∫v du', 'Chain rule links composite functions', 'Check limits before applying L’Hôpital'] },
];
export const folders = ['All', 'Biology', 'Chemistry', 'Physics', 'Comp. Sci', 'Maths'];

/* ---- Quiz bank: m = multiple choice, t = true/false, f = fill in the blank ---- */
export const BANK = {
  Biology: [
    { t: 'm', q: 'Which organelle produces most of a cell’s ATP?', o: ['Ribosome', 'Mitochondrion', 'Golgi body', 'Lysosome'], a: 1, topic: 'Cells', why: 'Mitochondria run the electron transport chain, which makes most of the ATP.' },
    { t: 't', q: 'Plant cells and animal cells both contain mitochondria.', a: true, topic: 'Cells', why: 'Plants respire too, so they have mitochondria as well as chloroplasts.' },
    { t: 'f', q: 'The cell ___ controls what enters and leaves the cell.', a: 'membrane', topic: 'Cells', why: 'The membrane is selectively permeable.' },
    { t: 'm', q: 'A cross between Aa and Aa gives which genotype ratio?', o: ['1:1', '3:1', '1:2:1', '9:3:3:1'], a: 2, topic: 'Genetics', why: 'AA : Aa : aa appears in a 1 : 2 : 1 ratio.' },
    { t: 't', q: 'DNA is built from amino acids.', a: false, topic: 'Genetics', why: 'DNA is built from nucleotides. Amino acids build proteins.' },
    { t: 'm', q: 'Which stage of mitosis lines chromosomes up at the cell’s equator?', o: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], a: 1, topic: 'Cell cycle', why: 'Metaphase aligns chromosomes on the equator before they are pulled apart.' },
    { t: 'f', q: 'Genes are made of ___.', a: 'dna', topic: 'Genetics', why: 'A gene is a stretch of DNA that codes for a protein.' },
    { t: 'm', q: 'What is the main function of ribosomes?', o: ['Make proteins', 'Store water', 'Digest waste', 'Copy DNA'], a: 0, topic: 'Cells', why: 'Ribosomes translate mRNA into proteins.' },
  ],
  'Comp. Sci': [
    { t: 'm', q: 'What is the time complexity of binary search?', o: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], a: 1, topic: 'Algorithms', why: 'Each step halves the search space.' },
    { t: 't', q: 'Binary search works on unsorted arrays.', a: false, topic: 'Algorithms', why: 'The array has to be sorted for halving to be valid.' },
    { t: 'f', q: 'A function that calls itself is called ___.', a: 'recursive', topic: 'Algorithms', why: 'Recursion needs a base case to stop.' },
    { t: 'm', q: 'Which structure is last-in, first-out?', o: ['Queue', 'Stack', 'Heap', 'Graph'], a: 1, topic: 'Data structures', why: 'A stack pops the most recently pushed item.' },
    { t: 'm', q: 'Which HTML tag creates a hyperlink?', o: ['<link>', '<a>', '<href>', '<nav>'], a: 1, topic: 'Web basics', why: 'The anchor tag <a> with an href attribute makes links.' },
    { t: 't', q: 'HTTP status 404 means the server crashed.', a: false, topic: 'Web basics', why: '404 means the page was not found.' },
  ],
};

export const SUGGESTIONS = {
  general: ['Explain mitochondria like I’m 12', 'Quiz me on my Biology notes', 'Make a 5-day revision plan'],
  doubt: ['Why does SN2 invert the stereocenter?', 'I don’t get entropy', 'What’s the difference between mitosis and meiosis?'],
  explain: ['Explain the electron transport chain', 'Teach me integration by parts', 'Break down the second law of thermodynamics'],
  expert: ['What do examiners look for in a 6-mark answer?', 'Common mistakes in Chemistry mechanisms', 'Give me a memory trick for the Krebs cycle'],
};

export const REPLIES = [
  { match: /mitochond|atp/i, text: 'Mitochondria are the cell’s power stations. They take in glucose products and oxygen, then run the electron transport chain across their folded inner membrane to make ATP. The folds, called cristae, give more surface area for that reaction.', src: ['Cell Biology: Lecture 4.pdf, p. 6', 'Cell Biology: Lecture 4.pdf, p. 7'] },
  { match: /entropy|thermo/i, text: 'Entropy measures how spread out energy is. In an isolated system it never decreases, which is why heat flows from hot to cold and not the other way round. For a reversible process the change is ΔS = Q / T.', src: ['Thermodynamics Lecture 6.pdf, p. 11'] },
  { match: /sn1|sn2|mechanism/i, text: 'SN2 happens in one step: the nucleophile attacks from the side opposite the leaving group, so the stereocenter inverts. SN1 goes through a carbocation first, which is why tertiary carbons favour it and why you often get a mix of stereoisomers.', src: ['Organic Chemistry Summary.docx, p. 3'] },
  { match: /plan|revision|schedule/i, text: 'Here is a 5-day plan weighted toward your weakest topics: Day 1 entropy and heat engines. Day 2 reaction mechanisms. Day 3 integration by parts. Day 4 mitosis versus meiosis. Day 5 mixed quiz and flashcard review.', src: ['Your quiz history, last 30 days'] },
  { match: /quiz|test me/i, text: 'I can build a quiz from your Biology notes. Pick a length and I’ll mix multiple choice, true or false and fill-in-the-blank questions, focused on what you missed last time.', src: ['Cell Biology: Lecture 4.pdf'], cta: 'quiz' },
];
export const FALLBACK = { text: 'Good question. From your notes, the key idea is to connect the definition to a worked example. Tell me which topic or file you want me to focus on and I will break it down step by step.', src: ['All uploaded notes'] };

export const sessions = [
  { id: 1, title: 'Electron transport chain', when: 'Today' }, { id: 2, title: 'SN1 vs SN2', when: 'Yesterday' },
  { id: 3, title: 'Integration by parts', when: 'Mon' }, { id: 4, title: 'Exam week plan', when: 'Last week' },
];

export const deck = [
  { q: 'What does the inner mitochondrial membrane’s folding (cristae) do?', a: 'Increases surface area for the electron transport chain, so more ATP can be made.', tag: 'Biology' },
  { q: 'State the second law of thermodynamics.', a: 'The entropy of an isolated system never decreases.', tag: 'Physics' },
  { q: 'Why does SN2 invert stereochemistry?', a: 'The nucleophile attacks from the side opposite the leaving group (backside attack).', tag: 'Chemistry' },
  { q: 'Write the integration by parts formula.', a: '∫u dv = uv − ∫v du', tag: 'Maths' },
  { q: 'What is the time complexity of merge sort?', a: 'O(n log n), with O(n) extra memory.', tag: 'Comp. Sci' },
];

export const planner = [
  { day: 'Mon', tasks: [{ id: 'a1', t: 'Cell biology flashcards', m: 25 }, { id: 'a2', t: 'Entropy problem set', m: 45 }] },
  { day: 'Tue', tasks: [{ id: 'b1', t: 'Reaction mechanisms quiz', m: 30 }] },
  { day: 'Wed', tasks: [{ id: 'c1', t: 'Integration practice', m: 40 }, { id: 'c2', t: 'Review weak topics', m: 20 }] },
  { day: 'Thu', tasks: [{ id: 'd1', t: 'Algorithms revision', m: 35 }] },
  { day: 'Fri', tasks: [{ id: 'e1', t: 'Mixed mock test', m: 60 }] },
];

export const board = [
  { name: 'Priya Nair', xp: 6420, college: 'Northfield University' }, { name: 'Daniel Okafor', xp: 5980, college: 'Lakeside College' },
  { name: 'Sofia Alvarez', xp: 5410, college: 'Northfield University' }, { name: 'Jonas Weber', xp: 4725, college: 'Northfield University' },
  { name: 'Hana Kimura', xp: 4310, college: 'Eastbridge Institute' }, { name: 'Leo Martin', xp: 3470, college: 'Northfield University' },
  { name: 'Aisha Rahman', xp: 3120, college: 'Lakeside College' }, { name: 'Tom Becker', xp: 2650, college: 'Northfield University' },
];

export const badges = [
  { id: 'streak7', name: 'Week warrior', desc: 'Study 7 days in a row', need: (g) => g.streak >= 7, emoji: '🔥' },
  { id: 'xp1k', name: 'First thousand', desc: 'Earn 1,000 XP', need: (g) => g.xp >= 1000, emoji: '⚡' },
  { id: 'lvl5', name: 'Level 5', desc: 'Reach level 5', need: (g) => g.level >= 5, emoji: '🎓' },
  { id: 'streak30', name: 'Unstoppable', desc: 'Study 30 days in a row', need: (g) => g.streak >= 30, emoji: '🚀' },
  { id: 'xp5k', name: 'Scholar', desc: 'Earn 5,000 XP', need: (g) => g.xp >= 5000, emoji: '🏆' },
  { id: 'lvl12', name: 'Level 12', desc: 'Reach level 12', need: (g) => g.level >= 12, emoji: '👑' },
];

export const revision = {
  checklist: ['Re-read your three weakest topics', 'Redo every quiz question you missed', 'Review all due flashcards', 'Write out each formula from memory', 'Sleep. A tired brain recalls less'],
  formulas: [['Entropy change', 'ΔS = Q / T'], ['Integration by parts', '∫u dv = uv − ∫v du'], ['Kinetic energy', 'KE = ½mv²'], ['Rate of reaction', 'rate = Δ[product] / Δt'], ['Binary search', 'T(n) = O(log n)']],
  definitions: [['Entropy', 'A measure of how dispersed energy is in a system.'], ['Allele', 'One version of a gene.'], ['Catalyst', 'Speeds up a reaction without being used up.'], ['Recursion', 'A function that solves a problem by calling itself on a smaller one.']],
  quick: ['Mitochondria make ATP via the electron transport chain.', 'SN2 inverts; SN1 goes through a carbocation.', 'Entropy of an isolated system never decreases.', 'Merge sort is O(n log n); bubble sort is O(n²).'],
};
