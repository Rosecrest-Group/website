type DividerProps = {
  width?: string;
  className?: string;
};

export default function Divider({ width = "w-[90%]", className = "" }: DividerProps) {
  return <hr className={`mx-auto ${width} border-t border-slate-200 ${className}`.trim()} />;
}
