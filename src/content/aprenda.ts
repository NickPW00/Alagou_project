// A6 — Conteúdo do "Aprenda e Previna".
// RASCUNHO para revisão da equipe Meninas pelo Clima (docs/pacote-a/A6-conteudo-educativo.md).
// Regras: linguagem simples; nunca orientar a entrar na água; nenhuma referência bibliográfica inventada.

export type Block = { p: string } | { list: string[] } | { tip: string } | { h: string };

export type Module = {
  n: number;
  title: string;
  intro: string;
  blocks: Block[];
};

export const DRAFT_NOTICE = 'Rascunho em revisão pela equipe Meninas pelo Clima';

export const MODULES: Module[] = [
  {
    n: 1,
    title: 'Por que as ruas alagam?',
    intro: 'Um alagamento quase nunca tem uma causa só. Ele acontece quando chove mais água do que a cidade consegue escoar.',
    blocks: [
      { h: 'Chuva forte em pouco tempo' },
      { p: 'O que pesa não é só quanto chove, mas em quanto tempo. Uma chuva muito forte em uma hora pode alagar mais do que um dia inteiro de chuva fraca.' },
      { h: 'Chão que não absorve água' },
      { p: 'Asfalto, cimento e telhados não deixam a água entrar no solo (impermeabilização). Sem terra e sem plantas, a água corre toda para as ruas ao mesmo tempo.' },
      { h: 'Drenagem que não dá conta' },
      { p: 'Bueiros, galerias e canais levam a água embora. Quando estão entupidos por lixo ou areia, ou foram feitos pequenos demais para o tamanho atual do bairro, a água fica parada na rua.' },
      { h: 'Rios, canais e a forma do terreno' },
      { p: 'A Baixada Fluminense é uma região baixa e plana, cortada por rios e canais que deságuam na Baía de Guanabara. Quando os rios enchem ou a maré está alta, a água das ruas tem mais dificuldade para sair.' },
      { h: 'Mudanças no uso do solo e no clima' },
      { p: 'Desmatamento, aterros e ocupação das margens dos rios mudam o caminho da água. As mudanças climáticas tendem a tornar as chuvas fortes mais frequentes em muitas regiões.' },
      { h: 'Nem todo mundo é atingido do mesmo jeito' },
      { p: 'Os bairros com menos infraestrutura, menos áreas verdes e mais moradias em áreas baixas costumam sofrer mais. Isso é chamado de desigualdade socioambiental, e é um tema central da justiça climática.' },
    ],
  },
  {
    n: 2,
    title: 'Entenda os fenômenos',
    intro: 'Alagamento, inundação, enchente e enxurrada não são a mesma coisa. Saber a diferença ajuda a avisar melhor e a se proteger.',
    blocks: [
      { h: 'Alagamento' },
      { p: 'Acúmulo de água nas ruas e em outras áreas da cidade porque a drenagem não consegue escoar a chuva. É o que o Alag@u registra.' },
      { h: 'Enchente (ou cheia)' },
      { p: 'Subida temporária do nível da água de um rio ou canal, que fica cheio até a borda, mas ainda sem transbordar.' },
      { h: 'Inundação' },
      { p: 'Quando o rio ou canal transborda e a água ocupa as áreas das margens, que normalmente ficam secas.' },
      { h: 'Enxurrada' },
      { p: 'Água da chuva correndo com muita força e velocidade pela superfície, capaz de arrastar objetos, carros e pessoas. É muito perigosa mesmo quando parece rasa.' },
      { h: 'Outros termos' },
      {
        list: [
          'Precipitação: toda água que cai do céu (chuva, granizo). É medida em milímetros (mm): 1 mm equivale a 1 litro de água por metro quadrado.',
          'Nível da água: a altura que a água atinge em um rio, canal ou rua.',
          'Bacia hidrográfica: toda a área de terra cuja chuva escorre para um mesmo rio. O que acontece rio acima afeta quem mora rio abaixo.',
        ],
      },
      { tip: 'Os termos seguem o uso do Cemaden e da Defesa Civil. A equipe do projeto vai conferir as definições nos materiais oficiais antes da publicação definitiva.' },
    ],
  },
  {
    n: 3,
    title: 'Como se proteger?',
    intro: 'Proteja primeiro as pessoas, depois as coisas. Em caso de emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).',
    blocks: [
      { h: 'Antes das chuvas' },
      {
        list: [
          'Acompanhe os avisos oficiais da Defesa Civil e do INMET. Se puder, cadastre seu celular para receber alertas da Defesa Civil.',
          'Combine com a família um lugar seguro e alto para se encontrar e quem vai ajudar crianças, idosos e pessoas com deficiência.',
          'Guarde documentos, remédios e uma lanterna em saco plástico, em lugar alto.',
          'Não jogue lixo na rua nem em bueiros e canais.',
        ],
      },
      { h: 'Durante o alagamento' },
      {
        list: [
          'Não entre em ruas alagadas, nem a pé, nem de carro, moto ou bicicleta. Pouca água com correnteza já derruba uma pessoa e arrasta um carro.',
          'Nunca atravesse uma área alagada para ver a profundidade.',
          'Fique longe de bueiros, valas e canais: a tampa do bueiro pode ter saído e não dá para ver embaixo da água.',
          'Se a água entrar em casa, desligue a energia elétrica no quadro de luz, se puder fazer isso com segurança e sem tocar na água.',
          'Fique longe de fios e postes caídos.',
          'Se precisar sair, vá para um lugar alto e seguro.',
        ],
      },
      { h: 'Depois que a água baixar' },
      {
        list: [
          'Só religue a energia depois de verificar se a instalação está seca e segura. Na dúvida, chame um profissional.',
          'A água do alagamento pode estar contaminada por esgoto. Use botas e luvas na limpeza e lave bem as mãos.',
          'Jogue fora alimentos e remédios que tiveram contato com a água.',
          'Procure atendimento de saúde se tiver febre, dor no corpo ou feridas depois de contato com a água (risco de leptospirose e outras doenças).',
        ],
      },
      { h: 'Cuidado redobrado' },
      { p: 'Crianças, idosos, gestantes e pessoas com deficiência ou mobilidade reduzida precisam de ajuda para sair a tempo. Combine isso antes.' },
    ],
  },
  {
    n: 4,
    title: 'Cidades resilientes',
    intro: 'Uma cidade resiliente é preparada para receber a chuva com menos danos. Muitas soluções usam a própria natureza.',
    blocks: [
      {
        list: [
          'Jardins de chuva: canteiros mais baixos que a rua, com plantas, que recebem e absorvem a água.',
          'Telhados verdes: telhados com plantas, que seguram parte da chuva e diminuem o calor.',
          'Pavimentos permeáveis: calçadas e estacionamentos que deixam a água passar para o solo.',
          'Árvores e áreas verdes: a copa segura a chuva e as raízes ajudam o solo a absorver água.',
          'Recuperação de rios: devolver espaço aos rios, com margens vegetadas, reduz inundações.',
          'Drenagem sustentável: combinar galerias e bueiros com soluções que guardam e infiltram a água.',
        ],
      },
      { p: 'Essas ideias são chamadas de soluções baseadas na natureza. Elas funcionam melhor quando planejadas junto com a comunidade.' },
    ],
  },
  {
    n: 5,
    title: 'Ciência cidadã',
    intro: 'Ciência cidadã é quando moradores e pesquisadores produzem conhecimento juntos.',
    blocks: [
      { p: 'Cada aviso no Alag@u registra onde, quando e como estava a rua. Juntos, esses registros mostram quais ruas alagam com mais frequência, quanto tempo a água demora para baixar e quais bairros precisam de mais atenção.' },
      {
        list: [
          'Conhecer o território: o mapa mostra o que as pessoas vivem no dia a dia.',
          'Pesquisa: os dados, sem identificar ninguém, ajudam estudos sobre chuva, drenagem e desigualdade.',
          'Participação pública: informações organizadas fortalecem os pedidos da comunidade ao poder público.',
          'Planejamento urbano: ajudam a decidir onde investir em drenagem e áreas verdes.',
        ],
      },
      { tip: 'Os registros comunitários não substituem os alertas e as avaliações da Defesa Civil.' },
    ],
  },
];

