var e={id:`summary-and-checklist`,h:{en:`Summary and exam checklist: AI data center design`,hi:`Summary aur exam checklist: AI data center design`},body:{en:`
<p>The design domain is only 5% of the exam, but it is made of questions you can win with clear definitions and simple arithmetic. This chapter collects everything in one place so you can revise it quickly.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Five design ideas in a row: three separate networks, node shorthand, scalable units, rails, fabric choice."><defs><marker id="ds" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="8" y="32" width="108" height="64" rx="8" fill="#bae6fd"/><text x="62" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 networks</text><text x="62" y="78" text-anchor="middle" class="svg-muted" font-size="11">kept separate</text><rect x="136" y="32" width="108" height="64" rx="8" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">Node</text><text x="190" y="78" text-anchor="middle" class="svg-muted" font-size="11">2-8-9-400</text><rect x="264" y="32" width="108" height="64" rx="8" fill="#ddd6fe"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="12">Scalable unit</text><text x="318" y="78" text-anchor="middle" class="svg-muted" font-size="11">4 servers</text><rect x="392" y="32" width="108" height="64" rx="8" fill="#fde68a"/><text x="446" y="60" text-anchor="middle" class="svg-ink" font-size="12">Rails</text><text x="446" y="78" text-anchor="middle" class="svg-muted" font-size="11">NIC n on rail n</text><rect x="520" y="32" width="112" height="64" rx="8" fill="#fed7aa"/><text x="576" y="60" text-anchor="middle" class="svg-ink" font-size="12">Fabric</text><text x="576" y="78" text-anchor="middle" class="svg-muted" font-size="11">IB or Spectrum-X</text><line x1="116" y1="64" x2="134" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#ds)"/><line x1="244" y1="64" x2="262" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#ds)"/><line x1="372" y1="64" x2="390" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#ds)"/><line x1="500" y1="64" x2="518" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#ds)"/></svg><p class="cap">The design domain in one line.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Name the parts of an AI factory network and say which of the three networks carries which traffic.</li>
<li>Decode 2-8-9-400 and 2-8-5-200.</li>
<li>Size a cluster in scalable units: servers, GPUs, NIC links and bandwidth.</li>
<li>Define a rail and explain why same-index traffic stays on one leaf.</li>
<li>Explain the difference between pure rail and rail-optimized, and say which is recommended.</li>
<li>Validate a rail design in four steps and name the signs of a miscabled rail.</li>
<li>State the blast-radius trade-off of rails.</li>
<li>Choose between InfiniBand and Spectrum-X Ethernet for a given customer and justify it.</li>
<li>Trace a GPU-to-GPU message in the same server, on the same rail and across rails.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>AI factory</dt><dd>A data center designed to train and serve models at scale.</dd><dt>Compute fabric</dt><dd>The east-west network that carries GPU-to-GPU RDMA traffic.</dd><dt>Scalable unit (SU)</dt><dd>The repeatable block, four servers in the reference designs.</dd><dt>Rail</dt><dd>The set of same-position NICs across servers, connected to one leaf.</dd><dt>Pure rail</dt><dd>No links between rails in scale-out; crossing uses NVLink.</dd><dt>Rail-optimized</dt><dd>Rails plus an upper tier so rails can be crossed through the spine.</dd><dt>Blast radius</dt><dd>How much of the cluster a single failure affects.</dd><dt>PXN</dt><dd>The NCCL habit of hopping over NVLink to the GPU on the right rail first.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Three networks</td><td>Compute fabric, storage and front-end, out-of-band management</td></tr>
<tr><td>HGX node</td><td>2-8-9-400: 2 CPUs, 8 GPUs, 9 NICs, 400 Gb/s each</td></tr>
<tr><td>RTX PRO node</td><td>2-8-5-200: 2 CPUs, 8 GPUs, 5 NICs, 200 Gb/s each</td></tr>
<tr><td>HGX Spectrum-X scale</td><td>SU is 4 servers; up to 32 SUs, 128 systems, 1,024 GPUs</td></tr>
<tr><td>RTX PRO scale</td><td>1 to 8 SUs, 4 to 32 nodes, 32 to 256 GPUs</td></tr>
<tr><td>Recommended topology</td><td>Rail-optimized, not pure rail</td></tr>
<tr><td>Validation rule</td><td>NIC n on rail n</td></tr>
<tr><td>Rail trade-off</td><td>A switch failure takes out a whole rail for its GPUs</td></tr></table>
<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td>lldpctl (host)</td><td>See which switch port each NIC is plugged into</td></tr>
<tr><td>ibnetdiscover, iblinkinfo</td><td>InfiniBand topology and link state</td></tr>
<tr><td>ib_write_lat</td><td>Compare same-rail and cross-rail latency</td></tr>
<tr><td>all_reduce_perf (nccl-tests)</td><td>Application-level check: compare busbw with line rate</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Memorising numbers without the logic. If you remember that an SU is four servers and a server has eight GPUs, every other figure follows by multiplication.</p></div>
<div class="exam"><p><b>Exam trap.</b> Several answers will be accurate for the wrong design. Check whether the question is about the HGX design (2-8-9-400, 32 SUs) or the RTX PRO design (2-8-5-200, 8 SUs) before you pick.</p></div>
<div class="scn"><h4>Quote for 192 GPUs</h4><p>A customer asked for 192 GPUs on the HGX Spectrum-X design. The engineer worked it out: 192 / 32 GPUs per SU = 6 SUs, which is 24 servers and 192 compute NIC links, or 76.8 Tb/s of compute bandwidth at 400 Gb/s each. Before ordering, the leaf and spine counts were checked against the reference architecture.</p><p><b>Lesson:</b> Work the arithmetic from the SU, then confirm the switch count against the reference design.</p></div>
<div class="iv"><p class="q">"Walk me through designing the network for a 128-server AI cluster."</p><p>I start with the three networks: a compute fabric for GPU RDMA, a storage and front-end network, and out-of-band management. The node is 2-8-9-400, so eight compute NICs per server and a ninth for the DPU. 128 servers is 32 scalable units and 1,024 GPUs. I would use a rail-optimized compute fabric with NIC n of every server on rail n, an upper tier for cross-rail traffic, and a fabric choice based on operations and tenancy: InfiniBand for a dedicated training cluster, Spectrum-X Ethernet for a shared AI cloud. After cabling I validate the rails.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Three networks stay separate; the compute fabric is judged by job completion time.</li><li>Decode 2-8-9-400 and 2-8-5-200, and size clusters in four-server scalable units.</li><li>A rail connects the same-position NIC of every server to one leaf; rail-optimized adds an upper tier and is recommended.</li><li>Validate NIC n on rail n; accept the blast-radius trade-off with redundancy and monitoring.</li><li>Choose InfiniBand or Spectrum-X by operations, tenancy, skills and workload mix.</li></ul></div>
`,hi:`
<p>Design domain exam ka sirf 5% hai, lekin yeh aise sawalon se bana hai jo saaf definitions aur simple arithmetic se jeete ja sakte hain. Yeh chapter sab kuch ek jagah jama karta hai taaki aap jaldi revise kar sako.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Ek row mein paanch design ideas: teen alag networks, node shorthand, scalable units, rails, fabric choice."><defs><marker id="dh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="8" y="32" width="108" height="64" rx="8" fill="#bae6fd"/><text x="62" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 networks</text><text x="62" y="78" text-anchor="middle" class="svg-muted" font-size="11">alag rakhe jaate hain</text><rect x="136" y="32" width="108" height="64" rx="8" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">Node</text><text x="190" y="78" text-anchor="middle" class="svg-muted" font-size="11">2-8-9-400</text><rect x="264" y="32" width="108" height="64" rx="8" fill="#ddd6fe"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="12">Scalable unit</text><text x="318" y="78" text-anchor="middle" class="svg-muted" font-size="11">4 servers</text><rect x="392" y="32" width="108" height="64" rx="8" fill="#fde68a"/><text x="446" y="60" text-anchor="middle" class="svg-ink" font-size="12">Rails</text><text x="446" y="78" text-anchor="middle" class="svg-muted" font-size="11">NIC n on rail n</text><rect x="520" y="32" width="112" height="64" rx="8" fill="#fed7aa"/><text x="576" y="60" text-anchor="middle" class="svg-ink" font-size="12">Fabric</text><text x="576" y="78" text-anchor="middle" class="svg-muted" font-size="11">IB ya Spectrum-X</text><line x1="116" y1="64" x2="134" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#dh)"/><line x1="244" y1="64" x2="262" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#dh)"/><line x1="372" y1="64" x2="390" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#dh)"/><line x1="500" y1="64" x2="518" y2="64" stroke="#64748b" stroke-width="2" marker-end="url(#dh)"/></svg><p class="cap">Design domain ek line mein.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>AI factory network ke parts ke naam batao aur kaho ki teen networks mein se kaun sa kaun sa traffic carry karta hai.</li>
<li>2-8-9-400 aur 2-8-5-200 decode karo.</li>
<li>Cluster ko scalable units mein size karo: servers, GPUs, NIC links aur bandwidth.</li>
<li>Rail define karo aur samjhao ki same-index traffic ek leaf par kyun rehta hai.</li>
<li>Pure rail aur rail-optimized ka fark samjhao, aur batao kaun sa recommended hai.</li>
<li>Rail design ko chaar steps mein validate karo aur miscabled rail ki nishaniyan batao.</li>
<li>Rails ka blast-radius trade-off batao.</li>
<li>Diye gaye customer ke liye InfiniBand aur Spectrum-X Ethernet mein se chuno aur kaaran batao.</li>
<li>Same server mein, same rail par aur rails ke across GPU-to-GPU message trace karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>AI factory</dt><dd>Data center jo scale par models train aur serve karne ke liye design hota hai.</dd><dt>Compute fabric</dt><dd>East-west network jo GPU-to-GPU RDMA traffic carry karta hai.</dd><dt>Scalable unit (SU)</dt><dd>Repeatable block, reference designs mein chaar servers.</dd><dt>Rail</dt><dd>Servers ke across same-position NICs ka set, ek leaf se jude hue.</dd><dt>Pure rail</dt><dd>Scale-out mein rails ke beech links nahi; crossing NVLink se.</dd><dt>Rail-optimized</dt><dd>Rails plus upper tier taaki rails ko spine se cross kiya ja sake.</dd><dt>Blast radius</dt><dd>Ek failure cluster ke kitne hisse ko affect karta hai.</dd><dt>PXN</dt><dd>NCCL ki aadat: pehle NVLink se sahi rail wale GPU tak hop karna.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Teen networks</td><td>Compute fabric, storage aur front-end, out-of-band management</td></tr>
<tr><td>HGX node</td><td>2-8-9-400: 2 CPUs, 8 GPUs, 9 NICs, har ek 400 Gb/s</td></tr>
<tr><td>RTX PRO node</td><td>2-8-5-200: 2 CPUs, 8 GPUs, 5 NICs, har ek 200 Gb/s</td></tr>
<tr><td>HGX Spectrum-X scale</td><td>SU 4 servers; 32 SUs, 128 systems, 1,024 GPUs tak</td></tr>
<tr><td>RTX PRO scale</td><td>1 se 8 SUs, 4 se 32 nodes, 32 se 256 GPUs</td></tr>
<tr><td>Recommended topology</td><td>Rail-optimized, pure rail nahi</td></tr>
<tr><td>Validation rule</td><td>NIC n on rail n</td></tr>
<tr><td>Rail trade-off</td><td>Switch failure apne GPUs ke liye poori rail gira deta hai</td></tr></table>
<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td>lldpctl (host)</td><td>Dekho har NIC kaun se switch port mein laga hai</td></tr>
<tr><td>ibnetdiscover, iblinkinfo</td><td>InfiniBand topology aur link state</td></tr>
<tr><td>ib_write_lat</td><td>Same-rail aur cross-rail latency compare karo</td></tr>
<tr><td>all_reduce_perf (nccl-tests)</td><td>Application-level check: busbw ko line rate se compare karo</td></tr></table>
<div class="warn"><p><b>Aam galti.</b> Logic ke bina numbers yaad karna. Agar yaad hai ki SU chaar servers ka hai aur server mein aath GPUs hain, to baaki har figure multiplication se nikalta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kai answers galat design ke liye sahi honge. Option chunne se pehle check karo ki sawal HGX design (2-8-9-400, 32 SUs) ke baare mein hai ya RTX PRO design (2-8-5-200, 8 SUs) ke.</p></div>
<div class="scn"><h4>192 GPUs ka quote</h4><p>Ek customer ne HGX Spectrum-X design par 192 GPUs maange. Engineer ne hisaab lagaya: 192 / 32 GPUs per SU = 6 SUs, yaani 24 servers aur 192 compute NIC links, ya har ek 400 Gb/s par 76.8 Tb/s compute bandwidth. Order se pehle leaf aur spine counts ko reference architecture se check kiya gaya.</p><p><b>Lesson:</b> Arithmetic SU se nikalo, phir switch count ko reference design se confirm karo.</p></div>
<div class="iv"><p class="q">"128-server AI cluster ka network design karna mujhe samjhao."</p><p>Main teen networks se shuru karta hoon: GPU RDMA ke liye compute fabric, storage aur front-end network, aur out-of-band management. Node 2-8-9-400 hai, yaani har server mein aath compute NICs aur nauva DPU ke liye. 128 servers matlab 32 scalable units aur 1,024 GPUs. Main rail-optimized compute fabric use karunga jisme har server ka NIC n rail n par ho, cross-rail traffic ke liye upper tier, aur fabric choice operations aur tenancy par: dedicated training cluster ke liye InfiniBand, shared AI cloud ke liye Spectrum-X Ethernet. Cabling ke baad main rails validate karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Teen networks alag rehte hain; compute fabric ko job completion time se aanka jaata hai.</li><li>2-8-9-400 aur 2-8-5-200 decode karo, aur clusters ko chaar-server ke scalable units mein size karo.</li><li>Rail har server ke same-position NIC ko ek leaf se jodti hai; rail-optimized upper tier jodta hai aur recommended hai.</li><li>NIC n on rail n validate karo; blast-radius trade-off ko redundancy aur monitoring se sambhalo.</li><li>InfiniBand ya Spectrum-X operations, tenancy, skills aur workload mix se chuno.</li></ul></div>
`}};export{e as default};