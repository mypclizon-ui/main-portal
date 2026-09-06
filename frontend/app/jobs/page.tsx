"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFilters, listJobs } from "@/lib/api";
import type { Job } from "@/lib/types";
import JobCard from "../components/JobCard";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<{ categories: string[]; locations: string[]; types: string[] }>({
    categories: [], locations: [], types: [],
  });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFilters().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (category) params.category = category;
    if (location) params.location = location;
    if (jobType) params.job_type = jobType;
    listJobs(params)
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [q, category, location, jobType]);

  return (
    <section className="page">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Job Board</span>
          <h1 className="section-title">Browse Jobs</h1>
        </div>

        <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "1.4rem", marginBottom: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "0.8rem" }}>
            <div className="field">
              <label>Search</label>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title or keyword…" />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {filters.categories.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">All Locations</option>
                {filters.locations.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">All Types</option>
                {filters.types.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p>No jobs match your search.</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}