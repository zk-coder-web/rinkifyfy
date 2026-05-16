"""
Verificador de Perfis do Instagram - Versão com múltiplos métodos para seguidores
"""

import sys
import os

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import requests
import re
import json
import html
import time
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

def get_headers():
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
    }

TIMEOUT = 15

def limpar_username(input_usuario):
    username = input_usuario.strip()
    if username.startswith('@'):
        username = username[1:]
    username = username.strip().rstrip('/')
    return username

def construir_url(username):
    return f"https://www.instagram.com/{username}/"

def limpar_nome(nome):
    if not nome:
        return None
    nome = html.unescape(nome)
    nome = re.sub(r'\s*\(@[^)]+\)\s*', '', nome)
    nome = re.sub(r'\s*•\s*Fotos e vídeos do Instagram\s*', '', nome)
    # Remove emojis e caracteres especiais
    nome = re.sub(r'[\U0001F300-\U0001F9FF]', '', nome)
    nome = re.sub(r'\s+', ' ', nome).strip()
    return nome if nome and len(nome) > 2 else None

def extrair_nome(html_content):
    match = re.search(r'<meta[^>]*property="og:title"[^>]*content="([^"]+)"', html_content)
    if match:
        return limpar_nome(match.group(1))
    
    match = re.search(r'"full_name":"([^"]+)"', html_content)
    if match:
        return limpar_nome(match.group(1))
    
    return None

def extrair_seguidores(html_content):
    """MÚLTIPLOS MÉTODOS para extrair seguidores"""
    
    # ========== MÉTODO 1: edge_followed_by ==========
    match = re.search(r'"edge_followed_by"\s*:\s*{[^}]*"count"\s*:\s*([0-9]+)', html_content)
    if match:
        return int(match.group(1))
    
    # ========== MÉTODO 2: sharedData ==========
    shared_match = re.search(r'window\._sharedData\s*=\s*({[^;]+});', html_content)
    if shared_match:
        try:
            data = json.loads(shared_match.group(1))
            if 'entry_data' in data and 'ProfilePage' in data['entry_data']:
                profile = data['entry_data']['ProfilePage']
                if profile and len(profile) > 0:
                    user_data = profile[0].get('graphql', {}).get('user', {})
                    followers = user_data.get('edge_followed_by', {}).get('count')
                    if followers:
                        return int(followers)
        except:
            pass
    
    # ========== MÉTODO 3: API ==========
    try:
        headers = get_headers()
        headers['X-Requested-With'] = 'XMLHttpRequest'
        response = requests.get(
            f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}", # type: ignore
            headers=headers, timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'user' in data['data']:
                followers = data['data']['user'].get('edge_followed_by', {}).get('count')
                if followers:
                    return int(followers)
    except:
        pass
    
    # ========== MÉTODO 4: Link com title ==========
    patterns = [
        r'<a[^>]*href="[^"]*/followers/"[^>]*>.*?<span[^>]*title="([0-9,\\.]+)"[^>]*>.*?</a>',
        r'<a[^>]*href="[^"]*/followers/"[^>]*>.*?([0-9,\\.]+).*?seguidores.*?</a>',
        r'<a[^>]*href="[^"]*/followers/"[^>]*>.*?([0-9,\\.]+).*?followers.*?</a>',
        r'([0-9,\\.]+)\s*seguidores',
        r'([0-9,\\.]+)\s*followers',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html_content, re.IGNORECASE | re.DOTALL)
        if match:
            num = match.group(1).replace('.', '').replace(',', '')
            try:
                return int(num)
            except:
                pass
    
    # ========== MÉTODO 5: Meta tag específica ==========
    match = re.search(r'<meta[^>]*content="([0-9,\\.]+)\s*Followers"', html_content, re.IGNORECASE)
    if match:
        num = match.group(1).replace('.', '').replace(',', '')
        try:
            return int(num)
        except:
            pass
    
    # ========== MÉTODO 6: Script com número ==========
    match = re.search(r'"count":\s*([0-9]+)[,\s][^}]*"followed_by"', html_content)
    if match:
        return int(match.group(1))
    
    # ========== MÉTODO 7: Buscar em JSON dentro de script tags ==========
    try:
        script_matches = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html_content, re.DOTALL)
        for script_content in script_matches:
            try:
                data = json.loads(script_content)
                if isinstance(data, dict) and 'interactionStatistic' in data:
                    for stat in data.get('interactionStatistic', []):
                        if stat.get('interactionType') == 'http://schema.org/FollowAction':
                            count = stat.get('userInteractionCount')
                            if count:
                                return int(count)
            except:
                pass
    except:
        pass
    
    # ========== MÉTODO 8: Procurar por padrão de número grande ==========
    try:
        # Procura por números grandes que parecem ser contagem de seguidores
        matches = re.findall(r'(?:followers|seguidores|followers_count|follower_count)["\']?\s*[:=]\s*["\']?([0-9]+)', html_content, re.IGNORECASE)
        if matches:
            return int(matches[0])
    except:
        pass
    
    return None

