import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { saveTransferToDatabase, isTransferMessage, downloadImage } from './utils/messageHandler.js';
import { processTransferImage, formatRupiah } from './utils/ocrProcessor.js';
import { detectFormType, parseFormA1, parseFormA2, parseFormA3, saveFormToDatabase, formatFormSummary, validateFormData } from './utils/formParser.js';
import { suggestCorrections, formatSuggestions, isLikelyTemplate } from './utils/aiAssistant.js';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('📱 Scan QR code ini dengan WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot WhatsApp siap!');
  console.log('🤖 Bot akan mencatat:');
  console.log('   - Bukti transfer ke database Supabase');
  console.log('   - Form Pengajuan A1, A2, A3');
});

client.on('message', async (message) => {
  try {
    const chat = await message.getChat();
    
    console.log(`\n[DEBUG] Pesan masuk dari: ${message.from}`);
    console.log(`[DEBUG] Isi pesan: ${message.body.substring(0, 50)}...`);
    console.log(`[DEBUG] Is Group: ${chat.isGroup}`);
    
    // Skip status broadcast dan pesan dari diri sendiri
    if (message.from === 'status@broadcast' || message.fromMe) {
      console.log('[DEBUG] Status broadcast atau pesan sendiri, di-skip');
      return;
    }
    
    if (!chat.isGroup) {
      console.log('[DEBUG] Pesan bukan dari grup, di-skip');
      return;
    }

    let contact;
    let senderName;
    let senderNumber;
    
    try {
      contact = await message.getContact();
      senderName = contact.pushname || contact.number || message.author || message.from;
      senderNumber = contact.number || message.author || message.from;
    } catch (error) {
      console.log('[DEBUG] Error getting contact, using fallback');
      senderName = message.author || message.from;
      senderNumber = message.author || message.from;
    }
    
    const hasMedia = message.hasMedia;
    const messageBody = message.body;
    
    // Check for template request
    if (/template\s*(a1|a2|a3)/i.test(messageBody)) {
      const templateType = messageBody.match(/template\s*(a1|a2|a3)/i)[1].toUpperCase();
      const templates = {
        A1: `📋 *Contoh Pengisian Form A1*\n\n_Silakan copy dan ganti dengan data Bapak/Ibu:_\n\n━━━━━━━━━━━━━━━━━━━━\nForm Pengajuan A1\n\nTanggal: 30-11-2024\nNama: Budi Santoso\nUsaha: Warung Sembako\nPlafon Pengajuan: Rp 50.000.000\nTenor: 12 bulan\nNomor Telepon: 081234567890\nNama dan nomor HP pasangan: Siti Aminah / 081298765432\nBank/Nomor Rekening/Atas Nama: BCA / 1234567890 / Budi Santoso\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *PENTING:* Ganti semua data di atas dengan data Bapak/Ibu yang sebenarnya ya!`,
        A2: `📋 *Contoh Pengisian Form A2*\n\n_Silakan copy dan ganti dengan data Bapak/Ibu:_\n\n━━━━━━━━━━━━━━━━━━━━\nForm Pengajuan A2\n\nTanggal: 30-11-2024\nNama: Ahmad Wijaya\nJenis Jaminan: BPKB Motor\nNopol/a.n. BPKB: B 1234 XYZ / Ahmad Wijaya\nPlafon Pengajuan: Rp 30.000.000\nTenor: 24 bulan\nNomor Telepon: 081234567890\nNama dan nomor HP pasangan: Dewi Lestari / 081298765432\nBank/Nomor Rekening/Nama: Mandiri / 9876543210 / Ahmad Wijaya\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *PENTING:* Ganti semua data di atas dengan data Bapak/Ibu yang sebenarnya ya!`,
        A3: `📋 *Contoh Pengisian Form A3*\n\n_Silakan copy dan ganti dengan data Bapak/Ibu:_\n\n━━━━━━━━━━━━━━━━━━━━\nForm Pengajuan A3\n\nTanggal: 30-11-2024\nNama: Rina Susanti\nPlafon Pengajuan: Rp 10.000.000\nBank/Nomor Rekening/Atas Nama: BRI / 5555666677778888 / Rina Susanti\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *PENTING:* Ganti semua data di atas dengan data Bapak/Ibu yang sebenarnya ya!`
      };
      await message.reply(templates[templateType]);
      return;
    }
    
    // Check for typo/similar keywords
    const typoPatterns = [
      /FROM\s*(PENGAJUAN)?\s*A\s*[123]/i,
      /FORN\s*(PENGAJUAN)?\s*A\s*[123]/i,
      /FORM\s*(PENGAJUAAN|PENGAJUA)\s*A\s*[123]/i
    ];
    
    if (typoPatterns.some(pattern => pattern.test(messageBody))) {
      await message.reply('🙏 Maaf Bapak/Ibu, sepertinya ada kesalahan penulisan.\n\n✅ Yang benar: *Form Pengajuan A1* atau *Form A1*\n\n📝 Ketik "template A1" untuk melihat contoh yang bisa di-copy.');
      return;
    }
    
    const formType = detectFormType(messageBody);
    if (formType) {
      console.log(`\n📋 Form Pengajuan ${formType} terdeteksi!`);
      console.log(`👤 Pengirim: ${senderName}`);
      console.log(`👥 Grup: ${chat.name}`);
      
      let formData;
      if (formType === 'A1') {
        formData = parseFormA1(messageBody);
      } else if (formType === 'A2') {
        formData = parseFormA2(messageBody);
      } else if (formType === 'A3') {
        formData = parseFormA3(messageBody);
      }
      
      const senderInfo = {
        senderName: senderName,
        senderNumber: senderNumber,
        groupName: chat.name,
        groupId: chat.id._serialized
      };
      
      // Validasi minimal: harus ada nama
      if (!formData.nama) {
        await message.reply(`🙏 Maaf Bapak/Ibu, form ${formType} belum lengkap.\n\n⚠️ Minimal harus ada *Nama* ya.\n\n📝 Ketik "template ${formType}" untuk melihat contoh pengisian yang benar.`);
        return;
      }
      
      const validation = validateFormData(formType, formData);
      
      // Check for placeholder errors
      if (!validation.isValid) {
        const suggestions = suggestCorrections(formType, formData, messageBody);
        let errorMessage = `🙏 Maaf Bapak/Ibu, ada yang perlu diperbaiki di form ${formType}:\n\n${validation.errors.join('\n')}\n\n⚠️ Mohon isi dengan data Bapak/Ibu yang sebenarnya ya, jangan pakai contoh.`;
        
        if (suggestions.length > 0) {
          errorMessage += formatSuggestions(suggestions);
        }
        
        errorMessage += `\n\n📝 Ketik "template ${formType}" kalau mau lihat contoh lagi.`;
        await message.reply(errorMessage);
        return;
      }
      
      const result = await saveFormToDatabase(formType, formData, senderInfo);
      
      if (result.success) {
        const summary = formatFormSummary(formType, formData);
        let replyMessage = `✅ Form Pengajuan ${formType} berhasil dicatat!\n\n${summary}`;
        
        if (validation.warnings.length > 0) {
          replyMessage += `\n\n🚨 *Peringatan:*\n${validation.warnings.join('\n')}`;
          replyMessage += `\n\n📝 Gunakan template yang benar untuk hasil optimal. Ketik "template ${formType}" untuk melihat contoh.`;
        }
        
        await message.reply(replyMessage);
      } else {
        await message.reply(`🙏 Maaf Bapak/Ibu, ada kendala teknis. Mohon coba kirim lagi ya.`);
      }
      
      return;
    }
    
    const isTransfer = isTransferMessage(message);

    if (isTransfer || hasMedia) {
      console.log('\n📨 Pesan baru terdeteksi:');
      console.log(`👤 Pengirim: ${senderName}`);
      console.log(`👥 Grup: ${chat.name}`);
      console.log(`💬 Pesan: ${message.body}`);
      console.log(`🖼️  Ada gambar: ${hasMedia ? 'Ya' : 'Tidak'}`);

      let imageUrl = null;
      let nominal = null;
      let extractedText = null;
      
      if (hasMedia) {
        console.log('⏳ Mengunduh gambar...');
        const media = await message.downloadMedia();
        
        // Filter sticker dan non-image
        if (media.mimetype.includes('webp') || !media.mimetype.includes('image')) {
          console.log('⚠️  Sticker atau bukan gambar, di-skip');
          return;
        }
        
        imageUrl = await downloadImage(media);
        console.log('✅ Gambar berhasil diunduh');

        const imageBuffer = Buffer.from(media.data, 'base64');
        const ocrResult = await processTransferImage(imageBuffer);
        
        if (ocrResult.success) {
          nominal = ocrResult.nominal;
          extractedText = ocrResult.extractedText;
        }
        
        // Hanya simpan kalau ada nominal
        if (!nominal) {
          console.log('⚠️  Nominal tidak terdeteksi, gambar tidak disimpan');
          return;
        }
      }

      const transferData = {
        senderName: senderName,
        senderNumber: senderNumber,
        groupName: chat.name,
        groupId: chat.id._serialized,
        messageText: message.body,
        hasImage: hasMedia,
        imageUrl: imageUrl,
        nominal: nominal,
        extractedText: extractedText,
        timestamp: message.timestamp
      };

      const result = await saveTransferToDatabase(transferData);
      
      if (result.success) {
        let replyMessage = '✅ Bukti transfer telah dicatat. Terima kasih!';
        if (nominal) {
          replyMessage += `\n💰 Nominal terdeteksi: ${formatRupiah(nominal)}`;
        }
        await message.reply(replyMessage);
      } else {
        console.error('❌ Gagal menyimpan ke database');
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

client.on('disconnected', (reason) => {
  console.log('❌ Bot terputus:', reason);
});

console.log('🚀 Memulai bot WhatsApp...');
client.initialize();
