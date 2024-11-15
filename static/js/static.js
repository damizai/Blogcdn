// Fetch and display visit count
fetch('https://tongji.090227.xyz/?id=blog.291055.xyz')
    .then(r => r.json())  // Convert to JSON
    .then(d => document.getElementById('visitCount').innerText = d.visitCount)  // Show visitCount
    .catch(e => document.getElementById('visitCount').innerText = '加载失败');  // Error handling

const urls = [
    "https://blog.291055.xyz#Vercel CDN",
    "https://blog.4evercurry.us.kg#Cloudflare CDN",
    "https://fastly.blog.291055.xyz#fastly CDN",
    "https://zy111x.github.io#备用地址"
];

// Dynamically generate URL list
const ul = document.getElementById("urls");
urls.forEach((url, index) => {
    const [testUrl, name] = url.split('#');
    const li = document.createElement("li");
    li.id = `result${index}`;
    li.innerHTML = `${name} <span id="latency${index}">测速中...</span>`;
    ul.appendChild(li);
});

const timeout = 10000;

function testLatency(url) {
    return new Promise((resolve) => {
        const start = Date.now();
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.timeout = timeout;

        xhr.onload = function () {
            const latency = Date.now() - start;
            if (xhr.status === 200) {
                resolve({ url, latency });
            } else {
                resolve({ url, latency: `状态码: ${xhr.status}` });
            }
        };

        xhr.ontimeout = function () {
            resolve({ url, latency: `响应超时 ${timeout}ms` });
        };

        xhr.onerror = function () {
            resolve({ url, latency: '请求失败' });
        };

        xhr.send();
    });
}

// Get latency color
function getLatencyColor(latency) {
    if (latency <= 100) return 'rgb(36, 170, 29)';
    if (latency <= 200) return 'rgb(142, 161, 40)';
    if (latency <= 500) return 'rgb(246, 152, 51)';
    if (latency <= 1000) return 'rgb(242, 118, 42)';
    if (latency > 1000) return 'rgb(236, 70, 28)';
    return 'rgb(230, 22, 16)';  // Timeout or error
}

async function runTests() {
    const results = await Promise.all(urls.map(url => {
        const [testUrl, name] = url.split('#');
        return testLatency(testUrl).then(result => ({
            ...result,
            name
        }));
    }));

    results.forEach((result, index) => {
        const li = document.getElementById(`result${index}`);
        const latencySpan = document.getElementById(`latency${index}`);
        if (typeof result.latency === 'number') {
            latencySpan.textContent = `${result.latency}ms`;
            latencySpan.style.color = getLatencyColor(result.latency);
        } else {
            latencySpan.textContent = result.latency;
            latencySpan.style.color = 'rgb(230, 22, 16)'; // Timeout or error in red
        }
    });

    const validResults = results.filter(result => typeof result.latency === 'number');
    if (validResults.length > 0) {
        const fastest = validResults.reduce((prev, current) => (prev.latency < current.latency ? prev : current), validResults[0]);

        // Mark the fastest CDN
        results.forEach((result, index) => {
            if (result.name === fastest.name) {
                const li = document.getElementById(`result${index}`);
                li.innerHTML += ' ✅';
            }
        });

        // 302 redirect to the fastest CDN
        const currentPath = '/';
        const currentParams = '';
        const redirectUrl = fastest.url + currentPath + currentParams;
        window.location.href = redirectUrl;
    }
}

window.onload = runTests;
