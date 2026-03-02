import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
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

const isVideoUrl = (url) => {
  const clean = asString(url).toLowerCase();
  return clean.includes('/video/upload/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(clean);
};

const MediaPreview = ({ url, label }) => {
  if (!url) {
    return <p className="text-sm text-muted-foreground">Sin archivo</p>;
  }

  if (isVideoUrl(url)) {
    return (
      <video className="h-32 w-full rounded-md border border-input object-cover" controls src={url}>
        Tu navegador no soporta reproducción de video.
      </video>
    );
  }

  return <img src={url} alt={label} className="h-32 w-full rounded-md border border-input object-cover" />;
};

const createPendingUpload = (file) => {
  if (!file) return null;
  return {
    file,
    fileName: file.name,
    previewUrl: URL.createObjectURL(file),
  };
};

const collectUrlsFromPayload = (payload) => {
  const normalized = normalizePayload(payload);

  const fromSkills = normalized.skils.map((skill) => asString(skill.img).trim()).filter(Boolean);

  return [
    asString(normalized.contactImg).trim(),
    asString(normalized.img).trim(),
    asString(normalized.logo).trim(),
    ...normalized.galery,
    ...normalized.experience,
    ...fromSkills,
  ].filter(Boolean);
};

const REUSE_MULTI_SECTIONS = new Set(['galery', 'experience', 'skils']);

const REUSE_SECTION_LABELS = {
  contactImg: 'contactImg',
  img: 'img',
  logo: 'logo',
  galery: 'galery',
  experience: 'experience',
  skils: 'skils',
};

const AdminPage = () => {
  const CLOUDINARY_CLOUD_NAME = asString(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME).trim();
  const CLOUDINARY_UPLOAD_PRESET = asString(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET).trim();
  const cloudinaryReady = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [selectedProfile, setSelectedProfile] = useState('twinslanza');
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(normalizePayload(BASE_SCHEMA));
  const [profilesCache, setProfilesCache] = useState({});

  const [uploadingLabel, setUploadingLabel] = useState('');
  const [newSkillName, setNewSkillName] = useState('Nuevo skill');
  const [cloudDeleteApiStatus, setCloudDeleteApiStatus] = useState('checking');
  const [reuseModal, setReuseModal] = useState({
    open: false,
    sectionKey: '',
    selectedUrls: [],
  });
  const [formData, setFormData] = useState(payloadToFormData(BASE_SCHEMA));
  const [pendingSingleUploads, setPendingSingleUploads] = useState({
    contactImg: null,
    img: null,
    logo: null,
  });
  const [pendingGaleryUpload, setPendingGaleryUpload] = useState(null);
  const [pendingExperienceUpload, setPendingExperienceUpload] = useState(null);
  const [pendingSkillUpload, setPendingSkillUpload] = useState(null);

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
      loadProfilesCache();
      checkCloudDeleteApiAvailability();
    }
  }, [user, selectedProfile]);

  useEffect(() => {
    return () => {
      Object.values(pendingSingleUploads).forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      if (pendingGaleryUpload?.previewUrl) {
        URL.revokeObjectURL(pendingGaleryUpload.previewUrl);
      }

      if (pendingExperienceUpload?.previewUrl) {
        URL.revokeObjectURL(pendingExperienceUpload.previewUrl);
      }

      if (pendingSkillUpload?.previewUrl) {
        URL.revokeObjectURL(pendingSkillUpload.previewUrl);
      }
    };
  }, [pendingSingleUploads, pendingGaleryUpload, pendingExperienceUpload, pendingSkillUpload]);

  const clearPendingSingleUpload = (fieldKey) => {
    setPendingSingleUploads((prev) => {
      const current = prev[fieldKey];
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        ...prev,
        [fieldKey]: null,
      };
    });
  };

  const setPendingSingleUpload = (fieldKey, file) => {
    setPendingSingleUploads((prev) => {
      const current = prev[fieldKey];
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        ...prev,
        [fieldKey]: createPendingUpload(file),
      };
    });
  };

  const clearPendingUpload = (pendingUpload, setPending) => {
    if (pendingUpload?.previewUrl) {
      URL.revokeObjectURL(pendingUpload.previewUrl);
    }
    setPending(null);
  };

  const setPendingUpload = (file, currentPending, setPending) => {
    if (currentPending?.previewUrl) {
      URL.revokeObjectURL(currentPending.previewUrl);
    }
    setPending(createPendingUpload(file));
  };

  const loadProfilesCache = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'twinslanza'));
      const nextCache = {};

      snapshot.forEach((documentSnapshot) => {
        nextCache[documentSnapshot.id] = normalizePayload(documentSnapshot.data());
      });

      setProfilesCache(nextCache);
    } catch (error) {
      setErrorMessage(`No se pudo cargar biblioteca de perfiles: ${error.message}`);
    }
  };

  const checkCloudDeleteApiAvailability = async () => {
    try {
      const response = await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: '' }),
      });

      if (response.status === 400 || response.status === 405 || response.status === 200) {
        setCloudDeleteApiStatus('ready');
        return;
      }

      setCloudDeleteApiStatus('not-ready');
    } catch {
      setCloudDeleteApiStatus('not-ready');
    }
  };

  const getUrlUsageCount = (urlToCheck, nextCurrentProfilePayload) => {
    if (!urlToCheck) return 0;

    const mergedCache = {
      ...profilesCache,
      [selectedProfile]: normalizePayload(nextCurrentProfilePayload),
    };

    return Object.values(mergedCache).reduce((accumulator, profilePayload) => {
      const occurrences = collectUrlsFromPayload(profilePayload).filter((url) => url === urlToCheck).length;
      return accumulator + occurrences;
    }, 0);
  };

  const deleteInCloudinaryIfUnused = async (removedUrl, nextCurrentProfilePayload) => {
    const url = asString(removedUrl).trim();
    if (!url) return;

    const usageCount = getUrlUsageCount(url, nextCurrentProfilePayload);
    if (usageCount > 0) {
      return;
    }

    try {
      const response = await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const rawText = await response.text();
      let result = {};
      if (rawText) {
        try {
          result = JSON.parse(rawText);
        } catch {
          result = { message: rawText };
        }
      }

      if (!response.ok) {
        const endpointHint = response.status === 404
          ? 'Endpoint /api/cloudinary-delete no disponible en este entorno. Si usas Vite local, necesitas backend/serverless activo.'
          : '';
        throw new Error(result?.message || endpointHint || 'No se pudo eliminar el asset en Cloudinary.');
      }

      setStatusMessage((previous) => `${previous} Asset eliminado también en Cloudinary.`.trim());
    } catch (error) {
      setErrorMessage(`El archivo se eliminó del perfil pero no de Cloudinary: ${error.message}`);
    }
  };

  const getReuseOptions = (sectionKey) => {
    const optionsMap = new Map();

    Object.entries(profilesCache).forEach(([profileName, profilePayload]) => {
      if (profileName === selectedProfile) return;

      const normalized = normalizePayload(profilePayload);
      let options = [];

      if (sectionKey === 'contactImg' || sectionKey === 'img' || sectionKey === 'logo') {
        const url = asString(normalized[sectionKey]).trim();
        if (url) {
          options = [{ url, sourceName: REUSE_SECTION_LABELS[sectionKey] }];
        }
      } else if (sectionKey === 'galery' || sectionKey === 'experience') {
        options = normalized[sectionKey].map((url, index) => ({
          url,
          sourceName: `${REUSE_SECTION_LABELS[sectionKey]} #${index + 1}`,
        }));
      } else if (sectionKey === 'skils') {
        options = normalized.skils
          .map((skill) => ({
            url: asString(skill.img).trim(),
            sourceName: asString(skill.name).trim() || 'Skill',
          }))
          .filter((option) => option.url);
      }

      options.forEach((option) => {
        const url = option.url;
        if (!optionsMap.has(url)) {
          optionsMap.set(url, {
            url,
            profileName,
            sourceName: option.sourceName,
            label: `${profileName} · ${option.sourceName}`,
          });
        }
      });
    });

    return Array.from(optionsMap.values());
  };

  const loadProfile = async (profileName) => {
    setProfileLoading(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const docRef = doc(db, 'twinslanza', profileName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const normalized = normalizePayload(docSnap.data());
        setProfileData(normalized);
        setFormData(payloadToFormData(normalized));
        setProfilesCache((prev) => ({ ...prev, [profileName]: normalized }));
        setStatusMessage(`Documento "${profileName}" cargado correctamente.`);
      } else {
        const normalized = normalizePayload({
          ...BASE_SCHEMA,
          name: profileName === 'fabio' ? 'Fabio Lanza Kaufman' : profileName === 'anna' ? 'Annarella Lanza Kaufman' : 'Twins Lanza Kaufman',
        });
        setProfileData(normalized);
        setFormData(payloadToFormData(normalized));
        setProfilesCache((prev) => ({ ...prev, [profileName]: normalized }));
        setStatusMessage(`No existe documento "${profileName}". Puedes crearlo guardando los cambios.`);
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
      const normalized = formDataToPayload(formData, profileData);
      const docRef = doc(db, 'twinslanza', selectedProfile);
      await setDoc(docRef, normalized, { merge: false });
      setProfileData(normalized);
      setProfilesCache((prev) => ({ ...prev, [selectedProfile]: normalized }));
      setFormData(payloadToFormData(normalized));
      setStatusMessage(`Documento "${selectedProfile}" guardado correctamente.`);
    } catch (error) {
      setErrorMessage(`Error guardando datos: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };


  const handleFormFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const syncMediaFieldsInForm = (normalized) => {
    setFormData((prev) => ({
      ...prev,
      contactImg: normalized.contactImg,
      img: normalized.img,
      logo: normalized.logo,
      galeryText: normalized.galery.join('\n'),
      experienceText: normalized.experience.join('\n'),
      skillsText: normalized.skils.map((item) => `${item.name} | ${item.img}`).join('\n'),
    }));
  };

  const persistProfileData = async (nextPayload, successText) => {
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const normalized = normalizePayload(nextPayload);
      const docRef = doc(db, 'twinslanza', selectedProfile);
      await setDoc(docRef, normalized, { merge: false });
      setProfileData(normalized);
      setProfilesCache((prev) => ({ ...prev, [selectedProfile]: normalized }));
      syncMediaFieldsInForm(normalized);
      setStatusMessage(successText);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Error guardando datos: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const uploadToCloudinary = async (file, sectionLabel) => {
    if (!file) return '';
    setStatusMessage('');
    setErrorMessage('');

    if (!cloudinaryReady) {
      setErrorMessage('Cloudinary no está configurado en variables de entorno. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.');
      return '';
    }

    setUploadingLabel(`Subiendo archivo para ${sectionLabel}...`);

    try {
      const resourceType = file?.type?.startsWith('video/') ? 'video' : 'image';

      const bodyData = new FormData();
      bodyData.append('file', file);
      bodyData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: bodyData,
      });

      const result = await response.json();

      if (!response.ok || !result?.secure_url) {
        const cloudinaryMessage = asString(result?.error?.message).trim();
        if (/upload preset not found/i.test(cloudinaryMessage)) {
          throw new Error('Upload preset no existe en Cloudinary. Crea un preset unsigned con ese nombre o corrige VITE_CLOUDINARY_UPLOAD_PRESET.');
        }
        throw new Error(result?.error?.message || 'No se pudo subir el archivo a Cloudinary.');
      }

      return result.secure_url;
    } catch (error) {
      setErrorMessage(`Error en Cloudinary: ${error.message}`);
      return '';
    } finally {
      setUploadingLabel('');
    }
  };

  const handleUploadSingleField = async (fieldKey) => {
    const pendingUpload = pendingSingleUploads[fieldKey];
    if (!pendingUpload?.file) {
      setErrorMessage(`Selecciona un archivo para ${fieldKey} antes de subir.`);
      return;
    }

    const secureUrl = await uploadToCloudinary(pendingUpload.file, fieldKey);
    if (!secureUrl) return;

    const updated = normalizePayload({
      ...profileData,
      [fieldKey]: secureUrl,
    });

    await persistProfileData(updated, `Archivo guardado en ${fieldKey}.`);
    clearPendingSingleUpload(fieldKey);
  };

  const handleDeleteSingleField = async (fieldKey) => {
    const removedUrl = asString(profileData[fieldKey]).trim();
    const updated = normalizePayload({
      ...profileData,
      [fieldKey]: '',
    });

    await persistProfileData(updated, `Archivo eliminado de ${fieldKey}.`);
    await deleteInCloudinaryIfUnused(removedUrl, updated);
  };

  const handleUploadToArray = async (fieldKey) => {
    let activePendingUpload = null;

    if (fieldKey === 'galery') {
      activePendingUpload = pendingGaleryUpload;
    } else if (fieldKey === 'experience') {
      activePendingUpload = pendingExperienceUpload;
    }

    if (!activePendingUpload?.file) {
      setErrorMessage(`Selecciona un archivo para ${fieldKey} antes de subir.`);
      return;
    }

    const secureUrl = await uploadToCloudinary(activePendingUpload.file, fieldKey);
    if (!secureUrl) return;

    const sourceArray = Array.isArray(profileData[fieldKey]) ? profileData[fieldKey] : [];
    const updated = normalizePayload({
      ...profileData,
      [fieldKey]: [...sourceArray, secureUrl],
    });

    await persistProfileData(updated, `Archivo agregado a ${fieldKey}.`);

    if (fieldKey === 'galery') {
      clearPendingUpload(pendingGaleryUpload, setPendingGaleryUpload);
    }

    if (fieldKey === 'experience') {
      clearPendingUpload(pendingExperienceUpload, setPendingExperienceUpload);
    }
  };

  const handleDeleteFromArray = async (fieldKey, indexToRemove) => {
    const sourceArray = Array.isArray(profileData[fieldKey]) ? profileData[fieldKey] : [];
    const removedUrl = asString(sourceArray[indexToRemove]).trim();
    const nextArray = sourceArray.filter((_, index) => index !== indexToRemove);

    const updated = normalizePayload({
      ...profileData,
      [fieldKey]: nextArray,
    });

    await persistProfileData(updated, `Archivo eliminado de ${fieldKey}.`);
    await deleteInCloudinaryIfUnused(removedUrl, updated);
  };

  const handleAddSkill = async () => {
    if (!pendingSkillUpload?.file) {
      setErrorMessage('Selecciona un archivo para el skill antes de subir.');
      return;
    }

    const secureUrl = await uploadToCloudinary(pendingSkillUpload.file, 'skils');
    if (!secureUrl) return;

    const sourceArray = Array.isArray(profileData.skils) ? profileData.skils : [];
    const skillName = asString(newSkillName).trim() || 'Nuevo skill';
    const updated = normalizePayload({
      ...profileData,
      skils: [...sourceArray, { name: skillName, img: secureUrl }],
    });

    await persistProfileData(updated, 'Skill agregado correctamente.');
    clearPendingUpload(pendingSkillUpload, setPendingSkillUpload);
  };

  const handleDeleteSkill = async (indexToRemove) => {
    const sourceArray = Array.isArray(profileData.skils) ? profileData.skils : [];
    const removedUrl = asString(sourceArray[indexToRemove]?.img).trim();
    const nextArray = sourceArray.filter((_, index) => index !== indexToRemove);
    const updated = normalizePayload({
      ...profileData,
      skils: nextArray,
    });

    await persistProfileData(updated, 'Skill eliminado correctamente.');
    await deleteInCloudinaryIfUnused(removedUrl, updated);
  };

  const openReuseModal = (sectionKey) => {
    setReuseModal({
      open: true,
      sectionKey,
      selectedUrls: [],
    });
    setErrorMessage('');
  };

  const closeReuseModal = () => {
    setReuseModal({
      open: false,
      sectionKey: '',
      selectedUrls: [],
    });
  };

  const toggleReuseUrl = (url) => {
    if (!url) return;

    setReuseModal((prev) => {
      const isMulti = REUSE_MULTI_SECTIONS.has(prev.sectionKey);
      const exists = prev.selectedUrls.includes(url);

      if (!isMulti) {
        return {
          ...prev,
          selectedUrls: exists ? [] : [url],
        };
      }

      return {
        ...prev,
        selectedUrls: exists ? prev.selectedUrls.filter((item) => item !== url) : [...prev.selectedUrls, url],
      };
    });
  };

  const applyReuseForSingle = async (fieldKey, selectedUrls) => {
    const selectedUrl = asString(selectedUrls[0]).trim();
    if (!selectedUrl) {
      setErrorMessage(`Selecciona un archivo para reutilizar en ${fieldKey}.`);
      return false;
    }

    const updated = normalizePayload({
      ...profileData,
      [fieldKey]: selectedUrl,
    });

    await persistProfileData(updated, `URL reutilizada en ${fieldKey}.`);
    return true;
  };

  const applyReuseForArray = async (fieldKey, selectedUrls) => {
    const cleanUrls = selectedUrls.map((url) => asString(url).trim()).filter(Boolean);
    if (cleanUrls.length === 0) {
      setErrorMessage(`Selecciona al menos un archivo para ${fieldKey}.`);
      return false;
    }

    let workingPayload = normalizePayload(profileData);
    let applied = 0;

    for (const url of cleanUrls) {
      const currentArray = Array.isArray(workingPayload[fieldKey]) ? workingPayload[fieldKey] : [];
      if (currentArray.includes(url)) {
        continue;
      }

      workingPayload = normalizePayload({
        ...workingPayload,
        [fieldKey]: [...currentArray, url],
      });

      applied += 1;
      await persistProfileData(workingPayload, `Reutilizando en ${fieldKey} (${applied}/${cleanUrls.length})...`);
    }

    if (applied === 0) {
      setErrorMessage(`Las URLs seleccionadas ya existen en ${fieldKey}.`);
      return false;
    }

    setStatusMessage(`Se reutilizaron ${applied} archivo(s) en ${fieldKey}.`);
    return true;
  };

  const applyReuseForSkills = async (selectedUrls, optionsByUrl) => {
    const cleanUrls = selectedUrls.map((url) => asString(url).trim()).filter(Boolean);
    if (cleanUrls.length === 0) {
      setErrorMessage('Selecciona al menos un archivo para skils.');
      return false;
    }

    let workingPayload = normalizePayload(profileData);
    let applied = 0;

    for (const url of cleanUrls) {
      const currentSkills = Array.isArray(workingPayload.skils) ? workingPayload.skils : [];
      if (currentSkills.some((skill) => asString(skill.img).trim() === url)) {
        continue;
      }

      const option = optionsByUrl.get(url);
      const derivedName = asString(option?.sourceName).trim();
      const fallbackName = asString(newSkillName).trim() || 'Skill reutilizado';

      workingPayload = normalizePayload({
        ...workingPayload,
        skils: [...currentSkills, { name: derivedName || fallbackName, img: url }],
      });

      applied += 1;
      await persistProfileData(workingPayload, `Reutilizando en skils (${applied}/${cleanUrls.length})...`);
    }

    if (applied === 0) {
      setErrorMessage('Las URLs seleccionadas ya existen en skils.');
      return false;
    }

    setStatusMessage(`Se reutilizaron ${applied} archivo(s) en skils.`);
    return true;
  };

  const handleApplyReuseModal = async () => {
    const sectionKey = reuseModal.sectionKey;
    const selectedUrls = reuseModal.selectedUrls;
    const options = getReuseOptions(sectionKey);
    const optionsByUrl = new Map(options.map((option) => [option.url, option]));

    let success = false;

    if (sectionKey === 'contactImg' || sectionKey === 'img' || sectionKey === 'logo') {
      success = await applyReuseForSingle(sectionKey, selectedUrls);
    } else if (sectionKey === 'galery' || sectionKey === 'experience') {
      success = await applyReuseForArray(sectionKey, selectedUrls);
    } else if (sectionKey === 'skils') {
      success = await applyReuseForSkills(selectedUrls, optionsByUrl);
    }

    if (success) {
      closeReuseModal();
    }
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

  const actionDisabled = Boolean(uploadingLabel) || saving;
  const uploadDisabled = actionDisabled || !cloudinaryReady;

  const reuseOptionsBySection = {
    contactImg: getReuseOptions('contactImg'),
    img: getReuseOptions('img'),
    logo: getReuseOptions('logo'),
    galery: getReuseOptions('galery'),
    experience: getReuseOptions('experience'),
    skils: getReuseOptions('skils'),
  };
  const activeReuseOptions = reuseOptionsBySection[reuseModal.sectionKey] || [];
  const reuseIsMulti = REUSE_MULTI_SECTIONS.has(reuseModal.sectionKey);

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
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" onClick={handleLogout} variant="secondary">Cerrar sesión</Button>
            </div>

            {statusMessage && <p className="text-sm text-emerald-700">{statusMessage}</p>}
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulario Rápido</CardTitle>
            <CardDescription>Edita campos de texto principales y guarda cambios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">name</Label>
                <Input id="form-name" value={formData.name} onChange={(event) => handleFormFieldChange('name', event.target.value)} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media por Sección</CardTitle>
            <CardDescription>Ver, eliminar y subir imagen/video por cada campo permitido del esquema.</CardDescription>
            <p className={`text-xs ${cloudDeleteApiStatus === 'ready' ? 'text-emerald-700' : cloudDeleteApiStatus === 'not-ready' ? 'text-red-600' : 'text-muted-foreground'}`}>
              {cloudDeleteApiStatus === 'ready'
                ? 'Borrado Cloudinary activo en este entorno.'
                : cloudDeleteApiStatus === 'not-ready'
                ? 'Borrado Cloudinary no disponible en este entorno.'
                : 'Verificando estado de borrado Cloudinary...'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {['contactImg', 'img', 'logo'].map((fieldKey, index) => (
                <details key={fieldKey} className="rounded-lg border border-border p-3" open={index === 0}>
                  <summary className="cursor-pointer text-base font-medium capitalize">{fieldKey}</summary>
                  <div className="mt-3 space-y-2">
                    <MediaPreview url={profileData[fieldKey]} label={fieldKey} />
                    {pendingSingleUploads[fieldKey]?.previewUrl && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Nuevo archivo seleccionado</p>
                        <MediaPreview url={pendingSingleUploads[fieldKey].previewUrl} label={`${fieldKey}-pending`} />
                        <p className="text-xs text-muted-foreground">{pendingSingleUploads[fieldKey].fileName}</p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      disabled={uploadDisabled}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setPendingSingleUpload(fieldKey, file || null);
                        event.target.value = '';
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionDisabled || reuseOptionsBySection[fieldKey].length === 0}
                        onClick={() => openReuseModal(fieldKey)}
                      >
                        Reutilizar desde otro perfil
                      </Button>
                      <Button
                        type="button"
                        disabled={uploadDisabled || !pendingSingleUploads[fieldKey]?.file}
                        onClick={() => handleUploadSingleField(fieldKey)}
                      >
                        Subir a {fieldKey}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionDisabled || !pendingSingleUploads[fieldKey]}
                        onClick={() => clearPendingSingleUpload(fieldKey)}
                      >
                        Quitar selección
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionDisabled || !profileData[fieldKey]}
                        onClick={() => handleDeleteSingleField(fieldKey)}
                      >
                        Eliminar actual
                      </Button>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            <details className="rounded-lg border border-border p-4" open>
              <summary className="cursor-pointer text-base font-medium">galery</summary>
              <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {profileData.galery.map((item, index) => (
                  <div key={`${item}-${index}`} className="space-y-2 rounded-md border border-border p-2">
                    <MediaPreview url={item} label={`galery-${index + 1}`} />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => handleDeleteFromArray('galery', index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                type="file"
                accept="image/*,video/*"
                disabled={uploadDisabled}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setPendingUpload(file || null, pendingGaleryUpload, setPendingGaleryUpload);
                  event.target.value = '';
                }}
              />
              {pendingGaleryUpload?.previewUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nuevo archivo para galery: {pendingGaleryUpload.fileName}</p>
                  <MediaPreview url={pendingGaleryUpload.previewUrl} label="galery-pending" />
                  <div className="flex flex-col md:flex-row gap-2">
                    <Button
                      type="button"
                      disabled={uploadDisabled || !pendingGaleryUpload.file}
                      onClick={() => handleUploadToArray('galery')}
                    >
                      Subir a galery
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => clearPendingUpload(pendingGaleryUpload, setPendingGaleryUpload)}
                    >
                      Quitar selección
                    </Button>
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={actionDisabled || reuseOptionsBySection.galery.length === 0}
                onClick={() => openReuseModal('galery')}
              >
                Reutilizar desde otro perfil
              </Button>
              </div>
            </details>

            <details className="rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-base font-medium">experience</summary>
              <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {profileData.experience.map((item, index) => (
                  <div key={`${item}-${index}`} className="space-y-2 rounded-md border border-border p-2">
                    <MediaPreview url={item} label={`experience-${index + 1}`} />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => handleDeleteFromArray('experience', index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                type="file"
                accept="image/*,video/*"
                disabled={uploadDisabled}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setPendingUpload(file || null, pendingExperienceUpload, setPendingExperienceUpload);
                  event.target.value = '';
                }}
              />
              {pendingExperienceUpload?.previewUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nuevo archivo para experience: {pendingExperienceUpload.fileName}</p>
                  <MediaPreview url={pendingExperienceUpload.previewUrl} label="experience-pending" />
                  <div className="flex flex-col md:flex-row gap-2">
                    <Button
                      type="button"
                      disabled={uploadDisabled || !pendingExperienceUpload.file}
                      onClick={() => handleUploadToArray('experience')}
                    >
                      Subir a experience
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => clearPendingUpload(pendingExperienceUpload, setPendingExperienceUpload)}
                    >
                      Quitar selección
                    </Button>
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={actionDisabled || reuseOptionsBySection.experience.length === 0}
                onClick={() => openReuseModal('experience')}
              >
                Reutilizar desde otro perfil
              </Button>
              </div>
            </details>

            <details className="rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-base font-medium">skils</summary>
              <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profileData.skils.map((skill, index) => (
                  <div key={`${skill.name}-${index}`} className="space-y-2 rounded-md border border-border p-3">
                    <p className="text-sm font-medium">{skill.name || `Skill ${index + 1}`}</p>
                    <MediaPreview url={skill.img} label={skill.name || `skill-${index + 1}`} />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => handleDeleteSkill(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-skill-name">Nombre del skill</Label>
                  <Input
                    id="new-skill-name"
                    value={newSkillName}
                    onChange={(event) => setNewSkillName(event.target.value)}
                    placeholder="Ej: Actuación"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-skill-upload">Archivo del skill</Label>
                  <Input
                    id="new-skill-upload"
                    type="file"
                    accept="image/*,video/*"
                    disabled={uploadDisabled}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setPendingUpload(file || null, pendingSkillUpload, setPendingSkillUpload);
                      event.target.value = '';
                    }}
                  />
                </div>
              </div>

              {pendingSkillUpload?.previewUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nuevo archivo para skill: {pendingSkillUpload.fileName}</p>
                  <MediaPreview url={pendingSkillUpload.previewUrl} label="skill-pending" />
                  <div className="flex flex-col md:flex-row gap-2">
                    <Button
                      type="button"
                      disabled={uploadDisabled || !pendingSkillUpload.file}
                      onClick={handleAddSkill}
                    >
                      Subir a skils
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionDisabled}
                      onClick={() => clearPendingUpload(pendingSkillUpload, setPendingSkillUpload)}
                    >
                      Quitar selección
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={actionDisabled || reuseOptionsBySection.skils.length === 0}
                onClick={() => openReuseModal('skils')}
              >
                Reutilizar desde otro perfil
              </Button>
              </div>
            </details>
          </CardContent>
        </Card>

        {reuseModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Reutilizar desde otros perfiles</p>
                  <p className="text-xs text-muted-foreground">
                    Sección: {REUSE_SECTION_LABELS[reuseModal.sectionKey] || reuseModal.sectionKey} · {reuseIsMulti ? 'selección múltiple' : 'selección única'}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={closeReuseModal} disabled={actionDisabled}>Cerrar</Button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4">
                {activeReuseOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay archivos disponibles en otros perfiles para esta sección.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeReuseOptions.map((option) => {
                      const selected = reuseModal.selectedUrls.includes(option.url);

                      return (
                        <button
                          key={option.url}
                          type="button"
                          onClick={() => toggleReuseUrl(option.url)}
                          className={`text-left space-y-2 rounded-md border p-3 ${selected ? 'border-primary' : 'border-border'}`}
                          disabled={actionDisabled}
                        >
                          <MediaPreview url={option.url} label={option.label} />
                          <p className="text-sm font-medium">{option.profileName}</p>
                          <p className="text-xs text-muted-foreground">{option.sourceName}</p>
                          <p className="text-xs text-muted-foreground break-all">{option.url}</p>
                          <p className="text-xs">{selected ? 'Seleccionado' : 'Click para seleccionar'}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Seleccionados: {reuseModal.selectedUrls.length}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeReuseModal} disabled={actionDisabled}>Cancelar</Button>
                  <Button
                    type="button"
                    onClick={handleApplyReuseModal}
                    disabled={actionDisabled || reuseModal.selectedUrls.length === 0}
                  >
                    Aplicar reutilización
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;