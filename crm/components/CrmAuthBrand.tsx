export default function CrmAuthBrand() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-deep shadow-[0_4px_12px_rgb(109_40_217/0.35)]">
        <span className="text-base font-semibold tracking-tight text-white">R</span>
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold tracking-tight text-ink">Rosecrest</p>
        <p className="text-xs font-medium tracking-wide text-ink-muted">CRM</p>
      </div>
    </div>
  );
}
