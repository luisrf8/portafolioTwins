import crypto from 'crypto';

const asString = (value) => (typeof value === 'string' ? value : '');

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método no permitido' });
    return;
  }

  const cloudName = asString(process.env.CLOUDINARY_CLOUD_NAME).trim();
  const apiKey = asString(process.env.CLOUDINARY_API_KEY).trim();
  const apiSecret = asString(process.env.CLOUDINARY_API_SECRET).trim();

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ message: 'Faltan credenciales Cloudinary en el servidor.' });
    return;
  }

  const { url } = req.body || {};
  const parsed = extractFromCloudinaryUrl(url);

  if (!parsed) {
    res.status(400).json({ message: 'URL de Cloudinary inválida para eliminación.' });
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `public_id=${parsed.publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

  try {
    const formData = new URLSearchParams();
    formData.set('public_id', parsed.publicId);
    formData.set('timestamp', String(timestamp));
    formData.set('api_key', apiKey);
    formData.set('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${parsed.resourceType}/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        message: result?.error?.message || 'Cloudinary no pudo eliminar el asset.',
      });
      return;
    }

    res.status(200).json({
      message: 'Asset eliminado en Cloudinary.',
      result: result?.result || 'unknown',
      publicId: parsed.publicId,
      resourceType: parsed.resourceType,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando asset en Cloudinary.', error: error?.message || String(error) });
  }
}
