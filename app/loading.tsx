export default function Loading() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 rounded bg-card" />
          <div className="h-5 w-1/2 rounded bg-card" />
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border bg-card space-y-3"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-white/5" />
                    <div className="h-4 w-full rounded bg-white/5" />
                    <div className="h-4 w-2/3 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
