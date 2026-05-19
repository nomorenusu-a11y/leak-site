export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span
          aria-hidden
          className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
        />
        <span className="text-sm font-semibold">불러오는 중...</span>
      </div>
    </div>
  );
}
