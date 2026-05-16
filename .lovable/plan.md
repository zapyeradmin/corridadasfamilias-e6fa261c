## Problema
Na hero, "das Famílias" usa `bg-gradient-orange bg-clip-text` em cima do bloco laranja, ficando ilegível.

## Solução
Em `src/routes/index.tsx` (linhas 72-75), trocar o gradiente do span para o gradiente roxo do fundo (mesmas cores do `bg-gradient-premium`), garantindo contraste sobre o laranja.

- Adicionar (se não existir) um utilitário `bg-gradient-purple` em `src/styles.css` usando as mesmas variáveis do gradiente premium do hero (tons de roxo escuro → roxo).
- Aplicar `bg-gradient-purple bg-clip-text text-transparent` no span "das Famílias".
- Manter "II Corrida" branco e na mesma linha.

## Verificação
Recarregar `/` e confirmar que "das Famílias" aparece em degradê roxo legível sobre a faixa laranja.