export default function Loading() {
  return (
    <main
      className="min-h-screen bg-[#f7f5f0] text-[#1e2b22]"
      aria-label="Loading menu"
      aria-busy="true"
    >
      <section className="relative min-h-[430px] overflow-hidden bg-[#1c2d22]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(232,184,106,.18),transparent_40%)]" />
        <div className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col px-5 py-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="menu-shimmer size-11 rounded-full bg-white/15" />
            <div className="menu-shimmer h-5 w-36 rounded bg-white/15" />
          </div>
          <div className="mt-auto pb-10">
            <div className="menu-shimmer h-3 w-40 rounded bg-[#e8b86a]/35" />
            <div className="menu-shimmer mt-5 h-12 w-72 max-w-full rounded bg-white/15 md:h-16 md:w-[480px]" />
            <div className="menu-shimmer mt-3 h-12 w-56 max-w-full rounded bg-white/15 md:h-16 md:w-96" />
            <div className="menu-shimmer mt-6 h-4 w-80 max-w-full rounded bg-white/10" />
            <div className="menu-shimmer mt-3 h-4 w-60 max-w-full rounded bg-white/10" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="menu-shimmer h-3 w-32 rounded bg-[#d9d7cf]" />
            <div className="menu-shimmer mt-3 h-10 w-64 rounded bg-[#dedcd4]" />
          </div>
          <div className="menu-shimmer hidden h-12 w-80 rounded-full bg-white md:block" />
        </div>
        <div className="mt-8 flex gap-2 overflow-hidden">
          {[72, 100, 92, 130, 90].map((width, i) => (
            <div
              key={i}
              className="menu-shimmer h-10 shrink-0 rounded-full bg-white"
              style={{ width }}
            />
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_8px_30px_rgba(34,51,40,.05)]"
            >
              <div className="menu-shimmer aspect-[4/3] bg-[#e4e3dc]" />
              <div className="p-5">
                <div className="menu-shimmer h-6 w-2/3 rounded bg-[#e7e6df]" />
                <div className="menu-shimmer mt-3 h-4 w-full rounded bg-[#eeede8]" />
                <div className="menu-shimmer mt-2 h-4 w-4/5 rounded bg-[#eeede8]" />
                <div className="menu-shimmer mt-5 h-6 w-24 rounded bg-[#e2e1da]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
