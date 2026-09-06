import Link from "next/link";
import type { Job } from "@/lib/types";

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {job.job_type && <span className="badge">{job.job_type.replace("-", " ")}</span>}
        {job.category && <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>{job.category}</span>}
      </div>
      <h3 className="job-card__title">
        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="job-card__meta">
        {job.company && <span>🏢 {job.company}</span>}
        {job.location && <span>📍 {job.location}</span>}
        {job.salary && <span>💰 {job.salary}</span>}
      </p>
      <div className="job-card__action">
        <Link className="btn btn--primary" style={{ width: "100%" }} href={`/jobs/${job.id}`}>
          View Details
        </Link>
      </div>
    </article>
  );
}