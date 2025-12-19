// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// import { useQuery } from "@tanstack/react-query";
// import { apiGet } from "@/lib/api";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";

// import { useTherapyStore } from "@/stores/therapyStore";
// import { Activity, Language, ProgressEntry } from "@/types/therapy";
// import {
//   Plus,
//   Edit,
//   Eye,
//   Send,
//   Users,
//   LayoutGrid,
//   TrendingUp,
//   LogOut,
//   Heart,
//   Database,
// } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import AssignActivityModal from "@/components/AssignActivityModal";

// /* -------------------- Activity Labels -------------------- */
// const activityTypeKeyMap = {
//   aac: "activity.aac",
//   matching: "activity.matching",
//   "visual-schedule": "activity.visualSchedule",
//   speech: "activity.speech",
// } as const;

// const activityTypeColors = {
//   aac: "bg-therapy-teal-light text-therapy-teal",
//   matching: "bg-therapy-coral-light text-therapy-coral",
//   "visual-schedule": "bg-therapy-amber-light text-therapy-amber",
//   speech: "bg-therapy-lavender-light text-therapy-lavender",
// } as const;

// const statusColors = {
//   assigned: "bg-muted text-muted-foreground",
//   "in-progress": "bg-therapy-amber-light text-therapy-amber",
//   completed: "bg-therapy-sage-light text-therapy-sage",
// } as const;

// /* -------------------- Backend Types -------------------- */
// type DatasetInfo = {
//   name: string;
//   status: string;
//   sample_count_cached: number;
//   last_refreshed_utc?: string | null;
//   error?: string | null;
// };

// /* -------------------- Live Datasets Panel (FIXED) -------------------- */
// function LiveDatasetsPanel() {
//   const { t } = useTranslation();

