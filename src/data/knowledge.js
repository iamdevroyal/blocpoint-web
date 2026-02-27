export const articles = [
  {
    id: 'vat-on-fees',
    title: "What the 7.5% VAT on transaction fees really means",
    excerpt: "Nigeria introduced a 7.5% VAT on banking service fees. Here's how it affects you.",
    category: "Policy",
    icon: "📜",
    image: "https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=800",
    content: `
      <p>Nigeria introduced a 7.5% VAT on banking service fees from January 19, 2026. This VAT applies only to service charges, not the actual transaction amount.</p>
      
      <div class="my-6 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
        <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Example</p>
        <p class="text-sm font-medium leading-relaxed opacity-80">If you send ₦50,000, the recipient still receives ₦50,000. VAT applies only to the bank’s transfer fee (e.g., ₦50 fee + ₦3.75 VAT).</p>
      </div>

      <div class="space-y-8">
        <section>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            What is taxed
          </h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <span class="text-emerald-500 font-bold">✓</span>
              <div class="space-y-1">
                <p class="text-sm font-bold tracking-tight">Digital Services</p>
                <p class="text-[11px] font-medium opacity-60">POS transaction service fees, Bank transfer fees, and USSD session charges.</p>
              </div>
            </li>
            <li class="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <span class="text-emerald-500 font-bold">✓</span>
              <div class="space-y-1">
                <p class="text-sm font-bold tracking-tight">Maintenance</p>
                <p class="text-[11px] font-medium opacity-60">Card issuance, maintenance fees, and loan processing fees.</p>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            What is NOT taxed
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Savings</p>
              <p class="text-[11px] font-medium opacity-70">Interest earned on savings accounts.</p>
            </div>
            <div class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Principal</p>
              <p class="text-[11px] font-medium opacity-70">The actual amount of your transfers.</p>
            </div>
          </div>
        </section>

        <section class="p-6 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
          <div class="relative z-10 space-y-4">
            <h4 class="text-xs font-black uppercase tracking-[0.2em] opacity-50">Pro Tips to Save</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs">📱</div>
                <p class="text-xs font-medium">Use mobile apps instead of USSD for balance checks.</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs">📦</div>
                <p class="text-xs font-medium">Combine transactions to reduce the number of service fees.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: 'pending-transactions',
    title: "Understanding pending transactions and reversals",
    excerpt: "Why transitions stay pending and how our automated reversal system protects you.",
    category: "Security",
    icon: "⏳",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    content: `
      <p>A pending transaction is a payment that has been initiated but not fully completed or confirmed. This usually happens due to network delays or bank processing time.</p>
      
      <div class="space-y-8">
        <section>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Common Causes
          </h4>
          <div class="space-y-3">
            <div v-for="cause in ['Network interruptions', 'Bank switching delays (NIBSS)', 'Security verification checks']" class="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-primary/40"></span>
              <span class="text-sm font-medium opacity-80">{{ cause }}</span>
            </div>
            <p class="text-sm font-medium opacity-70 p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-primary/40"></span>
              Network interruptions, Bank switching delays (NIBSS), or Security verification checks.
            </p>
          </div>
        </section>

        <section>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Reversal Timelines
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-center space-y-1">
              <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Instant</p>
              <p class="text-lg font-black tracking-tight">0–30 Mins</p>
            </div>
            <div class="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-center space-y-1">
              <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Interbank</p>
              <p class="text-lg font-black tracking-tight">24 Hours</p>
            </div>
          </div>
        </section>

        <div class="p-6 bg-primary/5 border border-primary/10 rounded-[2.5rem] space-y-3">
          <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">What you should do</p>
          <p class="text-sm leading-relaxed opacity-80">Avoid retrying immediately to prevent duplicate debits. Check your history after 30 minutes; if the transaction failed, it will be reversed automatically.</p>
        </div>
      </div>
    `
  }
];
