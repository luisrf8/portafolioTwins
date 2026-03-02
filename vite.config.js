import path from 'node:path';
import crypto from 'node:crypto';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;

const configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;

const configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;

const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/\.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;

const addTransformIndexHtml = {
	name: 'add-transform-index-html',
	transformIndexHtml(html) {
		return {
			html,
			tags: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsRuntimeErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsViteErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: {type: 'module'},
					children: configHorizonsConsoleErrroHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configWindowFetchMonkeyPatch,
					injectTo: 'head',
				},
			],
		};
	},
};

console.warn = () => {};

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
	if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
		return;
	}

	loggerError(msg, options);
}

const asString = (value) => (typeof value === 'string' ? value : '');

const readJsonBody = (req) => new Promise((resolve, reject) => {
	let data = '';
	req.on('data', (chunk) => {
		data += chunk;
	});
	req.on('end', () => {
		if (!data) {
			resolve({});
			return;
		}

		try {
			resolve(JSON.parse(data));
		} catch (error) {
			reject(error);
		}
	});
	req.on('error', reject);
});

const extractFromCloudinaryUrl = (assetUrl) => {
	const cleanUrl = asString(assetUrl)
		.trim()
		.replace(/^['"]+|['"]+$/g, '');
	if (!cleanUrl) return null;

	const resourceTypeMatch = cleanUrl.match(/\/((image|video))\/upload\//i);
	const resourceType = resourceTypeMatch?.[1]?.toLowerCase();
	if (!resourceType) return null;

	const afterUpload = cleanUrl.split('/upload/')[1];
	if (!afterUpload) return null;

	const noQuery = afterUpload.split('?')[0];
	const segments = noQuery.split('/').filter(Boolean);
	if (segments.length === 0) return null;

	const versionSegmentIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
	const publicIdSegments = versionSegmentIndex >= 0 ? segments.slice(versionSegmentIndex + 1) : segments;
	if (publicIdSegments.length === 0) return null;

	const lastIndex = publicIdSegments.length - 1;
	publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^/.?]+$/, '');
	const publicId = publicIdSegments.join('/');

	if (!publicId) return null;

	return { resourceType, publicId };
};

const localCloudinaryDeleteApi = {
	name: 'local-cloudinary-delete-api',
	configureServer(server) {
		server.middlewares.use('/api/cloudinary-delete', async (req, res) => {
			res.setHeader('Content-Type', 'application/json');

			if (req.method !== 'POST') {
				res.statusCode = 405;
				res.end(JSON.stringify({ message: 'Método no permitido' }));
				return;
			}

			const cloudName = asString(process.env.CLOUDINARY_CLOUD_NAME).trim();
			const apiKey = asString(process.env.CLOUDINARY_API_KEY).trim();
			const apiSecret = asString(process.env.CLOUDINARY_API_SECRET).trim();

			if (!cloudName || !apiKey || !apiSecret) {
				res.statusCode = 500;
				res.end(JSON.stringify({ message: 'Faltan credenciales CLOUDINARY_* para borrar en Cloudinary.' }));
				return;
			}

			let body;
			try {
				body = await readJsonBody(req);
			} catch {
				res.statusCode = 400;
				res.end(JSON.stringify({ message: 'Body JSON inválido.' }));
				return;
			}

			const parsed = extractFromCloudinaryUrl(body?.url);
			if (!parsed) {
				res.statusCode = 400;
				res.end(JSON.stringify({ message: 'URL de Cloudinary inválida para eliminación.' }));
				return;
			}

			const timestamp = Math.floor(Date.now() / 1000);
			const signaturePayload = `public_id=${parsed.publicId}&timestamp=${timestamp}${apiSecret}`;
			const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

			const formData = new URLSearchParams();
			formData.set('public_id', parsed.publicId);
			formData.set('timestamp', String(timestamp));
			formData.set('api_key', apiKey);
			formData.set('signature', signature);

			try {
				const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${parsed.resourceType}/destroy`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: formData.toString(),
				});

				const result = await response.json();

				if (!response.ok) {
					res.statusCode = response.status;
					res.end(JSON.stringify({ message: result?.error?.message || 'Cloudinary no pudo eliminar el asset.' }));
					return;
				}

				res.statusCode = 200;
				res.end(JSON.stringify({
					message: 'Asset eliminado en Cloudinary.',
					result: result?.result || 'unknown',
					publicId: parsed.publicId,
					resourceType: parsed.resourceType,
				}));
			} catch (error) {
				res.statusCode = 500;
				res.end(JSON.stringify({ message: `Error eliminando asset en Cloudinary: ${error.message}` }));
			}
		});
	},
};

export default defineConfig({
	customLogger: logger,
	plugins: [react(), localCloudinaryDeleteApi, addTransformIndexHtml],
	server: {
		cors: true,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', ],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
