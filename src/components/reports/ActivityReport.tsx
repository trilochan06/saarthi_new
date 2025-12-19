import React, { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ActivityReport, { ActivityReportData } from "../components/reports/ActivityReport";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type SkillBreakdown = { skill: string; score: number }; // 0..100
type TrendPoint = { label: string; value: number }; // e.g., session1..sessionN

export type ActivityReportData = {
  childName: string;
  activityName: string;
  activityId?: string;

  completedAtISO: string;

  score: number; // 0..100
  accuracy: number; // 0..100
  timeSeconds: number;

  attempts: number;
  correct: number;
  wrong: number;

  // Graphs
  skillBreakdown: SkillBreakdown[];
  weeklyTrend: TrendPoint[];

  // Optional notes
  clinicianNotes?: string;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function ActivityReport({
  data,
  onClose,
}: {
  data: ActivityReportData;
  onClose?: () => void;
}) {
  const reportRef = useRef<HTMLDivElement>(null);

  const completedDate = useMemo(() => {
    try {
      return new Date(data.completedAtISO).toLocaleString();
    } catch {
      return data.completedAtISO;
    }
  }, [data.completedAtISO]);

  async function exportPdf() {
    if (!reportRef.current) return;

    // High-quality capture
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit image into A4 while preserving aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    let remainingHeight = imgHeight;

    // Multi-page support if content is tall
    while (remainingHeight > 0) {
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      if (remainingHeight > 0) {
        pdf.addPage();
        y -= pageHeight; // shift image up for next page
      }
    }

    const fileName = `${data.childName}-${data.activityName}-report.pdf`
      .replaceAll(" ", "_")
      .toLowerCase();

    pdf.save(fileName);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-pink-500" />
            <div>
              <div className="text-sm text-gray-500">Activity Report</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.activityName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportPdf}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Export as PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Report content (this is what becomes PDF) */}
        <div ref={reportRef} className="bg-white px-8 py-6">
          {/* Header like your reference */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500">Child</div>
                <div className="text-lg font-semibold text-gray-900">
                  {data.childName}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-sm font-medium text-gray-900">
                  {completedDate}
                </div>
              </div>
            </div>
          </div>

          {/* KPI cards row */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <KpiCard label="Score" value={`${data.score}/100`} />
            <KpiCard label="Accuracy" value={`${data.accuracy}%`} />
            <KpiCard label="Time" value={formatTime(data.timeSeconds)} />
            <KpiCard
              label="Attempts"
              value={`${data.attempts} (✓${data.correct} ✗${data.wrong})`}
            />
          </div>

          {/* Two column layout like dashboard reference */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Radar (skill areas) */}
            <div className="rounded-2xl border p-4 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  Skill Areas
                </div>
                <div className="text-xs text-gray-500">0–100</div>
              </div>

              <div className="mt-3 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.skillBreakdown}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                    <Radar dataKey="score" strokeWidth={2} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tip: These are the dimensions you can tune per activity (memory,
                attention, matching, sequencing…)
              </div>
            </div>

            {/* Middle: Trend */}
            <div className="rounded-2xl border p-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  Progress Trend
                </div>
                <div className="text-xs text-gray-500">Recent sessions</div>
              </div>

              <div className="mt-3 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyTrend}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoBox title="Current Goal" text="Maintain accuracy ≥ 80% and reduce time for same score." />
                <InfoBox title="Suggested Next Step" text="Increase difficulty by adding distractor colors + smaller time window." />
              </div>
            </div>
          </div>

          {/* Notes section */}
          <div className="mt-6 rounded-2xl border p-4">
            <div className="text-sm font-semibold text-gray-900">
              Clinician Notes
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {data.clinicianNotes?.trim()
                ? data.clinicianNotes
                : "No notes added."}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-gray-500">
            <div>Generated by Saarthi</div>
            <div>ID: {data.activityId || "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="text-xs font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-xs text-gray-600">{text}</div>
    </div>
  );
}
