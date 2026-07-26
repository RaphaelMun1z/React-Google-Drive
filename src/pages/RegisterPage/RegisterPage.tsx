import { zodResolver } from "@hookform/resolvers/zod";
import { HardDrive } from "lucide-react";
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
  return <main className="auth-page"><section className="auth-hero"><div className="brand brand--large"><HardDrive size={38} /><span>Google Drive</span></div><h1>Organização simples para todos os seus arquivos.</h1><p>Crie sua conta e comece a armazenar seus documentos.</p></section><section className="auth-card"><div><span className="eyebrow">Nova conta</span><h2>Cadastre-se</h2><p>Preencha os dados para continuar.</p></div><form onSubmit={submit}><label>Nome<input autoComplete="name" {...register("name")} />{errors.name && <small>{errors.name.message}</small>}</label><label>E-mail<input type="email" autoComplete="email" {...register("email")} />{errors.email && <small>{errors.email.message}</small>}</label><label>Senha<input type="password" autoComplete="new-password" {...register("password")} />{errors.password && <small>{errors.password.message}</small>}</label><Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button></form><p className="auth-switch">Já possui conta? <Link to="/login">Entrar</Link></p></section></main>;
}
