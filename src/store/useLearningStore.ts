import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LearningSubmission = {
  testId: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  answers: number[];
  review: { question: string; answer: string; comment: string }[];
  submittedAt: string;
  feedback: string;
};

type LearningState = {
  submissions: Record<string, LearningSubmission>;
  submitTest: (submission: Omit<LearningSubmission, "submittedAt" | "feedback">) => LearningSubmission;
  resetAll: () => void;
};

function buildFeedback(score: number) {
  if (score >= 90) return "Инструктор: результат принят. Отличное понимание темы, переходите к следующему заданию.";
  if (score >= 70) return "Инструктор: тест зачтён. Повторите вопросы с ошибками, пояснения доступны в разборе.";
  return "Инструктор: требуется повторная попытка. Изучите разбор ответов и задайте вопрос в чате, если тема осталась непонятной.";
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      submissions: {},
      submitTest: (input) => {
        const submission: LearningSubmission = {
          ...input,
          submittedAt: new Date().toISOString(),
          feedback: buildFeedback(input.score),
        };
        set((state) => ({ submissions: { ...state.submissions, [input.testId]: submission } }));
        return submission;
      },
      resetAll: () => set({ submissions: {} }),
    }),
    { name: "voevoda-learning-v2" },
  ),
);
