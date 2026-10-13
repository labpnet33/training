var e={id:`natt-dpd-redundancy`,h:{en:`NAT traversal, DPD, authentication choices and redundancy`,hi:`NAT traversal, DPD, authentication choices aur redundancy`},body:{en:`
<p>A tunnel that works on the day of the build must also keep working on bad days: through NAT devices, flaky ISPs, rekeys and failures. This chapter covers the features that make an IPsec VPN resilient and secure: NAT traversal, dead peer detection, authentication choices, redundancy and the hub-and-spoke designs used by companies with many branches.</p>

<h3>NAT traversal (NAT-T)</h3>
<p>ESP has no port numbers, so a NAT device cannot translate it reliably. If either FortiGate sits behind a NAT device, such as an ISP router with a private address, IPsec would fail. <b>NAT traversal</b> solves this: the peers detect NAT during IKE and, if found, switch to <b>UDP port 4500</b>, wrapping ESP inside UDP so NAT can track it. On a FortiGate, <code>set nattraversal enable</code> (the default, also with a <code>forced</code> option) allows this. Keepalive packets are sent so that the NAT mapping does not time out. The practical consequences: allow UDP 500 and UDP 4500 (and ESP where there is no NAT) on any device in front of the FortiGate, and remember that the address in <code>remote-gw</code> must be the one the peer is reachable at from the outside.</p>

<h3>Dead peer detection (DPD)</h3>
<p>If a peer disappears without saying goodbye, for example when an ISP link fails, the tunnel looks up while traffic is silently lost. <b>DPD</b> sends small probe messages and tears down the SA when the peer stops answering, so that the tunnel can be rebuilt, possibly over a different path. Key settings: <code>dpd on-idle</code> (probe only when no traffic is received, the efficient choice), <code>dpd on-demand</code> (older wording, similar), <code>dpd-retryinterval</code> (seconds between probes) and <code>dpd-retrycount</code> (failures before declaring the peer dead). Choose values that detect failure within tens of seconds without causing false drops on a lossy link. With IKEv2, liveness checks are part of the protocol, and DPD settings still control the behaviour on FortiOS.</p>

<h3>Authentication choices in practice</h3>
<table class="cmp"><tr><th>Method</th><th>Strength</th><th>Weakness</th><th>Use when</th></tr>
<tr><td>Pre-shared key</td><td>Simple, quick</td><td>Shared secret leaks, hard to rotate across many sites</td><td>Few sites; use long random unique keys</td></tr>
<tr><td>Certificates</td><td>No shared secret, per-device revocation</td><td>Needs a CA and time sync</td><td>Many sites, regulated environments</td></tr>
<tr><td>Peer ID checks</td><td>Stops an unexpected peer using a known key</td><td>More configuration</td><td>Always on production tunnels</td></tr></table>
<p>Use unique pre-shared keys per tunnel, generate them with a password manager rather than by hand, and rotate them when staff with access leave. With certificates, check that both FortiGates keep correct time (NTP) because validity dates matter, and use a CA you trust. Placeholders are used for every secret in this course.</p>

<h3>Redundancy: two tunnels, two ISPs</h3>
<p>A single tunnel over one ISP is a single point of failure. The common design is <b>two tunnels</b>, one per ISP, between the same sites. With routing: use two static routes with different distances (the lower one preferred, the other floating), or run a dynamic protocol over both tunnels, or use SD-WAN members and rules (see <b>nse4-sdwan</b>). DPD ensures that a dead path is noticed, and the backup route takes over. If the two peers also use HA (see <b>nse4-ha</b>), remember that FGCP synchronises IKE and IPsec SAs for failover, but check the behaviour in your version during testing.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Hub and spoke with redundancy">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hub (HQ)</text>
<rect x="20" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Pune</text>
<rect x="255" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Delhi</text>
<rect x="490" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Mumbai</text>
<line x1="290" y1="70" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="350" y1="70" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="255" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="203" y="138" text-anchor="middle" class="svg-accent" font-size="11">ADVPN shortcut</text>
</svg><p class="cap">Spokes build tunnels to the hub; an on-demand shortcut can link two spokes directly.</p></div>

<h3>Hub-and-spoke and ADVPN</h3>
<p>With ten branches, a full mesh needs 45 tunnels. In <b>hub-and-spoke</b>, each branch has one tunnel to HQ and traffic between branches goes through the hub. FortiGate's <b>ADVPN (Auto-Discovery VPN)</b> improves this: the hub tells two spokes about each other so that they create a direct tunnel on demand. The hub is usually configured with <code>type dynamic</code> for spokes with changing addresses, and a dynamic routing protocol shares branch networks. These are advanced designs; for the exam know the idea, the benefit and that ADVPN reduces hub load and latency between spokes.</p>

<h3>Reference configuration fragments (not run in the simulator)</h3>
<pre class="code"><span class="c"># Branch behind NAT: NAT-T and a specific local ID</span>
config vpn ipsec phase1-interface
    edit "to-HQ"
        set interface "wan1"
        set ike-version 2
        set remote-gw 203.0.113.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
        set localid "branch-pune"
        set psksecret "Placeholder-Long-Random-Secret"
    next
end

<span class="c"># Second tunnel over ISP 2, floating route</span>
config router static
    edit 12
        set dst 10.10.0.0 255.255.255.0
        set device "to-HQ-isp2"
        set distance 20
    next
end</pre>

<div class="eg"><p><b>Worked example.</b> A branch sits behind an ISP router that does NAT. The tunnel to HQ fails with no response from HQ. The cause: UDP 4500 is blocked upstream, so NAT-T cannot work. After opening UDP 500 and UDP 4500 to HQ's address, IKE completes, ESP-in-UDP flows, and DPD keeps the NAT mapping fresh.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using one pre-shared key for every branch. Setting DPD so aggressively that a lossy link keeps resetting the tunnel. Forgetting to allow UDP 4500. Assuming a second tunnel gives failover without routing that prefers one and fails over to the other.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT traversal moves IKE and ESP to UDP 4500 when NAT is detected. DPD detects peer failure; it does not rekey keys. Know which feature addresses which problem.</p></div>

<div class="scn"><h4>The silent tunnel after an ISP flap</h4><p>A branch ISP link dropped for a few seconds. After it returned, the HQ side still showed the tunnel up, yet no traffic passed until someone cleared it by hand. DPD had been disabled to "reduce noise". After enabling <code>dpd on-idle</code> with a ten second retry interval, the tunnel recovered by itself within half a minute of the next flap.</p><p><b>Lesson:</b> DPD turns a silent failure into a self-healing one.</p></div>

<div class="iv"><p class="q">"Why does IPsec need NAT traversal and DPD?"</p><p>NAT-T wraps ESP in UDP 4500 so IPsec works when a peer is behind NAT; without it ESP cannot be translated. DPD detects a peer that has vanished so the SA is torn down and rebuilt rather than blackholing traffic. I would add that certificates and unique pre-shared keys, plus redundant tunnels over two ISPs, complete a resilient design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT-T uses UDP 4500 when NAT is detected; allow UDP 500 and 4500.</li>
<li>DPD detects dead peers and triggers rebuild.</li>
<li>Prefer certificates or unique long PSKs, and check peer IDs.</li>
<li>Redundant tunnels need routing or SD-WAN to fail over.</li>
<li>Hub-and-spoke with ADVPN scales many branches.</li>
</ul></div>
`,hi:`
<p>Jo tunnel build ke din chalta hai use kharab dinon mein bhi chalna chahiye: NAT devices, flaky ISPs, rekeys aur failures ke beech. Yeh chapter un features ko cover karta hai jo IPsec VPN ko resilient aur secure banate hain: NAT traversal, dead peer detection, authentication choices, redundancy aur bahut branches wali companies ke hub-and-spoke designs.</p>

<h3>NAT traversal (NAT-T)</h3>
<p>ESP mein port numbers nahi hote, isliye NAT device use reliably translate nahi kar sakta. Koi bhi FortiGate NAT device ke peeche ho, jaise private address wala ISP router, to IPsec fail ho jaata. <b>NAT traversal</b> yeh solve karta hai: peers IKE ke dauran NAT detect karte hain aur mil jaaye to <b>UDP port 4500</b> par switch ho jaate hain, ESP ko UDP ke andar wrap karke taaki NAT use track kar sake. FortiGate par <code>set nattraversal enable</code> (default, ek <code>forced</code> option bhi hai) isse allow karta hai. Keepalive packets bheje jaate hain taaki NAT mapping time out na ho. Practical nateeje: FortiGate ke aage har device par UDP 500 aur UDP 4500 (aur jahan NAT nahi wahan ESP) allow karo, aur yaad rakho ki <code>remote-gw</code> mein woh address ho jis par peer bahar se reachable hai.</p>

<h3>Dead peer detection (DPD)</h3>
<p>Peer bina alvida kahe gayab ho jaaye, jaise ISP link fail hone par, to tunnel up dikhta hai jabki traffic chupchaap kho jaata hai. <b>DPD</b> chhote probe messages bhejta hai aur peer ke jawab dena band karne par SA tod deta hai, taaki tunnel dobara ban sake, shayad doosre path se. Key settings: <code>dpd on-idle</code> (sirf tab probe jab koi traffic receive na ho, efficient choice), <code>dpd on-demand</code> (purani wording, milta-julta), <code>dpd-retryinterval</code> (probes ke beech seconds) aur <code>dpd-retrycount</code> (peer ko dead declare karne se pehle failures). Aisi values chuno jo kuch dus seconds mein failure detect karein bina lossy link par galat drops kiye. IKEv2 mein liveness checks protocol ka hissa hain, aur FortiOS par DPD settings behaviour control karte rehte hain.</p>

<h3>Practice mein authentication choices</h3>
<table class="cmp"><tr><th>Method</th><th>Strength</th><th>Weakness</th><th>Kab use karein</th></tr>
<tr><td>Pre-shared key</td><td>Simple, tez</td><td>Shared secret leak hota hai, kai sites par rotate karna mushkil</td><td>Kam sites; lambi random unique keys use karo</td></tr>
<tr><td>Certificates</td><td>Shared secret nahi, per-device revocation</td><td>CA aur time sync chahiye</td><td>Bahut sites, regulated environments</td></tr>
<tr><td>Peer ID checks</td><td>Known key use karne wale unexpected peer ko rokta hai</td><td>Zyada configuration</td><td>Production tunnels par hamesha</td></tr></table>
<p>Har tunnel ke liye unique pre-shared keys use karo, unhe haath se nahi balki password manager se generate karo, aur access wale staff jaayein to rotate karo. Certificates ke saath check karo ki dono FortiGates ka time sahi hai (NTP) kyunki validity dates matter karti hain, aur trusted CA use karo. Is course mein har secret ke liye placeholders hain.</p>

<h3>Redundancy: do tunnels, do ISPs</h3>
<p>Ek ISP par ek tunnel single point of failure hai. Common design hai <b>do tunnels</b>, har ISP ke liye ek, same sites ke beech. Routing ke saath: alag distances ke do static routes (kam wala preferred, doosra floating), ya dono tunnels par dynamic protocol, ya SD-WAN members aur rules (<b>nse4-sdwan</b> dekho). DPD yeh pakadta hai ki path dead hai, aur backup route sambhaal leta hai. Dono peers HA bhi use karein (<b>nse4-ha</b> dekho) to yaad rakho ki FGCP failover ke liye IKE aur IPsec SAs synchronise karta hai, lekin apne version ka behaviour testing mein check karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Redundancy ke saath hub aur spoke">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hub (HQ)</text>
<rect x="20" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Pune</text>
<rect x="255" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Delhi</text>
<rect x="490" y="120" width="130" height="50" rx="10" fill="#bae6fd"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="12">Spoke Mumbai</text>
<line x1="290" y1="70" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="350" y1="70" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="255" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="203" y="138" text-anchor="middle" class="svg-accent" font-size="11">ADVPN shortcut</text>
</svg><p class="cap">Spokes hub tak tunnel banate hain; on-demand shortcut do spokes ko seedha jod sakta hai.</p></div>

<h3>Hub-and-spoke aur ADVPN</h3>
<p>Das branches ke saath full mesh ko 45 tunnels chahiye. <b>Hub-and-spoke</b> mein har branch ka HQ tak ek tunnel hota hai aur branches ke beech traffic hub se guzarta hai. FortiGate ka <b>ADVPN (Auto-Discovery VPN)</b> ise behtar karta hai: hub do spokes ko ek-doosre ke baare mein batata hai taaki woh on demand seedha tunnel bana lein. Hub aam taur par badalte addresses wale spokes ke liye <code>type dynamic</code> se configure hota hai, aur dynamic routing protocol branch networks share karta hai. Yeh advanced designs hain; exam ke liye idea, fayda aur yeh jaano ki ADVPN hub load aur spokes ke beech latency ghatata hai.</p>

<h3>Reference configuration fragments (not run in the simulator)</h3>
<pre class="code"><span class="c"># NAT ke peeche branch: NAT-T aur specific local ID</span>
config vpn ipsec phase1-interface
    edit "to-HQ"
        set interface "wan1"
        set ike-version 2
        set remote-gw 203.0.113.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
        set localid "branch-pune"
        set psksecret "Placeholder-Long-Random-Secret"
    next
end

<span class="c"># ISP 2 par doosra tunnel, floating route</span>
config router static
    edit 12
        set dst 10.10.0.0 255.255.255.0
        set device "to-HQ-isp2"
        set distance 20
    next
end</pre>

<div class="eg"><p><b>Worked example.</b> Ek branch NAT karne wale ISP router ke peeche hai. HQ ke tunnel mein HQ se koi response nahi aata. Karan: UDP 4500 upstream block hai, isliye NAT-T kaam nahi kar sakta. HQ ke address tak UDP 500 aur UDP 4500 kholne ke baad IKE complete hota hai, ESP-in-UDP chalta hai, aur DPD NAT mapping ko fresh rakhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Har branch ke liye ek hi pre-shared key. DPD itna aggressive set karna ki lossy link tunnel ko baar-baar reset kare. UDP 4500 allow karna bhool jaana. Maan lena ki doosra tunnel failover deta hai, aisi routing ke bina jo ek ko prefer kare aur doosre par failover kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT traversal NAT detect hone par IKE aur ESP ko UDP 4500 par le jaata hai. DPD peer failure detect karta hai; woh keys rekey nahi karta. Jaano ki kaunsa feature kaun si problem solve karta hai.</p></div>

<div class="scn"><h4>ISP flap ke baad khamosh tunnel</h4><p>Ek branch ISP link kuch seconds ke liye gira. Wapas aane ke baad bhi HQ side tunnel up dikhata raha, lekin kisi ke haath se clear karne tak traffic pass nahi hua. "Noise kam karne" ke liye DPD disabled tha. Das second retry interval ke saath <code>dpd on-idle</code> enable karne ke baad agle flap ke aadhe minute ke andar tunnel khud recover ho gaya.</p><p><b>Lesson:</b> DPD khamosh failure ko self-healing banata hai.</p></div>

<div class="iv"><p class="q">"IPsec ko NAT traversal aur DPD kyun chahiye?"</p><p>NAT-T ESP ko UDP 4500 mein wrap karta hai taaki peer NAT ke peeche ho to bhi IPsec chale; uske bina ESP translate nahi ho sakta. DPD gayab hue peer ko detect karta hai taaki SA tootkar dobara bane, traffic blackhole na ho. Main yeh jodunga ki certificates ya unique pre-shared keys, aur do ISPs par redundant tunnels resilient design poora karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT-T NAT detect hone par UDP 4500 use karta hai; UDP 500 aur 4500 allow karo.</li>
<li>DPD dead peers detect karta hai aur rebuild trigger karta hai.</li>
<li>Certificates ya unique lambi PSKs prefer karo, aur peer IDs check karo.</li>
<li>Redundant tunnels ko failover ke liye routing ya SD-WAN chahiye.</li>
<li>ADVPN ke saath hub-and-spoke kai branches ko scale karta hai.</li>
</ul></div>
`}};export{e as default};