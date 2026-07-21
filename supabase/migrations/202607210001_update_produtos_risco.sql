begin;

update public.products
set
  slug = 'recalibracao-carga-brasil',
  image_url = '/assets/products/recalibracao-carga-brasil.jpg',
  images = array['/assets/products/recalibracao-carga-brasil.jpg'],
  name = 'Recalibração Carga Brasil',
  full_name = 'Recalibração Carga Brasil para scanners de veículos pesados',
  commercial_summary = 'Serviço técnico para ampliar a cobertura de diagnóstico em veículos de carga e manter o equipamento compatível com modelos mais recentes.',
  description = 'Serviço técnico para ampliar a cobertura de diagnóstico em veículos de carga, mantendo o equipamento compatível com os modelos mais recentes.',
  detail = 'Recalibração Carga Brasil. Serviço técnico indicado para oficinas que trabalham com diagnóstico em veículos pesados e precisam manter cobertura compatível.',
  applications = 'Oficinas, reparadores e auto centers que atendem veículos de carga e precisam ampliar ou manter a cobertura de diagnóstico.',
  benefits = array[
    'Amplia a cobertura de diagnóstico em veículos de carga',
    'Ajuda a manter o equipamento compatível com modelos mais recentes',
    'Serviço técnico com orientação ScannerTec'
  ],
  price_or_condition = coalesce(price_or_condition, 'Consulte condições'),
  image_alt = 'Recalibração Carga Brasil para diagnóstico de veículos pesados',
  use_tags = array['recalibração', 'diagnóstico', 'recalibracao', 'carga'],
  tags = array['recalibração', 'scanner', 'carga'],
  updated_at = now()
where id = 'atualizacao-carga-brasil';

update public.products
set
  slug = 'recalibracao-tecnica-ds808-mp208',
  image_url = '/assets/products/recalibracao-tecnica-ds808-mp208.png',
  images = array['/assets/products/recalibracao-tecnica-ds808-mp208.png'],
  name = 'Recalibração Técnica DS808/MP208',
  full_name = 'Recalibração Técnica DS808/MP208 - Serviço Anual',
  commercial_summary = 'Serviço técnico anual para manter o equipamento compatível com novos veículos e funções de oficina.',
  description = 'Serviço técnico que mantém o equipamento compatível com novos veículos e funções de oficina.',
  detail = 'Recalibração Técnica DS808/MP208 - Serviço Anual. Indicado para oficinas que precisam manter o equipamento compatível para rotinas de diagnóstico.',
  applications = 'Oficinas e reparadores que utilizam DS808/MP208 e precisam manter cobertura técnica compatível.',
  benefits = array[
    'Mantém compatibilidade com novos veículos',
    'Apoia funções técnicas usadas na rotina da oficina',
    'Serviço anual com suporte consultivo ScannerTec'
  ],
  price_or_condition = coalesce(price_or_condition, 'Consulte condições'),
  image_alt = 'Recalibração Técnica DS808 MP208 serviço anual',
  use_tags = array['recalibração', 'diagnóstico', 'recalibracao'],
  tags = array['recalibração', 'scanner', 'ds808', 'mp208'],
  updated_at = now()
where id = 'atualizacao-ds808-mp208-1-ano';

update public.products
set
  slug = 'consulta-tecnica-circuitos-eletricos-ecu',
  image_url = '/assets/products/consulta-tecnica-circuitos-eletricos-ecu.png',
  images = array['/assets/products/consulta-tecnica-circuitos-eletricos-ecu.png'],
  name = 'Consulta Técnica - Circuitos Elétricos ECU',
  full_name = 'Consulta Técnica - Circuitos Elétricos ECU',
  commercial_summary = 'Conteúdo de apoio para leitura de circuitos e análise elétrica em reparos automotivos.',
  description = 'Conteúdo de apoio para leitura de circuitos e análise elétrica em reparos automotivos.',
  detail = 'Consulta técnica para apoio na leitura de circuitos elétricos ECU e análise elétrica durante reparos automotivos.',
  applications = 'Reparadores e oficinas que precisam consultar circuitos elétricos e apoiar diagnósticos em módulos ECU.',
  benefits = array[
    'Apoia a leitura de circuitos elétricos',
    'Facilita análise em reparos automotivos',
    'Material útil para diagnóstico de ECU'
  ],
  price_or_condition = coalesce(price_or_condition, 'Consulte condições'),
  image_alt = 'Consulta Técnica de Circuitos Elétricos ECU',
  use_tags = array['diagnóstico', 'elétrica', 'ecu', 'circuitos'],
  tags = array['circuitos elétricos', 'ecu', 'elétrica'],
  updated_at = now()
where id = 'diagrama-eletrico';

update public.products
set
  use_tags = array['diagnóstico', 'recalibração', 'recalibracao'],
  updated_at = now()
where id in ('autel-ds900-bt', 'launch-x431-pro')
  and use_tags && array['atualização', 'atualizacao'];

commit;
