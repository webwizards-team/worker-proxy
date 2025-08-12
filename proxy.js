// مسیر پنل مدیریت. می‌توانید آن را تغییر دهید.
const ADMIN_PATH = '/_admin'; 

addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith(ADMIN_PATH)) {
        event.respondWith(handleAdminRequest(event.request));
    } else {
        event.respondWith(handleProxyRequest(event.request));
    }
});

/**
 * مدیریت درخواست‌های مربوط به پنل ادمین
 * @param {Request} request
 */
async function handleAdminRequest(request) {
    
    const {
        ADMIN_PASSWORD,
        REVERSE_PROXY_KV
    } = getBindings();

    if (!ADMIN_PASSWORD) {
        return new Response('Secret "ADMIN_PASSWORD" is not set in Worker settings.', {
            status: 500
        });
    }
    if (!REVERSE_PROXY_KV) {
        return new Response('KV Namespace "REVERSE_PROXY_KV" is not bound to this Worker.', {
            status: 500
        });
    }

    const url = new URL(request.url);

    
    if (request.method === 'POST' && url.pathname === `${ADMIN_PATH}/save`) {
        const formData = await request.formData();
        const password = formData.get('password');
        const upstreamUrl = formData.get('upstream_url');

        if (password !== ADMIN_PASSWORD) {
            return new Response('Invalid password', {
                status: 403
            });
        }

        if (!upstreamUrl || !isValidUrl(upstreamUrl)) {
            return new Response('Invalid Upstream URL provided.', {
                status: 400
            });
        }

        
        await REVERSE_PROXY_KV.put('config', JSON.stringify({
            upstreamUrl
        }));

        
        return Response.redirect(`${url.origin}${ADMIN_PATH}?password=${password}&saved=true`, 302);
    }

    
    const password = url.searchParams.get('password');
    if (password !== ADMIN_PASSWORD) {
        return new Response('Access denied. Please provide the correct password in the query string, e.g., ?password=your_pass', {
            status: 401
        });
    }

    
    const currentConfig = await REVERSE_PROXY_KV.get('config', {
        type: 'json'
    }) || {};
    const currentUpstream = currentConfig.upstreamUrl || '';
    const savedMessage = url.searchParams.get('saved') ? '<p style="color: green;">Settings saved successfully!</p>' : '';


    return new Response(getAdminPanelHTML(currentUpstream, savedMessage, password), {
        headers: {
            'Content-Type': 'text/html'
        },
    });
}


/**
 * مدیریت درخواست‌های پروکسی
 * @param {Request} request
 */
async function handleProxyRequest(request) {
    const {
        REVERSE_PROXY_KV
    } = getBindings();

    if (!REVERSE_PROXY_KV) {
        return new Response('KV Namespace "REVERSE_PROXY_KV" is not bound to this Worker.', {
            status: 500
        });
    }

    const config = await REVERSE_PROXY_KV.get('config', {
        type: 'json'
    });

    if (!config || !config.upstreamUrl) {
        return new Response(
            `Proxy is not configured. Please go to ${ADMIN_PATH} to set it up.`, {
                status: 503
            } 
        );
    }

    const upstreamUrl = new URL(config.upstreamUrl);
    const requestUrl = new URL(request.url);

    
    const newUrl = new URL(requestUrl.pathname + requestUrl.search, upstreamUrl.origin);

    const newRequest = new Request(newUrl, request);
    newRequest.headers.set('Host', upstreamUrl.hostname);
    newRequest.headers.set('X-Forwarded-Host', requestUrl.hostname);

    return fetch(newRequest);
}

// ----- Helper Functions -----

function getBindings() {
    
    return {
        ADMIN_PASSWORD,
        REVERSE_PROXY_KV,
    };
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function getAdminPanelHTML(currentUpstream, message, password) {
    return `
                                                                                                                                                                                                                                                                            <!DOCTYPE html>
                                                                                                                                                                                                                                                                              <html lang="en">
                                                                                                                                                                                                                                                                                <head>
                                                                                                                                                                                                                                                                                    <meta charset="UTF-8">
                                                                                                                                                                                                                                                                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                                                                                                                                                                                                                                            <title>Reverse Proxy Admin Panel</title>
                                                                                                                                                                                                                                                                                                <style>
                                                                                                                                                                                                                                                                                                      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; color: #333; max-width: 600px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; background-color: white; }
                                                                                                                                                                                                                                                                                                            h1 { color: #0070f3; }
                                                                                                                                                                                                                                                                                                                  input[type="text"], input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; }
                                                                                                                                                                                                                                                                                                                        button { background-color: #0070f3; color: white; padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; }
                                                                                                                                                                                                                                                                                                                              button:hover { background-color: #005bb5; }
                                                                                                                                                                                                                                                                                                                                    label { font-weight: bold; }
                                                                                                                                                                                                                                                                                                                                          .message { margin-bottom: 1rem; }
                                                                                                                                                                                                                                                                                                                                              </style>
                                                                                                                                                                                                                                                                                                                                                </head>
                                                                                                                                                                                                                                                                                                                                                  <body>
                                                                                                                                                                                                                                                                                                                                                      <h1>Reverse Proxy Settings</h1>
                                                                                                                                                                                                                                                                                                                                                          <div class="message">${message}</div>
                                                                                                                                                                                                                                                                                                                                                              <form action="${ADMIN_PATH}/save" method="POST">
                                                                                                                                                                                                                                                                                                                                                                    <label for="upstream_url">Upstream URL:</label>
                                                                                                                                                                                                                                                                                                                                                                          <p>Enter the full URL of the server you want to proxy to (e.g., https://example.com:port).</p>
                                                                                                                                                                                                                                                                                                                                                                                <input type="text" id="upstream_url" name="upstream_url" value="${currentUpstream}" placeholder="https://your-backend-server.com" required>
                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                            <input type="hidden" name="password" value="${password}">
                                                                                                                                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                                                                                                                        <button type="submit">Save Settings</button>
                                                                                                                                                                                                                                                                                                                                                                                                            </form>
                                                                                                                                                                                                                                                                                                                                                                                                            <p>By Web Wizards <a class="(telegram)" href="https://t.me/WebWizardsTeam" target="_blank" rel="noopener noreferrer">Telegram</a></p>
                                                                                                                                                                                                                                                                                                                                                                                                              </body>
                                                                                                                                                                                                                                                                                                                                                                                                                </html>
                                                                                                                                                                                                                                                                                                                                                                                                                  `;
}
