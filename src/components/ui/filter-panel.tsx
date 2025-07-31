// src/components/ui/filter-panel.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { LANGUAGES, LEVELS, PRICES } from '@/lib/constants/filters';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import CurrencySwitcher from '@/components/ui/currency-switcher';
import clsx from 'clsx';

export interface FiltersForm {
  language: string;
  level: string;
  price: string;
}

interface FilterPanelProps {
  initialFilters?: FiltersForm;
  onChange: (filters: FiltersForm) => void; // Убрали - больше не используется
  onApply: (filters: FiltersForm) => void; // Вызывается при клике "Поиск"
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

  // Устанавливаем начальные значения когда они загружены
  useEffect(() => {
    if (initialFilters && !isLoading) {
      setValue('language', initialFilters.language);
      setValue('level', initialFilters.level);
      setValue('price', initialFilters.price);
    }
  }, [initialFilters, isLoading, setValue]);

  // Подписка на изменения формы только для кнопок
  const values = watch();

  // Проверяем, есть ли выбранные фильтры
  const hasSelectedFilters = Object.values(values).some((v) => v !== '');

  const onSubmit = (data: FiltersForm) => {
    onApply(data);
  };

  const handleReset = () => {
    const emptyFilters = { language: '', level: '', price: '' };
    reset(emptyFilters);
    onApply(emptyFilters);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(213px,_1fr))] gap-5 px-3 py-8">
        <h2 className="sr-only">Loading filters...</h2>

        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-14 w-full animate-pulse rounded-[14px] bg-gray-200" />
          </div>
        ))}

        {/* Loading buttons */}
        <div className="grid grid-cols-2 gap-3 self-end">
          <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
        </div>

        {/* Loading currency switcher */}
        <div className="flex gap-3 justify-self-center md:self-end md:justify-self-end">
          <div className="h-12 w-20 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-20 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="@container grid gap-2 px-3 py-8 md:grid-cols-[repeat(3,minmax(200px,1fr))] xl:grid-cols-[repeat(3,minmax(200px,1fr))_auto_1fr_auto]"
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
          className="bg-yellow text-dark rounded-xl px-4 py-[14px] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSelectedFilters}
        >
          {t('search')}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-muted text-dark rounded-xl px-4 py-[14px] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSelectedFilters}
        >
          {t('reset')}
        </button>
      </div>

      {/* Currency Switcher */}
      <div className="justify-self-center md:col-3 md:self-end md:justify-self-end xl:col-6">
        <CurrencySwitcher />
      </div>
    </form>
  );
};

interface ControlledFilterProps {
  control: any;
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
      <span className="text-gray-muted text-sm leading-[1.29] font-medium">
        {label}
      </span>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Listbox
            value={field.value}
            onChange={(value) => {
              field.onChange(value); // Только обновляем значение в форме
              // Убрали вызов onFieldChange - больше не вызываем onChange при каждом изменении
            }}
          >
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-[14px] bg-white py-4 pr-8 pl-3 text-left shadow-sm focus:outline-none">
                <span className="text-dark block truncate text-[18px] leading-[1.11] font-medium">
                  {field.value || placeholder}
                </span>

                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDownIcon className="text-gray-muted h-5 w-5" />
                </span>
              </ListboxButton>

              <ListboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-[18px] shadow-lg focus:outline-none">
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
