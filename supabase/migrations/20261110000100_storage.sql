-- Fotografije oglasa i profilne slike u Supabase Storage.
-- Svako otprema samo u svoj folder: <user_id>/...

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-images', 'listing-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "otpremam u svoj folder" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menjam svoje fajlove" on storage.objects for update to authenticated
  using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "brisem svoje fajlove" on storage.objects for delete to authenticated
  using (
    bucket_id in ('listing-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
