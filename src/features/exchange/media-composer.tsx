import { useEffect, useRef, useState } from "react";
import { ImagePlus, Mic, Square, X, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchange } from "./context";
import type { Message } from "./context";
export function MediaComposer({ offerId }: { offerId: string }) {
  const { sendMedia } = useExchange();
  const fileInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const cancelled = useRef(false);
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<NonNullable<Message["media"]> | null>(null);
  useEffect(() => () => { cancelled.current = true; if (recorder.current?.state === "recording") recorder.current.stop(); stream.current?.getTracks().forEach((track) => track.stop()); }, []);
  useEffect(() => { if (!recording) return; const timer = window.setInterval(() => setSeconds((n) => n + 1), 1000); return () => window.clearInterval(timer); }, [recording]);
  useEffect(() => { if (seconds >= 120 && recorder.current?.state === "recording") recorder.current.stop(); }, [seconds]);
  const loadFile = (file?: File) => {
    if (!file) return;
    const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : null;
    if (!kind || file.size > 20 * 1024 * 1024) { setError("Choisissez une photo, une vidéo ou un audio de moins de 20 Mo."); return; }
    if (preview?.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
    setError(""); setPreview({ kind, url: URL.createObjectURL(file), name: file.name });
  };
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("L’enregistrement vocal n’est pas disponible dans ce navigateur. Vous pouvez joindre un fichier audio."); return; }
    setStarting(true); setError(""); cancelled.current = false;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled.current) { audioStream.getTracks().forEach((track) => track.stop()); return; }
      stream.current = audioStream;
      const supported = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const audioRecorder = supported ? new MediaRecorder(audioStream, { mimeType: supported }) : new MediaRecorder(audioStream);
      recorder.current = audioRecorder;
      const chunks: Blob[] = [];
      audioRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
      audioRecorder.onstop = () => {
        audioStream.getTracks().forEach((track) => track.stop()); setRecording(false);
        if (!cancelled.current && chunks.length) {
          const blob = new Blob(chunks, { type: audioRecorder.mimeType });
          setPreview({ kind: "audio", url: URL.createObjectURL(blob), name: "Message vocal" });
        }
      };
      setSeconds(0); audioRecorder.start(); setRecording(true);
    } catch { setError("Accès au microphone refusé ou indisponible. Autorisez-le dans votre navigateur ou joignez un fichier audio."); }
    finally { setStarting(false); }
  };
  return <div className="media-composer">{preview && <div className="attachment-preview">{preview.kind === "image" ? <img src={preview.url} alt="Photo à envoyer" /> : preview.kind === "video" ? <video src={preview.url} controls playsInline /> : <audio src={preview.url} controls />}<span>{preview.name}</span><div className="flex gap-2"><Button variant="ghost" size="icon" aria-label="Annuler la pièce jointe" onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}><X /></Button><Button variant="gold" size="sm" onClick={() => { sendMedia(offerId, preview); setPreview(null); }}><Send />Envoyer</Button></div></div>}<div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Joindre une photo ou un audio" title="Joindre une photo ou un fichier audio" onClick={() => fileInput.current?.click()} disabled={recording}><ImagePlus /></Button><Button variant="ghost" size="icon" aria-label="Joindre une vidéo" title="Joindre une vidéo" onClick={() => videoInput.current?.click()} disabled={recording}><Video /></Button><Button variant={recording ? "sell" : "ghost"} size="icon" aria-label={recording ? "Arrêter l’enregistrement" : "Enregistrer un message vocal"} title={recording ? "Arrêter l’enregistrement" : "Enregistrer un message vocal"} disabled={starting} onClick={() => { if (recording) recorder.current?.stop(); else void startRecording(); }}>{recording ? <Square /> : <Mic />}</Button>{recording && <><span className="text-xs text-destructive" role="status">Enregistrement · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span><Button variant="ghost" size="icon" aria-label="Annuler l’enregistrement" onClick={() => { cancelled.current = true; recorder.current?.stop(); }}><X /></Button></>}<span className="ml-auto text-[9px] text-muted-foreground">{recording ? "" : "Session locale · 20 Mo max."}</span></div><input type="file" ref={fileInput} accept="image/*,audio/*" aria-label="Photo ou audio à joindre" className="sr-only" onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ""; }} /><input type="file" ref={videoInput} accept="video/*" aria-label="Vidéo à joindre" className="sr-only" onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ""; }} />{error && <p className="form-error" role="alert">{error}</p>}</div>;
}