export interface PartCategory {
  name: string;
  parts: string[];
}

export const AUTO_DICTIONARY: PartCategory[] = [
  {
    name: "Motor",
    parts: [
      "Correia Dentada",
      "Bomba d'Água",
      "Junta do Cabeçote",
      "Vela de Ignição",
      "Filtro de Óleo",
      "Filtro de Ar",
      "Pistão",
      "Válvula de Admissão",
      "Cárter"
    ]
  },
  {
    name: "Suspensão e Direção",
    parts: [
      "Amortecedor",
      "Mola Helicoidal",
      "Barra Estabilizadora",
      "Bieleta",
      "Pivô de Suspensão",
      "Terminal de Direção",
      "Cixa de Direção",
      "Bucha da Bandeja"
    ]
  },
  {
    name: "Freios",
    parts: [
      "Pastilha de Freio",
      "Disco de Freio",
      "Lona de Freio",
      "Tambor de Freio",
      "Cilindro Mestre",
      "Servo Freio (Hidrovácuo)",
      "Pinça de Freio"
    ]
  },
  {
    name: "Elétrica e Ignição",
    parts: [
      "Bateria",
      "Alternador",
      "Motor de Partida",
      "Bobina de Ignição",
      "Cabo de Vela",
      "Fusível",
      "Relé",
      "Sensor de Oxigênio (Sonda Lambda)"
    ]
  },
  {
    name: "Transmissão",
    parts: [
      "Kit de Embreagem",
      "Platô",
      "Disco de Embreagem",
      "Cabo de Embreagem",
      "Semieixo",
      "Homocinética",
      "Tulipa"
    ]
  },
  {
    name: "Sistema de Arrefecimento",
    parts: [
      "Radiador",
      "Mangueira Superior",
      "Mangueira Inferior",
      "Válvula Termostática",
      "Aditivo do Radiador"
    ]
  }
];
