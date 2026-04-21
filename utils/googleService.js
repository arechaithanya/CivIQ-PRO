function createReminder(title, reminderDate) {
  const dateText = reminderDate || 'your eligibility date';

  return {
    success: true,
    message: `Mock reminder created in Google Calendar for ${title} on ${dateText}.`
  };
}

module.exports = {
  createReminder
};
