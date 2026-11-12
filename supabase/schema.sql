-- ============================================================================
-- CeylonRoute — Supabase schema (Phase 3)
-- Run this whole file in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. settings  (single-row global config)
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  id                 uuid primary key default gen_random_uuid(),
  rate_wagon_r       numeric(10,2) not null default 0.40,
  rate_aqua          numeric(10,2) not null default 0.45,
  rate_sedan         numeric(10,2) not null default 0.50,
  rate_kdh           numeric(10,2) not null default 0.70,
  driver_daily_batta numeric(10,2) not null default 15.00,
  whatsapp_number    text,
  admin_email        text,
  updated_at         timestamptz not null default now()
);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- seed one settings row (only if table is empty).
-- IMPORTANT: change admin_email to the inbox that should receive booking alerts
-- (here, or later in the admin Settings page).
insert into public.settings (whatsapp_number, admin_email)
select '+94770291675', 'admin@ceylonroute.lk'
where not exists (select 1 from public.settings);

-- ----------------------------------------------------------------------------
-- 2. packages
-- ----------------------------------------------------------------------------
create table if not exists public.packages (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  subtitle           text,
  duration_days      int not null,
  duration_nights    int not null,
  approx_distance_km numeric(10,2) not null,
  travel_style       text[] not null default '{}',
  overview           text,
  cover_image        text,
  gallery_images     text[] not null default '{}',
  itinerary          jsonb not null default '[]'::jsonb,
  inclusions         text[] not null default '{}',
  exclusions         text[] not null default '{}',
  is_featured        boolean not null default false,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. bookings
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  booking_ref          text unique,
  package_id           uuid references public.packages(id) on delete set null,
  vehicle_type         text not null check (vehicle_type in ('Aqua','Wagon R','Sedan','KDH')),
  estimated_price      numeric(10,2),
  full_name            text not null,
  email                text not null,
  country              text not null,
  passport_no          text not null,
  whatsapp_no          text not null,
  pickup_date          date not null,
  return_date          date,
  pickup_location      text not null,
  drop_location        text not null,
  adults_count         int not null default 1,
  children_count       int not null default 0,
  luggage_count        int not null default 0,
  needs_kids_seat      boolean not null default false,
  special_requirements text,
  status               text not null default 'PENDING'
                         check (status in ('PENDING','CONFIRMED','COMPLETED','CANCELLED')),
  admin_notes          text,
  created_at           timestamptz not null default now()
);

-- Human-friendly booking reference: CR-<year>-<seq>, e.g. CR-2026-1001
create sequence if not exists public.booking_ref_seq start with 1001;

