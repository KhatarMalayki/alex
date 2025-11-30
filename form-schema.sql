-- Schema untuk Form Pengajuan A1, A2, A3

-- Tabel untuk Form A1 (Usaha)
CREATE TABLE form_pengajuan_a1 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  usaha TEXT,
  plafon_pengajuan BIGINT,
  tenor TEXT,
  nomor_telepon TEXT,
  nama_pasangan TEXT,
  nomor_hp_pasangan TEXT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk Form A2 (Jaminan)
CREATE TABLE form_pengajuan_a2 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  jenis_jaminan TEXT,
  nopol TEXT,
  an_bpkb TEXT,
  plafon_pengajuan BIGINT,
  tenor TEXT,
  nomor_telepon TEXT,
  nama_pasangan TEXT,
  nomor_hp_pasangan TEXT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk Form A3 (Sederhana)
CREATE TABLE form_pengajuan_a3 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  plafon_pengajuan BIGINT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_a1_sender_number ON form_pengajuan_a1(sender_number);
CREATE INDEX idx_a1_created_at ON form_pengajuan_a1(created_at DESC);
CREATE INDEX idx_a1_nama ON form_pengajuan_a1(nama);

CREATE INDEX idx_a2_sender_number ON form_pengajuan_a2(sender_number);
CREATE INDEX idx_a2_created_at ON form_pengajuan_a2(created_at DESC);
CREATE INDEX idx_a2_nama ON form_pengajuan_a2(nama);

CREATE INDEX idx_a3_sender_number ON form_pengajuan_a3(sender_number);
CREATE INDEX idx_a3_created_at ON form_pengajuan_a3(created_at DESC);
CREATE INDEX idx_a3_nama ON form_pengajuan_a3(nama);

-- Disable RLS untuk testing
ALTER TABLE form_pengajuan_a1 DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_pengajuan_a2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_pengajuan_a3 DISABLE ROW LEVEL SECURITY;

-- View untuk melihat semua pengajuan
CREATE OR REPLACE VIEW v_all_pengajuan AS
SELECT 
  'A1' as form_type,
  id,
  tanggal,
  nama,
  plafon_pengajuan,
  'Rp ' || TO_CHAR(plafon_pengajuan, 'FM999,999,999,999') as formatted_plafon,
  tenor,
  nomor_telepon,
  sender_name,
  group_name,
  created_at
FROM form_pengajuan_a1
UNION ALL
SELECT 
  'A2' as form_type,
  id,
  tanggal,
  nama,
  plafon_pengajuan,
  'Rp ' || TO_CHAR(plafon_pengajuan, 'FM999,999,999,999') as formatted_plafon,
  tenor,
  nomor_telepon,
  sender_name,
  group_name,
  created_at
FROM form_pengajuan_a2
UNION ALL
SELECT 
  'A3' as form_type,
  id,
  tanggal,
  nama,
  plafon_pengajuan,
  'Rp ' || TO_CHAR(plafon_pengajuan, 'FM999,999,999,999') as formatted_plafon,
  NULL as tenor,
  NULL as nomor_telepon,
  sender_name,
  group_name,
  created_at
FROM form_pengajuan_a3
ORDER BY created_at DESC;

-- View untuk statistik pengajuan
CREATE OR REPLACE VIEW v_pengajuan_stats AS
SELECT 
  form_type,
  COUNT(*) as total_pengajuan,
  SUM(plafon_pengajuan) as total_plafon,
  'Rp ' || TO_CHAR(SUM(plafon_pengajuan), 'FM999,999,999,999') as formatted_total_plafon,
  AVG(plafon_pengajuan) as avg_plafon,
  'Rp ' || TO_CHAR(AVG(plafon_pengajuan), 'FM999,999,999,999') as formatted_avg_plafon
FROM v_all_pengajuan
GROUP BY form_type
ORDER BY form_type;
