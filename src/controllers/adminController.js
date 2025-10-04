import Admin from '../models/admin.js';

/**
 * @desc    Logs in an admin user
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set the admin ID in the session
    req.session.adminId = admin._id;
    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Logs out the current admin user
 * @route   POST /api/admin/logout
 * @access  Private
 */
export const logoutAdmin = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Admin logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    // Clear the session cookie
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

/**
 * @desc    Updates admin credentials (email/password)
 * @route   PUT /api/admin/update
 * @access  Private (should be protected by requireAdmin middleware)
 */
export const updateAdminCredentials = async (req, res) => {
  const { currentEmail, newEmail, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email: currentEmail });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If new email is provided, check if it's already in use
    if (newEmail && newEmail !== currentEmail) {
      const emailTaken = await Admin.findOne({ email: newEmail });
      if (emailTaken) {
        return res.status(400).json({ message: 'New email already in use' });
      }
      admin.email = newEmail;
    }

    // If new password is provided, update it (it will be hashed by the pre-save hook)
    if (newPassword) {
      admin.password = newPassword;
    }

    await admin.save();
    res.json({ message: 'Credentials updated successfully' });
  } catch (err) {
    console.error('Error updating admin credentials:', err);
    res.status(500).json({ message: 'Error updating credentials' });
  }
};

/**
 * @desc    Checks if an admin session is active
 * @route   GET /api/admin/check
 * @access  Public
 */
export const checkAuthStatus = (req, res) => {
  if (req.session && req.session.adminId) {
    return res.json({ loggedIn: true });
  }
  res.json({ loggedIn: false });
};

/**
 * @desc    Creates a new admin (from your commented-out code)
 * @route   POST /api/admin/create
 * @access  Private (should be protected or used for initial setup only)
 */
export const createAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const newAdmin = new Admin({ email, password }); // Password will be hashed by the model's pre-save hook
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ message: 'Error creating admin' });
  }
};