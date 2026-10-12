"use client";

/** A submit button that asks before it lets the form go — for deletes and restores. */
export function ConfirmButton({
  message,
  variant = "danger",
  children,
}: {
  message: string;
  variant?: "danger" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={`btn ${variant === "danger" ? "btn-danger" : "btn-secondary btn-sm"}`}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
