import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Código não fornecido' },
        { status: 400 }
      );
    }

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return NextResponse.json(
        { error: 'Variáveis de ambiente não configuradas' },
        { status: 500 }
      );
    }

    // Trocar código por token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token error:', error);
      return NextResponse.json(
        { error: 'Falha ao obter token' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obter informações do usuário
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Falha ao obter dados do usuário' },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();

    // Criar resposta com dados do usuário
    const response = NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        displayName: userData.name,
        picture: userData.picture,
        provider: 'google',
      },
    });

    // Criar um token de sessão simples (base64 dos dados do usuário)
    const sessionToken = Buffer.from(JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    })).toString('base64');
    
    response.cookies.set('rankify_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no callback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
