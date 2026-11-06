# Lucas Coiro — Portfólio de Product Design

Portfólio estático em HTML, CSS e JavaScript, com tema escuro, opção clara e layout responsivo. Todas as dependências de apresentação, fontes, fotos e logos disponíveis estão em `dist/`.

**Endereço de publicação:** https://lucascoiro.github.io/portifolio/

## Conteúdo

| Empresa | Ano de referência | Cor | Produtos |
| --- | --- | --- | --- |
| PicPay | 2026 | `#3FAB67` | 4 |
| Paciente 360 | 2022 | `#FB5C47` | 1 |
| Uzzo | 2019 | `#FF0076` | Em preparação |

Os anos aparecem nas páginas das empresas, na seleção de empresas e na identificação dos cases. O conteúdo de cada produto é separado em Visão geral, Desafio, Solução e Resultados; cada aba mostra somente seu próprio texto.

## Rodar localmente

Requer Node.js 22 ou superior. Não há dependências para instalar.

```sh
npm run check
npm run preview
```

Abra http://127.0.0.1:4328/.

Para simular o subdiretório do GitHub Pages no PowerShell:

```powershell
$env:PREVIEW_BASE_PATH='/portifolio'
npm run preview
```

Abra http://127.0.0.1:4328/portifolio/.

## Publicação com GitHub Pages

O workflow `.github/workflows/pages.yml` valida os arquivos e publica **somente `dist/`** a cada push na branch `main`. Também pode ser executado manualmente em **Actions → Publish portfolio to GitHub Pages → Run workflow**.

Na primeira configuração do repositório, use **Settings → Pages → Build and deployment → Source: GitHub Actions**. Aguarde a conclusão do workflow em Actions. O endereço é o mesmo indicado acima.

Os caminhos de CSS, JavaScript, imagens e fontes são relativos, permitindo hospedar em `/portifolio/`. As rotas usam fragmentos (`#...`), sem depender de configuração de servidor ou redirecionamento de SPA. Exemplo:

https://lucascoiro.github.io/portifolio/#case/paciente-360/simulador-de-casos-clinicos/overview/1

## Atualizar o conteúdo

Edite `dist/content.js`. A estrutura de cada empresa aceita `id`, `name`, `year`, `brand`, `role`, `description`, `logo` e `products`.

Cada produto aceita `id`, `title`, `shortTitle`, `description`, `problem`, `solution`, `result` e `media`. Parágrafos são separados por uma linha em branco. `emphasis` permite destacar frases específicas sem inserir HTML no conteúdo.

Mídias podem ser imagens locais (`type: 'image'`), cenas Three.js (`type: 'three'`) ou esquemas conceituais (`type: 'diagram'`). Animações, quando presentes, são feitas em Three.js, com pausa e respeito à preferência por movimento reduzido.

## Organização

- `dist/index.html`: estrutura das páginas.
- `dist/content.js`: empresas, anos, produtos, resumo e LinkedIn.
- `dist/app.js`: rotas, abas e conteúdo.
- `dist/vertical.css`: fluxo vertical, foto estática, logos e rodapé.
- `dist/accessibility.css`: tipografia mínima de 16 px (12 pt) e paletas.
- `dist/product-scene.js` e `dist/three.module.js`: suporte a animações de produtos.
- `scripts/check-site.mjs`: validação de conteúdo, sintaxe e caminhos locais.
- `preview.cjs`: servidor estático de prévia.

## Identidade e mídias

DM Sans e Three.js estão incluídos com suas licenças. Os logos e marcas pertencem às respectivas empresas. O símbolo do PicPay veio de seu site oficial; o logo Paciente 360 e a foto foram fornecidos pelo titular do portfólio. O logo da Uzzo permanece pendente. Os diagramas são conceituais e não representam telas oficiais.

O pacote não contém credenciais, arquivos de configuração do Sites ou dependências `node_modules`.