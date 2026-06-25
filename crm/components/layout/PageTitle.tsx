interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 p-4 md:px-14">
      <span className="text-[24px] font-semibold tracking-tight text-(--color-primary)">
        {children}
      </span>
    </div>
  );
}

