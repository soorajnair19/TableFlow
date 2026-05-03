import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shared horizontal bounds for fixed header and scrollable main: same max width + padding everywhere. */
export const PAGE_INNER = "mx-auto w-full max-w-6xl px-6";

export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-neutral-50 text-neutral-900">{children}</div>;
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
    state: "completed" | "current" | "disabled";
  }>;
}) {
  const currentStepIndex = stepperItems?.findIndex((item) => item.state === "current") ?? -1;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
      <div className={cn(PAGE_INNER, "py-4")}>
        {stepperItems?.length ? (
          <nav className="mb-4 flex justify-center">
            <ol className="flex w-full max-w-3xl items-center">
              {stepperItems.map((item, idx) => {
                const isDoneConnection = idx > 0 && currentStepIndex >= idx;
                const node = (
                  <span className="inline-flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                        item.state === "completed" && "bg-green-600 text-white",
                        item.state === "current" && "bg-[#2A18EF] text-white",
                        item.state === "disabled" && "bg-neutral-300 text-white"
                      )}
                    >
                      {item.state === "completed" ? "✓" : idx + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        item.state === "current" && "text-[#2A18EF]",
                        item.state === "completed" && "text-neutral-700",
                        item.state === "disabled" && "text-neutral-400"
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                );

                return (
                  <li key={item.href} className="flex flex-1 items-start">
                    <div className="flex flex-1 items-start">
                      {item.state === "disabled" ? node : <Link href={item.href}>{node}</Link>}
                      {idx < stepperItems.length - 1 ? (
                        <span
                          className={cn(
                            "mt-3 h-0.5 flex-1 rounded-full",
                            isDoneConnection ? "bg-[#2A18EF]" : "bg-neutral-200"
                          )}
                        />
                      ) : null}
                    </div>
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
            <p className="text-sm text-neutral-600">{subtitle}</p>
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
    <div className={cn("rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
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
          ? "bg-[#2A18EF] text-white hover:bg-[#001CB5]"
          : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100",
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
        "h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900",
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
        "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900",
        props.className
      )}
    />
  );
}
