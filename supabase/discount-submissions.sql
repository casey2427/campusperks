-- CampusPerks student submission and admin review setup.
-- Run this entire file once in the Supabase SQL Editor.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.discount_colleges
  alter column distance_miles drop not null;

create table if not exists public.discount_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  college_id uuid not null references public.colleges(id) on delete cascade,
  business_name text not null check (char_length(business_name) between 1 and 120),
  discount_title text not null check (char_length(discount_title) between 1 and 180),
  category text not null,
  address text not null check (char_length(address) between 1 and 220),
  source text not null check (char_length(source) between 1 and 500),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_discount_id uuid references public.discounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discount_submissions_status_created_idx
  on public.discount_submissions(status, created_at desc);

create index if not exists discount_submissions_user_created_idx
  on public.discount_submissions(submitted_by, created_at desc);

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

create or replace function public.touch_discount_submission_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists discount_submissions_set_updated_at
  on public.discount_submissions;

create trigger discount_submissions_set_updated_at
before update on public.discount_submissions
for each row execute function public.touch_discount_submission_updated_at();

alter table public.discount_submissions enable row level security;

drop policy if exists "Students can create their own submissions"
  on public.discount_submissions;
create policy "Students can create their own submissions"
  on public.discount_submissions
  for insert
  to authenticated
  with check (auth.uid() = submitted_by and status = 'pending');

drop policy if exists "Students can read their own submissions"
  on public.discount_submissions;
create policy "Students can read their own submissions"
  on public.discount_submissions
  for select
  to authenticated
  using (auth.uid() = submitted_by);

drop policy if exists "Admins can read all submissions"
  on public.discount_submissions;
create policy "Admins can read all submissions"
  on public.discount_submissions
  for select
  to authenticated
  using (public.current_user_is_admin());

grant select, insert on public.discount_submissions to authenticated;

create or replace function public.review_discount_submission(
  p_submission_id uuid,
  p_decision text,
  p_admin_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.discount_submissions%rowtype;
  v_business_id uuid;
  v_discount_id uuid;
  v_slug text;
begin
  if not public.current_user_is_admin() then
    raise exception 'Administrator access required';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  select *
  into v_submission
  from public.discount_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission not found';
  end if;

  if v_submission.status <> 'pending' then
    raise exception 'This submission has already been reviewed';
  end if;

  if p_decision = 'approved' then
    select id
    into v_business_id
    from public.businesses
    where lower(name) = lower(v_submission.business_name)
    order by id
    limit 1;

    if v_business_id is null then
      v_slug := trim(
        both '-' from regexp_replace(
          lower(v_submission.business_name),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ) || '-' || left(gen_random_uuid()::text, 8);

      insert into public.businesses (name, slug)
      values (v_submission.business_name, v_slug)
      returning id into v_business_id;
    end if;

    insert into public.discounts (
      business_id,
      title,
      category,
      address,
      verification_status,
      status,
      last_checked_at,
      helpful_count,
      not_helpful_count,
      is_demo
    )
    values (
      v_business_id,
      v_submission.discount_title,
      v_submission.category,
      v_submission.address,
      'pending-review',
      'active',
      now(),
      0,
      0,
      false
    )
    returning id into v_discount_id;

    insert into public.discount_colleges (
      discount_id,
      college_id,
      distance_miles
    )
    values (
      v_discount_id,
      v_submission.college_id,
      null
    )
    on conflict do nothing;
  end if;

  update public.discount_submissions
  set
    status = p_decision,
    admin_notes = nullif(trim(p_admin_notes), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    published_discount_id = v_discount_id
  where id = p_submission_id;

  return v_discount_id;
end;
$$;

revoke all on function public.review_discount_submission(uuid, text, text)
  from public;
grant execute on function public.review_discount_submission(uuid, text, text)
  to authenticated;

-- FINAL ADMIN STEP:
-- Replace YOUR-CAMPUSPERKS-LOGIN-EMAIL with the email you use to log in.
--
-- update public.profiles
-- set is_admin = true
-- where id = (
--   select id
--   from auth.users
--   where lower(email) = lower('YOUR-CAMPUSPERKS-LOGIN-EMAIL')
-- );
