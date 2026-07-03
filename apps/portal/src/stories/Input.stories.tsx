import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../components/Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Введите текст...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Имя пользователя",
    placeholder: "Введите имя",
  },
};

export const Error: Story = {
  args: {
    label: "Email",
    placeholder: "email@example.com",
    error: "Неверный формат email",
    value: "test",
  },
};

export const Phone: Story = {
  args: {
    label: "Телефон",
    placeholder: "+7 (999) 123-45-67",
    type: "tel",
  },
};
