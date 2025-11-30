import { supabase } from '../config/supabase.js';

export function detectFormType(message) {
  const text = message.toUpperCase().replace(/\s+/g, ' ');
  
  // Pattern untuk A1
  const a1Patterns = [
    /FORM\s*PENGAJUAN\s*A\s*1/,
    /FORM\s*A\s*1/,
    /PENGAJUAN\s*A\s*1/,
    /FORMULIR\s*A\s*1/
  ];
  
  // Pattern untuk A2
  const a2Patterns = [
    /FORM\s*PENGAJUAN\s*A\s*2/,
    /FORM\s*A\s*2/,
    /PENGAJUAN\s*A\s*2/,
    /FORMULIR\s*A\s*2/
  ];
  
  // Pattern untuk A3
  const a3Patterns = [
    /FORM\s*PENGAJUAN\s*A\s*3/,
    /FORM\s*A\s*3/,
    /PENGAJUAN\s*A\s*3/,
    /FORMULIR\s*A\s*3/
  ];
  
  if (a1Patterns.some(pattern => pattern.test(text))) {
    return 'A1';
  } else if (a2Patterns.some(pattern => pattern.test(text))) {
    return 'A2';
  } else if (a3Patterns.some(pattern => pattern.test(text))) {
    return 'A3';
  }
  
  return null;
}

