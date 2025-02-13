import models from '../models/index.js';

export const get_form = async (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.locals.photo_url = user.photo_url;
    res.render('add_whatsapp');
}

export const add_wa = async (req, res) => {
    try {
      const { countryCode, whatsappNumber } = req.body;
      
      // Validate input: both fields must be provided.
      if (!countryCode || !whatsappNumber) {
        return res.status(400).json({ error: 'Country code and WhatsApp number are required.' });
      }
  
      // Trim and validate that the number consists only of digits.
      const trimmedNumber = whatsappNumber.trim();
      if (!/^\d+$/.test(trimmedNumber)) {
        return res.status(400).json({ error: 'Invalid WhatsApp number format. Only digits are allowed.' });
      }
      
      // Combine the constant country code with the editable part.
      const fullNumber = `${countryCode}${trimmedNumber}`;
  
      // Assume the user is authenticated and req.user is available.
      const userId = req.user.id;
  
      // Update the user's record with the new WhatsApp number.
      await models.User.update(
        { whatsapp_number: fullNumber },
        { where: { id: userId } }
      );
  
      return res.status(200).json({ success: true, message: 'WhatsApp number added successfully.' });
    } catch (error) {
      console.error('Error adding WhatsApp number:', error);
      return res.status(500).json({ error: 'Server error' });
    }
};