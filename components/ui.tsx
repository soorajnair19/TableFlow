import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shared horizontal bounds for fixed header and scrollable main: same max width + padding everywhere. */
export const PAGE_INNER = "mx-auto w-full max-w-6xl px-6";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">{children}</div>
  );
}

export function StepHeader({
  step,
  title,
  subtitle,
  actions,
  stepperItems,
}: {
  step: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  stepperItems?: Array<{
    label: string;
    href: string;
    state: "completed" | "current" | "available" | "disabled";
  }>;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className={cn(PAGE_INNER, "py-4")}>
        {stepperItems?.length ? (
          <nav className="mb-4 w-full" aria-label="Progress">
            <ol className="flex w-full list-none flex-row flex-wrap items-start gap-y-2 p-0">
              {stepperItems.map((item, idx) => {
                const isDoneConnection = item.state === "completed";
                const node = (
                  <span className="inline-flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                        item.state === "completed" && "bg-green-600 text-white",
                        item.state === "current" && "bg-[#2A18EF] text-white",
                        item.state === "available" &&
                          "border-2 border-neutral-300 bg-white text-neutral-800 shadow-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-none",
                        item.state === "disabled" && "bg-neutral-300 text-white dark:bg-neutral-800 dark:text-neutral-500"
                      )}
                    >
                      {item.state === "completed" ? "✓" : idx + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        item.state === "current" && "text-[#2A18EF] dark:text-[#A7B0FF]",
                        item.state === "completed" && "text-neutral-700 dark:text-neutral-300",
                        item.state === "available" && "text-neutral-700 dark:text-neutral-300",
                        item.state === "disabled" && "text-neutral-400 dark:text-neutral-600"
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                );

                return (
                  <li key={item.href} className="flex items-start">
                    <div className="shrink-0">
                      {item.state === "disabled" ? node : <Link href={item.href}>{node}</Link>}
                    </div>
                    {idx < stepperItems.length - 1 ? (
                      <span
                        aria-hidden
                        className={cn(
                          "mt-3 mx-2 h-0.5 w-10 shrink-0 rounded-full sm:mx-2.5 sm:w-12",
                          isDoneConnection ? "bg-[#2A18EF]" : "bg-neutral-200 dark:bg-neutral-700"
                        )}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="sr-only">{step}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn(PAGE_INNER, "py-8", className)}>{children}</div>;
}

export function Card({ children, className, ...props }: PropsWithChildren<{ className?: string }> & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p> : null}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-[#2A18EF] text-white hover:bg-[#001CB5] disabled:bg-neutral-200 disabled:text-neutral-500 disabled:hover:bg-neutral-200 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 dark:disabled:hover:bg-neutral-800"
          : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 disabled:border-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:disabled:border-neutral-700 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-600 dark:disabled:hover:bg-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-300",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-300",
        props.className
      )}
    />
  );
}
