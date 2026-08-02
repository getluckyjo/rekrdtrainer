"use client";

import Icon from "@/components/Icon";
import { LESSONS } from "@/lib/lessons";
import { markLessonRead, useLessonsRead } from "./lessonProgress";
import s from "./training.module.css";

/**
 * Native <details> so the whole module renders and works with JavaScript off.
 * The progress rail is the only thing JS adds — completion pressure with no
 * login and no account.
 */
export default function LessonAccordion() {
  const read = useLessonsRead();

  const count = read.length;
  const total = LESSONS.length;
  const allRead = count === total;

  return (
    <>
      <div className={s.rail} aria-live="polite">
        <span className={s.railCount}>
          {count} of {total} read
        </span>
        <span className={s.railTrack}>
          <span
            className={s.railFill}
            style={{ width: `${(count / total) * 100}%` }}
          />
        </span>
      </div>

      {LESSONS.map((lesson) => (
        <details
          key={lesson.id}
          id={lesson.id}
          className="post"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open)
              markLessonRead(lesson.id);
          }}
        >
          <summary>
            <span className="pnum">{lesson.n}</span>
            <Icon name={lesson.icon} size={18} />
            <span className="ptitle">{lesson.title}</span>
            <span className={s.time}>{lesson.seconds} sec</span>
            <span
              className={`${s.tick} ${read.includes(lesson.id) ? s.tickOn : ""}`}
              aria-hidden="true"
            />
          </summary>
          <div className="body">
            {lesson.blocks.map((b, i) => {
              if (b.kind === "p") return <p key={i}>{b.text}</p>;
              if (b.kind === "list")
                return (
                  <ul key={i}>
                    {b.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              return (
                <div className="callout" key={i}>
                  <h4>{b.label}</h4>
                  <p style={{ color: "var(--ink)" }}>{b.text}</p>
                </div>
              );
            })}
          </div>
        </details>
      ))}

      {allRead && (
        <div className={s.done}>
          <div>
            <div className={s.doneText}>You&rsquo;ve read the lot.</div>
            <div className={s.doneSub}>
              One more section — the claims rules — and then your code.
            </div>
          </div>
          <a className="btn" href="#claims">
            Keep going
          </a>
        </div>
      )}
    </>
  );
}
