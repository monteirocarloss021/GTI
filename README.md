# Grand Theft Infra · edição 3D

Baixe **index.html** e abra no Chrome. O arquivo contém o jogo, os modelos, a música e o motor Three.js. Não há instalação para jogar.

**Explorar o H8** permite passear pelos jardins com qualquer um dos sete personagens. Use o menu para trocar de personagem. **Começar campanha** abre as seis missões com protagonistas definidos e o revezamento entre Suíço e Gucci. Os capítulos concluídos ficam salvos no navegador quando o armazenamento local está disponível.

| Comando | Ação |
| --- | --- |
| WASD ou setas | Andar em relação à câmera |
| Shift | Correr |
| Clique ou toque no chão | Caminhar até o ponto |
| Arrastar a cena / roda do mouse | Girar a câmera / ajustar a distância |
| Analógico de toque | Andar no celular |
| E, Espaço ou botão de ação | Interagir ou ativar a habilidade |
| G no brinde / X no resgate | Brindar no Toka / reagrupar na Mango |
| O ou botão Óculos | Colocar ou tirar os óculos |
| Esc ou Menu | Pausar e acessar opções |

A exploração usa perspectiva, modelos articulados e iluminação em WebGL. Os retratos, diálogos e a capa usam ilustrações. Em dispositivos sem WebGL, o jogo oferece o modo ilustrado. No duelo arcade, clique nos discos de luz ou use o botão de ação e caminhe até a marca. As falas na Mango também aparecem em texto.

## Desenvolvimento

O código do mundo 3D está em **src/world.js**. Execute `npm ci` e `npm run build` para incorporar o motor e o mundo ao HTML. O script preserva a campanha e as ilustrações e substitui somente o bloco `gti-world`. A licença MIT do Three.js está incluída no HTML.
