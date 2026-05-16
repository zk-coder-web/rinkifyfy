// Script simples para testar envio de email
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testando configuração de email do Gmail...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false para porta 587
    auth: {
      user: 'zkdopix@gmail.com',
      pass: 'zbfnuvbigijwbmch',
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
      from: '"Rankify" <noreply@rankify.com.br>',
      to: 'zkdopix@gmail.com', // Enviar para o próprio email
      subject: 'Teste de email do Rankify',
      text: 'Este é um email de teste do sistema Rankify.',
      html: '<p>Este é um email de teste do sistema Rankify.</p>'
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('Código do erro:', error.code);
    console.error('Comando:', error.command);
    
    // Dicas para solução
    if (error.code === 'EAUTH') {
      console.log('\n💡 Dica: Problema de autenticação. Verifique:');
      console.log('1. Email e senha estão corretos');
      console.log('2. A conta tem verificação em duas etapas ativada');
      console.log('3. Você gerou um "App Password" (não use sua senha normal)');
      console.log('4. "Acesso a app menos seguro" está ativado');
    } else if (error.code === 'ECONNECTION' || error.code === 'ESOCKET') {
      console.log('\n💡 Dica: Problema de conexão. Tente:');
      console.log('1. Porta 465 com secure: true');
      console.log('2. Verificar firewall/antivírus');
    }
  }
}

testEmail();