"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Accordion from "@/components/syllabus/Accordion";
import OutlineList from "@/components/syllabus/OutlineList";
import BookList from "@/components/syllabus/BookList";
import SectionHeading from "@/components/syllabus/SectionHeading";
import { useRequireProfile } from "@/lib/useProfile";
import { getSubject } from "@/lib/syllabus";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

export default function SubjectPage() {
  const { profile, loading } = useRequireProfile();
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code);

  const subject = useMemo(() => getSubject(code), [code]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  if (!subject) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 px-6 pt-24 text-center">
          <BookOpen size={28} className="text-text-tertiary" />
          <p className="text-sm text-text-secondary">Couldn&apos;t find that subject.</p>
          <Link href="/syllabus" className="mt-2 text-sm font-medium text-accent-soft">
            Back to Syllabus
          </Link>
        </div>
      </AppShell>
    );
  }

  const scheme = subject.teachingScheme;
  const hasScheme = scheme && Object.values(scheme).some(Boolean);

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <Link
          href="/syllabus"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary"
        >
          <ArrowLeft size={13} />
          Syllabus
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
              {subject.category && <span>{subject.category}</span>}
              {subject.category && <span aria-hidden>&middot;</span>}
              <span>{subject.standing}</span>
              {typeof subject.credits === "number" && (
                <>
                  <span aria-hidden>&middot;</span>
                  <span>{subject.credits} credits</span>
                </>
              )}
            </p>
            <h1 className="mt-1 text-xl font-semibold leading-snug text-text-primary">
              {subject.name}
            </h1>
          </div>
        </div>

        <a
          href={subject.pdf}
          download
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white"
        >
          <Download size={16} />
          Download PDF
        </a>

        {hasScheme && (
          <div className="mt-6">
            <SectionHeading>Teaching Scheme</SectionHeading>
            <div className="glass grid grid-cols-2 gap-3 rounded-xl px-4 py-3 text-[13px]">
              {scheme?.lecturesPerWeek && (
                <div>
                  <p className="text-text-tertiary">Lectures</p>
                  <p className="text-text-primary">{scheme.lecturesPerWeek}</p>
                </div>
              )}
              {scheme?.labPerWeek && (
                <div>
                  <p className="text-text-tertiary">Laboratory</p>
                  <p className="text-text-primary">{scheme.labPerWeek}</p>
                </div>
              )}
              {scheme?.selfStudyPerWeek && (
                <div>
                  <p className="text-text-tertiary">Self-Study</p>
                  <p className="text-text-primary">{scheme.selfStudyPerWeek}</p>
                </div>
              )}
              {scheme?.tutorialPerWeek && (
                <div>
                  <p className="text-text-tertiary">Tutorial</p>
                  <p className="text-text-primary">{scheme.tutorialPerWeek}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {subject.evaluationScheme && subject.evaluationScheme.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Evaluation Scheme</SectionHeading>
            <div className="glass flex flex-col divide-y divide-border-subtle rounded-xl px-4">
              {subject.evaluationScheme.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-text-secondary">{c.label}</span>
                  <span className="font-medium text-text-primary">{c.marks} Marks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {subject.courseOutcomes.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Course Outcomes</SectionHeading>
            <div className="flex flex-col gap-2">
              {subject.courseOutcomes.map((co) => (
                <div key={co.id} className="glass flex gap-3 rounded-xl px-4 py-3">
                  <span className="shrink-0 text-xs font-semibold text-accent-soft">{co.id}</span>
                  <p className="text-[13px] leading-snug text-text-secondary">{co.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {subject.units.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Syllabus</SectionHeading>
            <div className="flex flex-col gap-2">
              {subject.units.map((unit, i) => (
                <Accordion
                  key={i}
                  title={`Unit ${i + 1}: ${unit.title}`}
                  subtitle={unit.hours ? `${unit.hours} Hrs` : undefined}
                  defaultOpen={i === 0}
                >
                  <p className="text-[13px] leading-relaxed text-text-secondary">{unit.topics}</p>
                </Accordion>
              ))}
            </div>
          </div>
        )}

        {subject.selfStudy && (
          <div className="mt-6">
            <SectionHeading>Self-Study</SectionHeading>
            <Accordion
              title={subject.selfStudy.title}
              subtitle={subject.selfStudy.hours ? `${subject.selfStudy.hours} Hrs` : undefined}
            >
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {subject.selfStudy.topics}
              </p>
            </Accordion>
          </div>
        )}

        {subject.practicals && subject.practicals.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Practicals</SectionHeading>
            <div className="flex flex-col gap-2">
              {subject.practicals.map((lab) => (
                <Accordion key={lab.id} title={lab.title}>
                  <OutlineList items={lab.items} />
                </Accordion>
              ))}
            </div>
          </div>
        )}

        {subject.textbooks.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Textbooks</SectionHeading>
            <BookList books={subject.textbooks} />
          </div>
        )}

        {subject.referenceBooks.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Reference Books</SectionHeading>
            <BookList books={subject.referenceBooks} />
          </div>
        )}

        {subject.webReferences && subject.webReferences.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Web References</SectionHeading>
            <div className="flex flex-col gap-2">
              {subject.webReferences.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] text-accent-soft"
                >
                  <LinkIcon size={13} className="shrink-0" />
                  <span className="truncate">{ref.text}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {subject.extraSections?.map((section, i) => (
          <div key={i} className="mt-6">
            <SectionHeading>{section.heading}</SectionHeading>
            <div className="glass flex flex-col gap-2 rounded-xl px-4 py-3">
              {section.content.map((line, j) => (
                <p key={j} className="text-[13px] leading-snug text-text-secondary">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
