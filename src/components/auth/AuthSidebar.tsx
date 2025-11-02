interface AuthSidebarProps {
  title: string;
  features: Array<{
    icon: string;
    text: string;
  }>;
  image: string;
}

export default function AuthSidebar({ title, features, image }: AuthSidebarProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="relative z-10 flex flex-col justify-end p-12 text-white">
        <h2 className="text-4xl font-bold mb-8 leading-tight">
          {title}
        </h2>
        
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <span className="text-2xl mr-4">{feature.icon}</span>
              <span className="text-lg">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

