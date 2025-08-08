const SkillGroup = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-4">
      {children}
    </div>
  </div>
);

const TechIcon = ({ src, alt }: { src: string; alt: string }) => (
  <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 hover:scale-110 transition-transform duration-200">
    <img src={src} alt={alt} className="w-12 h-12 object-contain" />
  </div>
);

export { SkillGroup, TechIcon };
