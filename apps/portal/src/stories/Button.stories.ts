import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Кнопка",
    size: "medium",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Второстепенная",
    size: "medium",
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    children: "Большая кнопка",
    size: "large",
  },
};

export const Small: Story = {
  args: {
    variant: "outline",
    children: "Маленькая",
    size: "small",
  },
};
