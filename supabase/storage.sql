-- Crear bucket público para medios de los locales
INSERT INTO storage.buckets (id, name, public)
VALUES ('locales-media', 'locales-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de lectura pública para el bucket
CREATE POLICY "Public media access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'locales-media');

-- Políticas de subida para usuarios autenticados
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'locales-media');

-- Políticas de eliminación
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'locales-media');
