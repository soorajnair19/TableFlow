import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-neutral-50 text-neutral-900">{children}</div>;
}

export function StepHeader({
  step,
  title,
  subtitle,
  actions,
}: {
  step: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-6 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-500">{step}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-neutral-600">{subtitle}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 py-8", className)}>{children}</div>;
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm", className)}>
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
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition",
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
