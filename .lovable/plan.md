## Objetivo

Adicionar a logo "II Corrida das Famílias" centralizada acima do formulário de login na rota `/login`, usando o novo PNG sem fundo `logodacorridaparaosite_login.png`.

## Arquivos afetados

- `src/assets/logo-corrida-login.png` — novo arquivo (copiado de `user-uploads://logodacorridaparaosite_login.png`).
- `src/routes/login.tsx` — adicionar o import da logo e renderizá-la centralizada acima do `<form>`.

## Mudanças

1. Copiar `user-uploads://logodacorridaparaosite_login.png` para `src/assets/logo-corrida-login.png`.
2. Em `src/routes/login.tsx`:
   - Importar a logo via ES6: `import logo from "@/assets/logo-corrida-login.png"`.
   - Dentro do `<ContentSection>`, antes do `<form>`, adicionar um wrapper centralizado com a `<img>`:
     - Alt text: `"II Corrida das Famílias"`.
     - Altura responsiva: `h-24 md:h-32 w-auto` (boa visibilidade, próximo do print).
     - Margem inferior para separar do card do formulário.
     - `loading="eager"` e `decoding="async"`.

## Fora do escopo

- Página `/reset-password` e demais telas.
- Ajustes no `PageHeader` ou no card do formulário.
