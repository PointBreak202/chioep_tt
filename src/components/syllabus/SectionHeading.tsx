export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
      {children}
    </p>
  );
}
