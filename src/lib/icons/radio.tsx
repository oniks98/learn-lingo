const RadioButtonIcon = ({ selected }: { selected: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    className={selected ? 'text-yellow' : 'text-gray-muted'}
  >
    <rect
      x="1"
      y="1"
      width="18"
      height="18"
      rx="9"
      stroke="currentColor"
      strokeWidth="2"
    />
    {selected && (
      <rect x="5" y="5" width="10" height="10" rx="5" fill="currentColor" />
    )}
  </svg>
);
export default RadioButtonIcon;
