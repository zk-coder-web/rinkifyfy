// Script para testar envio de email
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testando configuração de email...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('SMTP_USER:', process.env.SMTP_USER ? 'Configurado' : 'Não configurado');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Testar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!');
    
    // Testar envio
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Rankify" <noreply@rankify.com.br>',
      to: 'test@example.com', // Substitua por um email real para testar
      subject: 'Teste de email do Rankify',
      text: 'Este é um email de teste do sistema Rankify.',
      html: '<p>Este é um email de teste do sistema Rankify.</p>'
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('Detalhes:', error);
  }
}

testEmail();