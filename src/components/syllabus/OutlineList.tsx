import type { OutlineItem } from "@/lib/syllabus";

export default function OutlineList({ items, depth = 0 }: { items: OutlineItem[]; depth?: number }) {
  if (items.length === 0) return null;

  return (
    <ul
      className={`flex flex-col gap-1.5 ${depth > 0 ? "mt-1.5 border-l border-border-subtle pl-3" : ""}`}
    >
      {items.map((item, i) => (
        <li key={i} className="text-[13px] leading-snug text-text-secondary">
          <span className={depth === 0 ? "text-text-primary" : ""}>{item.text}</span>
          {item.children && <OutlineList items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}
