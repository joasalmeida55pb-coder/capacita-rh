/** Utilitários de geração de links de partilha das vagas. */

/** Monta a URL pública absoluta de uma vaga (`/vagas/[id]`). */
export function buildVagaUrl(vagaId: string): string {
  if (typeof window === "undefined") return `/vagas/${vagaId}`;
  return `${window.location.origin}/vagas/${vagaId}`;
}

/** Monta a mensagem + URL para partilha via WhatsApp (api.whatsapp.com/send). */
export function buildWhatsappShareUrl(url: string, texto: string): string {
  const mensagem = `${texto} ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
}

/** Monta a URL de partilha via LinkedIn (sharing/share-offsite). */
export function buildLinkedinShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/**
 * Copia um texto para a área de transferência, com fallback para navegadores
 * sem suporte à Clipboard API (ou fora de um contexto seguro/https).
 */
export async function copiarParaAreaDeTransferencia(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // segue para o fallback abaixo
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const sucesso = document.execCommand("copy");
    document.body.removeChild(textarea);
    return sucesso;
  } catch {
    return false;
  }
}
