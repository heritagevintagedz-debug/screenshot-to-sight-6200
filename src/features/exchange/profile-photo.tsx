import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchange } from "./context";
export function ProfilePhoto() {
  const { username, profilePhoto, setProfilePhoto, signedIn } = useExchange();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return <div className="profile-photo-control"><span className="avatar">{profilePhoto ? <img src={profilePhoto} alt="Votre photo de profil" /> : username.slice(0, 2).toUpperCase()}</span>{signedIn && <><Button variant="secondary" size="icon" aria-label="Changer la photo de profil" title="Changer la photo de profil" onClick={() => input.current?.click()}><Camera /></Button>{profilePhoto && <Button variant="ghost" size="icon" aria-label="Supprimer la photo" title="Supprimer la photo" onClick={() => setProfilePhoto("")}><Trash2 /></Button>}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Photo de profil" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choisissez une photo JPG, PNG ou WebP de moins de 5 Mo."); return; } setError(""); const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") setProfilePhoto(reader.result); }; reader.readAsDataURL(file); e.target.value = ""; }} /></>}{error && <p className="form-error" role="alert">{error}</p>}</div>;
}