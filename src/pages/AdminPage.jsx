import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const PROFILE_OPTIONS = ['twinslanza', 'fabio', 'anna'];

const BASE_SCHEMA = {
  contact: {
    email: '',
    location: '',
    phone: '',
    website: '',
  },
  contactImg: '',
  experience: [],
  galery: [],
  img: '',
  img_alt: '',
  logo: '',
  logo_alt: '',
  name: '',
  personalInfo: '',
  projects: {},
  skils: [],
  title: '',
};

const asString = (value) => (typeof value === 'string' ? value : '');

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  return [];
};

const normalizeSkills = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const img = asString(item.img).trim();
      const name = asString(item.name).trim();
      if (!img && !name) return null;
      return { img, name };
    })
    .filter(Boolean);
};

const normalizeWebsite = (website) => {
  const clean = asString(website).trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
};

const normalizePayload = (rawPayload) => {
  const payload = rawPayload && typeof rawPayload === 'object' ? rawPayload : {};
  const fallbackGalery = payload.gallery;

  return {
    ...BASE_SCHEMA,
    contact: {
      email: asString(payload?.contact?.email).trim(),
      location: asString(payload?.contact?.location).trim(),
      phone: asString(payload?.contact?.phone).trim(),
      website: normalizeWebsite(payload?.contact?.website),
    },
    contactImg: asString(payload.contactImg).trim(),
    experience: normalizeStringArray(payload.experience),
    galery: normalizeStringArray(payload.galery ?? fallbackGalery),
    img: asString(payload.img).trim(),
    img_alt: asString(payload.img_alt).trim(),
    logo: asString(payload.logo).trim(),
    logo_alt: asString(payload.logo_alt).trim(),
    name: asString(payload.name).trim(),
    personalInfo: asString(payload.personalInfo).trim(),
    projects: payload.projects && typeof payload.projects === 'object' ? payload.projects : {},
    skils: normalizeSkills(payload.skils),
    title: asString(payload.title).trim(),
  };
};

const parsePath = (path) =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);

const setByPath = (target, path, value) => {
  const keys = parsePath(path);
  if (keys.length === 0) return;

  let cursor = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const shouldBeArray = /^\d+$/.test(nextKey);

    if (cursor[key] === undefined || cursor[key] === null) {
      cursor[key] = shouldBeArray ? [] : {};
    }

    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
};

const payloadToFormData = (payload) => {
  const normalized = normalizePayload(payload);
  return {
    name: normalized.name,
    title: normalized.title,
    personalInfo: normalized.personalInfo,
    contactEmail: normalized.contact.email,
    contactPhone: normalized.contact.phone,
    contactLocation: normalized.contact.location,
    contactWebsite: normalized.contact.website,
    contactImg: normalized.contactImg,
    img: normalized.img,
    imgAlt: normalized.img_alt,
    logo: normalized.logo,
    logoAlt: normalized.logo_alt,
    galeryText: normalized.galery.join('\n'),
    experienceText: normalized.experience.join('\n'),
    skillsText: normalized.skils.map((item) => `${item.name} | ${item.img}`).join('\n'),
  };
};

