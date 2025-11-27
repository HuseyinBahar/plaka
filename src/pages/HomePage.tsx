import { Plus, Search, Heart, Upload, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Car className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Plakanız mı kayboldu?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Kayıp plakaları bulmak ve sahiplerine ulaştırmak için güvenilir platform
          </p>
        </div>
      </section>

      {/* Action Sections */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Plaka mı buldunuz? */}
            <div className="card p-8 text-center">
              <div className="mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full inline-flex mb-4">
                  <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Plaka mı buldunuz?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Yolda, park yerinde veya herhangi bir yerde plaka bulduysanız, buraya ekleyerek sahibine ulaştırabilirsiniz.
                </p>
              </div>
              <Link
                to="/plaka-bildir"
                className="btn-primary text-lg px-8 py-3 w-full sm:w-auto inline-flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Plaka Bildir</span>
              </Link>
            </div>

            {/* Plakanız mı düştü? */}
            <div className="card p-8 text-center">
              <div className="mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full inline-flex mb-4">
                  <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Plakanız mı düştü?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Plakanızı kaybettiyseniz, bulunan plakalar arasında arama yaparak plakanızı bulabilirsiniz.
                </p>
              </div>
              <Link
                to="/bulunan-plakalar"
                className="btn-secondary text-lg px-8 py-3 w-full sm:w-auto inline-flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Plaka Sorgula</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Plaka bulma sürecini kolaylaştırmak için tasarlandı
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Plaka Bildir
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bulduğunuz plakayı fotoğraf ve açıklama ile sisteme ekleyin
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Arama Yap
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kayıp plakanızı konum veya plaka numarası ile arayın
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sahibine Ulaştır
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Plakayı sahibine teslim edin ve mutlu edin
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
