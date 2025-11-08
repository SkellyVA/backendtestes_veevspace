// proxy-server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.post('/api/meta', async (req, res) => {
  console.log('[/] X-CSRF-TOKEN TRYING GET...')

  // ШАГ 1: Получаем X-CSRF-TOKEN через /v2/login (с фейковыми данными)
  const dummyRes = await axios.post(
    'https://auth.roblox.com/v2/login',
    { ctype: 1, cvalue: 'dummy', password: 'dummy' },
    { headers: {}, validateStatus: () => true }
  );

  const csrfToken = dummyRes.headers['x-csrf-token'];
  console.log('CSRF Token:', csrfToken);
  console.log('CSRF Status:', csrfResponse.status);
  console.log('Headers:', Object.keys(csrfResponse.headers));
  console.log('X-CSRF-TOKEN:', csrfToken);

  if (!csrfToken) {
    return res.status(500).json({ 
      error: 'X-CSRF-TOKEN not found', 
      headers: dummyRes.headers 
    });
  }

  res.json({ success: true, cookie: 'get is work' })
})

// Логин через Roblox API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {

    console.log('[/] X-CSRF-TOKEN TRYING GET...')

    // ШАГ 1: Получаем X-CSRF-TOKEN через /v2/login (с фейковыми данными)
    const dummyRes = await axios.post(
      'https://auth.roblox.com/v2/login',
      { ctype: 1, cvalue: 'dummy', password: 'dummy' },
      { headers: {}, validateStatus: () => true }
    );

    const csrfToken = dummyRes.headers['x-csrf-token'];

    if (!csrfToken) {
      return res.status(500).json({
        error: 'X-CSRF-TOKEN not found. Roblox blocked request.',
        receivedHeaders: csrfResponse.headers,
      });
    }

    console.log('[|] X-CSRF-TOKEN GET SUCCESSFULY...')

    console.log('[/] LOGIN TRYING...')

    // ШАГ 2: Логин
    const loginResponse = await axios.post(
      'https://auth.roblox.com/v2/login',
      {
        ctype: 1,
        cvalue: username,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        maxRedirects: 0,
        validateStatus: () => true,
      }
    );

    console.log('[|] GET COOKIE...')

    // Извлекаем .ROBLOSECURITY из set-cookie
    const setCookie = loginResponse.headers['set-cookie'];
    let robloxSecurity = null;

    console.log(setCookie) 

    if (setCookie) {
      const cookie = setCookie.find(c => c.includes('.ROBLOSECURITY'));

      console.log(cookie)

      if (cookie) {
        robloxSecurity = cookie.split(';')[0].split('=')[1];

        console.log(robloxSecurity)
      }
    }

    console.log('[/] RESPONSE TO CLIENT...')

    // Успешный логин
    if (loginResponse.status === 200 && robloxSecurity) {
      res.json({
        success: true,
        cookie: robloxSecurity,
      });
    } else {
      // Ошибка от Roblox
      const errorMessage =
        loginResponse.data?.errors?.[0]?.message ||
        loginResponse.data?.message ||
        'Invalid credentials';
      res.status(401).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Запуск
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`No login required — CSRF generated automatically`);
});