create or replace function public.set_booking_ref()
returns trigger language plpgsql as $$
begin
  if new.booking_ref is null then
    new.booking_ref := 'CR-' || to_char(now(), 'YYYY') || '-' || nextval('public.booking_ref_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bookings_ref on public.bookings;
create trigger trg_bookings_ref
  before insert on public.bookings
  for each row execute function public.set_booking_ref();

create index if not exists idx_bookings_status     on public.bookings(status);
create index if not exists idx_bookings_created_at  on public.bookings(created_at desc);

-- Booking creation RPC.
-- RLS lets anon INSERT bookings but NOT SELECT them (passport data is private),
-- so a plain insert().select() can't return the generated booking_ref to the
-- customer. This SECURITY DEFINER function performs the insert and returns the
-- new row to its own submitter — it never exposes other customers' bookings.
create or replace function public.create_booking(
  p_package_id           uuid,
  p_vehicle_type         text,
  p_estimated_price      numeric,
  p_full_name            text,
  p_email                text,
  p_country              text,
  p_passport_no          text,
  p_whatsapp_no          text,
  p_pickup_date          date,
  p_return_date          date,
  p_pickup_location      text,
  p_drop_location        text,
  p_adults_count         int,
  p_children_count       int,
  p_luggage_count        int,
  p_needs_kids_seat      boolean,
  p_special_requirements text
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.bookings;
begin
  insert into public.bookings (
    package_id, vehicle_type, estimated_price, full_name, email, country,
    passport_no, whatsapp_no, pickup_date, return_date, pickup_location,
    drop_location, adults_count, children_count, luggage_count,
    needs_kids_seat, special_requirements
  ) values (
    p_package_id, p_vehicle_type, p_estimated_price, p_full_name, p_email, p_country,
    p_passport_no, p_whatsapp_no, p_pickup_date, p_return_date, p_pickup_location,
    p_drop_location, coalesce(p_adults_count, 1), coalesce(p_children_count, 0),
    coalesce(p_luggage_count, 0), coalesce(p_needs_kids_seat, false),
    p_special_requirements
  ) returning * into rec;

  return rec;
end;
$$;

grant execute on function public.create_booking(
  uuid, text, numeric, text, text, text, text, text, date, date, text, text,
  int, int, int, boolean, text
) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. reviews
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  country       text not null,
  country_code  text,
  rating        int not null check (rating between 1 and 5),
  comment       text not null,
  package_id    uuid references public.packages(id) on delete set null,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_reviews_approved on public.reviews(is_approved);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.settings enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews  enable row level security;

-- settings: public read, admin (authenticated) full control
drop policy if exists settings_select_public on public.settings;
create policy settings_select_public on public.settings
  for select to anon, authenticated using (true);

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all on public.settings
  for all to authenticated using (true) with check (true);

-- packages: public read, admin full control
drop policy if exists packages_select_public on public.packages;
create policy packages_select_public on public.packages
  for select to anon, authenticated using (true);

drop policy if exists packages_admin_all on public.packages;
create policy packages_admin_all on public.packages
  for all to authenticated using (true) with check (true);

-- bookings: public can ONLY insert; admin can select/update/delete.
drop policy if exists bookings_insert_public on public.bookings;
create policy bookings_insert_public on public.bookings
  for insert to anon, authenticated with check (true);

drop policy if exists bookings_admin_select on public.bookings;
create policy bookings_admin_select on public.bookings
  for select to authenticated using (true);

drop policy if exists bookings_admin_update on public.bookings;
create policy bookings_admin_update on public.bookings
  for update to authenticated using (true) with check (true);

drop policy if exists bookings_admin_delete on public.bookings;
create policy bookings_admin_delete on public.bookings
  for delete to authenticated using (true);

-- reviews: public reads approved only + can insert; admin full control
drop policy if exists reviews_select_approved on public.reviews;
create policy reviews_select_approved on public.reviews
  for select to anon using (is_approved = true);

drop policy if exists reviews_select_admin on public.reviews;
create policy reviews_select_admin on public.reviews
  for select to authenticated using (true);

drop policy if exists reviews_insert_public on public.reviews;
create policy reviews_insert_public on public.reviews
  for insert to anon, authenticated with check (is_approved = false);

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews
  for update to authenticated using (true) with check (true);

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
  for delete to authenticated using (true);

-- ============================================================================
-- 5. Storage bucket: tour-images (public read, authenticated write/delete)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('tour-images', 'tour-images', true)
on conflict (id) do nothing;

drop policy if exists tour_images_public_read on storage.objects;
create policy tour_images_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'tour-images');

drop policy if exists tour_images_auth_insert on storage.objects;
create policy tour_images_auth_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'tour-images');

drop policy if exists tour_images_auth_update on storage.objects;
create policy tour_images_auth_update on storage.objects
  for update to authenticated using (bucket_id = 'tour-images');

drop policy if exists tour_images_auth_delete on storage.objects;
create policy tour_images_auth_delete on storage.objects
  for delete to authenticated using (bucket_id = 'tour-images');

-- ============================================================================
-- 6. Seed packages (Unsplash Sri Lanka imagery) — only if table is empty
-- ============================================================================
insert into public.packages
  (slug, title, subtitle, duration_days, duration_nights, approx_distance_km,
   travel_style, overview, cover_image, gallery_images, itinerary,
   inclusions, exclusions, is_featured, is_active)
