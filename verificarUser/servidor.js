const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/check/:username', (req, res) => {
    const username = req.params.username;
    console.log(`[API] Verificando: @${username}`);
    
    const pythonProcess = spawn('python', [path.join(__dirname, 'checker.py'), username]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log(data.toString());
    });
    
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.json({
                success: false,
                exists: false,
                error: 'Erro no verificador'
            });
        }
        
        try {
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return res.json(result);
            }
            return res.json({
                success: false,
                exists: false,
                error: 'Resposta inválida'
            });
        } catch (e) {
            return res.json({
                success: false,
                exists: false,
                error: 'Erro ao processar'
            });
        }
    });
    
    setTimeout(() => {
        pythonProcess.kill();
        res.json({ success: false, exists: false, error: 'Timeout' });
    }, 15000);
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  🚀 Servidor rodando em: http://localhost:${PORT}          ║
║  🌐 Interface: http://localhost:${PORT}                   ║
╚══════════════════════════════════════════════════════════╝
    `);
});