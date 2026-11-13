import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { stepId } from "@/lib/toc";

type StepProps = {
  title: string;
  /** Set by `Steps`; the number shown and the anchor `#step-N`. */
  index?: number;
  children?: ReactNode;
};

/**
 * Numbered steps. Write `<Step title="…">` blocks inside one `<Steps>` per lab;
 * each step gets a stable anchor, `#step-1`, `#step-2`, and so on.
 */
export function Steps({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children).filter(isValidElement);
  return (
    <ol className="flex list-none flex-col gap-8 p-0">
      {steps.map((step, position) =>
        cloneElement(step as ReactElement<StepProps>, {
          index: position + 1,
        }),
      )}
    </ol>
  );
}

export function Step({ title, index = 0, children }: StepProps) {
  return (
    <li id={stepId(index)} className="scroll-mt-24">
      <h3 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
        <span
          aria-hidden
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground"
        >
          {index}
        </span>
        <span>
          <span className="sr-only">Step {index}: </span>
          {title}
        </span>
      </h3>
      <div className="mt-3 flex flex-col gap-3 sm:pl-10">{children}</div>
    </li>
  );
}
