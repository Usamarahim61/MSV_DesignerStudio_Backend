const Contact = require('../models/Contact');

// Create a new contact (public route)
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Name, email, subject, and message are required'
      });
    }

    // Create contact with default status 'new'
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      subject,
      message: message.trim(),
      status: 'new' // Default status
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A contact with this email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all contacts (admin route)
const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, subject } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (subject) {
      query.subject = subject;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contact statistics (admin route)
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await Contact.countDocuments();

    res.json({
      total: totalContacts,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contact by ID (admin route)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update contact (admin route)
const updateContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, status, priority, adminNotes } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : undefined;
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes.trim();

    // If status is being changed to 'responded', set respondedAt
    if (status === 'responded' && req.user) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user.id;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update contact status only (admin route)
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({
        message: 'Valid status is required (new, read, or responded)'
      });
    }

    const updateData = { status };

    // If status is being changed to 'responded', set respondedAt
    if (status === 'responded' && req.user) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user.id;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete contact (admin route)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactStats,
  getContactById,
  updateContact,
  updateContactStatus,
  deleteContact
};
