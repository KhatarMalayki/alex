export function suggestCorrections(formType, formData, messageBody) {
  const suggestions = [];
  
  // Check nama placeholder
  if (formData.nama && /^\[.*\]$/.test(formData.nama)) {
    suggestions.push({
      field: 'Nama',
      issue: 'Masih pakai contoh',
      suggestion: 'Ganti dengan nama lengkap Bapak/Ibu. Contoh: Budi Santoso'
    });
  }
  
  // Check plafon placeholder atau format salah
  if (!formData.plafon_pengajuan) {
    const plafonMatch = messageBody.match(/Plafon[^:]*:\s*(.+?)(?=\n|$)/i);
    if (plafonMatch) {
      const plafonText = plafonMatch[1].trim();
      if (/^\[.*\]$/.test(plafonText) || /jt|juta/i.test(plafonText)) {
        suggestions.push({
          field: 'Plafon Pengajuan',
          issue: `Masih pakai contoh: "${plafonText}"`,
          suggestion: 'Tulis angka lengkap ya Pak/Bu. Contoh: Rp 50.000.000'
        });
      }
    }
  }
  
  // Check tenor placeholder
  if (formType === 'A1' || formType === 'A2') {
    if (!formData.tenor) {
      const tenorMatch = messageBody.match(/Tenor[^:]*:\s*(.+?)(?=\n|$)/i);
      if (tenorMatch) {
        const tenorText = tenorMatch[1].trim();
        if (/^\[.*\]$/.test(tenorText) || /tahub/i.test(tenorText)) {
          suggestions.push({
            field: 'Tenor',
            issue: `Ada kesalahan: "${tenorText}"`,
            suggestion: 'Tulis berapa bulan. Contoh: 12 bulan atau 18 bulan'
          });
        }
      }
    }
  }
  
  // Check nomor telepon placeholder
  if (formData.nomor_telepon && /^\d{1,3}$/.test(formData.nomor_telepon)) {
    suggestions.push({
      field: 'Nomor Telepon',
      issue: 'Nomor HP kurang lengkap',
      suggestion: 'Tulis nomor HP lengkap ya. Contoh: 081234567890'
    });
  }
  
  return suggestions;
}

export function formatSuggestions(suggestions) {
  if (suggestions.length === 0) return '';
  
  let message = '\n\n💡 *Yang Perlu Diperbaiki:*\n';
  
  suggestions.forEach((s, index) => {
    message += `\n${index + 1}. *${s.field}*\n`;
    message += `   ❌ ${s.issue}\n`;
    message += `   ✅ ${s.suggestion}\n`;
  });
  
  return message;
}

export function isLikelyTemplate(messageBody) {
  const templateIndicators = [
    /\[Nama Lengkap\]/i,
    /\[Jenis Usaha\]/i,
    /\[Nominal\]/i,
    /DD-MM-YYYY/i,
    /\[.*\].*\[.*\].*\[.*\]/,  // Multiple placeholders
  ];
  
  return templateIndicators.some(pattern => pattern.test(messageBody));
}
