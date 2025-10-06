const SOSAlert = require('../models/SOSAlert');

class SOSAlertController {
  static async sendAlert(req, res) {
    try {
      const { userId, groupId } = req.body;

      if (!userId || !groupId) {
        return res.status(400).json({ success: false, message: 'userId and groupId are required' });
      }

      const alertId = await SOSAlert.create({ userId, groupId });

      return res.json({
        success: true,
        message: 'SOS alert sent',
        data: { alertId, userId, groupId, createdAt: new Date().toISOString() }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to send SOS alert', error: error.message });
    }
  }

  static async getAlerts(req, res) {
    try {
      const { groupId } = req.body;
      if (!groupId) {
        return res.status(400).json({ success: false, message: 'groupId is required' });
      }

      const alerts = await SOSAlert.getByGroup(groupId);
      return res.json({ success: true, message: 'Alerts fetched', data: alerts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch alerts', error: error.message });
    }
  }
}

module.exports = SOSAlertController;