select * from (values
  (
    'cultural-triangle-kandy-highlights',
    '04 Days Cultural Triangle & Kandy Highlights',
    'Ancient kingdoms, cave temples & the sacred city of Kandy',
    4, 3, 450,
    array['Culture','Scenic'],
    $ov$Step into the heart of Sri Lanka's Cultural Triangle. Climb the legendary Sigiriya Lion Rock, wander the painted Dambulla cave temples, cycle the ruins of Polonnaruwa, and witness the evening rituals at the Temple of the Sacred Tooth Relic in Kandy — all at your own pace with a private driver-guide.$ov$,
    'https://images.unsplash.com/photo-1588258219511-64eb629cb833?auto=format&fit=crop&w=1600&h=1000&q=80',
    array[
      'https://images.unsplash.com/photo-1588258219511-64eb629cb833?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&h=800&q=80'
    ],
    $json$[
      {"day":1,"title":"Airport to Sigiriya & Dambulla","activities":["Private pick-up from Bandaranaike International Airport","Scenic drive to the Cultural Triangle","Explore the golden Dambulla Cave Temple"],"travelTime":"~ 4 hrs driving","overnightStay":"Sigiriya"},
      {"day":2,"title":"Sigiriya Lion Rock & Village Tour","activities":["Sunrise climb of Sigiriya Rock Fortress","Traditional village tour with bullock-cart & catamaran ride","Optional Pidurangala viewpoint"],"travelTime":"~ 1 hr driving","overnightStay":"Sigiriya"},
      {"day":3,"title":"Polonnaruwa to Kandy","activities":["Cycle the ancient ruins of Polonnaruwa","Drive to Kandy via the Matale spice gardens","Evening Kandyan cultural dance show"],"travelTime":"~ 3.5 hrs driving","overnightStay":"Kandy"},
      {"day":4,"title":"Kandy to Peradeniya & Departure","activities":["Temple of the Sacred Tooth Relic","Royal Botanical Gardens, Peradeniya","Transfer to airport / Colombo"],"travelTime":"~ 3.5 hrs driving","overnightStay":"Departure day"}
    ]$json$::jsonb,
    array['Private A/C vehicle with driver-guide','All fuel, tolls & parking','Driver meals & accommodation','Airport pick-up & drop-off','Bottled water daily'],
    array['Entrance tickets & site fees','Hotel accommodation & meals','Personal expenses & tips','Travel insurance'],
    true, true
  ),
  (
    'epic-sri-lanka-adventure',
    '08 Days Epic Sri Lanka Adventure',
    'Cycling, canoeing, trekking, rafting, safari & beach',
    8, 7, 850,
    array['Adventure','Wildlife','Scenic'],
    $ov$The ultimate adrenaline circuit of the island. Cycle around Sigiriya, canoe the Kalu Ganga, trek the misty Knuckles range, raft the white water at Kitulgala, track elephants on a Udawalawe safari and unwind on the golden sands of Mirissa. Built for travellers who want to feel Sri Lanka, not just see it.$ov$,
    'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1600&h=1000&q=80',
    array[
      'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&h=800&q=80'
    ],
    $json$[
      {"day":1,"title":"Airport to Sigiriya","activities":["Private airport pick-up","Transfer to Sigiriya","Sunset at Pidurangala Rock"],"travelTime":"~ 4 hrs driving","overnightStay":"Sigiriya"},
      {"day":2,"title":"Sigiriya Cycling & Rock Fortress","activities":["Morning countryside cycling tour","Climb Sigiriya Lion Rock","Village lunch experience"],"travelTime":"~ 1 hr driving","overnightStay":"Sigiriya"},
      {"day":3,"title":"Kalu Ganga Canoeing to Knuckles","activities":["Canoe the Kalu Ganga river","Drive to the Knuckles Conservation Forest"],"travelTime":"~ 3 hrs driving","overnightStay":"Knuckles / Kandy"},
      {"day":4,"title":"Knuckles Trekking","activities":["Guided trek through Knuckles trails","Waterfalls & mini-world's-end viewpoints"],"travelTime":"~ 1.5 hrs driving","overnightStay":"Kandy"},
      {"day":5,"title":"Kitulgala White-Water Rafting","activities":["Grade 2-3 white-water rafting","Rainforest stream walk"],"travelTime":"~ 2.5 hrs driving","overnightStay":"Kitulgala"},
      {"day":6,"title":"Udawalawe Safari","activities":["Drive south to Udawalawe","Afternoon jeep safari - wild elephants"],"travelTime":"~ 4 hrs driving","overnightStay":"Udawalawe"},
      {"day":7,"title":"Mirissa Beach","activities":["Transfer to the south coast","Relax on Mirissa beach","Optional whale-watching (seasonal)"],"travelTime":"~ 2.5 hrs driving","overnightStay":"Mirissa"},
      {"day":8,"title":"Mirissa to Departure","activities":["Morning at leisure","Transfer to airport"],"travelTime":"~ 3 hrs driving","overnightStay":"Departure day"}
    ]$json$::jsonb,
    array['Private A/C vehicle with driver-guide','All fuel, tolls & parking','Driver meals & accommodation','Airport pick-up & drop-off','Bottled water daily'],
    array['Adventure activity fees (rafting, safari, canoeing)','Entrance tickets & site fees','Hotel accommodation & meals','Personal expenses, tips & insurance'],
    true, true
  ),
  (
    'southern-coast-wildlife-safari',
    '06 Days Southern Coast & Wildlife Safari',
    'Dutch forts, palm-fringed beaches & leopard country',
    6, 5, 550,
    array['Wildlife','Scenic','Culture'],
    $ov$Trade the highlands for the tropics. Explore the ramparts of Galle Fort, chase sunsets at Mirissa, track leopards and elephants on a Yala safari, and wind down in the lagoon resort town of Bentota. A relaxed coastal loop with just the right dose of wildlife.$ov$,
    'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1600&h=1000&q=80',
    array[
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?auto=format&fit=crop&w=1200&h=800&q=80'
    ],
    $json$[
      {"day":1,"title":"Airport to Bentota","activities":["Private airport pick-up","Drive down the southern expressway","Bentota lagoon boat safari"],"travelTime":"~ 2.5 hrs driving","overnightStay":"Bentota"},
      {"day":2,"title":"Bentota to Galle","activities":["Sea-turtle hatchery visit","Explore historic Galle Fort on foot","Sunset on the ramparts"],"travelTime":"~ 1.5 hrs driving","overnightStay":"Galle"},
      {"day":3,"title":"Galle to Mirissa","activities":["Coconut Tree Hill & Mirissa beach","Stilt fishermen photo stop","Beachfront evening"],"travelTime":"~ 1 hr driving","overnightStay":"Mirissa"},
      {"day":4,"title":"Mirissa to Yala","activities":["Scenic coastal drive to Yala","Afternoon leisure"],"travelTime":"~ 2.5 hrs driving","overnightStay":"Yala / Tissamaharama"},
      {"day":5,"title":"Yala National Park Safari","activities":["Early-morning jeep safari - leopards & elephants","Return for leisure / Tissa lake"],"travelTime":"~ 1 hr driving","overnightStay":"Yala / Tissamaharama"},
      {"day":6,"title":"Yala to Departure","activities":["Drive back toward Colombo / airport","Departure"],"travelTime":"~ 5 hrs driving","overnightStay":"Departure day"}
    ]$json$::jsonb,
    array['Private A/C vehicle with driver-guide','All fuel, tolls & parking','Driver meals & accommodation','Airport pick-up & drop-off','Bottled water daily'],
    array['Yala safari jeep & park fees','Entrance tickets & site fees','Hotel accommodation & meals','Personal expenses, tips & insurance'],
    false, true
  )
) as seed(slug, title, subtitle, duration_days, duration_nights, approx_distance_km,
          travel_style, overview, cover_image, gallery_images, itinerary,
          inclusions, exclusions, is_featured, is_active)
