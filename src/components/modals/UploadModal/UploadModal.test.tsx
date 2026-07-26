import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadModal } from "./UploadModal";

const renderModal = () => render(<UploadModal open onClose={vi.fn()} onConfirm={vi.fn().mockResolvedValue(undefined)} />);

beforeEach(() => {
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() });
});

describe("UploadModal", () => {
  it("permite selecionar um arquivo pelo explorador", () => {
    const { container } = renderModal();
    const file = new File(["conteúdo"], "relatorio.txt", { type: "text/plain" });
    fireEvent.change(container.querySelector("input[type=file]") as HTMLInputElement, { target: { files: [file] } });
    expect(screen.getByText("relatorio.txt")).toBeInTheDocument();
  });

  it("aceita arquivos por arrastar e soltar", () => {
    const { container } = renderModal();
    const file = new File(["imagem"], "foto.png", { type: "image/png" });
    fireEvent.drop(screen.getByRole("button", { name: /arraste arquivos/i }), { dataTransfer: { files: [file] } });
    expect(screen.getByText("foto.png")).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(container.querySelector(".upload-item__preview")).toBeInTheDocument();
  });

  it("impede arquivos duplicados na fila", () => {
    const { container } = renderModal();
    const file = new File(["conteúdo"], "relatorio.txt", { type: "text/plain" });
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText(/duplicado/)).toBeInTheDocument();
    expect(screen.getAllByText("relatorio.txt")).toHaveLength(1);
  });

  it("permite remover um arquivo antes do envio", () => {
    renderModal();
    const file = new File(["conteúdo"], "relatorio.txt", { type: "text/plain" });
    fireEvent.drop(screen.getByRole("button", { name: /arraste arquivos/i }), { dataTransfer: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /remover relatorio.txt/i }));
    expect(screen.queryByText("relatorio.txt")).not.toBeInTheDocument();
  });
});
