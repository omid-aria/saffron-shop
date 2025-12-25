import React, { useState } from 'react';

interface ContactInfoProps {
  phone: string;
  website: string;
  email: string;
  address: string;
  locationLink?: string;
  isEditing: boolean;
  onUpdate: (field: any, value: string) => void;
}

interface ContactRowProps {
  id: string; // شناسه یکتا برای مدیریت انیمیشن
  icon: string;
  label: string;
  value: string;
  href?: string;
  isRtlText?: boolean;
  isEditing: boolean;
  editValue?: string;
  onEdit?: (val: string) => void;
  inputType?: string;
  subInput?: {
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
    icon?: string;
  };
  isActive?: boolean;
  onRowClick?: (id: string) => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ 
  id, icon, label, value, href, isRtlText = false, isEditing, editValue, onEdit, inputType = "text", subInput, isActive, onRowClick
}) => {
  if (isEditing && onEdit) {
    const isGrouped = !!subInput;

    return (
      <div className={`w-full transition-all duration-300 ${isGrouped ? 'bg-white/5 p-3 rounded-xl border border-primary/20 mb-2' : 'p-2 mb-0'}`}>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex-1 flex flex-col gap-1">
            {isGrouped && <span className="text-[10px] text-primary/80 text-right px-1 font-bold">متن نمایشی آدرس</span>}
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => onEdit(e.target.value)}
              className={`w-full bg-white/10 border border-primary/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary ${!isRtlText ? 'text-left font-mono' : 'text-right'}`}
              placeholder={label}
              dir={isRtlText ? "rtl" : "ltr"}
            />
          </div>
          <div className={`flex items-center gap-3 shrink-0 opacity-50 ${isGrouped ? 'self-end mb-1' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-md">
              <i className={`fas ${icon}`}></i>
            </div>
          </div>
        </div>

        {subInput && (
           <div className="flex items-center justify-between w-full gap-3 mt-3 pt-3 border-t border-white/10 animate-fadeIn">
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-primary/80 text-right px-1 font-bold">لینک مسیریاب یا کد مکان (Plus Code)</span>
              <input
                type="text"
                value={subInput.value}
                onChange={(e) => subInput.onChange(e.target.value)}
                className="w-full bg-white/10 border border-primary/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left font-mono ltr placeholder-gray-500"
                placeholder="https://maps.google.com/... OR 85mr+h75"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0 opacity-50 self-end mb-1">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-md">
                <i className={`fas ${subInput.icon || 'fa-link'}`}></i>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View Mode
  const displayValue = value;

  const content = (
    <div 
      className={`flex items-center justify-between w-full group cursor-pointer p-2 rounded-lg transition-all gap-3
        ${isActive 
           ? 'bg-primary/20 ring-1 ring-primary/50 animate-breathing' 
           : 'active:bg-white/10 md:hover:bg-white/5'
        }
      `}
    >
      <div className={`text-right text-white flex-1 min-w-0 break-words leading-relaxed ${!isRtlText ? 'font-mono text-sm tracking-wide' : 'text-sm font-medium'}`}>
        {displayValue}
      </div>
      <div className="flex items-center gap-3 shrink-0 self-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-secondary shadow-md transition-all duration-300 ease-out
           ${isActive
              ? 'bg-primary scale-110 shadow-[0_0_15px_rgba(212,175,55,0.8)]'
              : 'bg-gradient-to-br from-primary to-gold-dark md:group-hover:scale-110 md:group-hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] group-active:scale-95'
           }
        `}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full"
        onClick={() => onRowClick && onRowClick(id)}
      >
        {content}
      </a>
    );
  }

  return content;
};

const Divider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent my-1"></div>
);

const resolveMapLink = (input: string): string => {
  if (!input || !input.trim()) return "";
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^geo:/.test(trimmed)) return trimmed;
  const isDomainLike = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/.*)?$/.test(trimmed) && !trimmed.includes(" ");
  if (isDomainLike) return `https://${trimmed}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
};

const ensureProtocol = (url: string) => {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const ContactInfo: React.FC<ContactInfoProps> = ({ phone, website, email, address, locationLink, isEditing, onUpdate }) => {
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setActiveRow(id);
    // بازگشت به حالت عادی بعد از 2 ثانیه
    setTimeout(() => {
      setActiveRow(null);
    }, 2000);
  };
  
  let addressHref = "";
  if (locationLink && locationLink.trim().length > 0) {
    addressHref = resolveMapLink(locationLink);
  } else {
    addressHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  const websiteHref = website ? ensureProtocol(website) : "";

  return (
    <div className="flex flex-col gap-2">
      <ContactRow 
        id="phone"
        icon="fa-phone-alt" 
        label="تماس" 
        value={phone} 
        href={`tel:${phone}`}
        isEditing={isEditing}
        editValue={phone}
        onEdit={(val) => onUpdate('phone', val)}
        inputType="tel"
        isActive={activeRow === 'phone'}
        onRowClick={handleRowClick}
      />
      
      <Divider />
      
      <ContactRow 
        id="website"
        icon="fa-globe" 
        label="وب سایت" 
        value={website} 
        href={websiteHref}
        isEditing={isEditing}
        editValue={website}
        onEdit={(val) => onUpdate('website', val)}
        isActive={activeRow === 'website'}
        onRowClick={handleRowClick}
      />
      
      <Divider />
      
      <ContactRow 
        id="email"
        icon="fa-envelope" 
        label="ایمیل" 
        value={email} 
        href={`mailto:${email}`}
        isEditing={isEditing}
        editValue={email}
        onEdit={(val) => onUpdate('email', val)}
        inputType="email"
        isActive={activeRow === 'email'}
        onRowClick={handleRowClick}
      />
      
      <Divider />
      
      <ContactRow 
        id="address"
        icon="fa-map-marker-alt" 
        label="آدرس" 
        value={address} 
        href={addressHref}
        isRtlText={true}
        isEditing={isEditing}
        editValue={address}
        onEdit={(val) => onUpdate('address', val)}
        subInput={{
          value: locationLink || '',
          placeholder: 'لینک نقشه (اختیاری)',
          onChange: (val) => onUpdate('locationLink', val),
          icon: 'fa-map-location-dot'
        }}
        isActive={activeRow === 'address'}
        onRowClick={handleRowClick}
      />
    </div>
  );
};