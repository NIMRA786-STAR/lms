import React from 'react';
import type { IconType } from 'react-icons';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconType;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  outline?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'md',
  outline = false,
  className = '',
  ...rest
}) => {
  const cls = [
    'icon-btn',
    outline ? 'icon-btn-outline' : `icon-btn-${variant}`,
    size === 'sm' ? 'icon-btn-sm' : '',
    !label ? 'icon-btn-icon-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...rest}>
      {Icon && <Icon />}
      {label && <span>{label}</span>}
    </button>
  );
};

export default IconButton;