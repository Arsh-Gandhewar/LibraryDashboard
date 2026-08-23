const axios = require('axios');

/**
 * Sends a WhatsApp message using Meta's official Cloud API.
 * 
 * Requires these environment variables:
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 */
const sendWhatsAppMessage = async (to, templateName, languageCode = 'en_US') => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error('WhatsApp credentials are not configured in .env');
    return false;
  }

  // Ensure the phone number starts with country code, no +, no spaces
  // Defaulting to India (+91) if not provided
  let formattedNumber = to.replace(/\D/g, '');
  if (formattedNumber.length === 10) {
    formattedNumber = '91' + formattedNumber;
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`WhatsApp message sent to ${formattedNumber}. Message ID:`, response.data.messages[0].id);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${formattedNumber}:`, error.response?.data || error.message);
    return false;
  }
};

module.exports = {
  sendWhatsAppMessage
};
