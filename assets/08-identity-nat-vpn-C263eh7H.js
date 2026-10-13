var e={id:`identity-nat`,h:{en:`Identity NAT and NAT exemption for VPN: no-proxy-arp and route-lookup`,hi:`Identity NAT aur VPN ke liye NAT exemption: no-proxy-arp aur route-lookup`},body:{en:`
<p>A courier company stamps a "forwarded by" label on every parcel leaving the city. But parcels for the company's own branch travel in a sealed armoured van, and the branch must see the original sender's name, not the courier's label. So the dispatcher keeps a short list: "parcels for the branch, do not relabel". That list is <b>identity NAT</b>, also called <b>NAT exemption</b>: a rule that matches traffic and translates it to <b>itself</b>, so that no other NAT rule can touch it.</p>

<h3>Why you need a rule that changes nothing</h3>
<p>Since 8.3 the ASA does not require NAT: traffic that matches no rule simply passes untranslated. So why write a rule whose mapped address equals its real address? Because of the <b>first-match</b> logic. The INSIDE-NET interface PAT matches every packet from 10.0.1.0/24 going to outside, including packets meant for a branch across a site-to-site VPN. If those packets are PATed to 203.0.113.2, they no longer match the VPN's interesting-traffic ACL (which lists the real subnets), so they are not encrypted and the branch never sees them. An identity rule placed above the PAT catches branch-bound traffic first and leaves it alone.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Identity NAT for VPN">
<rect x="20" y="95" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="85" y="119" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="85" y="137" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="250" y="95" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">NAT then crypto</text>
<rect x="490" y="30" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="13">branch</text><text x="555" y="70" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24</text>
<rect x="490" y="170" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="192" text-anchor="middle" class="svg-ink" font-size="13">internet</text><text x="555" y="210" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="123" x2="250" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="110" x2="490" y2="55" stroke="#64748b" stroke-width="3"/><line x1="390" y1="138" x2="490" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="440" y="66" text-anchor="middle" class="svg-accent" font-size="12">identity: src stays</text>
<text x="440" y="82" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.10, encrypted</text>
<text x="440" y="200" text-anchor="middle" class="svg-muted" font-size="12">PAT to 203.0.113.2</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">section 1 identity rule is checked before section 2 PAT</text>
</svg><p class="cap">Branch-bound traffic keeps its real source and enters the tunnel; everything else is PATed.</p></div>

<h3>The standard VPN exemption rule</h3>
<pre class="code">object network BRANCH-NET
 subnet 192.168.50.0 255.255.255.0
<span class="c">! Identity twice NAT, section 1, both sides unchanged</span>
nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</pre>
<p>Read it slowly. Source static INSIDE-NET to INSIDE-NET: the source is translated to itself. Destination static BRANCH-NET BRANCH-NET: only when going to the branch, and the destination is also unchanged. The rule is manual, so it lands in section 1 above every auto NAT rule. In the old 8.2 syntax this job was done by <code>nat (inside) 0 access-list NONAT</code>; migration tools convert it into exactly this kind of rule.</p>

<h3>no-proxy-arp</h3>
<p>For every static rule the ASA normally answers ARP on the <b>mapped</b> interface for the mapped addresses (chapter 5). In an identity rule the "mapped" addresses are really the inside hosts, 10.0.1.0/24, and the mapped interface is outside. You never want the ASA to claim inside addresses with ARP on the outside segment, or on any segment where those hosts or a neighbouring router could really exist. <code>no-proxy-arp</code> switches this off for the rule. It is harmless in normal cases and prevents strange ARP conflicts in the rare ones, which is why ASDM and the VPN wizard always add it.</p>

<h3>route-lookup and NAT divert</h3>
<p>For a static rule, when a packet arrives for a mapped address, the ASA normally chooses the egress interface from the rule itself: the rule's real interface. This is <b>NAT divert</b>, and it overrides the routing table. For a translated server that is exactly right. For an identity rule it can be wrong: with a broad rule, or with <code>any</code> as an interface, the real destination might be reachable through a different interface than the one written in the rule. <code>route-lookup</code>, which is allowed only on identity NAT in routed mode, tells the ASA to ignore NAT divert for this rule and use a normal route lookup. It also matters when traffic is aimed at an ASA interface address across a VPN, for example management of the ASA inside interface from the branch.</p>
<p>Rule of thumb for VPN exemption: <b>always add both keywords</b>.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# packet-tracer input inside tcp 10.0.1.10 40000 192.168.50.20 443
...
Phase: 3
Type: NAT
Subtype:
Result: ALLOW
Config:
nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup
Additional Information:
<span class="hl">Static translate 10.0.1.10/40000 to 10.0.1.10/40000</span>
...
Phase: 7
Type: VPN
Subtype: encrypt
<span class="hl">Result: ALLOW</span></pre>
<p>"Static translate 10.0.1.10 to 10.0.1.10" is identity NAT in action, and the VPN encrypt phase proves the packet enters the tunnel. In <code>show nat</code> the identity rule appears as section 1 line 1 with its own hit counters. The full tunnel build is in the sec-asa-vpn module; here you only need the NAT part.</p>

<div class="eg"><p><b>Worked example.</b> HQ inside 10.0.1.0/24, DMZ 10.0.2.0/24, branch 192.168.50.0/24. Both inside and DMZ must reach the branch. Create a network object-group LOCAL-NETS containing both subnets and write one rule: <code>nat (any,outside) source static LOCAL-NETS LOCAL-NETS destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</code>. With <code>any</code> as the real interface, route-lookup is what sends return traffic to the correct interface, inside or dmz.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding the identity rule with <code>after-auto</code>, or adding a new broad manual PAT above it. Either way the PAT matches first, the tunnel stays down or carries nothing, and <code>show crypto ipsec sa</code> shows zero encapsulated packets.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What is NAT exemption on ASA 8.3+?" A twice NAT identity rule, static source to itself and static destination to itself, in section 1. Not <code>nat 0</code>, which was removed. And <code>route-lookup</code> is valid only for identity NAT.</p></div>

<div class="scn"><h4>The branch that could ping nothing after an upgrade</h4><p>After a migration from very old software, a branch tunnel came up but carried no traffic from HQ. <code>packet-tracer</code> from 10.0.1.10 to 192.168.50.20 showed the NAT phase matching the INSIDE-NET interface PAT and translating to 203.0.113.2, then no VPN encrypt phase. The migrated identity rule had been created as auto NAT on a separate object and sat below nothing useful. Rebuilding it as a twice NAT identity rule in section 1 with no-proxy-arp and route-lookup fixed the tunnel.</p><p><b>Lesson:</b> VPN traffic must be exempted before any PAT rule can see it.</p></div>

<div class="iv"><p class="q">"Why do we need NAT exemption for a site-to-site VPN, and what are no-proxy-arp and route-lookup?"</p><p>Because the interface PAT would otherwise translate branch-bound traffic, which then no longer matches the crypto ACL and never gets encrypted. The identity twice NAT in section 1 keeps real addresses. no-proxy-arp stops the ASA answering ARP for those real addresses on the mapped interface; route-lookup makes the ASA use the routing table instead of NAT divert to pick the egress interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity NAT translates addresses to themselves so that no broader rule translates them.</li>
<li>VPN exemption: twice NAT, static source and destination to themselves, section 1.</li>
<li>no-proxy-arp stops the ASA claiming the exempted addresses with ARP.</li>
<li>route-lookup replaces NAT divert with a normal route lookup, identity NAT only.</li>
<li>packet-tracer shows "Static translate X to X" and then the VPN encrypt phase.</li>
</ul></div>
`,hi:`
<p>Ek courier company shehar se bahar jaane wale har parcel par "forwarded by" label lagati hai. Lekin company ki apni branch ke parcels ek sealed armoured van mein jaate hain, aur branch ko original sender ka naam dikhna chahiye, courier ka label nahi. Isliye dispatcher ek chhoti list rakhta hai: "branch ke parcels, dobara label mat karo". Woh list <b>identity NAT</b> hai, jise <b>NAT exemption</b> bhi kehte hain: ek rule jo traffic match karti hai aur use <b>khud mein hi</b> translate karti hai, taaki koi aur NAT rule use chhoo na sake.</p>

<h3>Aisi rule ki zaroorat kyun jo kuch nahi badalti</h3>
<p>8.3 se ASA ko NAT ki zaroorat nahi: jo traffic kisi rule se match nahi karta woh bina translate hue pass ho jaata hai. To aisi rule kyun likhein jiska mapped address real address ke barabar ho? <b>First-match</b> logic ki wajah se. INSIDE-NET interface PAT outside ki taraf jaane wale 10.0.1.0/24 ke har packet ko match karta hai, un packets ko bhi jo site-to-site VPN ke paar branch ke liye hain. Agar woh packets 203.0.113.2 par PAT ho jaate hain, to woh VPN ki interesting-traffic ACL (jo real subnets list karti hai) se match nahi karte, isliye encrypt nahi hote aur branch unhe kabhi nahi dekhti. PAT ke upar rakhi identity rule branch ki taraf ka traffic pehle pakadti hai aur use waisa hi chhod deti hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Identity NAT for VPN">
<rect x="20" y="95" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="85" y="119" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="85" y="137" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="250" y="95" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">pehle NAT phir crypto</text>
<rect x="490" y="30" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="13">branch</text><text x="555" y="70" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24</text>
<rect x="490" y="170" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="192" text-anchor="middle" class="svg-ink" font-size="13">internet</text><text x="555" y="210" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="123" x2="250" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="110" x2="490" y2="55" stroke="#64748b" stroke-width="3"/><line x1="390" y1="138" x2="490" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="440" y="66" text-anchor="middle" class="svg-accent" font-size="12">identity: src wahi</text>
<text x="440" y="82" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.10, encrypted</text>
<text x="440" y="200" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2 par PAT</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">section 1 identity rule section 2 PAT se pehle check hoti hai</text>
</svg><p class="cap">Branch ki taraf ka traffic apna real source rakhta hai aur tunnel mein jaata hai; baaki sab PAT hota hai.</p></div>

<h3>Standard VPN exemption rule</h3>
<pre class="code">object network BRANCH-NET
 subnet 192.168.50.0 255.255.255.0
<span class="c">! Identity twice NAT, section 1, dono sides unchanged</span>
nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</pre>
<p>Ise dheere padho. Source static INSIDE-NET se INSIDE-NET: source khud mein translate hota hai. Destination static BRANCH-NET BRANCH-NET: sirf branch ki taraf jaate waqt, aur destination bhi unchanged. Rule manual hai, isliye har auto NAT rule ke upar section 1 mein jaati hai. Purane 8.2 syntax mein yeh kaam <code>nat (inside) 0 access-list NONAT</code> karta tha; migration tools use bilkul isi tarah ki rule mein convert karte hain.</p>

<h3>no-proxy-arp</h3>
<p>Har static rule ke liye ASA normally <b>mapped</b> interface par mapped addresses ke liye ARP ka jawab deta hai (chapter 5). Identity rule mein "mapped" addresses asal mein inside hosts hain, 10.0.1.0/24, aur mapped interface outside hai. Aap kabhi nahi chahoge ki ASA outside segment par, ya kisi bhi segment par jahan woh hosts ya koi padosi router sach mein ho sakte hain, inside addresses ko ARP se claim kare. <code>no-proxy-arp</code> is rule ke liye yeh band kar deta hai. Normal cases mein yeh harmless hai aur rare cases mein ajeeb ARP conflicts rokta hai, isliye ASDM aur VPN wizard ise hamesha jodte hain.</p>

<h3>route-lookup aur NAT divert</h3>
<p>Static rule ke liye, jab koi packet mapped address ke liye aata hai, ASA normally egress interface rule se hi chunta hai: rule ka real interface. Yeh <b>NAT divert</b> hai, aur yeh routing table ko override karta hai. Translated server ke liye yeh bilkul sahi hai. Identity rule ke liye yeh galat ho sakta hai: broad rule ke saath, ya interface ke roop mein <code>any</code> ke saath, real destination us interface ke alawa kisi aur interface se reachable ho sakta hai jo rule mein likha hai. <code>route-lookup</code>, jo sirf routed mode mein identity NAT par allowed hai, ASA ko batata hai ki is rule ke liye NAT divert ignore karo aur normal route lookup use karo. Yeh tab bhi matter karta hai jab traffic VPN ke paar kisi ASA interface address par aata hai, jaise branch se ASA ke inside interface ka management.</p>
<p>VPN exemption ke liye rule of thumb: <b>hamesha dono keywords jodo</b>.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# packet-tracer input inside tcp 10.0.1.10 40000 192.168.50.20 443
...
Phase: 3
Type: NAT
Subtype:
Result: ALLOW
Config:
nat (inside,outside) source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup
Additional Information:
<span class="hl">Static translate 10.0.1.10/40000 to 10.0.1.10/40000</span>
...
Phase: 7
Type: VPN
Subtype: encrypt
<span class="hl">Result: ALLOW</span></pre>
<p>"Static translate 10.0.1.10 to 10.0.1.10" identity NAT ka kaam hai, aur VPN encrypt phase saabit karta hai ki packet tunnel mein jaata hai. <code>show nat</code> mein identity rule section 1 line 1 ki tarah apne hit counters ke saath dikhti hai. Poora tunnel build sec-asa-vpn module mein hai; yahan aapko sirf NAT wala hissa chahiye.</p>

<div class="eg"><p><b>Worked example.</b> HQ inside 10.0.1.0/24, DMZ 10.0.2.0/24, branch 192.168.50.0/24. Inside aur DMZ dono ko branch tak pahunchna hai. Dono subnets wala network object-group LOCAL-NETS banao aur ek rule likho: <code>nat (any,outside) source static LOCAL-NETS LOCAL-NETS destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</code>. Real interface ke roop mein <code>any</code> ke saath, route-lookup hi return traffic ko sahi interface, inside ya dmz, par bhejta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Identity rule ko <code>after-auto</code> ke saath add karna, ya uske upar naya broad manual PAT add karna. Dono tarah PAT pehle match karta hai, tunnel down rehta hai ya kuch nahi le jaata, aur <code>show crypto ipsec sa</code> zero encapsulated packets dikhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ASA 8.3+ par NAT exemption kya hai?" Twice NAT identity rule, static source khud par aur static destination khud par, section 1 mein. <code>nat 0</code> nahi, jo hata diya gaya. Aur <code>route-lookup</code> sirf identity NAT ke liye valid hai.</p></div>

<div class="scn"><h4>Upgrade ke baad branch jo kuch ping nahi kar paati</h4><p>Bahut purane software se migration ke baad ek branch tunnel up aaya lekin HQ se koi traffic nahi le gaya. 10.0.1.10 se 192.168.50.20 tak <code>packet-tracer</code> ne NAT phase ko INSIDE-NET interface PAT match karte aur 203.0.113.2 par translate karte dikhaya, phir koi VPN encrypt phase nahi. Migrate hui identity rule ek alag object par auto NAT ki tarah bani thi aur kisi kaam ki jagah par nahi thi. Use no-proxy-arp aur route-lookup ke saath section 1 mein twice NAT identity rule ki tarah dobara banane se tunnel theek hua.</p><p><b>Seekh:</b> VPN traffic ko kisi bhi PAT rule ke dekhne se pehle exempt karna hota hai.</p></div>

<div class="iv"><p class="q">"Site-to-site VPN ke liye NAT exemption kyun chahiye, aur no-proxy-arp aur route-lookup kya hain?"</p><p>Kyunki warna interface PAT branch ki taraf ka traffic translate kar dega, jo phir crypto ACL se match nahi karta aur kabhi encrypt nahi hota. Section 1 ka identity twice NAT real addresses rakhta hai. no-proxy-arp ASA ko mapped interface par un real addresses ke liye ARP ka jawab dene se rokta hai; route-lookup ASA se egress interface chunne ke liye NAT divert ki jagah routing table use karwata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity NAT addresses ko khud mein translate karta hai taaki koi broader rule unhe translate na kare.</li>
<li>VPN exemption: twice NAT, static source aur destination khud par, section 1.</li>
<li>no-proxy-arp ASA ko exempted addresses ARP se claim karne se rokta hai.</li>
<li>route-lookup NAT divert ko normal route lookup se badalta hai, sirf identity NAT.</li>
<li>packet-tracer "Static translate X to X" aur phir VPN encrypt phase dikhata hai.</li>
</ul></div>
`}};export{e as default};