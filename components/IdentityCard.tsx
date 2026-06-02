'use client';

interface IdentityCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  index?: number;
}

export default function IdentityCard({
  name,
  description,
  icon,
  color,
  isSelected,
  isDisabled,
  onSelect,
  index = 0,
}: IdentityCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        group relative h-full transform transition-all duration-500 ease-out
        ${isSelected ? 'scale-[0.97]' : ''}
        ${isDisabled && !isSelected ? 'opacity-30 cursor-not-allowed' : ''}
        ${!isDisabled ? 'hover:-translate-y-2 hover:scale-[1.03]' : ''}
      `}
      style={{
        animation: `card-appear 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s both`,
      }}
    >
      {/* 辉光 */}
      <div
        className={`
          absolute -inset-[4px] rounded-2xl opacity-0 blur-lg transition-all duration-500
          ${!isDisabled ? 'group-hover:opacity-60 group-hover:duration-300' : ''}
          ${isSelected ? 'opacity-80' : ''}
        `}
        style={{ background: 'linear-gradient(135deg, rgba(184,135,43,0.5), rgba(184,135,43,0.1), rgba(184,135,43,0.4))' }}
      />

      <div
        className={`
          relative bg-gradient-to-br ${color} rounded-2xl overflow-hidden border
          ${isSelected
            ? 'border-gold-accent shadow-[0_0_30px_rgba(184,135,43,0.35)]'
            : 'border-border-warm group-hover:border-gold-accent group-hover:border-opacity-50'
          }
          shadow-lg transition-all duration-500 ease-out
          ancient-texture h-full flex flex-col p-6 sm:p-7
          ${!isDisabled ? 'group-hover:shadow-[0_16px_40px_rgba(184,135,43,0.15)]' : ''}
        `}
      >
        {/* 四角金线 */}
        <span className="absolute top-0 left-0 block border-t-[2px] border-l-[2px] border-gold-accent w-0 h-0 opacity-0 transition-all duration-500 ease-out group-hover:w-8 group-hover:h-8 group-hover:opacity-70" />
        <span className="absolute top-0 right-0 block border-t-[2px] border-r-[2px] border-gold-accent w-8 h-8 opacity-0 transition-all duration-500 delay-75 group-hover:opacity-70" />
        <span className="absolute bottom-0 left-0 block border-b-[2px] border-l-[2px] border-gold-accent w-8 h-8 opacity-0 transition-all duration-500 delay-75 group-hover:opacity-70" />
        <span className="absolute bottom-0 right-0 block border-b-[2px] border-r-[2px] border-gold-accent w-0 h-0 opacity-0 transition-all duration-500 ease-out group-hover:w-8 group-hover:h-8 group-hover:opacity-70" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-5 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1">
            {icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-chinese font-bold text-scroll-dark mb-3 text-left transition-colors duration-500 group-hover:text-gold-accent">
            {name}
          </h3>
          <p className="text-sm sm:text-base text-ink-light text-left leading-relaxed flex-grow font-light">
            {description}
          </p>
          <div className="mt-5 pt-4 border-t border-border-warm/50 overflow-hidden">
            <span className="inline-block text-sm font-chinese font-bold text-gold-accent translate-y-full opacity-0 transition-all duration-[400ms] ease-out group-hover:translate-y-0 group-hover:opacity-100">
              点击开始体验 →
            </span>
          </div>
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-scroll-dark/5 rounded-2xl flex items-center justify-center z-20 backdrop-blur-[1px]">
            <div className="text-4xl text-gold-accent animate-pulse">✓</div>
          </div>
        )}
      </div>
    </button>
  );
}