function extractFieldValue(text, fieldNames) {
  for (const fieldName of fieldNames) {
    const patterns = [
      new RegExp(`${fieldName}\\s*[:\\-]\\s*(.+?)(?=\\n|$)`, 'i'),
      new RegExp(`${fieldName}\\s*[:\\-]?\\s*(.+?)(?=\\n|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return null;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  const cleanDate = dateStr.replace(/[^\d\-\/]/g, '');
  
  const formats = [
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ];
  
  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      let year, month, day;
      if (format === formats[0]) {
        [, year, month, day] = match;
      } else {
        [, day, month, year] = match;
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  return null;
}

function parseNominal(nominalStr) {
  if (!nominalStr) return null;
  
  const cleanNominal = nominalStr.replace(/[^\d]/g, '');
  const nominal = parseInt(cleanNominal);
  
  return (nominal && nominal > 0) ? nominal : null;
}

function parsePasangan(pasanganStr) {
  if (!pasanganStr) return { nama: null, nomor: null };
  
  const parts = pasanganStr.split(/[\/\-,]/);
  
  if (parts.length >= 2) {
    return {
      nama: parts[0].trim(),
      nomor: parts[1].trim()
    };
  }
  
  return { nama: pasanganStr.trim(), nomor: null };
}

function parseRekening(rekeningStr) {
  if (!rekeningStr) return { bank: null, nomor: null, atasNama: null };
  
  const parts = rekeningStr.split('/');
  
  if (parts.length >= 3) {
    return {
      bank: parts[0].trim(),
      nomor: parts[1].trim(),
      atasNama: parts[2].trim()
    };
  } else if (parts.length === 2) {
    return {
      bank: parts[0].trim(),
      nomor: parts[1].trim(),
      atasNama: null
    };
  }
  
  return { bank: rekeningStr.trim(), nomor: null, atasNama: null };
}

function parseNopolBPKB(nopolStr) {
  if (!nopolStr) return { nopol: null, anBpkb: null };
  
  const parts = nopolStr.split(/[\/\-]/);
  
  if (parts.length >= 2) {
    return {
      nopol: parts[0].trim(),
      anBpkb: parts.slice(1).join(' ').replace(/a\.n\.|an\.|atas nama/gi, '').trim()
    };
  }
  
  return { nopol: nopolStr.trim(), anBpkb: null };
}

export function parseFormA1(message) {
  const tanggal = parseDate(extractFieldValue(message, ['Tanggal', 'Tgl']));
  const nama = extractFieldValue(message, ['Nama']);
  const usaha = extractFieldValue(message, ['Usaha']);
  const plafonStr = extractFieldValue(message, ['Plafon Pengajuan', 'Plafon']);
  const plafon = parseNominal(plafonStr);
  const tenor = extractFieldValue(message, ['Tenor']);
  const nomorTelepon = extractFieldValue(message, ['Nomor Telepon', 'No Telepon', 'No HP', 'Nomor HP']);
  const pasanganStr = extractFieldValue(message, ['Nama dan nomor HP pasangan', 'Pasangan']);
  const pasangan = parsePasangan(pasanganStr);
  const rekeningStr = extractFieldValue(message, ['Bank/Nomor Rekening/Atas Nama', 'Rekening', 'Bank']);
  const rekening = parseRekening(rekeningStr);
  
  return {
    tanggal,
    nama,
    usaha,
    plafon_pengajuan: plafon,
    tenor,
    nomor_telepon: nomorTelepon,
    nama_pasangan: pasangan.nama,
    nomor_hp_pasangan: pasangan.nomor,
    bank: rekening.bank,
    nomor_rekening: rekening.nomor,
    atas_nama: rekening.atasNama,
    raw_message: message
  };
}

export function parseFormA2(message) {
  const tanggal = parseDate(extractFieldValue(message, ['Tanggal', 'Tgl']));
  const nama = extractFieldValue(message, ['Nama']);
  const jenisJaminan = extractFieldValue(message, ['Jenis Jaminan', 'Jaminan']);
  const nopolStr = extractFieldValue(message, ['Nopol/a.n. BPKB', 'Nopol', 'BPKB']);
  const nopolData = parseNopolBPKB(nopolStr);
  const plafonStr = extractFieldValue(message, ['Plafon Pengajuan', 'Plafon']);
  const plafon = parseNominal(plafonStr);
  const tenor = extractFieldValue(message, ['Tenor']);
  const nomorTelepon = extractFieldValue(message, ['Nomor Telepon', 'No Telepon', 'No HP', 'Nomor HP']);
  const pasanganStr = extractFieldValue(message, ['Nama dan nomor HP pasangan', 'Pasangan']);
  const pasangan = parsePasangan(pasanganStr);
  const rekeningStr = extractFieldValue(message, ['Bank/Nomor Rekening/Nama', 'Rekening', 'Bank']);
  const rekening = parseRekening(rekeningStr);
  
  return {
    tanggal,
    nama,
    jenis_jaminan: jenisJaminan,
    nopol: nopolData.nopol,
    an_bpkb: nopolData.anBpkb,
    plafon_pengajuan: plafon,
    tenor,
    nomor_telepon: nomorTelepon,
    nama_pasangan: pasangan.nama,
    nomor_hp_pasangan: pasangan.nomor,
    bank: rekening.bank,
    nomor_rekening: rekening.nomor,
    atas_nama: rekening.atasNama,
    raw_message: message
  };
}

export function parseFormA3(message) {
  const tanggal = parseDate(extractFieldValue(message, ['Tanggal', 'Tgl']));
  const nama = extractFieldValue(message, ['Nama']);
  const plafonStr = extractFieldValue(message, ['Plafon Pengajuan', 'Plafon']);
  const plafon = parseNominal(plafonStr);
  const rekeningStr = extractFieldValue(message, ['Bank/Nomor Rekening/Atas Nama', 'Rekening', 'Bank']);
  const rekening = parseRekening(rekeningStr);
  
  return {
    tanggal,
    nama,
    plafon_pengajuan: plafon,
    bank: rekening.bank,
    nomor_rekening: rekening.nomor,
    atas_nama: rekening.atasNama,
    raw_message: message
  };
}

export async function saveFormToDatabase(formType, formData, senderInfo) {
  try {
    const tableName = `form_pengajuan_${formType.toLowerCase()}`;
    
    const dataToInsert = {
      ...formData,
      sender_name: senderInfo.senderName,
      sender_number: senderInfo.senderNumber,
      group_name: senderInfo.groupName,
      group_id: senderInfo.groupId,
      created_at: new Date().toISOString()
    };
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([dataToInsert])
      .select();
    
    if (error) {
      console.error(`Error menyimpan Form ${formType}:`, error);
      return { success: false, error };
    }
    
    console.log(`✅ Form ${formType} berhasil disimpan:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

function isPlaceholder(value) {
  if (!value) return true;
  
  const placeholderPatterns = [
    /^\[.*\]$/,  // [Nama Lengkap], [Jenis Usaha]
    /^DD-MM-YYYY$/i,
    /^\d{1,3}$/,  // Nomor telepon cuma 123
    /^(asoy|test|contoh|example)$/i,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(value.trim()));
}

export function validateFormData(formType, formData) {
  const warnings = [];
  const errors = [];
  
  // Check if using template placeholder
  if (isPlaceholder(formData.nama)) {
    errors.push('❌ Nama masih menggunakan placeholder template');
  }
  
  if (!formData.nama) {
    warnings.push('⚠️ Nama tidak terdeteksi');
  }
  
  if (!formData.plafon_pengajuan) {
    warnings.push('⚠️ Plafon Pengajuan tidak terdeteksi (gunakan format: Plafon Pengajuan: Rp 50.000.000)');
  }
  
  if (formType === 'A1' || formType === 'A2') {
    if (!formData.tenor) {
      warnings.push('⚠️ Tenor tidak terdeteksi');
    }
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
}

export function formatFormSummary(formType, formData) {
  let summary = `📋 *Form Pengajuan ${formType}*\n\n`;
  
  if (formData.tanggal) summary += `📅 Tanggal: ${formData.tanggal}\n`;
  if (formData.nama) summary += `👤 Nama: ${formData.nama}\n`;
  
  if (formType === 'A1' && formData.usaha) {
    summary += `🏢 Usaha: ${formData.usaha}\n`;
  }
  
  if (formType === 'A2') {
    if (formData.jenis_jaminan) summary += `🔒 Jenis Jaminan: ${formData.jenis_jaminan}\n`;
    if (formData.nopol) summary += `🚗 Nopol: ${formData.nopol}\n`;
    if (formData.an_bpkb) summary += `📄 A.n. BPKB: ${formData.an_bpkb}\n`;
  }
  
  if (formData.plafon_pengajuan) {
    summary += `💰 Plafon: Rp ${formData.plafon_pengajuan.toLocaleString('id-ID')}\n`;
  }
  
  if (formData.tenor) summary += `📆 Tenor: ${formData.tenor}\n`;
  if (formData.nomor_telepon) summary += `📱 No. Telepon: ${formData.nomor_telepon}\n`;
  
  if (formData.nama_pasangan || formData.nomor_hp_pasangan) {
    summary += `👫 Pasangan: ${formData.nama_pasangan || ''} ${formData.nomor_hp_pasangan || ''}\n`;
  }
  
  if (formData.bank || formData.nomor_rekening) {
    summary += `🏦 Rekening: ${formData.bank || ''} / ${formData.nomor_rekening || ''} / ${formData.atas_nama || ''}\n`;
  }
  
  return summary;
}
