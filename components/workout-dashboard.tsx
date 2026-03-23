"use client";

import { useEffect, useState } from "react";
import type { FitnessGoal, FitnessLevel, WorkoutPlan, WorkoutRecord, WorkoutRequest } from "@/lib/types";

const equipmentOptions = [
  "bodyweight",
  "dumbbells",
  "barbell",
  "kettlebells",
  "pull_up_bar",
  "cardio_machine"
];

const defaultForm: WorkoutRequest = {
  name: "Avery",
  goal: "general_fitness",
  level: "intermediate",
  daysPerWeek: 4,
  sessionLength: 45,
  equipment: ["bodyweight", "dumbbells"],
  notes: ""
};

const goalLabels: Record<FitnessGoal, string> = {
  muscle_gain: "Muscle gain",
  fat_loss: "Fat loss",
  endurance: "Endurance",
  strength: "Strength",
  general_fitness: "General fitness"
};

const levelLabels: Record<FitnessLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

export function WorkoutDashboard() {
  const [form, setForm] = useState<WorkoutRequest>(defaultForm);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    setIsLoadingHistory(true);

    try {
      const response = await fetch("/api/workouts");
      const payload = (await response.json()) as { workouts?: WorkoutRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "History request failed.");
      }

      setHistory(payload.workouts ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function generatePlan() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { plan?: WorkoutPlan; error?: string };

      if (!response.ok || !payload.plan) {
        throw new Error(payload.error ?? "Plan generation failed.");
      }

      setPlan(payload.plan);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Plan generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function savePlan() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as {
        workout?: WorkoutRecord;
        plan?: WorkoutPlan;
        error?: string;
      };

      if (!response.ok || !payload.workout || !payload.plan) {
        throw new Error(payload.error ?? "Save failed.");
      }

      setPlan(payload.plan);
      setHistory((current) => [payload.workout as WorkoutRecord, ...current].slice(0, 6));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleEquipment(item: string) {
    setForm((current) => {
      const exists = current.equipment.includes(item);
      const nextEquipment = exists
        ? current.equipment.filter((entry) => entry !== item)
        : [...current.equipment, item];

      return {
        ...current,
        equipment: nextEquipment.length ? nextEquipment : ["bodyweight"]
      };
    });
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="panel hero-copy">
          <span className="eyebrow">Next.js + Supabase + Vercel</span>
          <h1>Forge a plan that actually fits your week.</h1>
          <p>
            Generate personalized workouts, save them to Supabase, and ship the whole app on Vercel.
            This starter gives you a polished frontend, API routes, and database-backed workout history.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <strong>2-6</strong>
              <span>Training days per week</span>
            </div>
            <div className="stat">
              <strong>20-120</strong>
              <span>Minutes per session</span>
            </div>
            <div className="stat">
              <strong>6</strong>
              <span>Recent plans stored</span>
            </div>
          </div>
        </div>

        <section className="panel form-panel">
          <h2 className="section-title">Build your workout</h2>
          <p className="muted">Adjust the inputs, generate instantly, then save the plan to your Supabase project.</p>

          <div className="form-grid">
            <label className="field">
              <span className="label">Name</span>
              <input
                className="input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your name"
              />
            </label>

            <label className="field">
              <span className="label">Goal</span>
              <select
                className="select"
                value={form.goal}
                onChange={(event) => setForm({ ...form, goal: event.target.value as FitnessGoal })}
              >
                {Object.entries(goalLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Level</span>
              <select
                className="select"
                value={form.level}
                onChange={(event) => setForm({ ...form, level: event.target.value as FitnessLevel })}
              >
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Days per week</span>
              <input
                className="input"
                type="number"
                min={2}
                max={6}
                value={form.daysPerWeek}
                onChange={(event) => setForm({ ...form, daysPerWeek: Number(event.target.value) })}
              />
            </label>

            <label className="field">
              <span className="label">Minutes per session</span>
              <input
                className="input"
                type="number"
                min={20}
                max={120}
                step={5}
                value={form.sessionLength}
                onChange={(event) => setForm({ ...form, sessionLength: Number(event.target.value) })}
              />
            </label>

            <label className="field-wide">
              <span className="label">Equipment</span>
              <div className="equipment-grid">
                {equipmentOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`pill ${form.equipment.includes(item) ? "active" : ""}`}
                    onClick={() => toggleEquipment(item)}
                  >
                    {item.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </label>

            <label className="field-wide">
              <span className="label">Notes</span>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Injuries, preferences, focus areas..."
              />
            </label>
          </div>

          <div className="actions">
            <button className="button button-primary" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate plan"}
            </button>
            <button className="button button-secondary" onClick={savePlan} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save to Supabase"}
            </button>
          </div>

          {error ? <div className="error">{error}</div> : null}
        </section>
      </section>

      <section className="section-grid">
        <div className="stack">
          {plan ? (
            <article className="panel plan-card">
              <div className="plan-header">
                <div>
                  <span className="badge">Generated plan</span>
                  <h2 className="section-title">{plan.title}</h2>
                  <p className="muted">{plan.summary}</p>
                  <p>{plan.weeklyFocus}</p>
                </div>
              </div>

              <div className="day-list">
                {plan.days.map((day) => (
                  <section key={day.day} className="day-card">
                    <strong>
                      Day {day.day}: {day.focus}
                    </strong>
                    <p className="muted">{day.warmup}</p>

                    <div className="exercise-list">
                      {day.exercises.map((exercise) => (
                        <div key={`${day.day}-${exercise.name}`} className="exercise-item">
                          <strong>{exercise.name}</strong>
                          <div>
                            {exercise.sets} blocks | {exercise.reps} | Rest {exercise.rest}
                          </div>
                          <div className="muted">{exercise.notes}</div>
                        </div>
                      ))}
                    </div>

                    <p>
                      <strong>Finisher:</strong> {day.finisher}
                    </p>
                    <p className="muted">
                      <strong>Recovery:</strong> {day.recovery}
                    </p>
                  </section>
                ))}
              </div>
            </article>
          ) : (
            <article className="panel empty-card">
              <span className="badge">Ready</span>
              <h2 className="section-title">Your generated workout will appear here</h2>
              <p className="muted">
                Start with the sample values or adjust the training inputs to fit your goal, time, and
                available equipment.
              </p>
            </article>
          )}
        </div>

        <aside className="stack">
          <article className="panel history-card">
            <div className="history-header">
              <div>
                <span className="badge">Supabase history</span>
                <h2 className="section-title">Recent saved plans</h2>
              </div>
            </div>

            {isLoadingHistory ? <p className="loading">Loading workout history...</p> : null}

            {!isLoadingHistory && history.length === 0 ? (
              <p className="muted">No plans saved yet. Save one to see it appear here.</p>
            ) : null}

            <div className="history-list">
              {history.map((workout) => (
                <div key={workout.id} className="history-item">
                  <strong>{workout.plan.title}</strong>
                  <p className="muted">
                    {goalLabels[workout.goal]} | {levelLabels[workout.level]} | {workout.days_per_week} days
                  </p>
                  <p>{new Date(workout.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
