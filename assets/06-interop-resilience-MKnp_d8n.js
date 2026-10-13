var e={id:`interop-resilience`,h:{en:`Proxy IDs, NAT traversal, MTU and tunnel monitoring`,hi:`Proxy IDs, NAT traversal, MTU aur tunnel monitoring`},body:{en:`
<p>The tunnel works between two Palo Alto firewalls in the lab. Real life adds other vendors, NAT devices, odd MTUs and failures nobody noticed. This chapter covers the interop and resilience details: <b>proxy IDs</b>, <b>NAT traversal</b>, <b>MTU and MSS</b>, <b>dead-peer detection and tunnel monitoring</b>, and how IPsec behaves with HA and dynamic peers.</p>

<h3>Proxy IDs: the traffic selectors</h3>
<p>A policy-based peer (for example a Cisco ASA or an older FortiGate setup) decides what to encrypt using an access list, and offers it during phase 2 as a pair of subnets. On the wire these are called <b>proxy IDs</b> (IKEv1) or <b>traffic selectors</b> (IKEv2). They must match on both sides, mirrored: the local subnet at one end is the remote subnet at the other.</p>
<ul>
<li>Between two PAN-OS firewalls the default proxy ID is any to any (0.0.0.0/0), and you do not configure anything.</li>
<li>Toward a policy-based peer, add a <b>proxy ID</b> on the IPsec tunnel with local subnet, remote subnet and protocol, matching the peer's access list exactly.</li>
<li>Several subnet pairs mean several proxy IDs, and each one creates its own IPsec SA.</li>
</ul>
<p>The clue for a mismatch: phase 1 is up, phase 2 fails, and the system log mentions a proxy ID or traffic selector problem.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Proxy IDs mirrored">
<rect x="20" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="14">PAN-OS (HQ)</text><text x="120" y="96" text-anchor="middle" class="svg-muted" font-size="12">proxy ID local 10.10.0.0/16</text><text x="120" y="118" text-anchor="middle" class="svg-muted" font-size="12">remote 10.20.0.0/16</text>
<rect x="420" y="40" width="200" height="110" rx="10" fill="#fde68a"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="14">Policy-based peer</text><text x="520" y="96" text-anchor="middle" class="svg-muted" font-size="12">ACL source 10.20.0.0/16</text><text x="520" y="118" text-anchor="middle" class="svg-muted" font-size="12">ACL destination 10.10.0.0/16</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">must mirror exactly</text>
</svg><p class="cap">One side's local is the other side's remote.</p></div>

<h3>NAT traversal</h3>
<p>If a NAT device sits between the peers (for example a branch behind an ISP router), plain ESP breaks because NAT cannot track it. <b>NAT traversal</b> (NAT-T) detects the NAT during IKE and moves to UDP port 4500, wrapping ESP inside UDP. Enable it in the IKE gateway when either peer may be behind NAT. Also remember that the identities may need to be FQDN or key ID rather than the private IP that the NAT hides.</p>

<h3>MTU and MSS</h3>
<p>IPsec adds overhead (ESP header, trailer, new IP header, and UDP if NAT-T is used). A 1500-byte packet from a user will not fit once wrapped. Symptoms of an MTU problem are classic: ping and small web pages work, big file transfers and some HTTPS sites stall. Fixes:</p>
<ul>
<li>Set a lower <b>MTU on the tunnel interface</b> (commonly around 1400, tune from your path).</li>
<li>Use <b>Adjust TCP MSS</b> on the relevant Layer 3 interface so TCP sessions negotiate a segment size that fits.</li>
<li>Allow ICMP "fragmentation needed" messages so path MTU discovery works, and keep an eye on the Don't Fragment bit.</li>
</ul>

<h3>Dead peer detection, liveness and tunnel monitoring</h3>
<p>A silently dead peer leaves your side holding stale SAs. In IKEv1 the answer is <b>DPD</b>, and in IKEv2 the <b>liveness check</b>; both are settings on the IKE gateway with an interval and retry count. The IPsec tunnel's <b>tunnel monitor</b> goes one level up: it pings an IP inside the tunnel and either waits and recovers or fails over by withdrawing the tunnel's routes so a backup tunnel takes over. Use the monitor with a backup path to build resilient VPNs.</p>

<h3>Dynamic peers and HA</h3>
<ul>
<li><b>Branch with a changing IP</b>: configure the hub's peer address as dynamic and use FQDN or key ID identification; let the branch initiate and set the hub to passive mode.</li>
<li><b>HA pairs</b>: the IKE gateway listens on an interface address that moves with the active unit. Phase 2 SAs are synchronised; phase 1 renegotiates after failover (see pan-ha). A short interruption is normal.</li>
<li><b>Multiple tunnels</b>: use separate tunnel interfaces, with routing metrics or dynamic routing to choose the primary and backup.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A bank branch connects to HQ over a PAN-OS tunnel. Everything works until staff open large PDFs from an HQ share: they stall at about 1400 bytes into each transfer. The engineer sets the tunnel interface MTU to 1400 and turns on TCP MSS adjustment on the branch LAN interface. Transfers finish normally.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Entering a proxy ID that is not the mirror image of the peer's. A /16 on one side and a /24 on the other negotiates nothing or only a partial SA. Copy the peer's access list and invert it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Between PAN-OS firewalls, proxy IDs are not required. Toward policy-based peers they must be exact mirrors. NAT traversal uses UDP 4500. DPD is IKEv1 terminology; liveness check is IKEv2.</p></div>

<div class="scn"><h4>Works for ping, fails for downloads</h4><p>A new tunnel to a partner passed every ping test, yet the partner portal over HTTPS timed out. Captures showed full-size packets disappearing. The partner's ISP link had a smaller MTU. Setting the tunnel MTU and TCP MSS fixed the portal immediately.</p><p><b>Lesson:</b> test with large packets, not only small pings.</p></div>

<div class="iv"><p class="q">"What are proxy IDs and when do you configure them?"</p><p>They are the local and remote subnets (and protocol) the two peers offer for the IPsec SA, also called traffic selectors. Between PAN-OS firewalls the default is any to any and nothing is needed. When the peer is policy-based, I configure proxy IDs that mirror the peer's crypto access list, one per subnet pair; a mismatch shows as phase 2 failing while phase 1 is up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Proxy IDs must mirror the peer's selectors; not needed between two PAN-OS firewalls.</li>
<li>NAT-T moves ESP into UDP 4500.</li>
<li>MTU and MSS problems: pings fine, large transfers stall.</li>
<li>DPD or liveness plus tunnel monitor give faster failure detection and failover.</li>
<li>Dynamic and HA setups need identity choice, passive mode and patience for renegotiation.</li>
</ul></div>
`,hi:`
<p>Lab mein do Palo Alto firewalls ke beech tunnel chal jaata hai. Asli duniya mein doosre vendors, NAT devices, ajeeb MTUs aur aisi failures aati hain jinhe kisi ne notice nahi kiya. Yeh chapter interop aur resilience ki details cover karta hai: <b>proxy IDs</b>, <b>NAT traversal</b>, <b>MTU aur MSS</b>, <b>dead-peer detection aur tunnel monitoring</b>, aur IPsec HA aur dynamic peers ke saath kaise behave karta hai.</p>

<h3>Proxy IDs: traffic selectors</h3>
<p>Policy-based peer (jaise Cisco ASA ya purana FortiGate setup) access list se tay karta hai ki kya encrypt hoga, aur use phase 2 mein subnets ki jodi ke roop mein offer karta hai. Wire par inhe <b>proxy IDs</b> (IKEv1) ya <b>traffic selectors</b> (IKEv2) kehte hain. Inhe dono sides par match karna padta hai, mirrored: ek end ka local subnet doosre end ka remote subnet hota hai.</p>
<ul>
<li>Do PAN-OS firewalls ke beech default proxy ID any to any (0.0.0.0/0) hai, aur kuch configure nahi karna padta.</li>
<li>Policy-based peer ki taraf IPsec tunnel par local subnet, remote subnet aur protocol ke saath <b>proxy ID</b> jodo, jo peer ki access list se bilkul match kare.</li>
<li>Kai subnet pairs ka matlab kai proxy IDs, aur har ek apna IPsec SA banata hai.</li>
</ul>
<p>Mismatch ka clue: phase 1 up hai, phase 2 fail hota hai, aur system log mein proxy ID ya traffic selector problem ka zikr hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Proxy IDs mirrored">
<rect x="20" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="120" y="68" text-anchor="middle" class="svg-ink" font-size="14">PAN-OS (HQ)</text><text x="120" y="96" text-anchor="middle" class="svg-muted" font-size="12">proxy ID local 10.10.0.0/16</text><text x="120" y="118" text-anchor="middle" class="svg-muted" font-size="12">remote 10.20.0.0/16</text>
<rect x="420" y="40" width="200" height="110" rx="10" fill="#fde68a"/><text x="520" y="68" text-anchor="middle" class="svg-ink" font-size="14">Policy-based peer</text><text x="520" y="96" text-anchor="middle" class="svg-muted" font-size="12">ACL source 10.20.0.0/16</text><text x="520" y="118" text-anchor="middle" class="svg-muted" font-size="12">ACL destination 10.10.0.0/16</text>
<line x1="220" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">bilkul mirror honi chahiye</text>
</svg><p class="cap">Ek side ka local doosri side ka remote hai.</p></div>

<h3>NAT traversal</h3>
<p>Agar peers ke beech NAT device hai (jaise ISP router ke peeche branch), to plain ESP toot jaata hai kyunki NAT use track nahi kar sakta. <b>NAT traversal</b> (NAT-T) IKE ke dauraan NAT detect karta hai aur UDP port 4500 par chala jaata hai, ESP ko UDP ke andar wrap karke. Jab bhi koi peer NAT ke peeche ho sakta hai, ise IKE gateway mein enable karo. Yeh bhi yaad rakho ki identities FQDN ya key ID rakhni pad sakti hain, us private IP ki jagah jo NAT chhupa deta hai.</p>

<h3>MTU aur MSS</h3>
<p>IPsec overhead jodta hai (ESP header, trailer, naya IP header, aur NAT-T ho to UDP). User ka 1500-byte packet wrap hone ke baad fit nahi hota. MTU problem ke symptoms classic hain: ping aur chhote web pages chalte hain, bade file transfers aur kuch HTTPS sites atak jaate hain. Fixes:</p>
<ul>
<li><b>Tunnel interface par MTU</b> kam karo (aam taur par 1400 ke aas-paas, apne path se tune karo).</li>
<li>Sambandhit Layer 3 interface par <b>Adjust TCP MSS</b> use karo taaki TCP sessions aisa segment size negotiate karein jo fit ho.</li>
<li>ICMP "fragmentation needed" messages allow karo taaki path MTU discovery chale, aur Don't Fragment bit par nazar rakho.</li>
</ul>

<h3>Dead peer detection, liveness aur tunnel monitoring</h3>
<p>Chupchaap mara hua peer aapki side par stale SAs chhod deta hai. IKEv1 mein iska jawab <b>DPD</b> hai, aur IKEv2 mein <b>liveness check</b>; dono IKE gateway ki settings hain, interval aur retry count ke saath. IPsec tunnel ka <b>tunnel monitor</b> ek star upar kaam karta hai: woh tunnel ke andar ek IP ping karta hai aur ya to wait-recover karta hai ya tunnel ke routes hatakar fail over karta hai taaki backup tunnel le le. Resilient VPNs banane ke liye monitor ko backup path ke saath use karo.</p>

<h3>Dynamic peers aur HA</h3>
<ul>
<li><b>Badalte IP wala branch</b>: hub ka peer address dynamic rakho aur FQDN ya key ID identification use karo; branch ko initiate karne do aur hub ko passive mode par set karo.</li>
<li><b>HA pairs</b>: IKE gateway aise interface address par sunta hai jo active unit ke saath move karta hai. Phase 2 SAs synchronise hote hain; failover ke baad phase 1 dobara negotiate hota hai (pan-ha dekho). Chhota interruption normal hai.</li>
<li><b>Kai tunnels</b>: alag tunnel interfaces use karo, aur primary aur backup chunne ke liye routing metrics ya dynamic routing.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek bank branch PAN-OS tunnel se HQ se jura hai. Sab kuch chalta hai jab tak staff HQ share se bade PDFs nahi kholte: har transfer lagbhag 1400 bytes par atak jaata hai. Engineer tunnel interface MTU 1400 set karta hai aur branch LAN interface par TCP MSS adjustment on karta hai. Transfers normal tarah se khatam hote hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aisa proxy ID dalna jo peer ka mirror image nahi hai. Ek side par /16 aur doosri par /24 kuch negotiate nahi karta ya sirf aanshik SA banata hai. Peer ki access list copy karo aur ulti karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS firewalls ke beech proxy IDs zaroori nahi. Policy-based peers ki taraf woh exact mirrors hone chahiye. NAT traversal UDP 4500 use karta hai. DPD IKEv1 ki terminology hai; liveness check IKEv2 ki.</p></div>

<div class="scn"><h4>Ping ke liye chalta hai, downloads ke liye fail</h4><p>Ek partner ka naya tunnel har ping test pass kar gaya, lekin HTTPS par partner portal time out hota raha. Captures mein full-size packets gayab hote dikhe. Partner ke ISP link ka MTU chhota tha. Tunnel MTU aur TCP MSS set karne se portal turant theek ho gaya.</p><p><b>Lesson:</b> bade packets se test karo, sirf chhote pings se nahi.</p></div>

<div class="iv"><p class="q">"Proxy IDs kya hain aur kab configure karte ho?"</p><p>Yeh woh local aur remote subnets (aur protocol) hain jo dono peers IPsec SA ke liye offer karte hain, jinhe traffic selectors bhi kehte hain. PAN-OS firewalls ke beech default any to any hai aur kuch nahi chahiye. Peer policy-based ho to main peer ki crypto access list ko mirror karte hue proxy IDs configure karta hoon, har subnet pair ke liye ek; mismatch tab dikhta hai jab phase 1 up ho aur phase 2 fail.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Proxy IDs peer ke selectors ko mirror karein; do PAN-OS firewalls ke beech zaroori nahi.</li>
<li>NAT-T ESP ko UDP 4500 mein le jaata hai.</li>
<li>MTU aur MSS problems: ping theek, bade transfers atak jaate hain.</li>
<li>DPD ya liveness plus tunnel monitor tez failure detection aur failover dete hain.</li>
<li>Dynamic aur HA setups ko identity choice, passive mode aur renegotiation ke liye sabr chahiye.</li>
</ul></div>
`}};export{e as default};