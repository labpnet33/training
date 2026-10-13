var e={id:`ndp-recap`,h:{en:`NDP recap: the five messages FHS watches`,hi:`NDP recap: woh paanch messages jinhe FHS dekhta hai`},body:{en:`
<p>Imagine a new tenant moving into a flat. First she shouts in the corridor, "Is there a caretaker here?" (Router Solicitation). The caretaker answers on the notice board for everyone: "I am the caretaker, this building is Block A" (Router Advertisement). Later she wants to post a letter to flat 12, so she knocks on the corridor, "Who lives in flat 12?" (Neighbor Solicitation), and the resident answers, "I do, here is my door" (Neighbor Advertisement). If she uses the wrong staircase, the caretaker says, "Use the other stairs next time" (Redirect). IPv6 <b>Neighbor Discovery Protocol (NDP)</b>, defined in RFC 4861, is exactly this conversation, carried in ICMPv6.</p>

<h3>The five NDP messages</h3>
<table class="cmp"><tr><th>ICMPv6 type</th><th>Message</th><th>Sent by, to</th><th>Purpose</th></tr>
<tr><td>133</td><td>Router Solicitation (RS)</td><td>host to ff02::2 (all routers)</td><td>"Routers, please advertise now."</td></tr>
<tr><td>134</td><td>Router Advertisement (RA)</td><td>router, from its link-local, to ff02::1 (all nodes) or to the asking host</td><td>Prefixes, default router, flags, MTU, hop limit.</td></tr>
<tr><td>135</td><td>Neighbor Solicitation (NS)</td><td>any node to the solicited-node multicast of the target, or unicast</td><td>Address resolution, reachability check, DAD.</td></tr>
<tr><td>136</td><td>Neighbor Advertisement (NA)</td><td>target node, unicast or to ff02::1</td><td>"This IPv6 address is at this MAC."</td></tr>
<tr><td>137</td><td>Redirect</td><td>router to a host</td><td>"A better first hop exists for that destination."</td></tr>
</table>
<p>FHS features classify every packet into one of these types (plus DHCPv6 and plain data) before deciding what to do. That is why the counters you will see later list RS, RA, NS, NA and REDIRECT separately.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="NDP exchanges">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="90" y1="60" x2="90" y2="270" stroke="#64748b" stroke-dasharray="4 4"/><line x1="550" y1="60" x2="550" y2="270" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">RS (133) to ff02::2</text>
<line x1="550" y1="120" x2="90" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">RA (134): prefix, lifetime, M/O flags</text>
<line x1="90" y1="160" x2="550" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">DAD: NS (135), source ::, target = new address</text>
<line x1="90" y1="200" x2="550" y2="200" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">NS (135): who has 2001:db8:a10::1?</text>
<line x1="550" y1="240" x2="90" y2="240" stroke="#64748b" stroke-width="2"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">NA (136): it is at this MAC (S, O flags)</text>
</svg><p class="cap">A host joining the link: ask for routers, receive the RA, check its new address with DAD, then resolve the gateway's MAC.</p></div>

<h3>Key details that matter for security</h3>
<dl class="terms">
<dt>Hop limit 255</dt><dd>Every NDP message is sent with hop limit 255, and receivers drop NDP with any other value. A router decrements the hop limit, so an NDP message that crossed a router can never arrive with 255. Result: NDP spoofing is only possible from the local link.</dd>
<dt>Solicited-node multicast</dt><dd><code>ff02::1:ff</code> followed by the last 24 bits of the target address. For 2001:db8:a10::1 it is <code>ff02::1:ff00:1</code>. Address resolution NS messages go here, so only a few hosts process them.</dd>
<dt>Duplicate Address Detection (DAD)</dt><dd>Before using a new address, a host sends an NS with source address <code>::</code> (unspecified) and target = the tentative address. If anyone answers with an NA, the address is a duplicate and the host must not use it. The address stays <b>tentative</b> until DAD passes.</dd>
<dt>NA flags</dt><dd><b>R</b> (router), <b>S</b> (solicited, this is an answer to an NS), <b>O</b> (override, replace an existing cache entry). An unsolicited NA with O set updates neighbours' caches immediately.</dd>
<dt>Link-layer address options</dt><dd>RS, RA and NS carry a <b>Source Link-Layer Address</b> option; NA carries a <b>Target Link-Layer Address</b> option. These are the MACs that end up in neighbour caches, so they are what an attacker lies about.</dd>
<dt>Neighbor cache states</dt><dd>INCOMPLETE (resolution in progress), REACHABLE (confirmed recently), STALE (not confirmed, still usable), DELAY and PROBE (re-checking). You will meet similar state names in the switch binding table.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> PC1 has MAC 0050.7966.6801 and wants to reach its gateway 2001:db8:a10::1. It sends an NS from its link-local <code>fe80::250:79ff:fe66:6801</code> to <code>ff02::1:ff00:1</code>, hop limit 255, with a Source Link-Layer Address option of 0050.7966.6801. R1 answers with a unicast NA, flags S and O set, target 2001:db8:a10::1, Target Link-Layer Address = R1's MAC. The switch in the middle sees both packets on their ingress ports, which is how an FHS-enabled switch learns that PC1's link-local lives on Gi0/1 with that MAC.</p></div>

<h3>Looking at NDP on IOS</h3>
<pre class="code"><span class="c">! Router view of neighbours and of other routers on the link</span>
show ipv6 neighbors
show ipv6 routers
show ipv6 interface GigabitEthernet0/0
<span class="c">! Watch NDP live (lab only, can be chatty)</span>
debug ipv6 nd</pre>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">2001:DB8:A10::11                            0 0050.7966.6801  REACH Gi0/0</span>
FE80::250:79FF:FE66:6801                    0 0050.7966.6801  REACH Gi0/0</pre>

<div class="warn"><p><b>Common mistake.</b> Thinking an NA is only sent as a reply. Hosts may send <b>unsolicited</b> NAs (for example after a MAC change), and receivers accept them if the O flag is set. That is useful for failover and dangerous if nobody validates it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the type numbers: 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect. Also remember DAD uses an NS (not an NA) with source <code>::</code>, and RAs are always sourced from a <b>link-local</b> address.</p></div>

<div class="scn"><h4>The migrated server that could not get an address</h4><p>After a server was moved to a new VLAN, its IPv6 address stayed "duplicate" and unusable. <code>show ipv6 interface</code> on the server's router peer showed nothing unusual. A packet capture on the access port showed the server's DAD NS being answered within milliseconds by an NA from a VM on another host that still held the same static address from an old test. The team removed the stale address from the VM.</p><p><b>Lesson:</b> DAD trusts any NA. A duplicate, whether accidental or malicious, blocks the address. Chapter 4 shows how the same weakness becomes a denial-of-service attack, and chapter 6 shows how the binding table resolves such claims.</p></div>

<div class="iv"><p class="q">"Why can't an attacker on the Internet spoof an IPv6 Router Advertisement to my hosts?"</p><p>Because NDP messages must arrive with hop limit 255. Every router decrements the hop limit, so any NDP that crossed a router arrives with 254 or less and hosts discard it. RAs must also come from a link-local source. The attacker therefore has to be on the same link, which is why the defence belongs on the access switch. Mention RFC 4861 if you can.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP = ICMPv6 types 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect.</li>
<li>Hop limit 255 limits every NDP threat to the local link.</li>
<li>DAD uses an NS from <code>::</code>; any NA answer marks the address duplicate.</li>
<li>Link-layer address options carry the MAC that ends up in caches; they are what spoofers forge.</li>
<li>FHS classifies traffic into RS, RA, NS, NA, Redirect, DHCPv6 and data, and treats each differently.</li>
</ul></div>
`,hi:`
<p>Socho ek naya kirayedaar flat mein shift ho raha hai. Pehle woh corridor mein awaaz lagata hai, "Yahan koi caretaker hai?" (Router Solicitation). Caretaker sabke liye notice board par jawab deta hai: "Main caretaker hoon, yeh building Block A hai" (Router Advertisement). Baad mein use flat 12 ko chitthi bhejni hai, to woh corridor mein puchhta hai, "Flat 12 mein kaun rehta hai?" (Neighbor Solicitation), aur resident jawab deta hai, "Main, yeh raha mera darwaza" (Neighbor Advertisement). Agar woh galat seedhi use kare, to caretaker kehta hai, "Agli baar doosri seedhi lo" (Redirect). IPv6 <b>Neighbor Discovery Protocol (NDP)</b>, jo RFC 4861 mein define hai, bilkul yahi baatcheet hai, ICMPv6 mein.</p>

<h3>Paanch NDP messages</h3>
<table class="cmp"><tr><th>ICMPv6 type</th><th>Message</th><th>Kaun bhejta hai, kisko</th><th>Maksad</th></tr>
<tr><td>133</td><td>Router Solicitation (RS)</td><td>host se ff02::2 (all routers) ko</td><td>"Routers, abhi advertise karo."</td></tr>
<tr><td>134</td><td>Router Advertisement (RA)</td><td>router, apne link-local se, ff02::1 (all nodes) ya puchhne wale host ko</td><td>Prefixes, default router, flags, MTU, hop limit.</td></tr>
<tr><td>135</td><td>Neighbor Solicitation (NS)</td><td>koi bhi node, target ke solicited-node multicast ya unicast par</td><td>Address resolution, reachability check, DAD.</td></tr>
<tr><td>136</td><td>Neighbor Advertisement (NA)</td><td>target node, unicast ya ff02::1 par</td><td>"Yeh IPv6 address is MAC par hai."</td></tr>
<tr><td>137</td><td>Redirect</td><td>router se host ko</td><td>"Us destination ke liye behtar first hop maujood hai."</td></tr>
</table>
<p>FHS features har packet ko inme se ek type mein (plus DHCPv6 aur plain data) classify karte hain, phir decide karte hain kya karna hai. Isiliye jo counters aap aage dekhoge woh RS, RA, NS, NA aur REDIRECT ko alag alag list karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="NDP exchanges">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="490" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="90" y1="60" x2="90" y2="270" stroke="#64748b" stroke-dasharray="4 4"/><line x1="550" y1="60" x2="550" y2="270" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">RS (133) ff02::2 ko</text>
<line x1="550" y1="120" x2="90" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">RA (134): prefix, lifetime, M/O flags</text>
<line x1="90" y1="160" x2="550" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">DAD: NS (135), source ::, target = naya address</text>
<line x1="90" y1="200" x2="550" y2="200" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">NS (135): 2001:db8:a10::1 kiske paas?</text>
<line x1="550" y1="240" x2="90" y2="240" stroke="#64748b" stroke-width="2"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">NA (136): is MAC par hai (S, O flags)</text>
</svg><p class="cap">Link join karta host: routers ko puchho, RA lo, naye address ko DAD se check karo, phir gateway ka MAC resolve karo.</p></div>

<h3>Security ke liye zaroori details</h3>
<dl class="terms">
<dt>Hop limit 255</dt><dd>Har NDP message hop limit 255 ke saath bheja jaata hai, aur receivers kisi aur value wala NDP drop karte hain. Router hop limit ghataata hai, isliye router cross karke aaya NDP message kabhi 255 ke saath nahi pahunch sakta. Nateeja: NDP spoofing sirf local link se hi possible hai.</dd>
<dt>Solicited-node multicast</dt><dd><code>ff02::1:ff</code> ke baad target address ke aakhri 24 bits. 2001:db8:a10::1 ke liye yeh <code>ff02::1:ff00:1</code> hai. Address resolution NS messages yahan jaate hain, isliye sirf kuch hosts unhe process karte hain.</dd>
<dt>Duplicate Address Detection (DAD)</dt><dd>Naya address use karne se pehle host ek NS bhejta hai jiska source address <code>::</code> (unspecified) aur target = tentative address hota hai. Agar koi NA se jawab de, to address duplicate hai aur host use use nahi kar sakta. DAD pass hone tak address <b>tentative</b> rehta hai.</dd>
<dt>NA flags</dt><dd><b>R</b> (router), <b>S</b> (solicited, yeh kisi NS ka jawab hai), <b>O</b> (override, purani cache entry badlo). O set wala unsolicited NA padosiyon ki cache turant update kar deta hai.</dd>
<dt>Link-layer address options</dt><dd>RS, RA aur NS mein <b>Source Link-Layer Address</b> option hota hai; NA mein <b>Target Link-Layer Address</b> option. Yahi MACs neighbour caches mein jaate hain, isliye attacker inhi ke baare mein jhooth bolta hai.</dd>
<dt>Neighbor cache states</dt><dd>INCOMPLETE (resolution chal raha hai), REACHABLE (haal hi mein confirm), STALE (confirm nahi, par use ho sakta hai), DELAY aur PROBE (dobara check). Switch binding table mein aapko milte-julte state names milenge.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> PC1 ka MAC 0050.7966.6801 hai aur use apne gateway 2001:db8:a10::1 tak pahunchna hai. Woh apne link-local <code>fe80::250:79ff:fe66:6801</code> se <code>ff02::1:ff00:1</code> ko NS bhejta hai, hop limit 255, Source Link-Layer Address option 0050.7966.6801 ke saath. R1 unicast NA se jawab deta hai, flags S aur O set, target 2001:db8:a10::1, Target Link-Layer Address = R1 ka MAC. Beech ka switch dono packets unke ingress ports par dekhta hai, aur isi tarah FHS-enabled switch seekhta hai ki PC1 ka link-local us MAC ke saath Gi0/1 par rehta hai.</p></div>

<h3>IOS par NDP dekhna</h3>
<pre class="code"><span class="c">! Router ka view: neighbours aur link par doosre routers</span>
show ipv6 neighbors
show ipv6 routers
show ipv6 interface GigabitEthernet0/0
<span class="c">! NDP live dekho (sirf lab mein, bahut output aata hai)</span>
debug ipv6 nd</pre>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">2001:DB8:A10::11                            0 0050.7966.6801  REACH Gi0/0</span>
FE80::250:79FF:FE66:6801                    0 0050.7966.6801  REACH Gi0/0</pre>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki NA sirf reply ke roop mein bheja jaata hai. Hosts <b>unsolicited</b> NAs bhi bhej sakte hain (jaise MAC badalne ke baad), aur receivers O flag set ho to unhe accept kar lete hain. Yeh failover ke liye useful hai aur khatarnaak bhi, agar koi validate na kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type numbers yaad rakho: 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect. Yeh bhi yaad rakho ki DAD source <code>::</code> ke saath NS use karta hai (NA nahi), aur RAs hamesha <b>link-local</b> address se source hote hain.</p></div>

<div class="scn"><h4>Migrate hua server jise address nahi mila</h4><p>Ek server ko naye VLAN mein move karne ke baad uska IPv6 address "duplicate" aur bekaar raha. Server ke router peer par <code>show ipv6 interface</code> mein kuch ajeeb nahi tha. Access port par packet capture ne dikhaya ki server ke DAD NS ka jawab milliseconds mein ek doosre host ke VM se NA de raha tha, jiske paas purane test ka wahi static address abhi bhi tha. Team ne VM se stale address hata diya.</p><p><b>Seekh:</b> DAD kisi bhi NA par bharosa karta hai. Duplicate, chahe galti se ho ya jaan-boojh kar, address ko block kar deta hai. Chapter 4 dikhata hai ki yahi kamzori denial-of-service attack kaise banti hai, aur chapter 6 dikhata hai ki binding table aise claims kaise resolve karti hai.</p></div>

<div class="iv"><p class="q">"Internet par baitha attacker mere hosts ko IPv6 Router Advertisement spoof kyun nahi kar sakta?"</p><p>Kyunki NDP messages hop limit 255 ke saath hi pahunchne chahiye. Har router hop limit ghataata hai, isliye router cross karke aaya NDP 254 ya kam ke saath pahunchta hai aur hosts use discard kar dete hain. RAs ka source bhi link-local hona chahiye. Isliye attacker ko same link par hona padega, aur isi wajah se defence access switch par hota hai. Ho sake to RFC 4861 ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP = ICMPv6 types 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect.</li>
<li>Hop limit 255 har NDP threat ko local link tak seemit karta hai.</li>
<li>DAD <code>::</code> se NS use karta hai; koi bhi NA jawab address ko duplicate bana deta hai.</li>
<li>Link-layer address options woh MAC le jaate hain jo caches mein jaata hai; spoofers inhi ko forge karte hain.</li>
<li>FHS traffic ko RS, RA, NS, NA, Redirect, DHCPv6 aur data mein classify karke har ek ke saath alag vyavhaar karta hai.</li>
</ul></div>
`}};export{e as default};