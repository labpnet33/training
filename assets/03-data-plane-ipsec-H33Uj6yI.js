var e={id:`data-plane-ipsec`,h:{en:`Data plane security: IPsec, AES-256-GCM and key rotation`,hi:`Data plane security: IPsec, AES-256-GCM aur key rotation`},body:{en:`
<p>User traffic between WAN Edges crosses networks you do not own: the internet, a provider MPLS cloud, a 5G link. The SD-WAN data plane protects it with <b>IPsec</b>. In this chapter you learn how the keys are created and distributed, what the default algorithms are, how rotation and anti-replay work, and how to verify and tune them safely.</p>

<h3>Analogy: sealed courier bags with a changing lock</h3>
<p>Imagine every parcel between two offices travels in a sealed bag. Each pair of offices uses a lock, and the lock combination changes every day. If someone photographs a parcel and tries to send it again later, the receiving office notices it has seen that serial number before and rejects it. The sealed bag is <b>encryption and integrity</b>; the daily change is <b>rekeying</b>; the serial number check is <b>anti-replay</b>.</p>

<h3>How the keys are created</h3>
<p>Classic IPsec uses IKE to negotiate keys between each pair of devices, which does not scale to hundreds of branches. Catalyst SD-WAN replaces it with the control plane. Each WAN Edge generates its own symmetric key for each transport and sends it to the Controller inside the encrypted control connection (as part of its OMP TLOC information). The Controller distributes that key to the other WAN Edges that are allowed to build tunnels to it. The data tunnels are then plain IPsec ESP, with no IKE exchange per pair.</p>
<table class="cmp"><tr><th>Design</th><th>How keys work</th><th>Effect</th></tr>
<tr><td><b>Default</b></td><td>One key per transport (TLOC) is advertised and used by all peers that send to it</td><td>Scales well, small control-plane load</td></tr>
<tr><td><b>Pairwise keying</b> (optional)</td><td>A separate key per pair of edges</td><td>Stronger isolation between peers, more keys to manage; off by default</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Key distribution through the Controller">
<rect x="20" y="150" width="120" height="55" rx="8" fill="#bae6fd"/><text x="80" y="174" text-anchor="middle" class="svg-ink" font-size="13">E-BR1 (Pune)</text><text x="80" y="192" text-anchor="middle" class="svg-muted" font-size="11">makes its key</text>
<rect x="500" y="150" width="120" height="55" rx="8" fill="#bae6fd"/><text x="560" y="174" text-anchor="middle" class="svg-ink" font-size="13">E-DC (Mumbai)</text><text x="560" y="192" text-anchor="middle" class="svg-muted" font-size="11">makes its key</text>
<rect x="240" y="20" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">VSMART</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">distributes keys</text>
<line x1="80" y1="150" x2="260" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="560" y1="150" x2="380" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="178" x2="500" y2="178" stroke="#16a34a" stroke-width="4"/><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">IPsec ESP, AES-256-GCM</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="11">dashed: encrypted control connections; solid: data tunnel</text>
</svg><p class="cap">Keys travel through the encrypted control plane. The data tunnel needs no per-pair IKE negotiation.</p></div>

<h3>Algorithms and the integrity setting</h3>
<p>The default is <b>ESP with AES-256-GCM</b>, an authenticated encryption mode: one algorithm provides both confidentiality and integrity. The <code>integrity-type</code> option decides which parts of the packet are covered by the integrity check, with these values:</p>
<table class="cmp"><tr><th>Value</th><th>Meaning</th></tr>
<tr><td><code>esp</code></td><td>ESP encryption with integrity of the ESP header and payload (default)</td></tr>
<tr><td><code>ip-udp-esp</code></td><td>Also protects the outer IP and UDP headers with integrity (used in some designs)</td></tr>
<tr><td><code>ip-udp-esp-no-id</code></td><td>Same, but ignores the IP ID field, which helps when a device along the path rewrites it</td></tr>
<tr><td><code>none</code></td><td>No integrity check; used only to test, never in production</td></tr></table>
<p>The configuration lives under the security parameters (a Manager security feature template, or CLI):</p>
<pre class="code">security ipsec rekey 86400
security ipsec replay-window 512
security ipsec integrity-type esp</pre>

<h3>Rekey</h3>
<p>Keys are replaced regularly. The default <b>rekey interval is 86400 seconds (24 hours)</b>, configurable from 10 seconds to 730 days. When the timer expires, the edge generates a new key, sends it through the Controller, and keeps the old key for a short time so traffic is not lost during the change. You can force an immediate rotation, for example after a suspected exposure:</p>
<pre class="code">request platform software sdwan security ipsec-rekey</pre>
<p>Shorter intervals reduce the value of any single captured key but increase control-plane churn; for large fabrics keep the default unless policy demands otherwise.</p>

<h3>Anti-replay</h3>
<p>Each ESP packet carries a sequence number. The receiver accepts numbers within a sliding <b>replay window</b> and drops old or duplicate ones. The default window is <b>512</b> packets; allowed values are 64, 128, 256, 512, 1024, 2048, 4096 and 8192. A path that reorders packets heavily, such as one with QoS queues on a congested link, can cause legitimate packets to fall outside a small window and be dropped as replays. In that case a larger window helps. Do not remove the feature; increase the window.</p>

<div class="eg"><p><b>Worked example.</b> Pune sends ERP traffic to Mumbai over a congested MPLS link with priority queues. Users report slowness and E-BR1 shows anti-replay drops on that tunnel. The engineer raises the replay window from 512 to 2048 for the domain, keeping encryption and integrity unchanged. Drops stop, and no security feature was removed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting integrity to none to "fix" a problem. (2) Setting an extremely short rekey on all devices and flooding the Controller. (3) Disabling anti-replay instead of enlarging the window. (4) Assuming all tunnels use the same key; keys are per transport (or per pair with pairwise keying). (5) Believing the data plane uses IKE; keys come from the control plane.</p></div>

<div class="exam"><p><b>Exam trap.</b> Defaults to remember: AES-256-GCM, rekey 86400 seconds, replay window 512, integrity-type esp. Keys are exchanged through the Controller over the control connection, and pairwise keying is optional and off by default.</p></div>

<div class="scn"><h4>Intermittent drops on one tunnel</h4><p>The Nashik kiosk reports slow ERP only on the MPLS tunnel. The anti-replay counters on E-BR1 increase. A provider QoS change reordered packets. After increasing the replay window and fixing the queue, the drops disappear.</p><p><b>Lesson:</b> read the counters before you touch the security features.</p></div>

<div class="iv"><p class="q">"How is SD-WAN data plane traffic secured and how are keys managed?"</p><p>Traffic between WAN Edges uses IPsec ESP, by default AES-256-GCM. Each edge creates its key per transport and sends it through the encrypted control connection to the Controller, which distributes it to peers, so there is no per-pair IKE. Keys rotate every 86400 seconds by default and can be rekeyed on demand with a request command. Anti-replay uses a window, 512 by default, and pairwise keying is an optional stronger mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane = IPsec ESP with AES-256-GCM by default.</li>
<li>Keys are created by edges and distributed by the Controller; no IKE per pair.</li>
<li>Rekey default 86400 seconds; replay window default 512; pairwise keying optional.</li>
<li>Integrity types: esp, ip-udp-esp, ip-udp-esp-no-id, none (never in production).</li>
<li>On-demand rotation: <code>request platform software sdwan security ipsec-rekey</code>.</li>
</ul></div>
`,hi:`
<p>WAN Edges ke beech user traffic aise networks se guzarta hai jinke aap malik nahi: internet, provider ka MPLS cloud, 5G link. SD-WAN data plane use <b>IPsec</b> se protect karta hai. Is chapter mein seekhoge ki keys kaise bante aur distribute hote hain, default algorithms kya hain, rotation aur anti-replay kaise chalte hain, aur unhe safely verify aur tune kaise karna hai.</p>

<h3>Analogy: badalte lock wale sealed courier bags</h3>
<p>Socho do offices ke beech har parcel sealed bag mein jaata hai. Har pair of offices ek lock use karta hai, aur lock ka combination roz badalta hai. Agar koi parcel ki photo khinch kar baad mein use dobara bheje, to receiving office dekhta hai ki yeh serial number pehle dekha hua hai aur reject kar deta hai. Sealed bag <b>encryption aur integrity</b> hai; roz ka badlav <b>rekeying</b> hai; serial number check <b>anti-replay</b> hai.</p>

<h3>Keys kaise bante hain</h3>
<p>Classic IPsec har pair of devices ke beech keys negotiate karne ke liye IKE use karta hai, jo sainkdon branches par scale nahi karta. Catalyst SD-WAN ise control plane se replace karta hai. Har WAN Edge har transport ke liye apni symmetric key banata hai aur use encrypted control connection ke andar Controller ko bhejta hai (apni OMP TLOC information ke hisse ke roop mein). Controller woh key un doosre WAN Edges ko distribute karta hai jinhe uske saath tunnel banane ki ijazat hai. Data tunnels phir seedhe IPsec ESP hote hain, per pair IKE exchange ke bina.</p>
<table class="cmp"><tr><th>Design</th><th>Keys kaise kaam karti hain</th><th>Asar</th></tr>
<tr><td><b>Default</b></td><td>Har transport (TLOC) ki ek key advertise hoti hai aur use bhejne wale saare peers use karte hain</td><td>Achche se scale hota hai, control-plane load chhota</td></tr>
<tr><td><b>Pairwise keying</b> (optional)</td><td>Edges ki har jodi ke liye alag key</td><td>Peers ke beech stronger isolation, zyada keys manage karni padti hain; default off</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Controller ke through key distribution">
<rect x="20" y="150" width="120" height="55" rx="8" fill="#bae6fd"/><text x="80" y="174" text-anchor="middle" class="svg-ink" font-size="13">E-BR1 (Pune)</text><text x="80" y="192" text-anchor="middle" class="svg-muted" font-size="11">apni key banata hai</text>
<rect x="500" y="150" width="120" height="55" rx="8" fill="#bae6fd"/><text x="560" y="174" text-anchor="middle" class="svg-ink" font-size="13">E-DC (Mumbai)</text><text x="560" y="192" text-anchor="middle" class="svg-muted" font-size="11">apni key banata hai</text>
<rect x="240" y="20" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">VSMART</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">keys distribute karta hai</text>
<line x1="80" y1="150" x2="260" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="560" y1="150" x2="380" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="178" x2="500" y2="178" stroke="#16a34a" stroke-width="4"/><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">IPsec ESP, AES-256-GCM</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="11">dashed: encrypted control connections; solid: data tunnel</text>
</svg><p class="cap">Keys encrypted control plane se guzarti hain. Data tunnel ko per-pair IKE negotiation nahi chahiye.</p></div>

<h3>Algorithms aur integrity setting</h3>
<p>Default <b>AES-256-GCM ke saath ESP</b> hai, jo authenticated encryption mode hai: ek hi algorithm confidentiality aur integrity dono deta hai. <code>integrity-type</code> option tay karta hai ki packet ke kaunse hisse integrity check mein aate hain, in values ke saath:</p>
<table class="cmp"><tr><th>Value</th><th>Matlab</th></tr>
<tr><td><code>esp</code></td><td>ESP header aur payload ki integrity ke saath ESP encryption (default)</td></tr>
<tr><td><code>ip-udp-esp</code></td><td>Outer IP aur UDP headers ko bhi integrity se protect karta hai (kuch designs mein use)</td></tr>
<tr><td><code>ip-udp-esp-no-id</code></td><td>Wahi, lekin IP ID field ignore karta hai, jo tab kaam aata hai jab raste ka koi device use rewrite kare</td></tr>
<tr><td><code>none</code></td><td>Koi integrity check nahi; sirf testing ke liye, production mein kabhi nahi</td></tr></table>
<p>Configuration security parameters ke andar hoti hai (Manager security feature template, ya CLI):</p>
<pre class="code">security ipsec rekey 86400
security ipsec replay-window 512
security ipsec integrity-type esp</pre>

<h3>Rekey</h3>
<p>Keys regularly badli jaati hain. Default <b>rekey interval 86400 seconds (24 ghante)</b> hai, 10 seconds se 730 din tak configurable. Timer expire hone par edge nayi key banata hai, Controller ke through bhejta hai, aur change ke dauran traffic na khoye isliye purani key thodi der rakhta hai. Suspected exposure ke baad turant rotation force kar sakte ho:</p>
<pre class="code">request platform software sdwan security ipsec-rekey</pre>
<p>Chhote intervals kisi ek capture ki gayi key ki value kam karte hain lekin control-plane churn badhate hain; bade fabrics mein policy ki maang ho tabhi default se badlo.</p>

<h3>Anti-replay</h3>
<p>Har ESP packet sequence number rakhta hai. Receiver sliding <b>replay window</b> ke andar ke numbers accept karta hai aur purane ya duplicate drop karta hai. Default window <b>512</b> packets hai; allowed values 64, 128, 256, 512, 1024, 2048, 4096 aur 8192 hain. Jo path packets ko zyada reorder karta hai, jaise congested link par QoS queues, wahan chhote window mein legitimate packets bahar gir kar replay ke naam par drop ho sakte hain. Aisi halat mein bada window madad karta hai. Feature hatao mat; window badhao.</p>

<div class="eg"><p><b>Worked example.</b> Pune ERP traffic ko priority queues wale congested MPLS link se Mumbai bhejta hai. Users slowness batate hain aur E-BR1 us tunnel par anti-replay drops dikhata hai. Engineer domain ke liye replay window 512 se 2048 karta hai, encryption aur integrity jaise ke taise. Drops ruk jaate hain, aur koi security feature nahi hataya gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Problem "fix" karne ke liye integrity none karna. (2) Saare devices par bahut chhota rekey lagakar Controller par bojh daalna. (3) Window badhane ke bajaye anti-replay disable karna. (4) Maan lena ki saare tunnels ek hi key use karte hain; keys per transport hoti hain (ya pairwise keying mein per pair). (5) Sochna ki data plane IKE use karta hai; keys control plane se aati hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Yaad rakhne wale defaults: AES-256-GCM, rekey 86400 seconds, replay window 512, integrity-type esp. Keys Controller ke through control connection par exchange hoti hain, aur pairwise keying optional aur default off hai.</p></div>

<div class="scn"><h4>Ek tunnel par intermittent drops</h4><p>Nashik kiosk sirf MPLS tunnel par slow ERP batata hai. E-BR1 par anti-replay counters badhte hain. Provider ke QoS change ne packets reorder kiye. Replay window badhane aur queue theek karne ke baad drops gayab ho gaye.</p><p><b>Lesson:</b> security features ko chhoone se pehle counters padho.</p></div>

<div class="iv"><p class="q">"SD-WAN data plane traffic kaise secure hota hai aur keys kaise manage hoti hain?"</p><p>WAN Edges ke beech traffic IPsec ESP use karta hai, default AES-256-GCM. Har edge apni key per transport banata hai aur encrypted control connection se Controller ko bhejta hai, jo use peers ko distribute karta hai, isliye per-pair IKE nahi hota. Keys default 86400 seconds mein rotate hoti hain aur request command se on-demand rekey ho sakti hain. Anti-replay window use karta hai, default 512, aur pairwise keying optional stronger mode hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane = default AES-256-GCM ke saath IPsec ESP.</li>
<li>Keys edges banate hain aur Controller distribute karta hai; per pair IKE nahi.</li>
<li>Rekey default 86400 seconds; replay window default 512; pairwise keying optional.</li>
<li>Integrity types: esp, ip-udp-esp, ip-udp-esp-no-id, none (production mein kabhi nahi).</li>
<li>On-demand rotation: <code>request platform software sdwan security ipsec-rekey</code>.</li>
</ul></div>
`}};export{e as default};