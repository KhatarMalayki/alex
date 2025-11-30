import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export async function extractTextFromImage(imageBuffer) {
  try {
    console.log('🔍 Memproses gambar dengan OCR...');
    
    const processedImage = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(
      processedImage,
      'ind+eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log('✅ OCR selesai');
    return text;
  } catch (error) {
    console.error('❌ Error OCR:', error);
    return null;
  }
}

export function extractNominalFromText(text) {
  if (!text) return null;

  const cleanText = text.replace(/\n/g, ' ').toUpperCase();
  
  const patterns = [
    /(?:RP|IDR|RUPIAH|NOMINAL|JUMLAH|TOTAL|AMOUNT)[\s:]*\.?\s*([\d.,]+)/gi,
    /(?:TRANSFER|BAYAR|PEMBAYARAN)[\s:]*\.?\s*(?:RP|IDR)?\s*([\d.,]+)/gi,
    /(?:^|\s)([\d]{1,3}(?:[.,][\d]{3})*(?:[.,][\d]{2})?)\s*(?:RP|IDR|RUPIAH)?/gi,
  ];

  const foundAmounts = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      let amountStr = match[1];
      
      // Handle format Indonesia: 5.500.000,00 atau 5.500.000
      // Deteksi kalau ada koma di akhir (desimal)
      if (amountStr.includes(',')) {
        // Format: 5.500.000,00 -> ambil bagian sebelum koma
        amountStr = amountStr.split(',')[0];
      }
      
      // Hapus semua titik dan koma
      const cleanAmount = amountStr.replace(/[.,]/g, '');
      const amount = parseInt(cleanAmount);
      
      if (amount >= 1000 && amount <= 999999999999) {
        foundAmounts.push(amount);
      }
    }
  }

  if (foundAmounts.length === 0) {
    return null;
  }

  foundAmounts.sort((a, b) => b - a);
  
  return foundAmounts[0];
}

export function formatRupiah(amount) {
  if (!amount) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export async function processTransferImage(imageBuffer) {
  try {
    const extractedText = await extractTextFromImage(imageBuffer);
    
    if (!extractedText) {
      return {
        success: false,
        nominal: null,
        extractedText: null,
        error: 'Gagal extract text dari gambar'
      };
    }

    const nominal = extractNominalFromText(extractedText);
    
    console.log('\n📊 Hasil OCR:');
    console.log('   Text terdeteksi:', extractedText.substring(0, 200) + '...');
    if (nominal) {
      console.log('   💰 Nominal terdeteksi:', formatRupiah(nominal));
    } else {
      console.log('   ⚠️  Nominal tidak terdeteksi');
    }

    return {
      success: true,
      nominal: nominal,
      extractedText: extractedText,
      formattedNominal: nominal ? formatRupiah(nominal) : null
    };
  } catch (error) {
    console.error('❌ Error processing image:', error);
    return {
      success: false,
      nominal: null,
      extractedText: null,
      error: error.message
    };
  }
}
