-- CampusPerks deal detail pages and outdated-report workflow.
-- Run this once in the Supabase SQL Editor after discount-submissions.sql.
-- This script does not delete any discounts or student data.

alter table public.discounts
  add column if not exists redemption_instructions text,
  add column if not exists terms text,
  add column if not exists verification_confidence smallint,
  add column if not exists expires_at date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'discounts_verification_confidence_range'
      and conrelid = 'public.discounts'::regclass
  ) then
    alter table public.discounts
      add constraint discounts_verification_confidence_range
      check (
        verification_confidence is null
        or verification_confidence between 0 and 100
      );
  end if;
end
$$;

alter table public.discount_sources
  add column if not exists source_url text,
  add column if not exists source_name text,
  add column if not exists evidence_text text,
  add column if not exists source_type text,
  add column if not exists confidence_score smallint,
  add column if not exists checked_at timestamptz,
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'discount_sources_confidence_score_range'
      and conrelid = 'public.discount_sources'::regclass
  ) then
    alter table public.discount_sources
      add constraint discount_sources_confidence_score_range
      check (
        confidence_score is null
        or confidence_score between 0 and 100
      );
  end if;
end
$$;

create table if not exists public.deal_reports (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete cascade,
  reported_by uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending'
    check (status in ('pending', 'resolved', 'dismissed')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deal_reports_status_created_idx
  on public.deal_reports (status, created_at desc);

create index if not exists deal_reports_discount_idx
  on public.deal_reports (discount_id);

create or replace function public.touch_deal_report_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_deal_report_updated_at
  on public.deal_reports;
create trigger touch_deal_report_updated_at
before update on public.deal_reports
for each row execute function public.touch_deal_report_updated_at();

alter table public.deal_reports enable row level security;

drop policy if exists "Students can submit their own deal reports"
  on public.deal_reports;
create policy "Students can submit their own deal reports"
on public.deal_reports
for insert
to authenticated
with check (
  reported_by = auth.uid()
  and status = 'pending'
);

drop policy if exists "Students can read their own deal reports"
  on public.deal_reports;
create policy "Students can read their own deal reports"
on public.deal_reports
for select
to authenticated
using (
  reported_by = auth.uid()
  or public.current_user_is_admin()
);

grant select, insert on public.deal_reports to authenticated;

alter table public.discount_sources enable row level security;

drop policy if exists "Public can read active discount sources"
  on public.discount_sources;
create policy "Public can read active discount sources"
on public.discount_sources
for select
to anon, authenticated
using (is_active = true);

grant select on public.discount_sources to anon, authenticated;

create or replace function public.review_deal_report(
  p_report_id uuid,
  p_decision text,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report public.deal_reports%rowtype;
begin
  if not public.current_user_is_admin() then
    raise exception 'Administrator access required';
  end if;

  if p_decision not in ('possibly-outdated', 'dismissed') then
    raise exception 'Invalid report decision';
  end if;

  select *
  into v_report
  from public.deal_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Report not found';
  end if;

  if v_report.status <> 'pending' then
    raise exception 'This report has already been reviewed';
  end if;

  if p_decision = 'possibly-outdated' then
    update public.discounts
    set verification_status = 'possibly-outdated'
    where id = v_report.discount_id;
  end if;

  update public.deal_reports
  set
    status = case
      when p_decision = 'possibly-outdated' then 'resolved'
      else 'dismissed'
    end,
    admin_notes = nullif(trim(p_admin_notes), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = p_report_id;
end;
$$;

revoke all on function public.review_deal_report(uuid, text, text)
  from public;
grant execute on function public.review_deal_report(uuid, text, text)
  to authenticated;

comment on table public.deal_reports is
  'Student reports reviewed by an administrator; reports never auto-delete listings.';
comment on column public.discounts.verification_confidence is
  'Evidence confidence from 0 to 100. Null means no score has been assigned.';
