import { zodResolver } from "@hookform/resolvers/zod";
import { HardDrive, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/common/Button/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import "./LoginPage.scss";

const schema = z.object({ email: z.string().email("Informe um e-mail válido"), password: z.string().min(1, "Informe sua senha") });
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  if (isAuthenticated) return <Navigate to="/drive" replace />;
  const submit = handleSubmit(async (data) => { setLoading(true); try { await login(data); toast.success("Login realizado com sucesso"); const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/drive"; navigate(from, { replace: true }); } catch (error) { toast.error(getApiErrorMessage(error, "Credenciais inválidas")); } finally { setLoading(false); } });
  return <main className="auth-page"><section className="auth-layout"><aside className="auth-panel"><div className="auth-brand"><HardDrive size={22} /><span>Google Drive</span></div><div className="auth-panel__content"><span className="auth-panel__eyebrow">Seu espaço de arquivos</span><h1>Organize o trabalho em um só lugar.</h1><p>Armazene, encontre e compartilhe seus documentos com praticidade e segurança.</p></div></aside><section className="auth-form-panel"><div className="auth-card"><header><span className="eyebrow">Bem-vindo de volta</span><h2>Entre no seu Google Drive</h2><p>Acesse seus arquivos para continuar.</p></header><form onSubmit={submit}><label className="auth-field">E-mail<div className="auth-input"><Mail size={17} aria-hidden="true" /><input type="email" autoComplete="email" placeholder="voce@exemplo.com" {...register("email")} /></div>{errors.email && <small>{errors.email.message}</small>}</label><label className="auth-field">Senha<div className="auth-input"><LockKeyhole size={17} aria-hidden="true" /><input type="password" autoComplete="current-password" placeholder="Digite sua senha" {...register("password")} /></div>{errors.password && <small>{errors.password.message}</small>}</label><Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button></form><p className="auth-switch">Ainda não possui conta? <Link to="/cadastro">Criar conta</Link></p></div></section></section></main>;
}
