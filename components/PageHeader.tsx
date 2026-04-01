interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
}

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">{description}</p>
    </div>
  );
}
