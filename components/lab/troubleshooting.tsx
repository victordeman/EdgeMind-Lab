import { Children, isValidElement, type ReactNode } from "react";

type IssueProps = {
  symptom: string;
  cause: string;
  fix: string;
};

/** One symptom, its likely cause and the fix. Use inside `<Troubleshooting>`. */
export function Issue({ symptom, cause, fix }: IssueProps) {
  return (
    <li className="rounded-lg border border-border p-4">
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[8rem_1fr]">
        <dt className="font-semibold">Symptom</dt>
        <dd>{symptom}</dd>
        <dt className="font-semibold">Likely cause</dt>
        <dd>{cause}</dd>
        <dt className="font-semibold">Fix</dt>
        <dd>{fix}</dd>
      </dl>
    </li>
  );
}

/** List of `<Issue>` entries, symptom then cause then fix. */
export function Troubleshooting({ children }: { children: ReactNode }) {
  const issues = Children.toArray(children).filter(isValidElement);
  return <ul className="flex list-none flex-col gap-3 p-0">{issues}</ul>;
}
