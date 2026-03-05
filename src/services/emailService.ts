export const emailService = {
  sendAdminAlert: async (payload: any) => {
    console.log('Email Alert:', payload);
    // Implementation for sending email alerts
  },
  sendBlockNotification: async (email: string, reason: string) => {
    console.log('Block Notification Sent to:', email, 'Reason:', reason);
    // Implementation for sending block notification emails
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
