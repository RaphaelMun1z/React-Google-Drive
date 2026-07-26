import { zodResolver } from "@hookform/resolvers/zod";
import { HardDrive, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/common/Button/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import "./RegisterPage.scss";

const schema = z.object({ name: z.string().trim().min(2, "Informe seu nome").max(120), email: z.string().email("Informe um e-mail válido"), password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72) });
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: createAccount, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  if (isAuthenticated) return <Navigate to="/drive" replace />;
  const submit = handleSubmit(async (data) => { setLoading(true); try { await createAccount(data); toast.success("Conta criada com sucesso"); navigate("/drive", { replace: true }); } catch (error) { toast.error(getApiErrorMessage(error)); } finally { setLoading(false); } });
  return <main className="auth-page"><section className="auth-layout"><aside className="auth-panel"><div className="auth-brand"><HardDrive size={22} /><span>Google Drive</span></div><div className="auth-panel__content"><span className="auth-panel__eyebrow">Comece agora</span><h1>Tenha seus arquivos sempre acessíveis.</h1><p>Crie seu espaço para organizar documentos e compartilhar o que importa.</p></div></aside><section className="auth-form-panel"><div className="auth-card"><header><span className="eyebrow">Nova conta</span><h2>Crie sua conta</h2><p>Preencha seus dados para começar.</p></header><form onSubmit={submit}><label className="auth-field">Nome<div className="auth-input"><UserRound size={17} aria-hidden="true" /><input autoComplete="name" placeholder="Seu nome" {...register("name")} /></div>{errors.name && <small>{errors.name.message}</small>}</label><label className="auth-field">E-mail<div className="auth-input"><Mail size={17} aria-hidden="true" /><input type="email" autoComplete="email" placeholder="voce@exemplo.com" {...register("email")} /></div>{errors.email && <small>{errors.email.message}</small>}</label><label className="auth-field">Senha<div className="auth-input"><LockKeyhole size={17} aria-hidden="true" /><input type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" {...register("password")} /></div>{errors.password && <small>{errors.password.message}</small>}</label><Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button></form><p className="auth-switch">Já possui conta? <Link to="/login">Entrar</Link></p></div></section></section></main>;
}
