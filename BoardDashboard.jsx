import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import { StatCard } from "../components/shared/StatCard";
import SubmissionRateLineChart from "../components/board/SubmissionRateLineChart";
import TrackPerformanceStackedBar from "../components/board/TrackPerformanceStackedBar";
import MembersOverviewTable from "../components/board/MembersOverviewTable";
import EvaluationFormEmbed from "../components/board/EvaluationFormEmbed";
import TrackFilterTabs from "../components/board/TrackFilterTabs";
import { fetchBoardData } from "../services/api";
import useScrollToHash from "../hooks/useScrollToHash";

const TRACKS = ["Web", "AI", "Cyber", "RAS"];

// Fallback demo data — same shape /api/board-data should return.
// 5 trainees per track so the "All / Web / AI / Cyber / RAS" filter has
// something real to show for each tab.
const ALL_MEMBERS = [
  { id: 1, name: "Omar Khaled", track: "Web", score: 88, attendance: 90, status: "Excellent" },
  { id: 2, name: "Laila Fathy", track: "Web", score: 74, attendance: 82, status: "Good" },
  { id: 3, name: "Ziad Nabil", track: "Web", score: 91, attendance: 95, status: "Excellent" },
  { id: 4, name: "Habiba Said", track: "Web", score: 58, attendance: 65, status: "At Risk" },
  { id: 5, name: "Kareem Younes", track: "Web", score: 80, attendance: 88, status: "Good" },

  { id: 6, name: "Sarah Ahmed", track: "AI", score: 92, attendance: 95, status: "Excellent" },
  { id: 7, name: "Mona Tarek", track: "AI", score: 76, attendance: 85, status: "Good" },
  { id: 8, name: "Ahmed Ezzat", track: "AI", score: 95, attendance: 98, status: "Excellent" },
  { id: 9, name: "Rana Fouad", track: "AI", score: 52, attendance: 60, status: "At Risk" },
  { id: 10, name: "Tarek Samir", track: "AI", score: 83, attendance: 87, status: "Good" },

  { id: 11, name: "Nourhan Ali", track: "Cyber", score: 71, attendance: 80, status: "Good" },
  { id: 12, name: "Youssef Hany", track: "Cyber", score: 89, attendance: 92, status: "Excellent" },
  { id: 13, name: "Salma Adel", track: "Cyber", score: 66, attendance: 72, status: "Good" },
  { id: 14, name: "Mostafa Reda", track: "Cyber", score: 45, attendance: 55, status: "At Risk" },
  { id: 15, name: "Dina Farouk", track: "Cyber", score: 93, attendance: 96, status: "Excellent" },

  { id: 16, name: "Youssef Adel", track: "RAS", score: 55, attendance: 60, status: "At Risk" },
  { id: 17, name: "Hana Gamal", track: "RAS", score: 79, attendance: 84, status: "Good" },
  { id: 18, name: "Amr Fathy", track: "RAS", score: 87, attendance: 90, status: "Excellent" },
  { id: 19, name: "Farida Ashraf", track: "RAS", score: 61, attendance: 68, status: "Good" },
  { id: 20, name: "Khaled Nasser", track: "RAS", score: 48, attendance: 58, status: "At Risk" },
];

// Per-track weekly submission rate, so the line chart genuinely changes
// when you switch tabs instead of just re-showing the same overall trend.
const SUBMISSION_TREND_BY_TRACK = {
  Web: [88, 82, 85, 79, 84, 86],
  AI: [95, 89, 91, 84, 88, 90],
  Cyber: [83, 78, 80, 75, 79, 81],
  RAS: [79, 74, 77, 70, 75, 77],
};
const WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6"];

function buildSubmissionTrend(track) {
  if (track === "All") {
    return WEEK_LABELS.map((week, i) => {
      const avg = Math.round(
        TRACKS.reduce((sum, t) => sum + SUBMISSION_TREND_BY_TRACK[t][i], 0) / TRACKS.length
      );
      return { week, rate: avg };
    });
  }
  return WEEK_LABELS.map((week, i) => ({ week, rate: SUBMISSION_TREND_BY_TRACK[track][i] }));
}

function buildTrackPerformance(members, track) {
  const tracksToShow = track === "All" ? TRACKS : [track];
  return tracksToShow.map((t) => {
    const inTrack = members.filter((m) => m.track === t);
    return {
      track: t,
      Excellent: inTrack.filter((m) => m.status === "Excellent").length,
      Good: inTrack.filter((m) => m.status === "Good").length,
      "At Risk": inTrack.filter((m) => m.status === "At Risk").length,
    };
  });
}

function buildStats(members) {
  const totalTrainees = members.length;
  const avgScore = totalTrainees
    ? Math.round(members.reduce((s, m) => s + m.score, 0) / totalTrainees)
    : 0;
  const submissionRate = totalTrainees
    ? Math.round((members.filter((m) => m.status !== "At Risk").length / totalTrainees) * 100)
    : 0;
  const atRisk = members.filter((m) => m.status === "At Risk").length;
  return { totalTrainees, avgScore, submissionRate, atRisk };
}

export default function BoardDashboard() {
  const [members, setMembers] = useState(ALL_MEMBERS);
  const [selectedTrack, setSelectedTrack] = useState("All");
  useScrollToHash(); // makes Sidebar links like "/dashboard/board#tracks" actually jump there

  useEffect(() => {
    fetchBoardData()
      .then((data) => setMembers(data.members ?? ALL_MEMBERS))
      .catch((err) => console.warn("[board-data] using demo data:", err.message));
  }, []);

  const filteredMembers = useMemo(
    () => (selectedTrack === "All" ? members : members.filter((m) => m.track === selectedTrack)),
    [members, selectedTrack]
  );

  const stats = useMemo(() => buildStats(filteredMembers), [filteredMembers]);
  const submissionTrend = useMemo(() => buildSubmissionTrend(selectedTrack), [selectedTrack]);
  const trackPerformance = useMemo(
    () => buildTrackPerformance(members, selectedTrack),
    [members, selectedTrack]
  );

  const scopeLabel = selectedTrack === "All" ? "all tracks" : `the ${selectedTrack} track`;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-col">
        <Topbar title="Board Overview" subtitle="Bird's-eye view of all trainees and tracks" />
        <div className="content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <TrackFilterTabs active={selectedTrack} onChange={setSelectedTrack} />
            <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
              Showing data for {scopeLabel}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <StatCard label="Trainees" value={stats.totalTrainees} />
            <StatCard label="Avg. Score" value={stats.avgScore} tone="good" />
            <StatCard label="Submission Rate" value={`${stats.submissionRate}%`} tone="good" />
            <StatCard label="At Risk" value={stats.atRisk} tone="bad" trend="needs follow-up" />
          </div>

          <div id="tracks" className="grid-2">
            <SubmissionRateLineChart
              data={submissionTrend}
              title={selectedTrack === "All" ? "Overall Submission Rate" : `${selectedTrack} Submission Rate`}
              subtitle={`% of trainees submitting on time, by week — ${scopeLabel}`}
            />
            <TrackPerformanceStackedBar
              data={trackPerformance}
              subtitle={
                selectedTrack === "All"
                  ? "Trainee count per performance band, per track"
                  : `Trainee count per performance band — ${selectedTrack}`
              }
            />
          </div>

          <div id="trainees">
            <MembersOverviewTable
              members={filteredMembers}
              subtitle={`${filteredMembers.length} trainee${filteredMembers.length === 1 ? "" : "s"} · ${scopeLabel}`}
            />
          </div>
          <EvaluationFormEmbed />
        </div>
      </div>
    </div>
  );
}
