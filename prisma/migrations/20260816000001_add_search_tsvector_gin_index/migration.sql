CREATE INDEX "Still_search_idx" ON "Still" USING GIN (
  to_tsvector(
    'english'::regconfig,
    coalesce(title, '') || ' ' ||
    coalesce("filmName", '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(director, '') || ' ' ||
    coalesce(cinematographer, '') || ' ' ||
    coalesce(editor, '') || ' ' ||
    coalesce(actor, '') || ' ' ||
    coalesce(notes, '') || ' ' ||
    coalesce("shotType", '') || ' ' ||
    coalesce(composition, '') || ' ' ||
    coalesce(lighting, '') || ' ' ||
    coalesce("interiorExterior", '') || ' ' ||
    coalesce("timeOfDay", '') || ' ' ||
    coalesce("aspectRatio", '') || ' ' ||
    coalesce("frameSize", '') || ' ' ||
    coalesce("lensSize", '') || ' ' ||
    coalesce("set", '') || ' ' ||
    coalesce("year"::text, '')
  )
);
