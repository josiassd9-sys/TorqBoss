
export interface CountryConfig {
  id: string;
  name: string;
  flag: string;
  plateFormat: RegExp;
  platePlaceholder: string;
  searchPortalUrl: string;
  technicalTerms: {
    brand: string[];
    model: string[];
    year: string[];
    color: string[];
    engine: string[];
  };
}

export const COUNTRIES: CountryConfig[] = [
  {
    id: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    plateFormat: /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, // Mercosul e Antiga
    platePlaceholder: 'ABC1D23',
    searchPortalUrl: 'https://buscaplacas.com.br/',
    technicalTerms: {
      brand: ['Marca', 'Fabricante'],
      model: ['Modelo', 'Versão'],
      year: ['Ano', 'Ano/Modelo'],
      color: ['Cor'],
      engine: ['Motor', 'Cilindrada', 'Potência']
    }
  },
  {
    id: 'US',
    name: 'United States',
    flag: '🇺🇸',
    plateFormat: /^[A-Z0-9]{1,8}$/,
    platePlaceholder: 'PLATE123',
    searchPortalUrl: 'https://www.vehiclehistory.com/',
    technicalTerms: {
      brand: ['Make'],
      model: ['Model', 'Trim'],
      year: ['Year'],
      color: ['Color', 'Exterior'],
      engine: ['Engine', 'Displacement']
    }
  },
  {
    id: 'ES',
    name: 'España',
    flag: '🇪🇸',
    plateFormat: /^[0-9]{4}[A-Z]{3}$/,
    platePlaceholder: '1234BBB',
    searchPortalUrl: 'https://www.dieselogasolina.com/consultar-matricula.html',
    technicalTerms: {
      brand: ['Marca'],
      model: ['Modelo'],
      year: ['Fecha matriculación', 'Año'],
      color: ['Color'],
      engine: ['Motor', 'CV']
    }
  },
  {
    id: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    plateFormat: /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/,
    platePlaceholder: 'AA123BB',
    searchPortalUrl: 'https://www.dnrpa.gov.ar/consulta_dominio/',
    technicalTerms: {
      brand: ['Marca'],
      model: ['Modelo'],
      year: ['Año'],
      color: ['Color'],
      engine: ['Motor']
    }
  }
];

export const getCountryById = (id: string) => COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