where not exists (select 1 from public.packages);

-- ============================================================================
-- 7. Seed a few approved reviews (only if table is empty)
-- ============================================================================
insert into public.reviews (reviewer_name, country, country_code, rating, comment, is_approved)
select * from (values
  ('Emily Carter','United Kingdom','gb',5,$c$Our driver-guide was exceptional — punctual, warm and endlessly knowledgeable. The route transparency meant zero surprises on cost. Climbing Sigiriya at sunrise was a highlight of our lives.$c$,true),
  ('Lukas Weber','Germany','de',5,$c$The 8-day adventure was perfectly paced. Rafting at Kitulgala, the Knuckles trek and the Udawalawe elephants — all seamless in a spotless, cool KDH van. Flexible, honest and great value.$c$,true),
  ('Olivia Nguyen','Australia','au',5,$c$We customised the whole southern coast trip over WhatsApp before arriving. Galle Fort and the Yala leopard sighting were unforgettable. No hidden charges, exactly as quoted.$c$,true),
  ('Camille Laurent','France','fr',4,$c$A beautifully organised private tour. Clean car, safe driving and a guide who clearly loves his country. We only wished we had booked more days.$c$,true)
) as seed(reviewer_name, country, country_code, rating, comment, is_approved)
where not exists (select 1 from public.reviews);
