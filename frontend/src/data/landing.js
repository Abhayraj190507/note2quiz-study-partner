import { FileUp, ListChecks, MessagesSquare, Layers, BarChart3, Timer } from 'lucide-react';

export const features = [
  { icon: FileUp, title: 'Notes in, structure out', body: 'Drop in PDFs, slides, Word files or a photo of the whiteboard. Note2Quiz pulls out the summary, key terms, formulas and definitions.', span: 'md:col-span-2' },
  { icon: ListChecks, title: 'Quizzes that adapt', body: 'Multiple choice, true or false and fill-in-the-blank, tuned to the topics you keep missing.', span: '' },
  { icon: MessagesSquare, title: 'A partner that cites its sources', body: 'Ask a question and get an answer that points to the exact page of your own notes.', span: '' },
  { icon: Layers, title: 'Flashcards on a schedule', body: 'Spaced repetition brings each card back just before you would forget it.', span: '' },
  { icon: BarChart3, title: 'See where marks are leaking', body: 'Topic-level mastery, accuracy trends and a plain-language read on what to fix next.', span: 'md:col-span-2' },
  { icon: Timer, title: 'Plan it, then do it', body: 'A weekly planner and focus timer that feed the same XP and streak.', span: 'md:col-span-3 lg:col-span-1' },
];

export const stats = [
  { n: 2400000, label: 'Questions generated from student notes', suffix: '+' },
  { n: 94, label: 'Of beta students kept a 7-day streak', suffix: '%' },
  { n: 38, label: 'Average improvement on weak topics in four weeks', suffix: '%' },
  { n: 12, label: 'Seconds from upload to first question', suffix: 's' },
];

export const testimonials = [
  { q: 'I stopped rewriting my notes and started testing myself on them. My organic chemistry mark went from a C to an A-.', name: 'Priya N.', role: 'Chemistry, year 2' },
  { q: 'The partner points to the page in my lecture slides. That is the difference between trusting it and double-checking everything.', name: 'Daniel O.', role: 'Computer science, year 3' },
  { q: 'The analytics told me entropy was the problem, not “physics”. I fixed one topic and the whole grade moved.', name: 'Sofia A.', role: 'Physics, year 1' },
];

export const faqs = [
  { q: 'What file types can I upload?', a: 'PDF, DOCX, PPT, TXT and images such as photos of whiteboards or handwritten pages.' },
  { q: 'Does the AI make things up?', a: 'Answers are grounded in your uploaded notes and show which file and page they came from, so you can check any claim in one click.' },
  { q: 'How are quiz questions chosen?', a: 'From the topics in your notes, weighted toward the ones you answer wrong most often. Each question comes with a short explanation.' },
  { q: 'Is it free for students?', a: 'Yes. Core features are free for students. Team and campus plans add shared libraries and teacher dashboards.' },
  { q: 'Can I use it on my phone?', a: 'Every screen is built mobile-first, so quizzes, flashcards and the study partner work well on a small screen.' },
];
