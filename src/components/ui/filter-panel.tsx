'use client';

import { useForm, Controller, Control } from 'react-hook-form';
import { useEffect } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { LANGUAGES, LEVELS, PRICES } from '@/lib/constants/filters';
import CurrencySwitcher from '@/components/ui/currency-switcher';

export interface FiltersForm {
  language: string;
  level: string;
  price: string;
}

interface FilterPanelProps {
  initialFilters?: FiltersForm;
  onChange: (filters: FiltersForm) => void;
  onApply: (filters: FiltersForm) => void; // Викликається при кліку "Пошук"
  isLoading?: boolean;
}

const FilterPanel = ({
  initialFilters,
  onApply,
  isLoading = false,
}: FilterPanelProps) => {
  const t = useTranslations('filters');

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FiltersForm>({
      defaultValues: {
        language: '',
        level: '',
        price: '',
      },
    });

  // Встановлюємо початкові значення коли вони завантажені
  useEffect(() => {
    if (initialFilters && !isLoading) {
      setValue('language', initialFilters.language);
      setValue('level', initialFilters.level);
      setValue('price', initialFilters.price);
    }
  }, [initialFilters, isLoading, setValue]);

  // Підписка на зміни форми
  const values = watch();

  // Перевіряємо, чи є обрані фільтри
  const hasSelectedFilters = Object.values(values).some((v) => v !== '');

  const onSubmit = (data: FiltersForm) => {
    onApply(data);
  };

  const handleReset = () => {
    const emptyFilters = { language: '', level: '', price: '' };
    reset(emptyFilters);
    onApply(emptyFilters);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        '@container grid gap-2 px-3 py-8',
        'md:grid-cols-[repeat(3,minmax(200px,1fr))]',
        'xl:grid-cols-[repeat(3,minmax(200px,min-content))_auto_1fr_auto]',
      )}
    >
      <h2 className="sr-only">{t('title')}</h2>

      <ControlledFilter
        control={control}
        name="language"
        label={t('language.label')}
        options={['', ...LANGUAGES]}
        placeholder={t('language.placeholder')}
      />

      <ControlledFilter
        control={control}
        name="level"
        label={t('level.label')}
        options={['', ...LEVELS]}
        placeholder={t('level.placeholder')}
      />

      <ControlledFilter
        control={control}
        name="price"
        label={t('price.label')}
        options={['', ...PRICES.map((p) => `${p} $`)]}
        placeholder={t('price.placeholder')}
      />

      <div className="grid grid-cols-2 gap-2 self-end md:col-1 xl:col-4">
        <button
          type="submit"
          className={clsx(
            'bg-yellow text-dark rounded-xl px-[1cqw] py-[14px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          disabled={!hasSelectedFilters}
        >
          {t('search')}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className={clsx(
            'bg-gray-muted text-dark rounded-xl px-[1cqw] py-[14px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          disabled={!hasSelectedFilters}
        >
          {t('reset')}
        </button>
      </div>

      <div
        className={clsx(
          'justify-self-center md:col-3 md:self-end md:justify-self-end xl:col-6',
        )}
      >
        <CurrencySwitcher />
      </div>
    </form>
  );
};

interface ControlledFilterProps {
  control: Control<FiltersForm>;
  name: keyof FiltersForm;
  label: string;
  options: string[];
  placeholder: string;
}

const ControlledFilter = ({
  control,
  name,
  label,
  options,
  placeholder,
}: ControlledFilterProps) => {
  return (
    <div className="grid gap-2">
      <span
        className={clsx('text-gray-muted text-sm leading-[1.29] font-medium')}
      >
        {label}
      </span>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Listbox
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
            }}
          >
            <div className="relative">
              <ListboxButton
                className={clsx(
                  'relative w-full cursor-pointer rounded-[14px] bg-white',
                  'py-4 pr-8 pl-3 text-left shadow-sm focus:outline-none',
                )}
              >
                <span
                  className={clsx(
                    'text-dark block truncate text-[18px] leading-[1.11] font-medium',
                  )}
                >
                  {field.value || placeholder}
                </span>

                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDownIcon className="text-gray-muted h-5 w-5" />
                </span>
              </ListboxButton>

              <ListboxOptions
                className={clsx(
                  'ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto',
                  'rounded-xl bg-white py-1 text-[18px] shadow-lg focus:outline-none',
                )}
              >
                {options.map((option, index) => (
                  <ListboxOption
                    key={option || `empty-${index}`}
                    value={option}
                    className={({ focus }) =>
                      clsx(
                        'cursor-pointer px-4 py-2 select-none',
                        focus
                          ? 'text-dark transition-colors duration-300'
                          : 'text-gray-muted',
                      )
                    }
                  >
                    {option || placeholder}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        )}
      />
    </div>
  );
};

export default FilterPanel;
