export const emailService = {
  sendAdminAlert: async (payload: any) => {
    console.log('Email Alert:', payload);
    // Implementation for sending email alerts
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
