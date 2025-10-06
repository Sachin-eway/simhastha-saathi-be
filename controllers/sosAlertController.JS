const User = require('../models/User');
const Alert = require('../models/Alert');

class SosAlertController {
  static async sendAlert(req, res) {
    const { userId, groupId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const alert = await Alert.create({ userId, alertType: 'sos', groupId });
    res.json({ success: true, message: 'Alert sent successfully' });
  }

  static async getAlerts(req, res) {
    const { groupId } = req.body;
    const alerts = await Alert.findByGroupId(groupId);
    res.json({ success: true, message: 'Alerts fetched successfully', data: alerts });
  }
}

module.exports = SosAlertController;