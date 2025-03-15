// 通过fetch获取API并展示visitCount
fetch('https://tongji.090227.xyz/?id=hexo.200038.xyz')
    .then(r => r.json()) // 转换为JSON
    .then(d => document.getElementById('visitCount').innerText = d.visitCount) // 显示visitCount
    .catch(e => document.getElementById('visitCount').innerText = '加载失败'); // 错误处理

const urls = [
    "https://blog.liuer.xin#Vercel CDN",   
    "https://hexo.200038.xyz#Cloudflare CDN",
    "https://fastly.hexo.200038.xyz#Fastly CDN",
    "https://gcore.hexo.200038.xyz#Gcore CDN",
    "https://xn--xhq80hj5vkhb.zone.id#备用地址"
];

// 动态生成URL列表
const ul = document.getElementById("urls");
urls.forEach((url, index) => {
    const [testUrl, name] = url.split('#');
    const li = document.createElement("li");
    li.id = `result${index}`;
    li.innerHTML = `${name} <span id="latency${index}">测速中...</span>`;
    ul.appendChild(li);
});

const timeout = 3000;

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

async function runTests() {
    const results = await Promise.all(urls.map(testLatency));

    results.forEach((result, index) => {
        const li = document.getElementById(`result${index}`);
        const latencySpan = document.getElementById(`latency${index}`);
        if (typeof result.latency === 'number') {
            latencySpan.textContent = `${result.latency}ms`;
            latencySpan.style.color = getLatencyColor(result.latency);
        } else {
            latencySpan.textContent = result.latency;
            latencySpan.style.color = 'rgb(230, 22, 16)';
        }
    });

    const validResults = results.filter(result => typeof result.latency === 'number');
    if (validResults.length > 0) {
        const fastest = validResults.reduce((prev, current) => (prev.latency < current.latency ? prev : current), validResults[0]);

        results.forEach((result, index) => {
            if (result.url === fastest.url) {
                const li = document.getElementById(`result${index}`);
                li.innerHTML += ' ✅';
            }
        });

        // Remove hash part of the URL and redirect to the fastest URL
        const fastestUrl = fastest.url.split('#')[0];
        window.location.href = fastestUrl;
    }
}

// Adjust the latency color based on speed
function getLatencyColor(latency) {
    if (latency < 100) return 'rgb(36, 170, 29)'; // fast
    if (latency < 300) return 'rgb(142, 161, 40)'; // medium
    if (latency < 500) return 'rgb(246, 152, 51)'; // slow
    return 'rgb(236, 70, 28)'; // error
}

window.onload = runTests;
