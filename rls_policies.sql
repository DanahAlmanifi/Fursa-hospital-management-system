-- ============================================================
--  MediCore — Minimal RLS Policies
--  Run this once in your Supabase project: SQL Editor → New query
-- ============================================================

-- ── 1) DOCTOR table ─────────────────────────────────────────
--  Any signed-in user can read doctors (for appointment booking dropdown).

alter table "public"."doctor" enable row level security;

drop policy if exists "Authenticated users can read doctors" on "public"."doctor";
create policy "Authenticated users can read doctors"
  on "public"."doctor"
  for select
  to authenticated
  using (true);


-- ── 2) PATIENT table ────────────────────────────────────────
--  A patient can only read their own row.
--  The patient row is linked to auth.users via the [nationalid] column.
--  (nationalid = auth.uid())

alter table "public"."patient" enable row level security;

drop policy if exists "Patient can read own row" on "public"."patient";
create policy "Patient can read own row"
  on "public"."patient"
  for select
  to authenticated
  using (nationalid = auth.uid()::text);

-- ── 3) APPOINTMENT table ────────────────────────────────────
--   a) A patient can read their own appointments.
--   b) A patient can create appointments for themselves.

alter table "public"."appointment" enable row level security;

-- 3a – select
drop policy if exists "Patient can read own appointments" on "public"."appointment";
create policy "Patient can read own appointments"
  on "public"."appointment"
  for select
  to authenticated
  using (
    patientid = (
      select patientid
      from "public"."patient"
      where nationalid = auth.uid()::text
      limit 1
    )
  );

-- 3b – insert
drop policy if exists "Patient can insert own appointments" on "public"."appointment";
create policy "Patient can insert own appointments"
  on "public"."appointment"
  for insert
  to authenticated
  with check (
    patientid = (
      select patientid
      from "public"."patient"
      where nationalid = auth.uid()::text
      limit 1
    )
  );

-- ============================================================
--  DONE.  Test by signing in as a patient and:
--    1. Loading /patients → should see only their own row
--    2. Opening their profile → overview + appointments load
--    3. Booking an appointment → row appears in appointment table
-- ============================================================
