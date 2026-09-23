import { Card } from '@/components/ui/card';
import { features } from '@/app/data/static';

interface Feature {
  title: string;
  desc: string;
  bgClass: string;
  iconClass: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function FeaturesSection() {
  const typedFeatures = features as Feature[];

  return (
    <section id='features' className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Mengapa Pilih Rekber.com?
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Keamanan dan kepercayaan adalah prioritas utama kami dalam setiap
            transaksi
          </p>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {typedFeatures.map((feature, idx) => (
            <Card
              key={idx}
              className='bg-white border border-gray-100 shadow-lg rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1'
            >
              <div
                className={`w-16 h-16 ${feature.bgClass} rounded-2xl flex items-center justify-center mx-auto mb-6`}
              >
                <feature.icon className={feature.iconClass} />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                {feature.title}
              </h3>
              <p className='text-gray-600'>{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
