import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";
import {ArrowLeftIcon,Loader2,Sparkles,Gauge,CheckCircle2,AlertTriangle,Target,ListChecks,Lightbulb,Layers,}from "lucide-react";

const AnalyzeResume = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const score = analysis?.atsScore ?? null;

  const scoreLabel = useMemo(() => {
    if (score === null || score === undefined) return "";
    if (score >= 90) return "Outstanding ATS Match";
    if (score >= 80) return "Strong Match";
    if (score >= 70) return "Good, Can Be Sharpened";
    if (score >= 50) return "Average, Needs Work";
    return "High Risk of Rejection";
  }, [score]);

  const scoreColorClasses = useMemo(() => {
    if (score === null || score === undefined) {
      return {
        ring: "border-slate-300",
        text: "text-slate-700",
        badge: "bg-slate-100 text-slate-700",
      };
    }
    if (score >= 80) {
      return {
        ring: "border-emerald-400",
        text: "text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
      };
    }
    if (score >= 60) {
      return {
        ring: "border-amber-400",
        text: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
      };
    }
    return {
      ring: "border-rose-400",
      text: "text-rose-600",
      badge: "bg-rose-100 text-rose-700",
    };
  }, [score]);

  const loadAndAnalyze = async () => {
    setError("");
    setStep(1);
    setLoadingResume(true);
    try {
      // Step 1: Fetch resume data
      const { data: resumeResp } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: {
          Authorization: token,
        },
      });
      setResume(resumeResp.resume || null);
      setLoadingResume(false);
      setStep(2);

      // Step 2: Call AI analysis
      setLoadingAnalysis(true);
      const { data: aiResp } = await api.post(
        "/api/ai/analyze-resume",
        { resumeId },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setAnalysis(aiResp.analysis || null);
      setLoadingAnalysis(false);
      setStep(3);
    } catch (err) {
      console.error(err);
      setLoadingResume(false);
      setLoadingAnalysis(false);
      setError(err?.response?.data?.message || "Failed to analyze resume.");
      toast.error(err?.response?.data?.message || "Failed to analyze resume.");
    }
  };

  useEffect(() => {
    if (token && resumeId) {
      loadAndAnalyze();
    }
  }, [token, resumeId]);

  const isLoading = loadingResume || loadingAnalysis;

  const sectionFeedback = analysis?.sectionFeedback || {
    summary: "",
    experience: "",
    projects: "",
    skills: "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              <ArrowLeftIcon className="size-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700 border border-purple-100">
            <Sparkles className="size-3" />
            <span>AI-Powered ATS Analysis</span>
          </div>
        </div>

        {/* Header / Hero */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 flex items-center gap-2">
            Analyze Resume with AI
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Get an ATS compatibility score, identify gaps, and receive actionable, recruiter‑grade
            feedback tailored for software and tech roles.
          </p>

          {resume && (
            <div className="mt-3 inline-flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm border border-slate-200">
                <span className="mr-1 font-medium text-slate-800">Resume:</span>
                {resume.title}
              </span>
              {resume.personal_info?.full_name && (
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-slate-100 text-xs">
                  Candidate:&nbsp;{resume.personal_info.full_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress / Steps */}
        <div className="mb-6">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {[
              { id: 1, label: "Fetching resume" },
              { id: 2, label: "Analyzing with AI" },
              { id: 3, label: "Review insights" },
            ].map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex-1 flex items-center gap-2">
                  <div
                    className={[
                      "flex items-center justify-center size-7 rounded-full text-xs border",
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : isActive
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-slate-500 border-slate-300",
                    ].join(" ")}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4" /> : s.id}
                  </div>
                  <div className="flex-1">
                    <p
                      className={
                        isActive || isCompleted
                          ? "font-medium text-slate-800"
                          : "font-medium text-slate-400"
                      }
                    >
                      {s.label}
                    </p>
                    {s.id === 2 && (
                      <p className="text-[11px] text-slate-400">
                        We simulate an ATS and a senior tech recruiter to benchmark your resume.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500"
              style={{
                width: `${(Math.max(step, 1) / 3) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="size-4 mt-0.5" />
            <div>
              <p className="font-semibold">We couldn&apos;t analyze this resume.</p>
              <p className="mt-1">{error}</p>
              <button
                onClick={loadAndAnalyze}
                className="mt-2 inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700 transition-colors"
              >
                <Loader2 className="size-3 animate-spin" />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="size-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">AI is scoring your resume…</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="size-20 rounded-full border-4 border-slate-200" />
                    <Loader2 className="absolute size-8 text-purple-500 animate-spin" />
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs">
                    We&apos;re analyzing structure, keywords, and impact to estimate how your
                    resume will perform in modern ATS systems for software/tech roles.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Sparkles className="size-4 text-purple-500" />
                  <span>What you&apos;ll get</span>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>ATS compatibility score (0–100)</li>
                  <li>Strengths and weaknesses in recruiter language</li>
                  <li>Missing but relevant keywords for tech roles</li>
                  <li>Section‑wise feedback and concrete suggestions</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 border border-dashed border-slate-200 animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="h-28 rounded-lg bg-white border border-slate-200" />
                <div className="h-28 rounded-lg bg-white border border-slate-200" />
              </div>
            </div>
          </div>
        )}

        {/* Analysis content */}
        {!isLoading && analysis && !error && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Score + high level cards */}
            <div className="lg:col-span-5 space-y-5">
              {/* ATS Score */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      ATS Compatibility
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      How well your resume is likely to pass automated screening for tech roles.
                    </p>
                  </div>
                  <Gauge className="size-5 text-slate-400" />
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`size-24 sm:size-28 rounded-full border-8 ${scoreColorClasses.ring} bg-gradient-to-br from-white to-slate-50 flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <p className={`text-3xl font-semibold ${scoreColorClasses.text}`}>
                          {score ?? "--"}
                        </p>
                        <p className="text-[11px] text-slate-400">out of 100</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${scoreColorClasses.badge}`}
                    >
                      <Target className="size-3" />
                      {scoreLabel || "Awaiting score"}
                    </span>
                    <p className="text-xs text-slate-500">
                      Aim for a score of <span className="font-semibold">80+</span> to be
                      competitive for modern software and tech roles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white border border-emerald-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-emerald-700">Strengths</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-800">
                    {(analysis.strengths || []).length ? (
                      analysis.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 size-1.5 rounded-full bg-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-emerald-800/70">
                        No explicit strengths detected. Try adding more concrete impact and
                        measurable outcomes.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl bg-white border border-amber-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <p className="text-sm font-semibold text-amber-700">Weaknesses</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {(analysis.weaknesses || []).length ? (
                      analysis.weaknesses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 size-1.5 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-amber-900/70">
                        No major weaknesses flagged. Consider tightening language and adding more
                        metrics regardless.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListChecks className="size-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-800">Missing Keywords</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Add relevant, truthful keywords where they naturally fit in your experience,
                  projects, or skills to improve ATS matching.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.missingKeywords || []).length ? (
                    analysis.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700 border border-slate-200"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      No specific missing keywords were identified.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Section‑wise feedback + suggestions */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section Feedback */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Section‑wise Feedback
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Summary
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">
                      {sectionFeedback.summary || "No specific feedback for the summary section."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Experience
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">
                      {sectionFeedback.experience ||
                        "No specific feedback for the experience section."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Projects
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">
                      {sectionFeedback.projects ||
                        "No specific feedback for the projects section."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Skills
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">
                      {sectionFeedback.skills || "No specific feedback for the skills section."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Suggestions */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-amber-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Actionable Improvements
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Use these as a checklist when editing your resume in the builder. Focus on
                  making each bullet outcome-driven and measurable.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(analysis.suggestions || []).length ? (
                    analysis.suggestions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 size-1.5 rounded-full bg-purple-400" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">
                      No specific suggestions provided. Consider tightening wording, adding metrics,
                      and aligning bullets with target job descriptions.
                    </li>
                  )}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <p>
                    Ready to apply changes? Open this resume in the builder and update your content
                    section by section.
                  </p>
                  <Link
                    to={`/app/builder/${resumeId}`}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-[11px] text-slate-50 hover:bg-slate-800 transition-colors"
                  >
                    Edit in Builder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no analysis but not loading (edge) */}
        {!isLoading && !analysis && !error && (
          <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-600">
            We couldn&apos;t display analysis for this resume. Please try again in a moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeResume;