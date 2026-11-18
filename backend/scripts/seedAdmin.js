// backend/scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // User model import karein

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = process.argv[2] || 'admin@lms.com';
    const password = process.argv[3] || 'Admin@12345';
    const name = process.argv[4] || 'Admin';

    // Check karein ke user pehle se hai ya nahi
    let user = await User.findOne({ email });
    
    if (user) {
      // User hai, toh sirf role update karein (password ko chhedne ki zaroorat nahi)
      user.role = 'admin';
      await user.save(); // save() call karein taake hook trigger ho (lekin password modified nahi hai, toh hash nahi hoga)
      console.log(`✅ Existing user ${email} promoted to admin`);
    } else {
      // Naya user banayein
      // ⚠️ IMPORTANT: Yahan plain text password dein. Mongoose ka pre-save hook khud hash karega.
      await User.create({
        name,
        email,
        password: password, // Plain text password. Hook isko hash karega.
        role: 'admin'
      });
      console.log(`✅ New admin created: ${email} / ${password}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
})();