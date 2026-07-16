import { Activity, Flame, Gauge, Target, Timer, Trophy, Plus, History } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Metric } from "../../components/ui/Metric";
import { Panel } from "../../components/ui/Panel";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAppSelector } from "../../store/hooks";
import { difficulties, topics } from "../../types/topics";
import { formatDateTime, formatDuration, getLastNDays } from "../../utils/date";

export function DashboardPage() {
  const { stats, recentActivity } = useAppSelector((state) => state.dashboard);
  const problems = useAppSelector((state) => state.problems.problems);

  const solvedByTopic = new Map<string, number>();
  const totalByTopic = new Map<string, number>();
  const solvedByDifficulty = new Map<string, number>();
  const totalByDifficulty = new Map<string, number>();

  for (const problem of problems) {
    totalByTopic.set(problem.topic, (totalByTopic.get(problem.topic) ?? 0) + 1);
    totalByDifficulty.set(problem.difficulty, (totalByDifficulty.get(problem.difficulty) ?? 0) + 1);
    if (problem.solvedAt) {
      solvedByTopic.set(problem.topic, (solvedByTopic.get(problem.topic) ?? 0) + 1);
      solvedByDifficulty.set(problem.difficulty, (solvedByDifficulty.get(problem.difficulty) ?? 0) + 1);
    }
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Track progress, spot weak topics, and get back into focused practice quickly."
        action={
          <Link to="/generate">
            <Button variant="primary" icon={<Plus className="h-5 w-5" />}>Generate Problem</Button>
          </Link>
        }
      />

      <motion.div 
        className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, staggerChildren: 0.1 }}
      >
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Solved" value={stats.questionsSolved} icon={<Trophy className="h-4 w-4" />} /></motion.div>
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Attempts" value={stats.totalAttempts} icon={<Activity className="h-4 w-4" />} /></motion.div>
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Accuracy" value={`${stats.accuracy}%`} icon={<Target className="h-4 w-4" />} /></motion.div>
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Streak" value={stats.dailyStreak} icon={<Flame className="h-4 w-4" />} /></motion.div>
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Longest" value={stats.longestStreak} icon={<Gauge className="h-4 w-4" />} /></motion.div>
        <motion.div whileHover={{ scale: 1.02 }}><Metric label="Avg Time" value={formatDuration(stats.averageSolveTimeSeconds)} icon={<Timer className="h-4 w-4" />} /></motion.div>
      </motion.div>

      <motion.div 
        className="mt-6 grid grid-cols-12 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Panel 
          title="Topic Progress" 
          action={<span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-palette-muted">12 CATEGORIES</span>} 
          className="col-span-12 lg:col-span-8"
        >
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {topics.map((topic) => (
              <ProgressBar
                key={topic}
                label={topic}
                value={solvedByTopic.get(topic) ?? 0}
                max={Math.max(totalByTopic.get(topic) ?? 0, 1)}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Difficulty Progress" className="col-span-12 flex flex-col lg:col-span-4">
          <div className="flex-1 space-y-6">
            {difficulties.map((difficulty) => {
              let dotColor = "bg-palette-teal";
              let barColor = "bg-palette-teal";
              let bgBarColor = "bg-palette-border/30";
              
              if (difficulty === "Easy") { dotColor = "bg-emerald-400"; barColor = "bg-emerald-400"; bgBarColor = "bg-emerald-400/20"; }
              else if (difficulty === "Medium") { dotColor = "bg-amber-400"; barColor = "bg-amber-400"; bgBarColor = "bg-amber-400/20"; }
              else if (difficulty === "Hard") { dotColor = "bg-rose-400"; barColor = "bg-rose-400"; bgBarColor = "bg-rose-400/20"; }

              return (
                <ProgressBar
                  key={difficulty}
                  label={<><div className={`h-2 w-2 rounded-full ${dotColor}`} /><span>{difficulty}</span></>}
                  value={solvedByDifficulty.get(difficulty) ?? 0}
                  max={Math.max(totalByDifficulty.get(difficulty) ?? 0, 1)}
                  colorClass={barColor}
                  bgColorClass={bgBarColor}
                />
              );
            })}
          </div>
        </Panel>

        <Panel 
          title="Practice Heatmap" 
          action={
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-palette-muted">LESS</span>
              <div className="flex gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-palette-surface"></div>
                <div className="h-2.5 w-2.5 rounded-sm bg-palette-teal/20"></div>
                <div className="h-2.5 w-2.5 rounded-sm bg-palette-teal/50"></div>
                <div className="h-2.5 w-2.5 rounded-sm bg-palette-teal"></div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-palette-muted">MORE</span>
            </div>
          }
          className="col-span-12 lg:col-span-8"
        >
          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1 sm:grid-cols-[repeat(21,minmax(0,1fr))] lg:grid-cols-[repeat(28,minmax(0,1fr))]">
            {getLastNDays(84).map((day) => {
              const count = stats.activityByDay[day] ?? 0;
              const opacity = count === 0 ? "bg-palette-surface" : count < 2 ? "bg-palette-teal/30" : count < 4 ? "bg-palette-teal/60" : "bg-palette-teal";
              return <div key={day} title={`${day}: ${count} activities`} className={`aspect-square rounded-sm ${opacity}`} />;
            })}
          </div>
        </Panel>

        <Panel title="Recent Activity" className="col-span-12 lg:col-span-4">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-palette-border/50 py-12 text-center opacity-70">
              <History className="mb-3 h-8 w-8 text-palette-muted" />
              <p className="text-sm font-medium text-palette-light">No submissions yet.</p>
              <p className="mt-1 text-xs text-palette-muted">Start with the seeded problem or generate a fresh one.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  to={`/problem/${activity.problemId}`}
                  className="grid gap-2 rounded-md border border-palette-border bg-palette-surfaceHover p-3 transition hover:border-palette-teal/50 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-heading font-medium text-palette-light">{activity.title}</span>
                    <StatusBadge value={activity.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-palette-muted">
                    <span>{activity.language}</span>
                    <span>{formatDuration(activity.solveTimeSeconds)}</span>
                    <span>{formatDateTime(activity.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </motion.div>
    </>
  );
}
