INSERT INTO "Category" (name, slug) VALUES
  ('Électronique', 'electronique'),
  ('Vêtements', 'vetements'),
  ('Livres', 'livres'),
  ('Meubles', 'meubles'),
  ('Cuisine', 'cuisine'),
  ('Sport', 'sport'),
  ('Informatique', 'informatique'),
  ('Musique', 'musique'),
  ('Vélos', 'velos'),
  ('Autres', 'autres')
ON CONFLICT (slug) DO NOTHING;
