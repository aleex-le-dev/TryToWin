const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/trytowinimage/image/upload";
// const UPLOAD_PRESET = "<votre_upload_preset>"; // Supprimé pour éviter toute confusion

/**
 * Upload une image locale sur Cloudinary et retourne l'URL publique
 * @param {string} uri (local file URI)
 * @param {string} uploadPreset (nom du preset Cloudinary)
 * @returns {Promise<string>} URL Cloudinary
 */
export async function uploadToCloudinary(uri, uploadPreset) {
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  console.log("[uploadToCloudinary] response", data);
  if (!data.secure_url)
    throw new Error("Erreur upload Cloudinary: " + JSON.stringify(data));
  return data.secure_url;
}
