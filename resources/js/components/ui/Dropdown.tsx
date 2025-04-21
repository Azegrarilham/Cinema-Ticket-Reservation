import React, { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export interface DropdownItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number | string;
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'left',
  width = 'auto',
  className = '',
}: DropdownProps) {
  const alignmentClasses = align === 'left' ? 'origin-top-left left-0' : 'origin-top-right right-0';

  const widthStyle = typeof width === 'number'
    ? { width: `${width}px` }
    : width !== 'auto'
      ? { width }
      : {};

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button as={Fragment}>
          {trigger}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${alignmentClasses} mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10`}
          style={widthStyle}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Fragment key={index}>
                <Menu.Item>
                  {({ active }) => (
                    item.href ? (
                      <a
                        href={item.href}
                        className={`
                          ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                          ${item.divider ? 'border-t border-gray-100' : ''}
                          group flex items-center px-4 py-2 text-sm
                        `}
                        onClick={item.onClick}
                      >
                        {item.icon && (
                          <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`
                          ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                          ${item.divider ? 'border-t border-gray-100' : ''}
                          group flex w-full items-center px-4 py-2 text-sm
                        `}
                        onClick={item.onClick}
                      >
                        {item.icon && (
                          <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </button>
                    )
                  )}
                </Menu.Item>
              </Fragment>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
