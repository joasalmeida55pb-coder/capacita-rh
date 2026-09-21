# Capacita RH — visualização dos candidatos pela empresa

## Ficheiros

```
src/app/empresa/page.tsx   ← ATUALIZADO: botão e modal de candidatos
src/lib/supabaseClient.ts  ← ATUALIZADO: tipos Candidato e CandidaturaComCandidato
src/lib/estilos.ts         ← regenerado para o markup novo
migracao-trilha.sql        ← continua por correr (ver abaixo)
```

## 1. Onde clicar

No cartão da vaga, dentro de Minhas Vagas, há agora dois caminhos para o mesmo
sítio:

- botão preto **Ver Candidatos (n)** junto a Partilhar / Editar / Encerrar;
- o texto do rodapé passou a ser clicável: **"1 candidatura(s) — ver candidatos"**.

Sem candidaturas, nada disso aparece: o rodapé diz "Ainda sem candidaturas" e o
botão fica fora, para não convidar a abrir um modal vazio.

## 2. O modal

Por candidato: nome, data e hora da candidatura, bairro, WhatsApp/telefone,
e-mail, experiência anterior, e dois badges — o da trilha e o estado da
candidatura. Ações: **Falar no WhatsApp**, **Enviar e-mail** (só se houver
e-mail) e **Ver currículo** (só se `curriculo_url` estiver preenchido).

O link do WhatsApp normaliza o número: tira pontuação, acrescenta o 55 se
faltar e já leva mensagem escrita. `(47) 99888-7766` vira
`https://wa.me/5547998887766?text=…`. Se o número tiver menos de 10 dígitos, em
vez de um link partido aparece "Telefone inválido para WhatsApp".

## 3. Duas queries, não um join

O modal lê `candidaturas` e depois `candidatos` com `.in('id', …)`, em vez de
`candidaturas.select('*, candidatos(*)')`.

É deliberado: com RLS ativo, um join embutido faz **desaparecer** a candidatura
inteira quando a política bloqueia o candidato — a empresa veria "0 candidatos"
com candidaturas na tabela. Já perdemos uma rodada com exatamente este padrão
na página da vaga.

## 4. O badge da trilha depende da migração

| `trilha_concluida` | Badge |
|---|---|
| `true` | verde **Trilha Concluída** |
| `false` | âmbar **Em Capacitação** |
| coluna não existe | cinza **Trilha sem registo** |

Neste momento **o `migracao-trilha.sql` ainda não foi corrido**, portanto a
candidatura de teste vai aparecer com o badge cinza. Isso é o esperado, não é
um erro: a coluna não existe, logo não há o que mostrar. Corra o
`migracao-trilha.sql` e as candidaturas novas passam a verde.

As antigas ficam em **Em Capacitação** (o `default false` da migração). Se
quiser marcar a candidatura de teste como concluída:

```sql
update public.candidaturas set trilha_concluida = true, trilha_area = 'Comércio e Vendas'
 where id = '<id-da-candidatura>';
```

## 5. Verificação feita

Corri o fluxo num Chromium real, com duas candidaturas simuladas — uma com
registo de trilha e outra sem a coluna, para testar os dois badges:

- botão "Ver Candidatos (2)" ✓
- modal com os dois candidatos, datas, contactos e experiência ✓
- badges "Trilha Concluída" e "Trilha sem registo" lado a lado ✓
- link gerado: `https://wa.me/5547998887766?text=Olá Maria! …` ✓
- candidato sem e-mail → botão de e-mail não aparece ✓
- experiência vazia → "Não informada." ✓
- zero erros de JavaScript ✓

## 6. Continua por fazer

O RLS. As tabelas continuam `UNRESTRICTED`, o que significa que os dados de
contacto dos candidatos — nome, telefone, CPF — estão hoje acessíveis a
qualquer pessoa com a chave anon, que vai no browser. Agora que há candidatos
reais na base, isto deixou de ser teórico. O `seguranca.sql` está pronto.
