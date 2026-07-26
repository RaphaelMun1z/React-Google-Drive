import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button/Button";
import "./NotFoundPage.scss";
export function NotFoundPage() { return <main className="not-found"><span>404</span><h1>Página não encontrada</h1><p>O endereço acessado não existe.</p><Link to="/drive"><Button>Voltar ao Drive</Button></Link></main>; }
