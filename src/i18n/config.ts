import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      app_subtitle: 'Gerenciamento de veículos e manutenção',
      app_welcome: 'Bem-vindo ao TorqBoss. Gerencie seus veículos, serviços e lembretes a partir daqui.',
      app_empty_fleet: 'Nenhum veículo cadastrado ainda. Comece adicionando um novo veículo para ver o dashboard completo.',
      add_vehicle_label: 'Nome do veículo',
      add_vehicle_button: 'Adicionar veículo'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
