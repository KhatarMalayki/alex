-- Schema untuk tabel transfer_bukti di Supabase
-- Jalankan query ini di Supabase SQL Editor

CREATE TABLE transfer_bukti (
  id BIGSERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  message_text TEXT,
  has_image BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  nominal BIGINT,
  extracted_text TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa lebih baik
CREATE INDEX idx_sender_number ON transfer_bukti(sender_number);
CREATE INDEX idx_group_id ON transfer_bukti(group_id);
CREATE INDEX idx_created_at ON transfer_bukti(created_at DESC);
CREATE INDEX idx_nominal ON transfer_bukti(nominal);

-- Optional: Disable RLS untuk testing (enable lagi untuk production)
ALTER TABLE transfer_bukti DISABLE ROW LEVEL SECURITY;

-- Optional: View untuk melihat data dengan format lebih readable
CREATE OR REPLACE VIEW v_transfer_summary AS
SELECT 
  id,
  sender_name,
  sender_number,
  group_name,
  message_text,
  has_image,
  nominal,
  CASE 
    WHEN nominal IS NOT NULL THEN 'Rp ' || TO_CHAR(nominal, 'FM999,999,999,999')
    ELSE NULL
  END as formatted_nominal,
  TO_TIMESTAMP(timestamp) as message_time,
  created_at
FROM transfer_bukti
ORDER BY created_at DESC;

-- Query untuk total transfer per grup
CREATE OR REPLACE VIEW v_transfer_by_group AS
SELECT 
  group_name,
  COUNT(*) as total_transfer,
  SUM(nominal) as total_nominal,
  'Rp ' || TO_CHAR(SUM(nominal), 'FM999,999,999,999') as formatted_total
FROM transfer_bukti
WHERE nominal IS NOT NULL
GROUP BY group_name
ORDER BY total_nominal DESC;
