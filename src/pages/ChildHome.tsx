import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function ChildHome() {
  const navigate = useNavigate();

  const options = useMemo(
    () => [
      {
        title: "AAC Board",
        desc: "Open communication board / AAC preview activity",
        emoji: "🧩",
        onClick: () => navigate("/preview/activity-1"),
      },
      {
        title: "Color Matching",
        desc: "Interactive color game (opens only when you click here)",
        emoji: "🎨",
        onClick: () => navigate("/color-matching"),
      },
      {
        title: "Board Game",
        desc: "Go to board game page",
        emoji: "🎲",
        onClick: () => navigate("/board-game"),
      },
      {
        title: "Activity Preview",
        desc: "Preview another activity example",
        emoji: "👀",
        onClick: () => navigate("/preview/activity-2"),
      },
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Child Home</h1>
          <p className="text-muted-foreground">
            Choose an activity to start.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.title}
              onClick={o.onClick}
              className="rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{o.emoji}</div>
                <div>
                  <div className="text-lg font-semibold">{o.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {o.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
          Tip: Color Matching should open only via the “Color Matching” card.
          If it goes to <code className="px-1">/preview/...</code>, your button
          routing is wrong.
        </div>
      </div>
    </div>
  );
}
