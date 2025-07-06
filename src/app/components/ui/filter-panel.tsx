'use client';

import { useForm, Controller } from 'react-hook-form';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { LANGUAGES, LEVELS, PRICES } from '@/lib/constants/filters';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

export interface FiltersForm {
  language: string;
  level: string;
  price: string;
}

const FilterPanel = ({
  onChange,
}: {
  onChange: (filters: FiltersForm) => void;
}) => {
  const { control, handleSubmit, reset, watch } = useForm<FiltersForm>({
    defaultValues: {
      language: '',
      level: '',
      price: '',
    },
  });

  const values = watch();

  const hasSelectedFilters = Object.values(values).some((v) => v !== '');

  const onSubmit = (data: FiltersForm) => {
    onChange(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-[repeat(auto-fit,minmax(213px,_1fr))] gap-5 px-3 py-8"
    >
      <h2 className="sr-only">Filters Panel</h2>

      <ControlledFilter
        control={control}
        name="language"
        label="Languages"
        options={['', ...LANGUAGES]} //
        placeholder="Choose a language"
      />

      <ControlledFilter
        control={control}
        name="level"
        label="Level of knowledge"
        options={['', ...LEVELS]}
        placeholder="Choose a level"
      />

      <ControlledFilter
        control={control}
        name="price"
        label="Price"
        options={['', ...PRICES.map((p) => `${p} $`)]}
        placeholder="Choose a price"
      />

      <div className="grid grid-cols-2 gap-3 self-end md:col-start-2 xl:col-start-4">
        <button
          type="submit"
          className="bg-yellow text-dark rounded-xl px-5 py-4 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSelectedFilters}
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
            onChange({ language: '', level: '', price: '' });
          }}
          className="bg-gray-muted text-dark rounded-xl px-5 py-4 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSelectedFilters}
        >
          Reset
        </button>
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
          <Listbox value={field.value} onChange={field.onChange}>
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-[14px] bg-white py-4 pr-10 pl-[18px] text-left shadow-sm focus:outline-none">
                <span className="text-dark block truncate text-[18px] leading-[1.11] font-medium">
                  {field.value || placeholder}
                </span>

                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDownIcon className="text-gray-muted h-5 w-5" />
                </span>
              </ListboxButton>

              <ListboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-[18px] shadow-lg focus:outline-none">
                {options.map((option) => (
                  <ListboxOption
                    key={option}
                    value={option}
                    className={({ focus }) =>
                      clsx(
                        'cursor-pointer px-4 py-2 select-none',
                        focus ? 'bg-gray-light text-black' : 'text-dark',
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
