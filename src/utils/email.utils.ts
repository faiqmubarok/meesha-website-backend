export const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  // Dalam implementasi nyata, kita akan menggunakan nodemailer untuk mengirim email
  // Untuk saat ini, kita hanya log ke konsol untuk keperluan pengembangan
  console.log(`
    ====== EMAIL RESET PASSWORD ======
    Kepada: ${email}
    Token: ${resetToken}
    Link: http://localhost:3000/reset-password?token=${resetToken}
    ================================
  `)

  // Implementasi sebenarnya akan menggunakan nodemailer
  // const transporter = nodemailer.createTransport({...})
  // await transporter.sendMail({...})

  return true
}
