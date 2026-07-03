import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../components/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const CourseCard: Story = {
  args: {
    title: "Курс молодого бойца V5",
    city: "Москва",
    duration: "4 месяца",
    price: 35000,
    oldPrice: 40000,
    image: "🪖",
  },
};

export const TeacherCard: Story = {
  args: {
    name: "Александр Суворов",
    rank: "Полковник",
    position: "Инструктор по тактике",
    index: 4.8,
    image: "⚔️",
  },
};
