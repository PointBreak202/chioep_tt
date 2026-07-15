import type { Book } from "@/lib/syllabus";

export default function BookList({ books }: { books: Book[] }) {
  return (
    <div className="flex flex-col gap-2">
      {books.map((book, i) => (
        <div key={i} className="glass rounded-xl px-4 py-3">
          <p className="text-[13px] font-medium leading-snug text-text-primary">{book.name}</p>
          {book.author && <p className="mt-0.5 text-xs text-text-secondary">{book.author}</p>}
        </div>
      ))}
    </div>
  );
}
