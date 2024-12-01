
// api from LibreTranslate Library 
async function translateText(text, targetLang = 'zh') {
  try {
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text',
    });
    console.log(`Original Text: ${text}`);
    console.log(`Translated Text: ${response.data.translatedText}`);
  } catch (error) {
    console.error('Error translating text:', error);
  }
}


