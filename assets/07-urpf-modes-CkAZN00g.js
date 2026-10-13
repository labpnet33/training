var e={id:`urpf-modes`,h:{en:`Unicast RPF: strict, loose and VRF mode`,hi:`Unicast RPF: strict, loose aur VRF mode`},body:{en:`
<p>The mailroom clerk has one simple test for each incoming parcel: "If I had to send a reply to this return address, which door would it leave by?" In the strict version of the test, the reply must leave by the <b>same door</b> the parcel came in through. In the relaxed version, it is enough that the return address exists somewhere on the clerk's map. Parcels that fail are shredded. That is <b>unicast reverse path forwarding</b>: a check on the <b>source</b> address of each packet, using the router's own forwarding table.</p>

<h3>Why it exists</h3>
<p>Many denial-of-service attacks use <b>spoofed</b> source addresses: the attacker forges the source so replies and blame go elsewhere. BCP 38 asks every network edge to drop packets whose source could not legitimately come from that direction. You could write an ACL per customer, but ACLs must be maintained by hand. uRPF uses the routing table, so it updates itself when routes change.</p>

<h3>How the check works</h3>
<p>For every packet arriving on an interface with uRPF, the router looks up the <b>source</b> address in the <b>FIB</b> (the CEF table). CEF must therefore be enabled, which it is by default on modern IOS (<code>ip cef</code>). Then:</p>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>Packet passes when</th><th>Typical place</th></tr>
<tr><td><b>Strict</b></td><td><code>ip verify unicast source reachable-via rx</code></td><td>The best route (or one of the equal-cost best routes) to the source points out of the interface the packet <b>arrived on</b></td><td>Customer-facing and access edges, single-homed links</td></tr>
<tr><td><b>Loose</b></td><td><code>ip verify unicast source reachable-via any</code></td><td>Any route to the source exists in the FIB, through any interface, and it is not a Null0 route</td><td>Multihomed and provider links with asymmetric routing</td></tr>
<tr><td><b>VRF mode</b></td><td><code>ip verify unicast vrf NAME permit|deny</code></td><td>The source is looked up in the table of the named VRF; found sources are permitted or denied</td><td>PE and shared-service edges, source-based blackholing</td></tr></table>
<p>On an interface that belongs to a VRF, strict and loose checks are done against that VRF's FIB. The explicit VRF mode goes further and lets you check the source against a <b>different</b> VRF table, for example a "blackhole" VRF that holds known bad sources, and <code>deny</code> any packet whose source is found there.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Strict versus loose uRPF">
<rect x="250" y="90" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">FIB lookup of SOURCE</text>
<rect x="20" y="100" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="13">Customer LAN</text><text x="95" y="139" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A (Gi0/0)</text><text x="545" y="59" text-anchor="middle" class="svg-muted" font-size="12">route back here</text>
<rect x="470" y="180" width="150" height="50" rx="8" fill="#fed7aa"/><text x="545" y="202" text-anchor="middle" class="svg-ink" font-size="13">ISP-B (Gi0/2)</text><text x="545" y="219" text-anchor="middle" class="svg-muted" font-size="12">traffic arrives here</text>
<line x1="170" y1="125" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="140" x2="470" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="210" y="115" text-anchor="middle" class="svg-accent" font-size="12">strict</text>
<text x="440" y="185" text-anchor="middle" class="svg-accent" font-size="12">loose</text>
</svg><p class="cap">Strict on the single-homed customer side, loose on the provider side where return traffic uses a different link.</p></div>

<h3>The options that change the result</h3>
<ul>
<li><b>allow-default</b>: by default the check <b>ignores the default route</b>. A source covered only by 0.0.0.0/0 fails in both modes. With <code>allow-default</code>, loose mode lets such sources pass, which makes loose mode almost useless on a router whose default covers everything; in strict mode the default route must point out of the arrival interface.</li>
<li><b>allow-self-ping</b>: lets the router ping its own interface addresses through uRPF. It is off by default and should normally stay off, because it can be abused.</li>
<li><b>ACL exception</b>: <code>ip verify unicast source reachable-via rx 110</code>. A packet that fails the check is compared with ACL 110; if the ACL permits it, the packet is forwarded anyway and counted as a <b>suppressed</b> drop. If the ACL denies it, it is dropped.</li>
<li><b>Null0</b>: a source whose best match is a Null0 route fails in both modes. This is how source-based remote-triggered black hole filtering works together with loose uRPF.</li>
</ul>
<p>The older command <code>ip verify unicast reverse-path</code> is the legacy strict-mode form; you may still see it in older configurations. For IPv6 the commands are the same with <code>ipv6</code> in front: <code>ipv6 verify unicast source reachable-via rx</code>.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show ip interface GigabitEthernet0/1 | include verify|drops
  <span class="hl">IP verify source reachable-via RX</span>
   <span class="hl">5 verification drops</span>
   0 suppressed verification drops

EDGE# show ip traffic | include RPF
         0 no route, <span class="hl">5 unicast RPF</span>, 0 forced drop

EDGE# show cef interface GigabitEthernet0/1 | include RPF
  IP unicast RPF check is enabled</pre>

<div class="eg"><p><b>Worked example.</b> EDGE has <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1</code> and <code>ip route 198.51.100.0 255.255.255.0 100.64.1.1</code>, both via ISP-A on Gi0/0. With loose mode on Gi0/2: a packet from 198.51.100.10 passes, because a specific route exists. A packet from 192.0.2.66 matches only the default route, which is ignored, so it is dropped. If you added <code>allow-default</code>, 192.0.2.66 would pass too, and loose mode would stop protecting anything on that link.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling strict mode on a link where traffic arrives but the return route leaves elsewhere. Adding <code>allow-default</code> to "fix" drops without understanding that it disables most of the protection. Forgetting that uRPF needs CEF; if CEF is disabled, the command is refused or has no effect.</p></div>

<div class="exam"><p><b>Exam trap.</b> uRPF checks the <b>source</b> address, not the destination. Strict equals <code>rx</code>, loose equals <code>any</code>. The default route is ignored unless <code>allow-default</code> is configured. Packets failing the check but permitted by the exception ACL are forwarded and counted as suppressed drops.</p></div>

<div class="scn"><h4>The spoofing customer</h4><p>A provider's abuse desk received complaints that one of its customers was sending traffic with sources from 203.0.113.0/24, a range the customer did not own. The customer link was single-homed, so the engineer enabled <code>ip verify unicast source reachable-via rx</code> on it. Within minutes <code>show ip interface</code> showed thousands of verification drops and the complaints stopped, while the customer's real 10.30.0.0/24 traffic kept flowing.</p><p><b>Lesson:</b> strict uRPF on single-homed customer edges is the cheapest anti-spoofing filter there is.</p></div>

<div class="iv"><p class="q">"Explain strict versus loose uRPF and where you would use each."</p><p>Strong answer: both look up the packet's source in the FIB. Strict requires the best route to the source to leave through the same interface the packet arrived on, so it suits single-homed customer and access edges. Loose only requires that some route exists, not via Null0 and not only the default, so it suits multihomed or asymmetric links. Mention allow-default, the exception ACL with suppressed drops, and that CEF is required.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>uRPF drops packets whose source address fails a FIB lookup test; CEF is required.</li>
<li>Strict (<code>rx</code>): route back must use the arrival interface. Loose (<code>any</code>): any route except Null0.</li>
<li>VRF mode checks the source against a VRF table and can permit or deny matches.</li>
<li>The default route is ignored unless <code>allow-default</code>; <code>allow-self-ping</code> is off by default.</li>
<li>Verify with <code>show ip interface</code> (verification drops) and <code>show ip traffic</code> (unicast RPF).</li>
</ul></div>
`,hi:`
<p>Mailroom clerk ke paas har aane wale parcel ke liye ek simple test hai: "Agar mujhe is return address par jawab bhejna ho, to woh kis darwaze se niklega?" Test ke strict version mein, jawab <b>usi darwaze</b> se nikalna chahiye jisse parcel aaya. Relaxed version mein, itna kaafi hai ki return address clerk ke map par kahin exist kare. Fail hone wale parcels shred ho jaate hain. Yahi hai <b>unicast reverse path forwarding</b>: router ki apni forwarding table se har packet ke <b>source</b> address ka check.</p>

<h3>Yeh kyun hai</h3>
<p>Kai denial-of-service attacks <b>spoofed</b> source addresses use karte hain: attacker source jaali banata hai taaki replies aur ilzaam kahin aur jaayein. BCP 38 har network edge se kehta hai ki woh packets drop karo jinka source us direction se jaayaz roop se aa hi nahi sakta. Aap har customer ke liye ACL likh sakte ho, lekin ACLs haath se maintain karni padti hain. uRPF routing table use karta hai, isliye routes badalne par khud update ho jaata hai.</p>

<h3>Check kaise kaam karta hai</h3>
<p>uRPF wale interface par aane wale har packet ke liye router <b>source</b> address ko <b>FIB</b> (CEF table) mein dhoondhta hai. Isliye CEF enabled hona chahiye, jo modern IOS par default mein hota hai (<code>ip cef</code>). Phir:</p>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>Packet kab pass</th><th>Typical jagah</th></tr>
<tr><td><b>Strict</b></td><td><code>ip verify unicast source reachable-via rx</code></td><td>Source ka best route (ya equal-cost best routes mein se ek) usi interface se bahar jaaye jis par packet <b>aaya</b></td><td>Customer-facing aur access edges, single-homed links</td></tr>
<tr><td><b>Loose</b></td><td><code>ip verify unicast source reachable-via any</code></td><td>FIB mein source ka koi bhi route ho, kisi bhi interface se, aur woh Null0 route na ho</td><td>Asymmetric routing wale multihomed aur provider links</td></tr>
<tr><td><b>VRF mode</b></td><td><code>ip verify unicast vrf NAME permit|deny</code></td><td>Source ko named VRF ki table mein dhoondha jaata hai; mile hue sources permit ya deny hote hain</td><td>PE aur shared-service edges, source-based blackholing</td></tr></table>
<p>Jo interface kisi VRF mein hai, us par strict aur loose checks us VRF ki FIB se hote hain. Explicit VRF mode aur aage jaata hai aur aapko source ko ek <b>alag</b> VRF table se check karne deta hai, jaise ek "blackhole" VRF jismein jaane-maane kharab sources hain, aur jis packet ka source wahan mile use <code>deny</code> kar do.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Strict vs loose uRPF">
<rect x="250" y="90" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">SOURCE ka FIB lookup</text>
<rect x="20" y="100" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="13">Customer LAN</text><text x="95" y="139" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A (Gi0/0)</text><text x="545" y="59" text-anchor="middle" class="svg-muted" font-size="12">wapas ka route yahan</text>
<rect x="470" y="180" width="150" height="50" rx="8" fill="#fed7aa"/><text x="545" y="202" text-anchor="middle" class="svg-ink" font-size="13">ISP-B (Gi0/2)</text><text x="545" y="219" text-anchor="middle" class="svg-muted" font-size="12">traffic yahan aata hai</text>
<line x1="170" y1="125" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="140" x2="470" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="210" y="115" text-anchor="middle" class="svg-accent" font-size="12">strict</text>
<text x="440" y="185" text-anchor="middle" class="svg-accent" font-size="12">loose</text>
</svg><p class="cap">Single-homed customer side par strict, provider side par loose jahan return traffic alag link use karta hai.</p></div>

<h3>Options jo result badalte hain</h3>
<ul>
<li><b>allow-default</b>: default mein check <b>default route ko ignore</b> karta hai. Jo source sirf 0.0.0.0/0 se cover ho woh dono modes mein fail hota hai. <code>allow-default</code> ke saath loose mode aise sources ko pass hone deta hai, jisse us router par loose mode lagbhag bekaar ho jaata hai jiska default sab kuch cover karta hai; strict mode mein default route arrival interface se bahar point karna chahiye.</li>
<li><b>allow-self-ping</b>: router ko uRPF ke through apne interface addresses ping karne deta hai. Yeh default mein off hai aur normally off hi rehna chahiye, kyunki iska galat use ho sakta hai.</li>
<li><b>ACL exception</b>: <code>ip verify unicast source reachable-via rx 110</code>. Check mein fail hone wala packet ACL 110 se compare hota hai; agar ACL permit kare, to packet phir bhi forward hota hai aur <b>suppressed</b> drop gina jaata hai. Agar ACL deny kare, to drop hota hai.</li>
<li><b>Null0</b>: jis source ka best match Null0 route hai woh dono modes mein fail hota hai. Isi tarah loose uRPF ke saath source-based remote-triggered black hole filtering kaam karti hai.</li>
</ul>
<p>Purani command <code>ip verify unicast reverse-path</code> legacy strict-mode form hai; aap ise purani configurations mein abhi bhi dekh sakte ho. IPv6 ke liye commands same hain, aage <code>ipv6</code> ke saath: <code>ipv6 verify unicast source reachable-via rx</code>.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show ip interface GigabitEthernet0/1 | include verify|drops
  <span class="hl">IP verify source reachable-via RX</span>
   <span class="hl">5 verification drops</span>
   0 suppressed verification drops

EDGE# show ip traffic | include RPF
         0 no route, <span class="hl">5 unicast RPF</span>, 0 forced drop

EDGE# show cef interface GigabitEthernet0/1 | include RPF
  IP unicast RPF check is enabled</pre>

<div class="eg"><p><b>Worked example.</b> EDGE par <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1</code> aur <code>ip route 198.51.100.0 255.255.255.0 100.64.1.1</code> hain, dono Gi0/0 par ISP-A ke through. Gi0/2 par loose mode ke saath: 198.51.100.10 ka packet pass hota hai, kyunki specific route exist karta hai. 192.0.2.66 ka packet sirf default route se match karta hai, jo ignore hota hai, isliye drop hota hai. Agar aap <code>allow-default</code> jodte, to 192.0.2.66 bhi pass ho jaata, aur loose mode us link par kuch bhi protect karna band kar deta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Us link par strict mode lagana jahan traffic aata hai lekin return route kahin aur se nikalta hai. Drops "theek" karne ke liye <code>allow-default</code> jodna, yeh samjhe bina ki woh zyadatar protection band kar deta hai. Bhool jaana ki uRPF ko CEF chahiye; CEF disabled ho to command mana ho jaati hai ya uska koi asar nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> uRPF <b>source</b> address check karta hai, destination nahi. Strict barabar <code>rx</code>, loose barabar <code>any</code>. <code>allow-default</code> configure na ho to default route ignore hota hai. Check mein fail lekin exception ACL se permit hone wale packets forward hote hain aur suppressed drops gine jaate hain.</p></div>

<div class="scn"><h4>Spoofing karta customer</h4><p>Ek provider ke abuse desk ko shikayatein mili ki uska ek customer 203.0.113.0/24 ke sources ke saath traffic bhej raha hai, ek range jo customer ki thi hi nahi. Customer link single-homed tha, isliye engineer ne us par <code>ip verify unicast source reachable-via rx</code> chalu kiya. Minuton mein <code>show ip interface</code> ne hazaaron verification drops dikhaye aur shikayatein band ho gayi, jabki customer ka asli 10.30.0.0/24 traffic chalta raha.</p><p><b>Seekh:</b> single-homed customer edges par strict uRPF sabse sasta anti-spoofing filter hai.</p></div>

<div class="iv"><p class="q">"Strict aur loose uRPF samjhao aur batao har ek kahan use karoge."</p><p>Strong answer: dono packet ke source ko FIB mein dhoondhte hain. Strict maangta hai ki source ka best route usi interface se nikle jis par packet aaya, isliye yeh single-homed customer aur access edges ke liye theek hai. Loose sirf maangta hai ki koi route exist kare, Null0 nahi aur sirf default nahi, isliye yeh multihomed ya asymmetric links ke liye theek hai. allow-default, suppressed drops wala exception ACL, aur CEF ki zaroorat ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>uRPF un packets ko drop karta hai jinka source address FIB lookup test fail kare; CEF zaroori hai.</li>
<li>Strict (<code>rx</code>): wapas ka route arrival interface se jaana chahiye. Loose (<code>any</code>): Null0 ke alawa koi bhi route.</li>
<li>VRF mode source ko VRF table se check karta hai aur matches ko permit ya deny kar sakta hai.</li>
<li><code>allow-default</code> ke bina default route ignore hota hai; <code>allow-self-ping</code> default mein off hai.</li>
<li><code>show ip interface</code> (verification drops) aur <code>show ip traffic</code> (unicast RPF) se verify karo.</li>
</ul></div>
`}};export{e as default};