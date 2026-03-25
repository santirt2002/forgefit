"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FitnessGoal, FitnessLevel, WorkoutPlan, WorkoutRecord, WorkoutRequest } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const equipmentOptions = [
  "bodyweight",
  "dumbbells",
  "barbell",
  "kettlebells",
  "pull_up_bar",
  "cardio_machine"
];

const daysPerWeekOptions = [2, 3, 4, 5, 6];
const sessionLengthOptions = [20, 30, 40, 45, 50, 60, 75, 90, 105, 120];

const defaultForm: WorkoutRequest = {
  name: "",
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

export function WorkoutDashboard({
  initialUserEmail
}: {
  initialUserEmail: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<WorkoutRequest>(defaultForm);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    void loadHistory();
  }, [userEmail]);

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
      if (!userEmail) {
        throw new Error("Sign in to save workouts to your account.");
      }

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

  async function deleteWorkout(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Delete failed.");
      }

      setHistory((current) => current.filter((workout) => workout.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAuthSubmit() {
    setIsAuthenticating(true);
    setError(null);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const normalizedEmail = authEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error("Enter your email address to continue.");
      }

      if (!authPassword) {
        throw new Error("Enter your password to continue.");
      }

      if (authPassword.length < 6) {
        throw new Error("Your password must be at least 6 characters long.");
      }

      const supabase = createSupabaseBrowserClient();

      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: authPassword,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin : undefined
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session?.user.email) {
          setUserEmail(data.session.user.email);
          router.refresh();
          setAuthMessage("Account created. You're signed in.");
        } else {
          setAuthMessage("Account created. Check your email to confirm your sign-in.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: authPassword
        });

        if (signInError) {
          throw signInError;
        }

        setUserEmail(data.user.email ?? normalizedEmail);
        router.refresh();
        setAuthMessage("Signed in successfully.");
      }

      setAuthPassword("");
    } catch (authError) {
      const message =
        authError instanceof TypeError && authError.message === "Failed to fetch"
          ? "Could not reach Supabase. Check your internet connection, your Supabase URL/key, and disable browser shields or blockers for localhost."
          : authError instanceof Error
            ? authError.message
            : "Authentication failed.";
      setAuthError(message);
      setError(message);
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUserEmail(null);
      setPlan(null);
      setHistory([]);
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Sign out failed.");
    }
  }

  function resetBuilder() {
    setForm(defaultForm);
    setPlan(null);
    setError(null);
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
          <h1>Forge a plan that actually fits your week.</h1>
          <p>
            Build workout plans around your goals, schedule, and available equipment. ForgeFit helps
            you create a routine you can actually follow, then saves your progress so you can come
            back to past plans anytime.
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
          <div className="auth-shell">
            <div>
              <h2 className="section-title">Account</h2>
              <p className="muted">
                {userEmail
                  ? `Signed in as ${userEmail}. Your saved workouts are private to your account.`
                  : "Create an account or sign in to save workouts and keep a personal history."}
              </p>
            </div>

            {userEmail ? (
              <button className="button button-secondary button-small" onClick={handleSignOut} type="button">
                Sign out
              </button>
            ) : null}
          </div>

          {!userEmail ? (
            <div className="auth-card">
              <div className="auth-toggle">
                <button
                  type="button"
                  className={`pill ${authMode === "signin" ? "active" : ""}`}
                  onClick={() => setAuthMode("signin")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`pill ${authMode === "signup" ? "active" : ""}`}
                  onClick={() => setAuthMode("signup")}
                >
                  Create account
                </button>
              </div>

              <div className="form-grid auth-grid">
                <label className="field">
                  <span className="label">Email</span>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </label>

                <label className="field">
                  <span className="label">Password</span>
                  <input
                    className="input"
                    type="password"
                    name="password"
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="At least 6 characters"
                  />
                </label>
              </div>

              <div className="actions auth-actions">
                <button
                  className="button button-secondary"
                  onClick={handleAuthSubmit}
                  disabled={isAuthenticating}
                  type="button"
                >
                  {isAuthenticating
                    ? authMode === "signup"
                      ? "Creating account..."
                      : "Signing in..."
                    : authMode === "signup"
                      ? "Create account"
                      : "Sign in"}
                </button>
              </div>

              {authMessage ? <div className="success">{authMessage}</div> : null}
              {authError ? <div className="error auth-feedback">{authError}</div> : null}
            </div>
          ) : null}

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
              <select
                className="select"
                value={form.daysPerWeek}
                onChange={(event) => setForm({ ...form, daysPerWeek: Number(event.target.value) })}
              >
                {daysPerWeekOptions.map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Minutes per session</span>
              <select
                className="select"
                value={form.sessionLength}
                onChange={(event) => setForm({ ...form, sessionLength: Number(event.target.value) })}
              >
                {sessionLengthOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
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
            <button className="button button-secondary" onClick={savePlan} disabled={isSaving || !userEmail}>
              {isSaving ? "Saving..." : "Save Workout"}
            </button>
            <button className="button button-secondary" onClick={resetBuilder} type="button">
              Reset form
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

              <div className="tips-block">
                <strong>Coaching notes</strong>
                <ul className="tips-list">
                  {plan.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
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

            {!userEmail ? (
              <p className="muted">Sign in to see your saved workout history.</p>
            ) : null}

            {userEmail && !isLoadingHistory && history.length === 0 ? (
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
                  <div className="history-actions">
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => setPlan(workout.plan)}
                    >
                      View plan
                    </button>
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => deleteWorkout(workout.id)}
                      disabled={deletingId === workout.id}
                    >
                      {deletingId === workout.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
