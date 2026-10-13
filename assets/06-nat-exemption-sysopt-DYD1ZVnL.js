var e={id:`nat-exempt`,h:{en:`NAT exemption (identity NAT) and sysopt connection permit-vpn`,hi:`NAT exemption (identity NAT) aur sysopt connection permit-vpn`},body:{en:`
<p>Imagine the courier desk from the last chapter has a rule: before any parcel leaves the building, a clerk sticks the company's public address label over the sender's internal room number. That is PAT. Now the VPN clerk looks at the parcel to decide which van it belongs in, and the label says "from the company front office", not "from room 10.30.0.10". The route card says "parcels from room 10.30 go in van 10", so the parcel misses the van and goes out on the public road. That is exactly what happens when an ASA translates VPN traffic before the crypto map checks it.</p>

<h3>Why NAT breaks the tunnel</h3>
<p>On the ASA, NAT is applied before the packet reaches the crypto map on the outbound interface. HQ almost always has a PAT rule like "inside to outside, translate to the interface address" so users can browse the internet. If PC-HQ 10.30.0.10 pings 10.40.0.10, PAT translates the source to 100.64.51.2. The crypto ACL expects source 10.30.0.0/24, so the packet does not match, is not encrypted, and is sent to the ISP, which drops it. The tunnel never even starts.</p>
<p>The fix is an <b>identity NAT</b> rule (often called NAT exemption, or "no-NAT" in old versions): translate HQ LAN to itself when the destination is the branch LAN. You met identity NAT in sec-asa-nat; here is its main job.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT exemption order">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">10.30.0.10</text>
<rect x="210" y="20" width="200" height="70" rx="8" fill="#fde68a"/><text x="310" y="45" text-anchor="middle" class="svg-ink" font-size="13">NAT section 1</text><text x="310" y="65" text-anchor="middle" class="svg-muted" font-size="12">identity: to 10.40.0.0/24</text><text x="310" y="82" text-anchor="middle" class="svg-muted" font-size="12">source stays 10.30.0.10</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">crypto ACL match</text>
<line x1="170" y1="55" x2="210" y2="55" stroke="#64748b"/><line x1="410" y1="55" x2="450" y2="55" stroke="#64748b"/>
<rect x="210" y="125" width="200" height="60" rx="8" fill="#fed7aa"/><text x="310" y="150" text-anchor="middle" class="svg-ink" font-size="13">Without exemption</text><text x="310" y="170" text-anchor="middle" class="svg-muted" font-size="12">PAT to 100.64.51.2</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="13">no match, sent clear</text>
<line x1="95" y1="80" x2="210" y2="155" stroke="#64748b" stroke-dasharray="4 3"/><line x1="410" y1="155" x2="450" y2="155" stroke="#64748b" stroke-dasharray="4 3"/>
</svg><p class="cap">The identity NAT rule must win before the PAT rule, so the crypto ACL still sees the real LAN address.</p></div>

<h3>Configuring the exemption</h3>
<pre class="code"><span class="c">! Objects from chapter 5</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
<span class="c">! Identity NAT for VPN traffic (manual NAT, section 1)</span>
nat (inside,outside) source static LAN-HQ LAN-HQ destination static LAN-BR LAN-BR no-proxy-arp route-lookup
<span class="c">! Internet PAT stays as auto NAT (section 2) on its own object</span>
object network INSIDE-PAT
 subnet 10.30.0.0 255.255.255.0
 nat (inside,outside) dynamic interface</pre>
<p>Read the rule as: "when traffic goes from inside to outside with source LAN-HQ and destination LAN-BR, translate source LAN-HQ to LAN-HQ and destination LAN-BR to LAN-BR", which is no change at all. <code>no-proxy-arp</code> stops the ASA answering ARP for these addresses on outside, and <code>route-lookup</code> makes the ASA pick the egress interface from the routing table instead of from the NAT rule. Manual NAT (section 1) is checked before auto NAT (section 2), so the exemption wins. If the PAT rule is also a manual NAT rule, insert the exemption above it with a line number, for example <code>nat (inside,outside) 1 source static ...</code>.</p>

<div class="eg"><p><b>Worked example.</b> With the exemption in place, PC-HQ pings 10.40.0.10 twice and opens a web page on 203.0.113.80. <code>show nat detail</code> then shows section 1 hits rising by 2 (the pings, and their replies as untranslate hits) and section 2 PAT hits rising by the web connection. The ping is encrypted; the web traffic leaves with source 100.64.51.2.</p></div>

<pre class="out">HQ-ASA# show nat detail
Manual NAT Policies (Section 1)
1 (inside) to (outside) source static LAN-HQ LAN-HQ   destination static LAN-BR LAN-BR no-proxy-arp route-lookup
<span class="hl">    translate_hits = 2, untranslate_hits = 2</span>
    Source - Origin: 10.30.0.0/24, Translated: 10.30.0.0/24
    Destination - Origin: 10.40.0.0/24, Translated: 10.40.0.0/24

Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-PAT interface
    translate_hits = 1, untranslate_hits = 0</pre>

<h3>sysopt connection permit-vpn: how decrypted traffic gets in</h3>
<p>When ESP from the branch arrives on outside, the ASA decrypts it. The inner packet (10.40.0.10 to 10.30.0.10) now needs permission to enter. By default, <code>sysopt connection permit-vpn</code> is <b>enabled</b>: decrypted traffic bypasses the outside interface ACL. That is why a tunnel works even though the outside ACL denies 10.40.0.0/24. Because it is a default, it does not appear in <code>show running-config</code>; use <code>show running-config all sysopt</code>.</p>
<p>Two ways to restrict what the branch may reach:</p>
<ul>
<li><b>Keep permit-vpn and add a vpn-filter</b> in the group-policy. The filter ACL is written with the <b>remote network as source</b> and the local network as destination, and it applies only to that tunnel.</li>
<li><b>Disable it</b> with <code>no sysopt connection permit-vpn</code>. Now decrypted traffic must be permitted by the outside interface ACL, using the real inner addresses. This affects every VPN on the box, so plan it.</li>
</ul>
<pre class="code"><span class="c">! Branch may reach only the HQ web server on 443</span>
access-list VPN-FILTER-BR extended permit tcp 10.40.0.0 255.255.255.0 host 10.30.0.20 eq 443
group-policy GP-L2L attributes
 vpn-filter value VPN-FILTER-BR</pre>

<h3>The router side</h3>
<p>An IOS router with PAT has the same problem. Its NAT ACL must <b>deny</b> the VPN traffic before the permit for internet traffic, for example <code>deny ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code> followed by <code>permit ip 10.40.0.0 0.0.0.255 any</code>. The module lab has no NAT on the routers, so it is not needed there.</p>

<div class="warn"><p><b>Common mistake.</b> Writing the exemption as an auto NAT on the LAN object, or placing it after a manual "any" PAT rule. The PAT rule matches first and the VPN breaks. Always confirm with <code>show nat detail</code> that the identity rule's hit counters rise.</p></div>
<div class="exam"><p><b>Exam trap.</b> With the default <code>sysopt connection permit-vpn</code>, the outside interface ACL is NOT checked for decrypted VPN traffic. Use a vpn-filter to restrict it. A question that says "add the branch subnet to the outside ACL to allow the tunnel traffic" is wrong unless permit-vpn has been disabled.</p></div>

<div class="scn"><h4>The tunnel that only came up from the branch</h4><p>Branch users could reach HQ servers, but when HQ initiated, nothing happened. <code>show crypto ipsec sa</code> on the ASA showed decaps rising but encaps stuck. <code>packet-tracer input inside icmp 10.30.0.10 8 0 10.40.0.10</code> showed the packet hitting the manual PAT rule <code>source dynamic any interface</code> that a colleague had added at line 1. Moving the identity NAT rule to line 1 fixed both directions.</p><p><b>Lesson:</b> NAT order decides whether VPN traffic is encrypted. Check NAT first when encaps does not rise.</p></div>

<div class="iv"><p class="q">"Why do you need NAT exemption on an ASA for a site-to-site VPN, and what does sysopt connection permit-vpn do?"</p><p>Strong answer: NAT runs before the crypto map check, so without an identity NAT rule the internet PAT translates the LAN source and the packet no longer matches the crypto ACL. The fix is a manual twice-NAT identity rule with no-proxy-arp and route-lookup, placed above any PAT. sysopt connection permit-vpn, on by default, lets decrypted traffic bypass the interface ACL; restrict it per tunnel with a vpn-filter, or disable it and permit inner traffic in the outside ACL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT is applied before the crypto ACL check; translated traffic is not encrypted.</li>
<li>Use manual identity NAT: <code>source static LAN LAN destination static REMOTE REMOTE no-proxy-arp route-lookup</code>.</li>
<li>The exemption must sit above any manual PAT rule; check hits with <code>show nat detail</code>.</li>
<li><code>sysopt connection permit-vpn</code> is on by default and bypasses interface ACLs for decrypted traffic.</li>
<li>Restrict tunnel traffic with a vpn-filter (remote as source) in the group-policy.</li>
</ul></div>
`,hi:`
<p>Socho pichle chapter ki courier desk ka ek rule hai: koi bhi parcel building se nikalne se pehle ek clerk sender ke internal room number ke upar company ka public address label chipka deta hai. Yeh PAT hai. Ab VPN clerk parcel dekhta hai ki woh kis van mein jaayega, aur label kehta hai "company front office se", na ki "room 10.30.0.10 se". Route card kehta hai "room 10.30 ke parcels van 10 mein", isliye parcel van miss kar deta hai aur public road par nikal jaata hai. Bilkul yahi hota hai jab ASA crypto map check se pehle VPN traffic translate kar deta hai.</p>

<h3>NAT tunnel kyun todta hai</h3>
<p>ASA par NAT packet ke outbound interface ke crypto map tak pahunchne se pehle lagta hai. HQ par lagbhag hamesha ek PAT rule hota hai jaise "inside se outside, interface address mein translate karo" taaki users internet browse kar sakein. Agar PC-HQ 10.30.0.10, 10.40.0.10 ko ping kare, to PAT source ko 100.64.51.2 mein translate kar deta hai. Crypto ACL source 10.30.0.0/24 expect karti hai, isliye packet match nahi karta, encrypt nahi hota, aur ISP ko bhej diya jaata hai, jo use drop kar deta hai. Tunnel shuru hi nahi hota.</p>
<p>Fix ek <b>identity NAT</b> rule hai (ise aksar NAT exemption, ya purane versions mein "no-NAT" kehte hain): jab destination branch LAN ho to HQ LAN ko khud mein translate karo. Aap identity NAT sec-asa-nat mein mil chuke ho; yahan uska main kaam hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT exemption order">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">10.30.0.10</text>
<rect x="210" y="20" width="200" height="70" rx="8" fill="#fde68a"/><text x="310" y="45" text-anchor="middle" class="svg-ink" font-size="13">NAT section 1</text><text x="310" y="65" text-anchor="middle" class="svg-muted" font-size="12">identity: 10.40.0.0/24 tak</text><text x="310" y="82" text-anchor="middle" class="svg-muted" font-size="12">source 10.30.0.10 hi rehta hai</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">crypto ACL match</text>
<line x1="170" y1="55" x2="210" y2="55" stroke="#64748b"/><line x1="410" y1="55" x2="450" y2="55" stroke="#64748b"/>
<rect x="210" y="125" width="200" height="60" rx="8" fill="#fed7aa"/><text x="310" y="150" text-anchor="middle" class="svg-ink" font-size="13">Exemption ke bina</text><text x="310" y="170" text-anchor="middle" class="svg-muted" font-size="12">100.64.51.2 mein PAT</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="13">match nahi, clear bheja</text>
<line x1="95" y1="80" x2="210" y2="155" stroke="#64748b" stroke-dasharray="4 3"/><line x1="410" y1="155" x2="450" y2="155" stroke="#64748b" stroke-dasharray="4 3"/>
</svg><p class="cap">Identity NAT rule ko PAT rule se pehle jeetna chahiye, taaki crypto ACL ko asli LAN address dikhe.</p></div>

<h3>Exemption configure karna</h3>
<pre class="code"><span class="c">! Chapter 5 ke objects</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
<span class="c">! VPN traffic ke liye identity NAT (manual NAT, section 1)</span>
nat (inside,outside) source static LAN-HQ LAN-HQ destination static LAN-BR LAN-BR no-proxy-arp route-lookup
<span class="c">! Internet PAT apne object par auto NAT (section 2) hi rehta hai</span>
object network INSIDE-PAT
 subnet 10.30.0.0 255.255.255.0
 nat (inside,outside) dynamic interface</pre>
<p>Rule ko aise padho: "jab traffic inside se outside jaaye source LAN-HQ aur destination LAN-BR ke saath, to source LAN-HQ ko LAN-HQ mein aur destination LAN-BR ko LAN-BR mein translate karo", yaani koi change nahi. <code>no-proxy-arp</code> ASA ko outside par in addresses ke liye ARP ka jawab dene se rokta hai, aur <code>route-lookup</code> ASA ko egress interface NAT rule ke bajaye routing table se chunne deta hai. Manual NAT (section 1) auto NAT (section 2) se pehle check hota hai, isliye exemption jeetta hai. Agar PAT rule bhi manual NAT rule hai, to exemption ko line number ke saath uske upar insert karo, jaise <code>nat (inside,outside) 1 source static ...</code>.</p>

<div class="eg"><p><b>Worked example.</b> Exemption lagne ke baad PC-HQ 10.40.0.10 ko do baar ping karta hai aur 203.0.113.80 par ek web page kholta hai. Tab <code>show nat detail</code> mein section 1 hits 2 se badhte hain (pings, aur unke replies untranslate hits ki tarah) aur section 2 PAT hits web connection se badhte hain. Ping encrypt hota hai; web traffic source 100.64.51.2 ke saath nikalta hai.</p></div>

<pre class="out">HQ-ASA# show nat detail
Manual NAT Policies (Section 1)
1 (inside) to (outside) source static LAN-HQ LAN-HQ   destination static LAN-BR LAN-BR no-proxy-arp route-lookup
<span class="hl">    translate_hits = 2, untranslate_hits = 2</span>
    Source - Origin: 10.30.0.0/24, Translated: 10.30.0.0/24
    Destination - Origin: 10.40.0.0/24, Translated: 10.40.0.0/24

Auto NAT Policies (Section 2)
1 (inside) to (outside) source dynamic INSIDE-PAT interface
    translate_hits = 1, untranslate_hits = 0</pre>

<h3>sysopt connection permit-vpn: decrypted traffic andar kaise aata hai</h3>
<p>Jab branch se ESP outside par aata hai, ASA use decrypt karta hai. Andar wale packet (10.40.0.10 se 10.30.0.10) ko ab andar aane ki permission chahiye. Default se <code>sysopt connection permit-vpn</code> <b>enabled</b> hai: decrypted traffic outside interface ACL ko bypass karta hai. Isiliye tunnel kaam karta hai jabki outside ACL 10.40.0.0/24 ko deny karti hai. Kyunki yeh default hai, yeh <code>show running-config</code> mein nahi dikhta; <code>show running-config all sysopt</code> use karo.</p>
<p>Branch kya reach kar sakti hai use restrict karne ke do tareeke:</p>
<ul>
<li><b>permit-vpn rakho aur group-policy mein vpn-filter jodo.</b> Filter ACL <b>remote network ko source</b> aur local network ko destination rakhkar likhi jaati hai, aur sirf us tunnel par lagti hai.</li>
<li><b>Ise disable karo</b> <code>no sysopt connection permit-vpn</code> se. Ab decrypted traffic ko asli inner addresses ke saath outside interface ACL se permit hona padega. Yeh box ke har VPN ko affect karta hai, isliye plan karo.</li>
</ul>
<pre class="code"><span class="c">! Branch sirf HQ web server ko 443 par reach kar sakti hai</span>
access-list VPN-FILTER-BR extended permit tcp 10.40.0.0 255.255.255.0 host 10.30.0.20 eq 443
group-policy GP-L2L attributes
 vpn-filter value VPN-FILTER-BR</pre>

<h3>Router side</h3>
<p>PAT wale IOS router ki bhi yahi problem hai. Uski NAT ACL ko internet traffic ke permit se pehle VPN traffic ko <b>deny</b> karna chahiye, jaise <code>deny ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code> ke baad <code>permit ip 10.40.0.0 0.0.0.255 any</code>. Module lab ke routers par NAT nahi hai, isliye wahan iski zaroorat nahi.</p>

<div class="warn"><p><b>Common galti.</b> Exemption ko LAN object par auto NAT ki tarah likhna, ya use manual "any" PAT rule ke baad rakhna. PAT rule pehle match karta hai aur VPN toot jaata hai. Hamesha <code>show nat detail</code> se confirm karo ki identity rule ke hit counters badh rahe hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default <code>sysopt connection permit-vpn</code> ke saath decrypted VPN traffic ke liye outside interface ACL check NAHI hoti. Ise restrict karne ke liye vpn-filter use karo. Jo question kahe "tunnel traffic allow karne ke liye branch subnet outside ACL mein jodo" woh galat hai, jab tak permit-vpn disable na kiya gaya ho.</p></div>

<div class="scn"><h4>Woh tunnel jo sirf branch se up hota tha</h4><p>Branch users HQ servers tak pahunch paate the, lekin jab HQ initiate karta, kuch nahi hota. ASA par <code>show crypto ipsec sa</code> mein decaps badh rahe the lekin encaps atke the. <code>packet-tracer input inside icmp 10.30.0.10 8 0 10.40.0.10</code> ne dikhaya ki packet manual PAT rule <code>source dynamic any interface</code> se hit ho raha tha jo ek colleague ne line 1 par joda tha. Identity NAT rule ko line 1 par le jaane se dono directions fix ho gayi.</p><p><b>Seekh:</b> NAT order tay karta hai ki VPN traffic encrypt hoga ya nahi. Jab encaps na badhe to pehle NAT check karo.</p></div>

<div class="iv"><p class="q">"Site-to-site VPN ke liye ASA par NAT exemption kyun chahiye, aur sysopt connection permit-vpn kya karta hai?"</p><p>Strong answer: NAT crypto map check se pehle chalta hai, isliye identity NAT rule ke bina internet PAT LAN source translate kar deta hai aur packet crypto ACL se match nahi karta. Fix hai no-proxy-arp aur route-lookup wala manual twice-NAT identity rule, kisi bhi PAT se upar. sysopt connection permit-vpn, jo default se on hai, decrypted traffic ko interface ACL bypass karne deta hai; ise har tunnel ke liye vpn-filter se restrict karo, ya disable karke outside ACL mein inner traffic permit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT crypto ACL check se pehle lagta hai; translated traffic encrypt nahi hota.</li>
<li>Manual identity NAT use karo: <code>source static LAN LAN destination static REMOTE REMOTE no-proxy-arp route-lookup</code>.</li>
<li>Exemption kisi bhi manual PAT rule ke upar hona chahiye; hits <code>show nat detail</code> se check karo.</li>
<li><code>sysopt connection permit-vpn</code> default se on hai aur decrypted traffic ke liye interface ACLs bypass karta hai.</li>
<li>Tunnel traffic ko group-policy mein vpn-filter (remote source ke roop mein) se restrict karo.</li>
</ul></div>
`}};export{e as default};