export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plakamdüştü.com
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kayıp plakaları bulmak ve sahiplerine ulaştırmak için kurulmuş güvenilir platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              İletişim
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sorularınız için: <br />
              info@plakamdüştü.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © 2024 Plakamdüştü.com. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};
