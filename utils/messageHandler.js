import { supabase } from '../config/supabase.js';

export async function saveTransferToDatabase(data) {
  try {
    const { data: result, error } = await supabase
      .from('transfer_bukti')
      .insert([
        {
          sender_name: data.senderName,
          sender_number: data.senderNumber,
          group_name: data.groupName,
          group_id: data.groupId,
          message_text: data.messageText,
          has_image: data.hasImage,
          image_url: data.imageUrl,
          nominal: data.nominal,
          extracted_text: data.extractedText,
          timestamp: data.timestamp,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error menyimpan ke database:', error);
      return { success: false, error };
    }

    console.log('✅ Bukti transfer berhasil disimpan:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

export function isTransferMessage(message) {
  const transferKeywords = [
    'bukti transfer',
    'bukti tf',
    'transfer',
    'pembayaran',
    'bayar',
    'sudah transfer',
    'sudah bayar',
    'tf',
    'lunas'
  ];

  const messageText = message.body.toLowerCase();
  return transferKeywords.some(keyword => messageText.includes(keyword));
}

export async function downloadImage(media) {
  try {
    const buffer = await media.data;
    const base64 = buffer.toString('base64');
    return `data:${media.mimetype};base64,${base64}`;
  } catch (error) {
    console.error('Error download gambar:', error);
    return null;
  }
}
