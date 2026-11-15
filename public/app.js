const output = document.querySelector('#output');
const statusEl = document.querySelector('#status');
const buttons = document.querySelectorAll('button[data-path]');

async function callRoute(path, method) {
    statusEl.textContent = 'Loading...';
    output.textContent = '';

    try {
        const response = await fetch(path, { method });
        const contentType = response.headers.get('Content-Type') ?? '';

        let body;
        if (contentType.includes('application/json')) {
            const data = await response.json();
            body = JSON.stringify(data, null, 2);
        } else {
            body = await response.text();
        }

        statusEl.textContent = `${method} ${path} → ${response.status} ${response.statusText}`;
        statusEl.className = response.ok ? 'ok' : 'error';
        output.textContent = body;
    } catch (error) {
        statusEl.textContent = `${method} ${path} → request failed`;
        statusEl.className = 'error';
        output.textContent = error.message;
    }
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const path = button.dataset.path;
        const method = button.dataset.method ?? 'GET';
        callRoute(path, method);
    });
});