import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const Card = ({
    title,
    desc,
    onClick,
    emoji,
  }: {
    title: string;
    desc: string;
    onClick: () => void;
    emoji: string;
  }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 18,
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 26 }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{desc}</div>
        </div>
      </div>
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc, #ffffff)",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Saarthi Dashboard
        </h1>
        <p style={{ opacity: 0.75, marginBottom: 18 }}>
          Choose an activity to start.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {/* ✅ 4 OPTIONS */}
          <Card
            emoji="🧩"
            title="AAC Board"
            desc="Communication board with categories and speech."
            onClick={() => navigate("/aac")}
          />

          <Card
            emoji="🎨"
            title="Color Matching"
            desc="Tap/Drag game → then goes to Board Game."
            onClick={() => navigate("/color-matching")}
          />

          <Card
            emoji="🎲"
            title="Board Game"
            desc="Main board game screen and progress."
            onClick={() => navigate("/board-game")}
          />

          <Card
            emoji="🗣️"
            title="Speech Practice"
            desc="(Next) Prompts / repetition / pronunciation."
            onClick={() => alert("Speech Practice page not added yet. Tell me route/name and I’ll add it.")}
          />
        </div>
      </div>
    </div>
  );
}
