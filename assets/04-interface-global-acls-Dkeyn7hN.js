var e={id:`apply`,h:{en:`Applying ACLs: inbound, outbound and global`,hi:`ACLs apply karna: inbound, outbound aur global`},body:{en:`
<p>An ACL is only a list until you bind it. The ASA gives you three places to bind it: <b>inbound</b> on an interface, <b>outbound</b> on an interface, and <b>global</b> (all interfaces, inbound). Choosing the right place keeps the rule set small and easy to reason about.</p>

<h3>The analogy: guards at doors versus a guard at the lobby</h3>
<p>An office floor has several doors. You can post a guard at a door who checks people <b>coming in</b> through it (inbound), a guard who checks people <b>leaving</b> through it (outbound), or one supervisor in the lobby who sees everyone who came in through any door (global). The door guards speak first; the lobby supervisor only sees people the door guards did not decide on.</p>

<h3>Inbound ACLs: the default choice</h3>
<p><code>access-group OUTSIDE_IN in interface outside</code> checks traffic as it <b>enters</b> the ASA on outside. This is the most efficient place: unwanted packets are dropped before routing work and NAT for the source are done. Cisco and most companies use inbound ACLs for almost everything, and a common naming habit is <code>INTERFACE_IN</code> (OUTSIDE_IN, DMZ_IN, INSIDE_IN).</p>

<h3>Outbound ACLs: when many sources share one exit</h3>
<p><code>access-group OUTSIDE_OUT out interface outside</code> checks traffic as it <b>leaves</b> through outside, after the route lookup. It is useful when traffic from several ingress interfaces (inside, dmz, a VPN) must follow the same exit policy, for example "nobody may send SMTP to the internet except MAIL". Instead of copying the same deny into three inbound ACLs, you write it once outbound.</p>
<p>Two facts to remember: the outbound ACL also uses <b>real</b> addresses (the source is 10.0.2.25, not the PAT address), and a packet must pass <b>both</b> the inbound ACL of its ingress interface and the outbound ACL of its egress interface.</p>

<h3>Global ACLs: one policy for all interfaces</h3>
<p><code>access-group GLOBAL_POLICY global</code> applies one ACL to traffic entering <b>every</b> interface. It is always inbound (there is no global outbound). Global ACLs suit policies that do not depend on the interface, such as "block this known-bad network everywhere" or a policy written purely in terms of source and destination objects.</p>
<p>The order is fixed:</p>
<ol>
<li>The interface inbound ACL (if the ingress interface has one).</li>
<li>The global ACL.</li>
<li>The implicit deny.</li>
</ol>
<p>Once a global ACL exists, do not rely on the higher-to-lower security-level permit any more: traffic that no interface ACL decides falls through to the global ACL and then to the implicit deny. Add explicit permits for the traffic you want.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Order of interface and global ACLs">
<rect x="20" y="30" width="130" height="55" rx="8" fill="#fed7aa"/><text x="85" y="53" text-anchor="middle" class="svg-ink" font-size="13">Interface ACL</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="12">in, on ingress</text>
<rect x="190" y="30" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="255" y="53" text-anchor="middle" class="svg-ink" font-size="13">Global ACL</text><text x="255" y="72" text-anchor="middle" class="svg-muted" font-size="12">all interfaces</text>
<rect x="360" y="30" width="130" height="55" rx="8" fill="#e2e8f0"/><text x="425" y="53" text-anchor="middle" class="svg-ink" font-size="13">Implicit deny</text><text x="425" y="72" text-anchor="middle" class="svg-muted" font-size="12">drop, 106023</text>
<rect x="190" y="130" width="130" height="55" rx="8" fill="#bae6fd"/><text x="255" y="153" text-anchor="middle" class="svg-ink" font-size="13">Outbound ACL</text><text x="255" y="172" text-anchor="middle" class="svg-muted" font-size="12">out, on egress</text>
<rect x="500" y="130" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="560" y="160" text-anchor="middle" class="svg-ink" font-size="13">Allowed</text>
<line x1="150" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><line x1="320" y1="57" x2="360" y2="57" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="85" x2="190" y2="155" stroke="#64748b" stroke-width="2"/><line x1="255" y1="85" x2="255" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="157" x2="500" y2="157" stroke="#64748b" stroke-width="2"/>
<text x="130" y="125" text-anchor="middle" class="svg-accent" font-size="12">permit</text><text x="275" y="112" class="svg-accent" font-size="12">permit</text><text x="170" y="50" text-anchor="middle" class="svg-muted" font-size="11">no match</text><text x="340" y="50" text-anchor="middle" class="svg-muted" font-size="11">no match</text>
</svg><p class="cap">Interface inbound first, then global, then implicit deny. A permitted packet is then checked by the outbound ACL of the egress interface, if one exists.</p></div>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! inbound from the internet</span>
access-group OUTSIDE_IN in interface outside
<span class="c">! stop the DMZ from starting sessions into inside</span>
access-list DMZ_IN extended deny ip any object INSIDE-NET
access-list DMZ_IN extended permit tcp object MAIL any eq smtp
access-list DMZ_IN extended permit udp object DMZ-NET any eq domain
access-group DMZ_IN in interface dmz
<span class="c">! one exit policy for everybody leaving to the internet</span>
access-list OUTSIDE_OUT extended permit tcp object MAIL any eq smtp
access-list OUTSIDE_OUT extended deny tcp any any eq smtp
access-list OUTSIDE_OUT extended permit ip any any
access-group OUTSIDE_OUT out interface outside
<span class="c">! a global block list</span>
access-list GLOBAL_POLICY extended deny ip object-group BLOCKLIST any
access-list GLOBAL_POLICY extended permit ip any any
access-group GLOBAL_POLICY global</pre>

<pre class="out">NK-ASA# show running-config access-group
access-group OUTSIDE_IN in interface outside
access-group DMZ_IN in interface dmz
<span class="hl">access-group OUTSIDE_OUT out interface outside</span>
access-group GLOBAL_POLICY global</pre>

<div class="eg"><p><b>Worked example.</b> Why does the DMZ_IN ACL above begin with <code>deny ip any object INSIDE-NET</code>? DMZ (50) to inside (100) is already denied by security levels, but the moment DMZ_IN exists, the levels no longer decide for traffic entering dmz. If a later line said <code>permit ip any any</code> "so servers can get updates", the DMZ could suddenly open sessions to inside. Putting the inside deny first keeps the most important boundary safe even if someone adds a broad permit below it.</p></div>

<h3>One ACL per interface per direction</h3>
<p>If you run <code>access-group NEW_IN in interface outside</code> while OUTSIDE_IN is bound, the new ACL <b>replaces</b> the old binding. That is a useful trick: build and review NEW_IN completely, then swap it in with one command, instead of editing a live ACL line by line. To remove a binding use <code>no access-group OUTSIDE_IN in interface outside</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Binding an ACL <code>out</code> when you meant <code>in</code> (the lab checks for inbound on outside); assuming an interface ACL filters traffic <i>to the ASA itself</i> (it does not, see chapter 9); and adding a global ACL without a final permit, which silently blocks traffic that used to pass by security level.</p></div>

<div class="exam"><p><b>Exam trap.</b> "In which order are the interface ACL and the global ACL processed?" Interface first, then global, then implicit deny. And global ACLs apply only in the inbound direction.</p></div>

<div class="scn"><h4>The global ACL that broke the guest Wi-Fi</h4><p>A hospital added <code>access-group GLOBAL_POLICY global</code> containing only a few deny lines for a threat feed, expecting all other traffic to behave as before. Within minutes the guest Wi-Fi interface (level 20, no ACL of its own) lost internet access. The syslog showed 106023 denies naming GLOBAL_POLICY. Without a final permit, the guest traffic fell through to the implicit deny. Adding <code>permit ip any any</code> at the bottom of GLOBAL_POLICY, below the threat denies, fixed it.</p><p><b>Lesson:</b> a global ACL is still an ACL: it ends with an implicit deny. Design it as a full policy, not as a short block list.</p></div>

<div class="iv"><p class="q">"When would you use an outbound ACL or a global ACL instead of inbound interface ACLs?"</p><p>Strong answer: inbound interface ACLs are the default because they drop early. Use outbound when many ingress interfaces must follow the same egress rule, such as restricting SMTP to the internet to the mail server only. Use a global ACL for interface-independent policy, like a block list. Explain the order (interface, global, implicit deny) and that outbound and global ACLs also match real IPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three bindings: <code>in interface</code>, <code>out interface</code>, <code>global</code> (inbound only).</li>
<li>Order: interface inbound, then global, then implicit deny; outbound on egress is also checked.</li>
<li>Only one ACL per interface per direction; a new access-group replaces the old one.</li>
<li>Protect critical boundaries (DMZ to inside) with an early deny once an ACL exists.</li>
<li>Every ACL, including a global one, ends with an implicit deny.</li>
</ul></div>
`,hi:`
<p>ACL tab tak sirf ek list hai jab tak aap use bind nahi karte. ASA aapko use bind karne ki teen jagah deta hai: interface par <b>inbound</b>, interface par <b>outbound</b>, aur <b>global</b> (saare interfaces, inbound). Sahi jagah chunne se rule set chhota aur samajhne mein aasaan rehta hai.</p>

<h3>Analogy: darwazon par guards banaam lobby mein ek guard</h3>
<p>Ek office floor mein kai darwaze hain. Aap kisi darwaze par ek guard rakh sakte ho jo usse <b>andar aane</b> walon ko check kare (inbound), ek guard jo usse <b>bahar jaane</b> walon ko check kare (outbound), ya lobby mein ek supervisor jo kisi bhi darwaze se aaye har insaan ko dekhe (global). Darwaze ke guards pehle bolte hain; lobby supervisor sirf unhe dekhta hai jinke baare mein darwaze ke guards ne decide nahi kiya.</p>

<h3>Inbound ACLs: default choice</h3>
<p><code>access-group OUTSIDE_IN in interface outside</code> traffic ko check karta hai jab woh outside par ASA mein <b>ghusta</b> hai. Yeh sabse efficient jagah hai: unwanted packets routing ka kaam aur source ka NAT hone se pehle hi drop ho jaate hain. Cisco aur zyada tar companies lagbhag har cheez ke liye inbound ACLs use karti hain, aur naming ki common aadat hai <code>INTERFACE_IN</code> (OUTSIDE_IN, DMZ_IN, INSIDE_IN).</p>

<h3>Outbound ACLs: jab kai sources ek hi exit share karein</h3>
<p><code>access-group OUTSIDE_OUT out interface outside</code> traffic ko route lookup ke baad check karta hai jab woh outside se <b>bahar nikalta</b> hai. Yeh tab useful hai jab kai ingress interfaces (inside, dmz, ek VPN) ke traffic ko same exit policy follow karni ho, jaise "MAIL ke alawa koi internet par SMTP nahi bhej sakta". Same deny ko teen inbound ACLs mein copy karne ke bajaye, aap use ek baar outbound likhte ho.</p>
<p>Do facts yaad rakho: outbound ACL bhi <b>real</b> addresses use karti hai (source 10.0.2.25 hai, PAT address nahi), aur packet ko apne ingress interface ki inbound ACL aur egress interface ki outbound ACL <b>dono</b> pass karni hoti hain.</p>

<h3>Global ACLs: saare interfaces ke liye ek policy</h3>
<p><code>access-group GLOBAL_POLICY global</code> ek ACL ko <b>har</b> interface mein ghusne wale traffic par apply karta hai. Yeh hamesha inbound hota hai (global outbound nahi hota). Global ACLs un policies ke liye theek hain jo interface par depend nahi karti, jaise "is known-bad network ko har jagah block karo" ya aisi policy jo sirf source aur destination objects mein likhi ho.</p>
<p>Order fixed hai:</p>
<ol>
<li>Interface inbound ACL (agar ingress interface par hai).</li>
<li>Global ACL.</li>
<li>Implicit deny.</li>
</ol>
<p>Ek baar global ACL exist kare, to higher-to-lower security-level permit par bharosa mat karo: jis traffic ke baare mein koi interface ACL decide nahi karti, woh global ACL aur phir implicit deny tak gir jaata hai. Jo traffic chahiye uske liye explicit permits jodo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Interface aur global ACLs ka order">
<rect x="20" y="30" width="130" height="55" rx="8" fill="#fed7aa"/><text x="85" y="53" text-anchor="middle" class="svg-ink" font-size="13">Interface ACL</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="12">in, ingress par</text>
<rect x="190" y="30" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="255" y="53" text-anchor="middle" class="svg-ink" font-size="13">Global ACL</text><text x="255" y="72" text-anchor="middle" class="svg-muted" font-size="12">saare interfaces</text>
<rect x="360" y="30" width="130" height="55" rx="8" fill="#e2e8f0"/><text x="425" y="53" text-anchor="middle" class="svg-ink" font-size="13">Implicit deny</text><text x="425" y="72" text-anchor="middle" class="svg-muted" font-size="12">drop, 106023</text>
<rect x="190" y="130" width="130" height="55" rx="8" fill="#bae6fd"/><text x="255" y="153" text-anchor="middle" class="svg-ink" font-size="13">Outbound ACL</text><text x="255" y="172" text-anchor="middle" class="svg-muted" font-size="12">out, egress par</text>
<rect x="500" y="130" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="560" y="160" text-anchor="middle" class="svg-ink" font-size="13">Allowed</text>
<line x1="150" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><line x1="320" y1="57" x2="360" y2="57" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="85" x2="190" y2="155" stroke="#64748b" stroke-width="2"/><line x1="255" y1="85" x2="255" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="157" x2="500" y2="157" stroke="#64748b" stroke-width="2"/>
<text x="130" y="125" text-anchor="middle" class="svg-accent" font-size="12">permit</text><text x="275" y="112" class="svg-accent" font-size="12">permit</text><text x="170" y="50" text-anchor="middle" class="svg-muted" font-size="11">match nahi</text><text x="340" y="50" text-anchor="middle" class="svg-muted" font-size="11">match nahi</text>
</svg><p class="cap">Pehle interface inbound, phir global, phir implicit deny. Permitted packet ko phir egress interface ki outbound ACL check karti hai, agar ho to.</p></div>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! internet se inbound</span>
access-group OUTSIDE_IN in interface outside
<span class="c">! DMZ ko inside mein sessions shuru karne se roko</span>
access-list DMZ_IN extended deny ip any object INSIDE-NET
access-list DMZ_IN extended permit tcp object MAIL any eq smtp
access-list DMZ_IN extended permit udp object DMZ-NET any eq domain
access-group DMZ_IN in interface dmz
<span class="c">! internet ki taraf jaane wale sabke liye ek exit policy</span>
access-list OUTSIDE_OUT extended permit tcp object MAIL any eq smtp
access-list OUTSIDE_OUT extended deny tcp any any eq smtp
access-list OUTSIDE_OUT extended permit ip any any
access-group OUTSIDE_OUT out interface outside
<span class="c">! ek global block list</span>
access-list GLOBAL_POLICY extended deny ip object-group BLOCKLIST any
access-list GLOBAL_POLICY extended permit ip any any
access-group GLOBAL_POLICY global</pre>

<pre class="out">NK-ASA# show running-config access-group
access-group OUTSIDE_IN in interface outside
access-group DMZ_IN in interface dmz
<span class="hl">access-group OUTSIDE_OUT out interface outside</span>
access-group GLOBAL_POLICY global</pre>

<div class="eg"><p><b>Worked example.</b> Upar wali DMZ_IN ACL <code>deny ip any object INSIDE-NET</code> se kyun shuru hoti hai? DMZ (50) se inside (100) security levels se pehle hi denied hai, lekin jaise hi DMZ_IN exist karti hai, dmz mein ghusne wale traffic ke liye levels decide nahi karte. Agar baad ki koi line kehti <code>permit ip any any</code> "taaki servers updates le sakein", to DMZ achanak inside tak sessions khol sakta tha. Inside deny ko pehle rakhne se sabse important boundary safe rehti hai, chahe koi uske neeche broad permit jod de.</p></div>

<h3>Har interface har direction ek ACL</h3>
<p>Agar OUTSIDE_IN bound hote hue aap <code>access-group NEW_IN in interface outside</code> chalate ho, to nayi ACL purani binding ko <b>replace</b> kar deti hai. Yeh useful trick hai: live ACL ko line by line edit karne ke bajaye, NEW_IN ko poora banao aur review karo, phir ek command se swap karo. Binding hataane ke liye <code>no access-group OUTSIDE_IN in interface outside</code> use karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>in</code> ki jagah <code>out</code> bind kar dena (lab outside par inbound check karti hai); yeh maan lena ki interface ACL <i>ASA ko hi</i> jaane wala traffic filter karti hai (nahi karti, chapter 9 dekho); aur final permit ke bina global ACL jodna, jo chupchaap us traffic ko block kar deta hai jo pehle security level se pass hota tha.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Interface ACL aur global ACL kis order mein process hoti hain?" Pehle interface, phir global, phir implicit deny. Aur global ACLs sirf inbound direction mein apply hoti hain.</p></div>

<div class="scn"><h4>Global ACL jisne guest Wi-Fi tod diya</h4><p>Ek hospital ne <code>access-group GLOBAL_POLICY global</code> joda jismein threat feed ke liye sirf kuch deny lines thi, yeh sochte hue ki baaki saara traffic pehle jaisa chalega. Kuch minutes mein guest Wi-Fi interface (level 20, apni koi ACL nahi) ka internet chala gaya. Syslog mein GLOBAL_POLICY naam wale 106023 denies dikhe. Final permit ke bina, guest traffic implicit deny tak gir gaya. GLOBAL_POLICY ke neeche, threat denies ke baad, <code>permit ip any any</code> jodne se theek hua.</p><p><b>Seekh:</b> global ACL bhi ACL hi hai: woh implicit deny par khatam hoti hai. Use chhoti block list nahi, poori policy ki tarah design karo.</p></div>

<div class="iv"><p class="q">"Aap inbound interface ACLs ke bajaye outbound ACL ya global ACL kab use karoge?"</p><p>Strong answer: inbound interface ACLs default hain kyunki woh jaldi drop karti hain. Outbound tab use karo jab kai ingress interfaces ko same egress rule follow karna ho, jaise internet par SMTP ko sirf mail server tak restrict karna. Global ACL interface-independent policy ke liye use karo, jaise block list. Order samjhao (interface, global, implicit deny) aur yeh ki outbound aur global ACLs bhi real IPs match karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen bindings: <code>in interface</code>, <code>out interface</code>, <code>global</code> (sirf inbound).</li>
<li>Order: interface inbound, phir global, phir implicit deny; egress par outbound bhi check hoti hai.</li>
<li>Har interface har direction sirf ek ACL; naya access-group purane ko replace karta hai.</li>
<li>ACL exist karte hi critical boundaries (DMZ se inside) ko early deny se protect karo.</li>
<li>Har ACL, global bhi, implicit deny par khatam hoti hai.</li>
</ul></div>
`}};export{e as default};