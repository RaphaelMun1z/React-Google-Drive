import { zodResolver } from "@hookform/resolvers/zod";
import { HardDrive } from "lucide-react";
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
  return <main className="auth-page"><section className="auth-hero"><div className="brand brand--large"><HardDrive size={38} /><span>Google Drive</span></div><h1>Seus arquivos disponíveis onde você estiver.</h1><p>Armazene, organize, baixe e compartilhe seus documentos com segurança.</p></section><section className="auth-card"><div><span className="eyebrow">Bem-vindo</span><h2>Entre na sua conta</h2><p>Acesse seus arquivos e pastas.</p></div><form onSubmit={submit}><label>E-mail<input type="email" autoComplete="email" {...register("email")} />{errors.email && <small>{errors.email.message}</small>}</label><label>Senha<input type="password" autoComplete="current-password" {...register("password")} />{errors.password && <small>{errors.password.message}</small>}</label><Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button></form><p className="auth-switch">Ainda não possui conta? <Link to="/cadastro">Criar conta</Link></p></section></main>;
}
