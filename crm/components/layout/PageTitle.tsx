interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-12">
      <span className="text-base font-medium tracking-tight text-(--color-ink) sm:text-lg">
        {children}
      </span>
    </div>
  );
}