//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ["datasets"],
//     queryFn: () => apiGet<{ datasets: DatasetInfo[] }>("/datasets"),
//     refetchInterval: 30_000,
//   });

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Database className="w-5 h-5" />
//           {t("dashboard.datasets")}
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {isLoading && (
//           <p className="text-sm text-muted-foreground">
//             {t("common.loading")}
//           </p>
//         )}

//         {error && (
//           <div className="space-y-2">
//             <p className="text-sm text-red-500">
//               {t("dashboard.datasetError")}
//             </p>
//             <Button variant="outline" size="sm" onClick={() => refetch()}>
//               {t("common.retry")}
//             </Button>
//           </div>
//         )}

//         {!isLoading && !error && (
//           <>
//             {(data?.datasets || []).map((d) => (
//               <div
//                 key={d.name}
//                 className="flex justify-between border rounded px-3 py-2 text-sm"
//               >
//                 <span className="font-medium">{d.name}</span>
//                 <span className="text-muted-foreground">
//                   {d.status} · {d.sample_count_cached}
//                 </span>
//               </div>
//             ))}

//             {(data?.datasets || []).length === 0 && (
//               <p className="text-sm text-muted-foreground">
//                 {t("dashboard.noDatasets")}
//               </p>
//             )}

//             <Button variant="outline" size="sm" onClick={() => refetch()}>
//               {t("common.refresh")}
//             </Button>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// /* -------------------- Page -------------------- */
// const TherapistDashboard = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const { learners, activities, assignments, addLearner, logout } =
//     useTherapyStore();

//   const [showAddLearner, setShowAddLearner] = useState(false);
//   const [assigningActivity, setAssigningActivity] = useState<Activity | null>(
//     null
//   );

//   const [newLearner, setNewLearner] = useState({
//     name: "",
//     age: "",
//     preferredLanguage: "english" as Language,
//   });

//   const handleAddLearner = () => {
//     if (!newLearner.name || !newLearner.age) return;

//     addLearner({
//       name: newLearner.name,
//       age: Number(newLearner.age),
//       preferredLanguage: newLearner.preferredLanguage,
//     });

//     toast({
//       title: t("toast.learnerAdded"),
//       description: newLearner.name,
//     });

//     setNewLearner({ name: "", age: "", preferredLanguage: "english" });
//     setShowAddLearner(false);
//   };

//   const getProgressEntries = (): ProgressEntry[] =>
//     assignments.map((a) => {
//       const learner = learners.find((l) => l.id === a.learnerId);
//       const activity = activities.find((act) => act.id === a.activityId);
//       return {
//         childName: learner?.name || t("common.unknown"),
//         activityName: activity?.name || t("common.unknown"),
//         status: a.status,
//         lastUpdate: a.lastUpdate,
//         assignmentId: a.id,
//         learnerId: a.learnerId,
//         activityId: a.activityId,
//       };
//     });

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="bg-card border-b sticky top-0 z-10">
//         <div className="container mx-auto px-6 py-4 flex justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl therapy-gradient flex items-center justify-center">
//               <Heart className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">{t("app.name")}</h1>
//               <p className="text-sm text-muted-foreground">
//                 {t("dashboard.title")}
//               </p>
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <Button onClick={() => navigate("/therapist/create")}>
//               <Plus className="w-4 h-4" />
//               {t("dashboard.createActivity")}
//             </Button>
//             <Button variant="ghost" size="icon" onClick={logout}>
//               <LogOut className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="container mx-auto px-6 py-8">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Learners */}
//           <div className="col-span-3">
//             <Card>
//               <CardHeader className="flex flex-row justify-between">
//                 <CardTitle>
//                   <Users className="inline mr-2" />
//                   {t("dashboard.learners")}
//                 </CardTitle>

//                 <Dialog open={showAddLearner} onOpenChange={setShowAddLearner}>
//                   <DialogTrigger asChild>
//                     <Button size="sm">
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </DialogTrigger>

//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>
//                         {t("dashboard.addLearner")}
//                       </DialogTitle>
//                     </DialogHeader>

//                     <div className="space-y-3">
//                       <Label>{t("dashboard.childName")}</Label>
//                       <Input
//                         value={newLearner.name}
//                         onChange={(e) =>
//                           setNewLearner({ ...newLearner, name: e.target.value })
//                         }
//                       />

//                       <Label>{t("dashboard.age")}</Label>
//                       <Input
//                         type="number"
//                         value={newLearner.age}
//                         onChange={(e) =>
//                           setNewLearner({ ...newLearner, age: e.target.value })
//                         }
//                       />

//                       <Label>{t("dashboard.language")}</Label>
//                       <Select
//                         value={newLearner.preferredLanguage}
//                         onValueChange={(v: Language) =>
//                           setNewLearner({
//                             ...newLearner,
//                             preferredLanguage: v,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="english">
//                             {t("language.english")}
//                           </SelectItem>
//                           <SelectItem value="hindi">
//                             {t("language.hindi")}
//                           </SelectItem>
//                           <SelectItem value="tamil">
//                             {t("language.tamil")}
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>

//                       <Button onClick={handleAddLearner}>
//                         {t("common.save")}
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </CardHeader>
//             </Card>
//           </div>

//           {/* Activities */}
//           <div className="col-span-5">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("dashboard.activities")}</CardTitle>
//               </CardHeader>

//               <CardContent className="grid grid-cols-2 gap-4">
//                 {activities.map((a) => (
//                   <div key={a.id} className="p-4 border rounded-xl">
//                     <Badge className={activityTypeColors[a.type]}>
//                       {t(activityTypeKeyMap[a.type])}
//                     </Badge>

//                     <h3 className="font-semibold mt-2">{a.name}</h3>

//                     <div className="flex gap-2 mt-3">
//                       <Button size="sm" onClick={() => navigate(`/preview/${a.id}`)}>
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                       <Button size="sm" onClick={() => setAssigningActivity(a)}>
//                         <Send className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right */}
//           <div className="col-span-4 space-y-6">
//             <LiveDatasetsPanel />

//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("dashboard.progress")}</CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-3">
//                 {getProgressEntries().map((e) => (
//                   <div key={e.assignmentId} className="p-3 border rounded-lg">
//                     <p className="font-medium">{e.childName}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {e.activityName}
//                     </p>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>

//       {assigningActivity && (
//         <AssignActivityModal
//           activity={assigningActivity}
//           open
//           onClose={() => setAssigningActivity(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default TherapistDashboard;

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
