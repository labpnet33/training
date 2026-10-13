var e={id:`nat-exemption`,h:{en:`NAT exemption: keeping real addresses inside the tunnel`,hi:`NAT exemption: tunnel ke andar real addresses rakhna`},body:{en:`
<p>Picture the HQ post room. Every outgoing letter gets the company's public return address stamped on it, so replies come back to the front desk; that is <b>PAT</b>. Now a courier box for the branch arrives at the post room. If the clerk stamps the public address on it too, the courier's list says "only boxes from department 10.0.1.0 to department 10.20.0.0", the stamped box no longer matches, and the courier refuses it. It goes out with ordinary post instead, unprotected, and the branch never receives it. <b>NAT exemption</b> is the instruction to the clerk: "do not stamp boxes that go to the branch".</p>

<h3>Why the order of operations matters</h3>
<p>On a Threat Defense (and an ASA), for traffic leaving through the outside interface, <b>NAT is applied before the crypto map lookup</b>. The crypto ACL is written with the real addresses (10.0.1.0/24 to 10.20.0.0/24). If the normal internet PAT rule translates 10.0.1.10 to 203.0.113.2 first, the packet no longer matches the crypto ACL. It is sent unencrypted to a private destination and the provider drops it.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NAT before crypto">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 → 10.20.0.10</text>
<rect x="190" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="250" y="47" text-anchor="middle" class="svg-ink" font-size="13">NAT rules</text>
<rect x="350" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="47" text-anchor="middle" class="svg-ink" font-size="13">crypto ACL?</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="13">ESP to BR1</text>
<line x1="150" y1="42" x2="190" y2="42" stroke="#64748b"/><line x1="310" y1="42" x2="350" y2="42" stroke="#64748b"/><line x1="470" y1="42" x2="510" y2="42" stroke="#64748b"/>
<text x="250" y="95" text-anchor="middle" class="svg-accent" font-size="12">exempt: stays 10.0.1.10</text>
<text x="250" y="125" text-anchor="middle" class="svg-muted" font-size="12">no exemption: PAT to 203.0.113.2</text>
<line x1="250" y1="132" x2="250" y2="160" stroke="#64748b"/>
<rect x="160" y="160" width="300" height="34" rx="8" fill="#fed7aa"/><text x="310" y="182" text-anchor="middle" class="svg-ink" font-size="12">no match: leaves in clear text, dropped</text>
</svg><p class="cap">NAT runs first. Only untranslated packets still match the crypto ACL.</p></div>

<h3>The fix: identity NAT in section 1</h3>
<p>NAT exemption is a <b>manual (twice) NAT</b> rule that translates the inside networks to themselves when the destination is the remote network. It must sit in <b>section 1</b>, above the auto NAT (object NAT) that does the internet PAT, because section 1 is evaluated first. The generated rule looks like this:</p>
<pre class="code">nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BR1-LAN BR1-LAN no-proxy-arp route-lookup</pre>
<ul><li><code>source static X X</code>: translate the source to itself (identity).</li>
<li><code>destination static Y Y</code>: only when the destination is the remote LAN.</li>
<li><code>no-proxy-arp</code>: do not answer ARP for these addresses on the outside.</li>
<li><code>route-lookup</code>: choose the egress interface from the routing table instead of the NAT rule.</li></ul>
<p>In the Management Center you rarely write this by hand. In the topology's <b>4 · Advanced</b> step, tick <b>Exempt VPN traffic from network address translation</b> and select the <b>Inside Interfaces (security zone)</b>, for example <code>INSIDE</code>. The Management Center then creates one identity rule per inside interface in that zone. If you have several protected networks, it groups them into generated network groups with names like <code>|s2sAclSrcNwgp…|</code>.</p>

<h3>Seeing the problem and the fix</h3>
<p>The NOC ticket lab (INC-9422) starts without the exemption. Packet-tracer from the inside shows the translation:</p>
<pre class="out">&gt; packet-tracer input inside icmp 10.0.1.20 8 0 10.20.0.10
...
Phase: 4
Type: NAT
Subtype:
Result: ALLOW
Config:
object network INSIDE-NET
 nat (inside,outside) dynamic interface
Additional Information:
<span class="hl">Dynamic translate 10.0.1.20/1 to 203.0.113.2/40011</span></pre>
<p>After ticking the exemption and deploying, the same trace shows a NAT phase with the identity rule ("Static translate 10.0.1.20/0 to 10.0.1.20/0"), followed by a <b>VPN encrypt</b> phase. <code>show nat</code> proves where it sits and whether it is being hit:</p>
<pre class="out">&gt; show nat

Manual NAT Policies (Section 1)
1 (inside) to (outside) source static INSIDE-NET INSIDE-NET destination static BR1-LAN BR1-LAN no-proxy-arp route-lookup
    <span class="hl">translate_hits = 6, untranslate_hits = 6</span>

Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 14, untranslate_hits = 0</pre>

<div class="eg"><p><b>Worked example: why one direction worked.</b> In INC-9422, once the access control rule was fixed, the branch could open SRV1 but HQ could not reach the branch. Branch-initiated traffic arrives decrypted with real addresses, creates a connection, and the replies follow that connection, so they are not translated by the dynamic PAT rule. HQ-initiated traffic is new: it hits the PAT rule, leaves as 203.0.113.2, misses the crypto ACL, and dies. One direction working while the other fails is the classic signature of a missing NAT exemption.</p></div>

<h3>Remote access needs it too</h3>
<p>For remote access the remote side is the <b>VPN address pool</b>. In <b>Devices → VPN · Remote Access</b>, the <b>NAT Exemption</b> card edits <b>Exempt traffic between inside networks and the VPN address pools from NAT</b> with an Inside zone and Inside networks. Without it, inside hosts that open connections to a VPN client (a help-desk tool, a printer pushing a job) would be translated and never reach the client, and some return paths fail.</p>

<div class="warn"><p><b>Common mistakes.</b> Placing a hand-written exemption below the PAT rule (section 3, after auto NAT); exempting the wrong inside zone; forgetting the exemption on the peer, which gives "encaps rising, decaps 0" on your side; using an exemption with a broad destination such as any, which also stops internet PAT.</p></div>

<div class="exam"><p><b>Exam trap.</b> On a Threat Defense or ASA, NAT is checked before the crypto ACL. Questions describing "the tunnel is up, the remote site can reach us, but we cannot reach them" point to NAT exemption on our side. Identity NAT rules are manual NAT (section 1), not auto NAT.</p></div>

<div class="scn"><h4>The migration that forgot the clerk</h4><p>A company migrated from an old firewall to NK-FTD. The tunnel came up immediately because the branch kept sending traffic, but HQ users could not print to the branch printer. Packet-tracer showed the inside source translated to 203.0.113.2. The old firewall had a hand-written exemption that the migration script skipped. Ticking "Exempt VPN traffic from network address translation" in HQ-BR1 and deploying fixed both printing and the HQ-to-branch file share.</p><p><b>Lesson:</b> after any migration, run packet-tracer in both directions and read the NAT phase.</p></div>

<div class="iv"><p class="q">"Why does a firewall need NAT exemption for a site-to-site VPN, and how do you configure it on Threat Defense?"</p><p>Explain the order of operations: NAT happens before the crypto ACL lookup, so PAT changes the source and the packet no longer matches the protected networks. The fix is identity twice NAT in section 1 with no-proxy-arp and route-lookup; in the Management Center it is the "Exempt VPN traffic from network address translation" option in the topology (or the NAT Exemption card for remote access). Verify with packet-tracer and the hit counters in <code>show nat</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT is evaluated before the crypto map lookup; translated packets miss the crypto ACL.</li>
<li>NAT exemption = identity manual NAT in section 1 with no-proxy-arp and route-lookup.</li>
<li>In the topology: 4 · Advanced → Exempt VPN traffic from network address translation + inside zone.</li>
<li>Remote access exempts inside networks to the VPN pool through the NAT Exemption card.</li>
<li>One direction working and the other failing is the classic missing-exemption symptom.</li>
</ul></div>
`,hi:`
<p>HQ ka post room socho. Har outgoing letter par company ka public return address stamp hota hai, taaki replies front desk par wapas aayein; yeh <b>PAT</b> hai. Ab branch ke liye ek courier box post room mein aata hai. Agar clerk us par bhi public address stamp kar de, to courier ki list kehti hai "sirf department 10.0.1.0 se department 10.20.0.0 tak ke boxes", stamp wala box ab match nahi karta, aur courier use lene se mana kar deta hai. Woh ordinary post se bina protection ke chala jaata hai, aur branch ko kabhi nahi milta. <b>NAT exemption</b> clerk ko instruction hai: "branch jaane wale boxes par stamp mat lagao".</p>

<h3>Order of operations kyun matter karta hai</h3>
<p>Threat Defense (aur ASA) par, outside interface se nikalne wale traffic ke liye <b>NAT crypto map lookup se pehle lagta hai</b>. Crypto ACL real addresses ke saath likhi hoti hai (10.0.1.0/24 se 10.20.0.0/24). Agar normal internet PAT rule pehle 10.0.1.10 ko 203.0.113.2 mein translate kar de, to packet ab crypto ACL se match nahi karta. Woh private destination par bina encryption ke bheja jaata hai aur provider use drop kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NAT before crypto">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 → 10.20.0.10</text>
<rect x="190" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="250" y="47" text-anchor="middle" class="svg-ink" font-size="13">NAT rules</text>
<rect x="350" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="47" text-anchor="middle" class="svg-ink" font-size="13">crypto ACL?</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="13">BR1 ko ESP</text>
<line x1="150" y1="42" x2="190" y2="42" stroke="#64748b"/><line x1="310" y1="42" x2="350" y2="42" stroke="#64748b"/><line x1="470" y1="42" x2="510" y2="42" stroke="#64748b"/>
<text x="250" y="95" text-anchor="middle" class="svg-accent" font-size="12">exempt: 10.0.1.10 hi rehta hai</text>
<text x="250" y="125" text-anchor="middle" class="svg-muted" font-size="12">exemption nahi: 203.0.113.2 mein PAT</text>
<line x1="250" y1="132" x2="250" y2="160" stroke="#64748b"/>
<rect x="160" y="160" width="300" height="34" rx="8" fill="#fed7aa"/><text x="310" y="182" text-anchor="middle" class="svg-ink" font-size="12">match nahi: clear text mein nikla, drop</text>
</svg><p class="cap">NAT pehle chalta hai. Sirf untranslated packets hi crypto ACL se match karte hain.</p></div>

<h3>Fix: section 1 mein identity NAT</h3>
<p>NAT exemption ek <b>manual (twice) NAT</b> rule hai jo inside networks ko khud mein hi translate karta hai jab destination remote network ho. Ise <b>section 1</b> mein hona chahiye, internet PAT karne wale auto NAT (object NAT) ke upar, kyunki section 1 pehle evaluate hota hai. Generated rule aisa dikhta hai:</p>
<pre class="code">nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BR1-LAN BR1-LAN no-proxy-arp route-lookup</pre>
<ul><li><code>source static X X</code>: source ko khud mein translate karo (identity).</li>
<li><code>destination static Y Y</code>: sirf tab jab destination remote LAN ho.</li>
<li><code>no-proxy-arp</code>: outside par in addresses ke liye ARP ka jawab mat do.</li>
<li><code>route-lookup</code>: egress interface NAT rule ki jagah routing table se chuno.</li></ul>
<p>Management Center mein aap ise shayad hi haath se likhte ho. Topology ke <b>4 · Advanced</b> step mein <b>Exempt VPN traffic from network address translation</b> tick karo aur <b>Inside Interfaces (security zone)</b> select karo, jaise <code>INSIDE</code>. Management Center phir us zone ke har inside interface ke liye ek identity rule banata hai. Agar aapke kai protected networks hain, to woh unhe <code>|s2sAclSrcNwgp…|</code> jaise naamon wale generated network groups mein group karta hai.</p>

<h3>Problem aur fix dekhna</h3>
<p>NOC ticket lab (INC-9422) exemption ke bina shuru hota hai. Inside se packet-tracer translation dikhata hai:</p>
<pre class="out">&gt; packet-tracer input inside icmp 10.0.1.20 8 0 10.20.0.10
...
Phase: 4
Type: NAT
Subtype:
Result: ALLOW
Config:
object network INSIDE-NET
 nat (inside,outside) dynamic interface
Additional Information:
<span class="hl">Dynamic translate 10.0.1.20/1 to 203.0.113.2/40011</span></pre>
<p>Exemption tick karke deploy karne ke baad wahi trace identity rule wala NAT phase dikhata hai ("Static translate 10.0.1.20/0 to 10.0.1.20/0"), uske baad ek <b>VPN encrypt</b> phase. <code>show nat</code> prove karta hai rule kahan hai aur hit ho raha hai ya nahi:</p>
<pre class="out">&gt; show nat

Manual NAT Policies (Section 1)
1 (inside) to (outside) source static INSIDE-NET INSIDE-NET destination static BR1-LAN BR1-LAN no-proxy-arp route-lookup
    <span class="hl">translate_hits = 6, untranslate_hits = 6</span>

Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 14, untranslate_hits = 0</pre>

<div class="eg"><p><b>Worked example: ek direction kyun chali.</b> INC-9422 mein access control rule theek hone ke baad branch SRV1 khol sakti thi par HQ branch tak nahi pahunch paata tha. Branch se shuru hua traffic real addresses ke saath decrypted aata hai, ek connection banata hai, aur replies us connection ko follow karte hain, isliye dynamic PAT rule unhe translate nahi karta. HQ se shuru hua traffic naya hai: woh PAT rule hit karta hai, 203.0.113.2 ban ke nikalta hai, crypto ACL miss karta hai, aur mar jaata hai. Ek direction chalna aur doosri fail hona missing NAT exemption ka classic signature hai.</p></div>

<h3>Remote access ko bhi chahiye</h3>
<p>Remote access ke liye remote side <b>VPN address pool</b> hai. <b>Devices → VPN · Remote Access</b> mein <b>NAT Exemption</b> card Inside zone aur Inside networks ke saath <b>Exempt traffic between inside networks and the VPN address pools from NAT</b> edit karta hai. Iske bina VPN client ki taraf connections kholne wale inside hosts (help-desk tool, job push karta printer) translate ho jaate aur client tak kabhi nahi pahunchte, aur kuch return paths fail hote hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Haath se likhi exemption ko PAT rule ke neeche rakhna (section 3, auto NAT ke baad); galat inside zone exempt karna; peer par exemption bhoolna, jisse aapki side par "encaps badh raha, decaps 0" aata hai; any jaise broad destination wali exemption use karna, jo internet PAT bhi rok deti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Threat Defense ya ASA par NAT crypto ACL se pehle check hota hai. "Tunnel up hai, remote site hum tak pahunchti hai, par hum unhe nahi" describe karne wale questions humari side ke NAT exemption ki taraf ishara karte hain. Identity NAT rules manual NAT (section 1) hain, auto NAT nahi.</p></div>

<div class="scn"><h4>Woh migration jo clerk ko bhool gayi</h4><p>Ek company purane firewall se NK-FTD par migrate hui. Tunnel turant up aaya kyunki branch traffic bhejti rahi, par HQ users branch printer par print nahi kar paaye. Packet-tracer ne inside source ko 203.0.113.2 mein translate hota dikhaya. Purane firewall par haath se likhi exemption thi jise migration script ne skip kar diya. HQ-BR1 mein "Exempt VPN traffic from network address translation" tick karke deploy karne se printing aur HQ-se-branch file share dono theek ho gaye.</p><p><b>Lesson:</b> kisi bhi migration ke baad dono directions mein packet-tracer chalao aur NAT phase padho.</p></div>

<div class="iv"><p class="q">"Site-to-site VPN ke liye firewall ko NAT exemption kyun chahiye, aur Threat Defense par ise kaise configure karte ho?"</p><p>Order of operations samjhao: NAT crypto ACL lookup se pehle hota hai, isliye PAT source badal deta hai aur packet protected networks se match nahi karta. Fix hai section 1 mein no-proxy-arp aur route-lookup ke saath identity twice NAT; Management Center mein yeh topology ka "Exempt VPN traffic from network address translation" option hai (ya remote access ke liye NAT Exemption card). Packet-tracer aur <code>show nat</code> ke hit counters se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT crypto map lookup se pehle evaluate hota hai; translated packets crypto ACL miss karte hain.</li>
<li>NAT exemption = section 1 mein no-proxy-arp aur route-lookup ke saath identity manual NAT.</li>
<li>Topology mein: 4 · Advanced → Exempt VPN traffic from network address translation + inside zone.</li>
<li>Remote access NAT Exemption card se inside networks ko VPN pool ke liye exempt karta hai.</li>
<li>Ek direction chalna aur doosri fail hona classic missing-exemption symptom hai.</li>
</ul></div>
`}};export{e as default};