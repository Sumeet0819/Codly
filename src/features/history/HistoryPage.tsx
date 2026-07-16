import { Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Panel } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAppSelector } from "../../store/hooks";
import { formatDateTime, formatDuration } from "../../utils/date";

export function HistoryPage() {
  const submissions = useAppSelector((state) => state.submissions.submissions);

  return (
    <>
      <PageHeader title="Submission History" description="Review accepted and failed submissions stored locally in this browser." />
      <Panel>
        {submissions.length === 0 ? (
          <div className="rounded-md border border-dashed border-palette-border p-8 text-center text-sm text-palette-muted">
            You haven't made any submissions yet. Start practicing to build your history!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-palette-border text-xs uppercase text-palette-muted bg-palette-surfaceHover/50">
                <tr>
                  <th className="px-3 py-3 font-medium">Problem</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Language</th>
                  <th className="px-3 py-3 font-medium">Runtime</th>
                  <th className="px-3 py-3 font-medium">Memory</th>
                  <th className="px-3 py-3 font-medium">Time Spent</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-border">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="transition hover:bg-palette-surfaceHover">
                    <td className="px-3 py-3">
                      <Link to={`/problem/${submission.problemId}`} className="font-heading font-medium text-palette-light hover:text-palette-teal">
                        {submission.problemTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge value={submission.status} />
                    </td>
                    <td className="px-3 py-3 text-palette-light/90">{submission.language}</td>
                    <td className="px-3 py-3 font-mono text-xs text-palette-muted">{submission.runtimeMs ?? 0}ms</td>
                    <td className="px-3 py-3 font-mono text-xs text-palette-muted">{submission.memoryKb ?? 0}KB</td>
                    <td className="px-3 py-3 text-palette-light/90">{formatDuration(submission.solveTimeSeconds)}</td>
                    <td className="px-3 py-3 text-palette-muted">{formatDateTime(submission.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
