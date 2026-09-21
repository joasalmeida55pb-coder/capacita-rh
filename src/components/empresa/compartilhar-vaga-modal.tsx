"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, PartyPopper, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildLinkedinShareUrl,
  buildVagaUrl,
  buildWhatsappShareUrl,
  copiarParaAreaDeTransferencia,
} from "@/lib/share";
import type { Vaga } from "@/types";

/** Ícone da marca LinkedIn (não disponível no pacote lucide-react). */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

export function CompartilharVagaModal({
  vaga,
  onClose,
  celebrar = false,
}: {
  /** `null` mantém o modal fechado. */
  vaga: Vaga | null;
  onClose: () => void;
  /** Mostra um cabeçalho de "vaga publicada com sucesso" (usado logo após criar a vaga). */
  celebrar?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  if (!vaga) return null;

  const link = buildVagaUrl(vaga.id);
  const textoDivulgacao = `Vaga: ${vaga.titulo} — ${vaga.empresa} (Balneário Camboriú). Confira no Capacita RH:`;
  const linkWhatsapp = buildWhatsappShareUrl(link, textoDivulgacao);
  const linkLinkedin = buildLinkedinShareUrl(link);

  async function handleCopiar() {
    const ok = await copiarParaAreaDeTransferencia(link);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  return (
    <Modal aberto={Boolean(vaga)} onClose={onClose} title="Divulgar vaga">
      {celebrar && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">
          <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Vaga <span className="font-medium">{vaga.titulo}</span> publicada com sucesso!
            Compartilhe o link abaixo para atrair mais candidatos.
          </p>
        </div>
      )}

      {!celebrar && (
        <p className="mb-4 text-sm text-slate-500">
          Compartilhe o link da vaga <span className="font-medium text-slate-700">{vaga.titulo}</span>{" "}
          em qualquer canal.
        </p>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Link direto da vaga
        </label>
        <div className="flex gap-2">
          <Input value={link} readOnly onFocus={(e) => e.target.select()} />
          <Button type="button" variant="outline" onClick={handleCopiar} className="shrink-0">
            {copiado ? (
              <>
                <Check className="h-4 w-4 text-teal-600" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar Link
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" className="block">
          <Button type="button" className="w-full bg-[#25D366] hover:bg-[#1ebe5a]">
            <MessageCircle className="h-4 w-4" /> Partilhar no WhatsApp
          </Button>
        </a>
        <a href={linkLinkedin} target="_blank" rel="noopener noreferrer" className="block">
          <Button type="button" className="w-full bg-[#0A66C2] hover:bg-[#08529b]">
            <LinkedinIcon className="h-4 w-4" /> Partilhar no LinkedIn
          </Button>
        </a>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Share2 className="h-3.5 w-3.5" /> Qualquer pessoa com este link pode ver a vaga e se
        candidatar, sem precisar entrar na área da empresa.
      </p>
    </Modal>
  );
}