export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string };

export const QUIZ: QuizQuestion[] = [
  {
    q: 'A rua ficou com água parada porque o bueiro não deu conta da chuva. Isso é:',
    options: ['Alagamento', 'Inundação', 'Enchente'],
    answer: 0,
    explain: 'Alagamento é o acúmulo de água nas ruas quando a drenagem não consegue escoar a chuva.',
  },
  {
    q: 'O rio transbordou e a água chegou às casas da margem. Isso é:',
    options: ['Enxurrada', 'Inundação', 'Alagamento'],
    answer: 1,
    explain: 'Inundação é quando o rio ou canal transborda e ocupa as áreas das margens.',
  },
  {
    q: 'A água está na altura da canela e correndo rápido. O que fazer?',
    options: ['Atravessar devagar', 'Atravessar de carro', 'Não atravessar e procurar outro caminho seguro'],
    answer: 2,
    explain: 'Pouca água com correnteza já derruba uma pessoa e arrasta um carro. Nunca atravesse.',
  },
  {
    q: 'A água entrou em casa. O que fazer com a energia elétrica?',
    options: ['Desligar no quadro de luz, se for seguro e sem tocar na água', 'Deixar ligada para ter luz', 'Mexer nas tomadas para testar'],
    answer: 0,
    explain: 'Desligar a energia evita choques. Só faça isso se puder sem tocar na água.',
  },
];
