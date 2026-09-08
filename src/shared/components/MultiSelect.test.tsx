import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./MultiSelect";

const options = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
] as const;

describe("MultiSelect", () => {
  it("renders a checkbox for every option", () => {
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={[]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Plumbing")).toBeInTheDocument();
    expect(screen.getByLabelText("Electrical")).toBeInTheDocument();
  });

  it("checks the boxes matching the current value", () => {
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={["electrical"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Plumbing")).not.toBeChecked();
    expect(screen.getByLabelText("Electrical")).toBeChecked();
  });

  it("adds the skill to the value when an unchecked box is checked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={["electrical"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("Plumbing"));

    expect(onChange).toHaveBeenCalledWith(["electrical", "plumbing"]);
  });

  it("removes the skill from the value when a checked box is unchecked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={["plumbing", "electrical"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("Plumbing"));

    expect(onChange).toHaveBeenCalledWith(["electrical"]);
  });

  it("applies the checked-state accent styling when a chip is selected", () => {
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={["plumbing"]}
        onChange={vi.fn()}
      />,
    );

    const checkedChip = screen.getByLabelText("Plumbing").closest("div");
    const uncheckedChip = screen.getByLabelText("Electrical").closest("div");

    expect(checkedChip).toHaveClass("border-blue-600");
    expect(uncheckedChip).not.toHaveClass("border-blue-600");
  });

  it("associates the group with its label and error via aria attributes", () => {
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={[]}
        onChange={vi.fn()}
        invalid
        describedById="skills-error"
      />,
    );

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-labelledby", "skills-label");
    expect(group).toHaveAttribute("aria-describedby", "skills-error");
    expect(group).toHaveAttribute("aria-invalid", "true");
  });
});