def verificar_perfil_existe(username):
    url = construir_url(username)
    
    for tentativa in range(3):
        try:
            headers = get_headers()
            response = requests.get(
                url, 
                headers=headers, 
                timeout=TIMEOUT,
                allow_redirects=False
            )
            
            if response.status_code == 200:
                html_content = response.text
                html_lower = html_content.lower()
                
                if 'página não está disponível' in html_lower or 'page not found' in html_lower:
                    return {
                        "existe": False,
                        "url": url,
                        "motivo": "Página não disponível",
                        "nome": None,
                        "seguidores": None
                    }
                
                nome = extrair_nome(html_content)
                seguidores = extrair_seguidores(html_content)
                
                # Debug
                print(f"[DEBUG] Nome: {nome}", file=sys.stderr)
                print(f"[DEBUG] Seguidores: {seguidores}", file=sys.stderr)
                
                if nome or seguidores or 'og:description' in html_lower:
                    return {
                        "existe": True,
                        "url": url,
                        "motivo": "Perfil encontrado",
                        "nome": nome,
                        "seguidores": seguidores
                    }
                
                return {
                    "existe": False,
                    "url": url,
                    "motivo": "Sem dados de perfil",
                    "nome": None,
                    "seguidores": None
                }
            
            elif response.status_code in [301, 302, 303, 307, 308]:
                location = response.headers.get('Location', '')
                if 'login' in location.lower():
                    if tentativa < 2:
                        time.sleep(2)
                        continue
                    return {
                        "existe": False,
                        "url": url,
                        "motivo": "Perfil não existe",
                        "nome": None,
                        "seguidores": None
                    }
            
            elif response.status_code == 404:
                return {
                    "existe": False,
                    "url": url,
                    "motivo": "Página não encontrada",
                    "nome": None,
                    "seguidores": None
                }
            
            elif response.status_code == 429:
                if tentativa < 2:
                    time.sleep(5)
                    continue
                return {
                    "existe": False,
                    "url": url,
                    "motivo": "Rate limit",
                    "nome": None,
                    "seguidores": None
                }
            
            else:
                if tentativa < 2:
                    time.sleep(2)
                    continue
                return {
                    "existe": False,
                    "url": url,
                    "motivo": f"Status {response.status_code}",
                    "nome": None,
                    "seguidores": None
                }
                
        except Exception as e:
            if tentativa < 2:
                time.sleep(2)
                continue
            return {
                "existe": False,
                "url": url,
                "motivo": f"Erro: {str(e)}",
                "nome": None,
                "seguidores": None
            }
    
    return {
        "existe": False,
        "url": url,
        "motivo": "Falha após tentativas",
        "nome": None,
        "seguidores": None
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Username não fornecido"}))
        return
    
    username = sys.argv[1]
    username_limpo = limpar_username(username)
    resultado = verificar_perfil_existe(username_limpo)
    
    output = {
        "success": True,
        "exists": resultado["existe"],
        "username": username_limpo,
        "url": resultado["url"],
        "motivo": resultado["motivo"],
        "nome": resultado.get("nome"),
        "seguidores": resultado.get("seguidores")
    }
    
    # Usar UTF-8 encoding para evitar problemas com caracteres especiais
    print(json.dumps(output, ensure_ascii=False, indent=2, default=str))

if __name__ == "__main__":
    main()