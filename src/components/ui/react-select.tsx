import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React from "react";
import Select, {
  components,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type MultiValueRemoveProps,
  type Props as SelectProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";

const DropdownIndicator = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: DropdownIndicatorProps<Option, IsMulti, Group>,
) => (
  <components.DropdownIndicator {...props}>
    <ChevronDownIcon />
  </components.DropdownIndicator>
);

const ClearIndicator = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: ClearIndicatorProps<Option, IsMulti, Group>,
) => (
  <components.ClearIndicator {...props}>
    <Cross2Icon />
  </components.ClearIndicator>
);

const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <components.MultiValueRemove {...props}>
    <Cross2Icon />
  </components.MultiValueRemove>
);

const controlStyles = {
  base: "flex w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground",
  focus: "outline-none ring-1 ring-ring",
  nonFocus: "border-border",
};
const placeholderStyles = "text-muted-foreground text-sm ml-1";
const selectInputStyles = "text-foreground text-sm ml-1";
const valueContainerStyles = "text-foreground text-sm";
const singleValueStyles = "ml-1";
const multiValueStyles =
  "ml-1 bg-background border border-border rounded items-center px-1 my-0.5 gap-1.5";
const multiValueLabelStyles = "leading-5 text-xs py-0.5";
const multiValueRemoveStyles =
  "bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md bg-background";
const indicatorsContainerStyles = "gap-1 bg-background rounded-lg";
const clearIndicatorStyles = "text-gray-500 rounded-md hover:text-red-800";
const indicatorSeparatorStyles = "bg-muted";
const dropdownIndicatorStyles = "hover:text-foreground text-gray-500";
const menuStyles =
  "mt-2 p-2 border border-border bg-background text-sm rounded-lg";
const optionsStyle =
  "bg-background p-2 border-0 text-base hover:bg-secondary hover:cursor-pointer";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm bg-background";
const noOptionsMessageStyles = "text-muted-foreground bg-background";

function ReactSelectInner<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  {
    options,
    value,
    onChange,
    isMulti,
    isDisabled,
    components,
    createAble,
    isLoading,
    placeholder,
    defaultValue,
    ...props
  }: SelectProps<Option, IsMulti, Group> & { createAble: boolean },
  ref: React.ForwardedRef<
    React.ElementRef<typeof Select<Option, IsMulti, Group>>
  >,
) {
  const Comp = createAble ? CreatableSelect : Select;
  return (
    <Comp
      ref={ref}
      unstyled
      isClearable
      isSearchable
      value={value}
      isDisabled={isDisabled}
      isMulti={isMulti}
      isLoading={isLoading}
      placeholder={placeholder}
      components={{
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
        ...components,
      }}
      defaultValue={defaultValue}
      options={options}
      noOptionsMessage={() => "No options found !!"}
      onChange={onChange}
      classNames={{
        control: ({ isFocused, isDisabled }) =>
          clsx(
            isDisabled ? "cursor-not-allowed opacity-50" : "",
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base,
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        option: () => optionsStyle,
        menu: () => menuStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        multiValue: () => multiValueStyles,
        multiValueLabel: () => multiValueLabelStyles,
        multiValueRemove: () => multiValueRemoveStyles,
        indicatorsContainer: () => indicatorsContainerStyles,
        clearIndicator: () => clearIndicatorStyles,
        indicatorSeparator: () => indicatorSeparatorStyles,
        dropdownIndicator: () => dropdownIndicatorStyles,
        groupHeading: () => groupHeadingStyles,
        noOptionsMessage: () => noOptionsMessageStyles,
      }}
      {...props}
    />
  );
}

export const ReactSelect = React.forwardRef(ReactSelectInner) as <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: SelectProps<Option, IsMulti, Group> & {
    createAble: boolean;
    ref?: React.ForwardedRef<
      React.ElementRef<typeof Select<Option, IsMulti, Group>>
    >;
  },
) => ReturnType<typeof ReactSelectInner>;
