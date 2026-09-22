/**
 * Formatação e validação básica de CPF — só para reduzir erro de digitação,
 * sem qualquer verificação contra a Receita Federal.
 */

/** Aplica a máscara 000.000.000-00 conforme o usuário digita. */
export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Algoritmo padrão dos dígitos verificadores do CPF. */
export function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // 111.111.111-11 etc.

  const digito = (base: string) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const char of base) {
      soma += Number(char) * peso;
      peso -= 1;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digito(cpf.slice(0, 9));
  const d2 = digito(cpf.slice(0, 9) + d1);
  return cpf === cpf.slice(0, 9) + String(d1) + String(d2);
}