const formDataToPayload = (formData, currentPayload) => {
  const normalizedCurrent = normalizePayload(currentPayload);
  const toList = (text) =>
    asString(text)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const parsedSkills = asString(formData.skillsText)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...imgParts] = line.split('|');
      const name = asString(namePart).trim();
      const img = asString(imgParts.join('|')).trim();
      return { name, img };
    })
    .filter((item) => item.name || item.img);

  return {
    ...normalizedCurrent,
    name: asString(formData.name).trim(),
    title: asString(formData.title).trim(),
    personalInfo: asString(formData.personalInfo).trim(),
    contact: {
      email: asString(formData.contactEmail).trim(),
      phone: asString(formData.contactPhone).trim(),
      location: asString(formData.contactLocation).trim(),
      website: normalizeWebsite(formData.contactWebsite),
    },
    contactImg: asString(formData.contactImg).trim(),
    img: asString(formData.img).trim(),
    img_alt: asString(formData.imgAlt).trim(),
    logo: asString(formData.logo).trim(),
    logo_alt: asString(formData.logoAlt).trim(),
    galery: toList(formData.galeryText),
    experience: toList(formData.experienceText),
    skils: parsedSkills,
  };
};

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [selectedProfile, setSelectedProfile] = useState('twinslanza');
  const [jsonData, setJsonData] = useState('{}');
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [cloudName, setCloudName] = useState(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '');
  const [uploadPreset, setUploadPreset] = useState(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadTarget, setUploadTarget] = useState('galery');
  const [customPath, setCustomPath] = useState('');
  const [skillUploadName, setSkillUploadName] = useState('Nuevo skill');
  const [autoSaveUpload, setAutoSaveUpload] = useState(true);
  const [formData, setFormData] = useState(payloadToFormData(BASE_SCHEMA));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile(selectedProfile);
    }
  }, [user, selectedProfile]);

  const loadProfile = async (profileName) => {
    setProfileLoading(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const docRef = doc(db, 'twinslanza', profileName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const normalized = normalizePayload(docSnap.data());
        setJsonData(JSON.stringify(normalized, null, 2));
        setFormData(payloadToFormData(normalized));
        setStatusMessage(`Documento "${profileName}" cargado correctamente.`);
      } else {
        const normalized = normalizePayload(BASE_SCHEMA);
        setJsonData(JSON.stringify(normalized, null, 2));
        setFormData(payloadToFormData(normalized));
        setStatusMessage(`No existe documento "${profileName}". Puedes crearlo guardando este JSON.`);
      }
    } catch (error) {
      setErrorMessage(`Error cargando datos: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setLoginError('Credenciales inválidas o usuario sin permisos.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const parsed = JSON.parse(jsonData);
      const normalized = normalizePayload(parsed);
      const docRef = doc(db, 'twinslanza', selectedProfile);
      await setDoc(docRef, normalized, { merge: false });
      setJsonData(JSON.stringify(normalized, null, 2));
      setFormData(payloadToFormData(normalized));
      setStatusMessage(`Documento "${selectedProfile}" guardado correctamente.`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setErrorMessage('JSON inválido. Revisa comas, comillas y llaves antes de guardar.');
      } else {
        setErrorMessage(`Error guardando datos: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoadBaseSchema = () => {
    const baseForProfile = {
      ...BASE_SCHEMA,
      name: selectedProfile === 'fabio' ? 'Fabio Lanza Kaufman' : selectedProfile === 'anna' ? 'Annarella Lanza Kaufman' : 'Twins Lanza Kaufman',
    };
    const normalized = normalizePayload(baseForProfile);
    setJsonData(JSON.stringify(normalized, null, 2));
    setFormData(payloadToFormData(normalized));
    setStatusMessage('Esquema base cargado. Completa textos, links y guarda.');
    setErrorMessage('');
  };

  const handleFormFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSyncFormFromJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const normalized = normalizePayload(parsed);
      setFormData(payloadToFormData(normalized));
      setStatusMessage('Formulario actualizado desde JSON.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('JSON inválido. Corrige el JSON antes de cargar en formulario.');
    }
  };

  const handleApplyFormToJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const payload = formDataToPayload(formData, parsed);
      setJsonData(JSON.stringify(payload, null, 2));
      setStatusMessage('Cambios del formulario aplicados al JSON. Guarda para persistir.');
      setErrorMessage('');
    } catch (error) {
      const payload = formDataToPayload(formData, BASE_SCHEMA);
      setJsonData(JSON.stringify(payload, null, 2));
      setStatusMessage('JSON regenerado desde formulario. Guarda para persistir.');
      setErrorMessage('');
    }
  };

  const handleCloudinaryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedUrl('');
    setStatusMessage('');
    setErrorMessage('');

    if (!cloudName || !uploadPreset) {
      setErrorMessage('Configura Cloudinary Cloud Name y Upload Preset antes de subir archivos.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result?.secure_url) {
        throw new Error(result?.error?.message || 'No se pudo subir el archivo a Cloudinary.');
      }

      const secureUrl = result.secure_url;
      setUploadedUrl(secureUrl);

      await handleInsertUrlInTarget(secureUrl, autoSaveUpload);
    } catch (error) {
      setErrorMessage(`Error en Cloudinary: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleInsertUrlInTarget = async (urlToInsert, persistInFirebase) => {
    if (!urlToInsert) {
      setErrorMessage('Primero sube un archivo a Cloudinary para obtener la URL.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonData);
      const targetPath = uploadTarget === 'custom' ? customPath.trim() : uploadTarget;

      if (!targetPath) {
        setErrorMessage('Debes indicar un campo destino para insertar la URL.');
        return;
      }

      if (targetPath === 'galery' || targetPath === 'experience') {
        const source = parsed[targetPath];
        parsed[targetPath] = Array.isArray(source) ? [...source, urlToInsert] : [urlToInsert];
      } else if (targetPath === 'skils') {
        const source = Array.isArray(parsed.skils) ? parsed.skils : [];
        parsed.skils = [...source, { img: urlToInsert, name: asString(skillUploadName).trim() || 'Nuevo skill' }];
      } else {
        setByPath(parsed, targetPath, urlToInsert);
      }

      const normalized = normalizePayload(parsed);
      setJsonData(JSON.stringify(normalized, null, 2));
      setFormData(payloadToFormData(normalized));

      if (persistInFirebase) {
        const docRef = doc(db, 'twinslanza', selectedProfile);
        await setDoc(docRef, normalized, { merge: false });
        setStatusMessage(`Archivo subido a Cloudinary, URL guardada en "${targetPath}" y persistida en Firebase.`);
      } else {
        setStatusMessage(`URL insertada en "${targetPath}". Guarda para persistir en Firebase.`);
      }

      setErrorMessage('');
    } catch (error) {
      setErrorMessage('El JSON actual es inválido. Corrígelo antes de insertar la URL.');
    }
  };

  const handleInsertUploadedUrl = async () => {
    await handleInsertUrlInTarget(uploadedUrl, false);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Validando sesión...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Inicia sesión para gestionar Fabio, Anna y Twinslanza.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 md:py-10 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Panel Administrador</CardTitle>
            <CardDescription>Gestiona contenido de twinslanza, fabio y anna.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="w-full md:w-64 space-y-2">
                <Label htmlFor="profile-select">Perfil</Label>
                <select
                  id="profile-select"
                  value={selectedProfile}
                  onChange={(event) => setSelectedProfile(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PROFILE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={() => loadProfile(selectedProfile)} disabled={profileLoading} variant="outline">
                {profileLoading ? 'Cargando...' : 'Recargar'}
              </Button>
              <Button onClick={handleLoadBaseSchema} variant="outline">Esquema base</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button onClick={handleLogout} variant="secondary">Cerrar sesión</Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="json-editor">JSON del perfil</Label>
              <textarea
                id="json-editor"
                value={jsonData}
                onChange={(event) => setJsonData(event.target.value)}
                className="min-h-[420px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                spellCheck={false}
              />
            </div>

            {statusMessage && <p className="text-sm text-emerald-700">{statusMessage}</p>}
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulario Rápido</CardTitle>
            <CardDescription>Edita campos principales sin tocar JSON manualmente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <Button variant="outline" onClick={handleSyncFormFromJson}>Cargar formulario desde JSON</Button>
              <Button variant="outline" onClick={handleApplyFormToJson}>Aplicar formulario al JSON</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">name</Label>
                <Input id="form-name" value={formData.name} onChange={(event) => handleFormFieldChange('name', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-title">title</Label>
                <Input id="form-title" value={formData.title} onChange={(event) => handleFormFieldChange('title', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-email">contact.email</Label>
                <Input id="form-email" value={formData.contactEmail} onChange={(event) => handleFormFieldChange('contactEmail', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-phone">contact.phone</Label>
                <Input id="form-phone" value={formData.contactPhone} onChange={(event) => handleFormFieldChange('contactPhone', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-location">contact.location</Label>
                <Input id="form-location" value={formData.contactLocation} onChange={(event) => handleFormFieldChange('contactLocation', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-website">contact.website</Label>
                <Input id="form-website" value={formData.contactWebsite} onChange={(event) => handleFormFieldChange('contactWebsite', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-contactImg">contactImg</Label>
                <Input id="form-contactImg" value={formData.contactImg} onChange={(event) => handleFormFieldChange('contactImg', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-img">img</Label>
                <Input id="form-img" value={formData.img} onChange={(event) => handleFormFieldChange('img', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-logo">logo</Label>
                <Input id="form-logo" value={formData.logo} onChange={(event) => handleFormFieldChange('logo', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-img-alt">img_alt</Label>
                <Input id="form-img-alt" value={formData.imgAlt} onChange={(event) => handleFormFieldChange('imgAlt', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-logo-alt">logo_alt</Label>
                <Input id="form-logo-alt" value={formData.logoAlt} onChange={(event) => handleFormFieldChange('logoAlt', event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-personal">personalInfo</Label>
              <textarea
                id="form-personal"
                value={formData.personalInfo}
                onChange={(event) => handleFormFieldChange('personalInfo', event.target.value)}
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="form-galery">galery (1 URL por línea)</Label>
                <textarea
                  id="form-galery"
                  value={formData.galeryText}
                  onChange={(event) => handleFormFieldChange('galeryText', event.target.value)}
                  className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="form-experience">experience (1 URL por línea)</Label>
                <textarea
                  id="form-experience"
                  value={formData.experienceText}
                  onChange={(event) => handleFormFieldChange('experienceText', event.target.value)}
                  className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="form-skills">skils (formato: nombre | url)</Label>
                <textarea
                  id="form-skills"
                  value={formData.skillsText}
                  onChange={(event) => handleFormFieldChange('skillsText', event.target.value)}
                  className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  spellCheck={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloudinary Upload</CardTitle>
            <CardDescription>Sube imágenes/videos a Cloudinary y guarda la URL en el campo elegido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="upload-target">Destino de la URL</Label>
                <select
                  id="upload-target"
                  value={uploadTarget}
                  onChange={(event) => setUploadTarget(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="galery">galery (agregar al array)</option>
                  <option value="experience">experience (agregar al array)</option>
                  <option value="contactImg">contactImg</option>
                  <option value="img">img</option>
                  <option value="logo">logo</option>
                  <option value="skils">skils (agregar item)</option>
                  <option value="custom">Ruta personalizada</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-path">Ruta personalizada</Label>
                <Input
                  id="custom-path"
                  value={customPath}
                  onChange={(event) => setCustomPath(event.target.value)}
                  placeholder="Ej: contact.website o skils[0].img"
                  disabled={uploadTarget !== 'custom'}
                />
              </div>
            </div>

            {uploadTarget === 'skils' && (
              <div className="space-y-2">
                <Label htmlFor="skill-upload-name">Nombre del skill</Label>
                <Input
                  id="skill-upload-name"
                  value={skillUploadName}
                  onChange={(event) => setSkillUploadName(event.target.value)}
                  placeholder="Ej: Actuación"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={autoSaveUpload}
                onChange={(event) => setAutoSaveUpload(event.target.checked)}
              />
              Guardar automáticamente en Firebase después de subir
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cloud-name">Cloud Name</Label>
                <Input
                  id="cloud-name"
                  value={cloudName}
                  onChange={(event) => setCloudName(event.target.value)}
                  placeholder="tu-cloud-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-preset">Upload Preset (unsigned)</Label>
                <Input
                  id="upload-preset"
                  value={uploadPreset}
                  onChange={(event) => setUploadPreset(event.target.value)}
                  placeholder="tu-upload-preset"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-upload">Archivo</Label>
              <Input
                id="asset-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleCloudinaryUpload}
                disabled={uploading}
              />
            </div>

            {uploading && <p className="text-sm text-muted-foreground">Subiendo archivo...</p>}

            {uploadedUrl && (
              <div className="space-y-3">
                <Label htmlFor="uploaded-url">URL subida</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input id="uploaded-url" value={uploadedUrl} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(uploadedUrl)}
                  >
                    Copiar
                  </Button>
                </div>

                <Button onClick={handleInsertUploadedUrl} variant="outline">
                  Insertar URL en JSON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;