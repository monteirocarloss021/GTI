# Grand Theft Infra · Vol. 02

Baixe o arquivo **index.html**, abra-o no Chrome e escolha **Começar campanha**. O HTML inclui o motor 3D, os personagens, as ilustrações, a música e as seis missões. Os capítulos concluídos ficam disponíveis em **Capítulos** no mesmo navegador, quando o armazenamento local está habilitado.

**Explorar o H8** libera os sete personagens desde o início. Escolha um deles, ande até um amigo para conversar ou siga o marcador até o hall. Ali você pode consultar a planta, ver como os apartamentos são numerados e visitar o 230. Para trocar quem você controla durante o passeio, abra **Menu → Trocar personagem**. O H8 é uma interpretação em escala de jogo dos três blocos térreos e do corredor entre os halls. [Referência arquitetônica na WikITA](https://wikita.aeita.com.br/wiki/H8)

## Jogabilidade

A primeira versão de *Grand Theft Gucci* usa animação corporal e expressões para indicar o que o protagonista está fazendo. A revisão aproveita essa linguagem no elenco da Infra. O amigo escolhido se vira e fala, o grupo ergue os copos no brinde e o fôlego determina por quanto tempo o personagem consegue correr. Na campanha, Marrom, Suíço, Gucci, Gaba, Fogaréu, Chassi e Lixo assumem o controle conforme a história.

| Comando | Ação |
| --- | --- |
| WASD ou setas | Andar em relação à câmera |
| Shift enquanto anda / Espaço | Correr / pular |
| Clique ou toque no chão | Caminhar até o ponto |
| Clique ou toque em um amigo / F perto dele | Aproximar-se e conversar / falar diretamente |
| Clique no marcador / E perto do objetivo | Ir até o objetivo / interagir |
| Arrastar a cena / roda do mouse | Girar a câmera / ajustar a distância |
| Números de 1 a 9 | Escolher uma resposta ou opção visível |
| G no brinde / X no resgate | Brindar no Toka / reagrupar na Mango |
| O / Esc | Colocar ou tirar os óculos / abrir o menu |

No celular, use o analógico para andar, arraste o cenário para girar a câmera e toque nos botões para pular, conversar ou ativar a habilidade indicada. No duelo de fliperama, toque nos discos iluminados e use o salto para evitar os pulsos. Se perder os três escudos, você pode repetir a rodada. Em navegadores sem WebGL, a campanha oferece uma apresentação ilustrada.

## Desenvolvimento e teste

Execute `npm ci` e `npm run build` para incorporar o código de `src/world.js`, `src/actors.js` e `src/play.js` ao HTML. Os demais roteiros e a interface estão no próprio `index.html`. A licença MIT do Three.js está incluída no arquivo distribuído.

Com Python, Playwright e Chromium instalados, execute `python tests/campaign.py`. O teste abre o HTML, bloqueia requisições externas, joga os seis capítulos, verifica as fotos do brinde e do pátio, chega aos créditos e recarrega o jogo para conferir os capítulos desbloqueados.
