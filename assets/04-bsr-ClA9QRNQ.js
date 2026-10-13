var e={id:`bsr`,h:{en:`BSR: bootstrap election, candidate RPs and the hash mask`,hi:`BSR: bootstrap election, candidate RPs aur hash mask`},body:{en:`
<p><b>BSR</b> (bootstrap router) is the open-standard way to distribute RP information. It is defined for PIM version 2, so it works between vendors, and it has no chicken-and-egg problem because its messages are carried by PIM itself, hop by hop, not by multicast groups that need an RP. If your network mixes Cisco and Juniper, BSR is the dynamic method you will meet.</p>

<h3>Two roles again, with one extra twist</h3>
<ul>
<li>A <b>candidate BSR (C-BSR)</b> says "I can be the BSR". Among all candidates, <b>one is elected</b>: highest BSR priority wins, and the highest IP address breaks a tie.</li>
<li>A <b>candidate RP (C-RP)</b> says "I can be the RP for these groups". It does not flood anything. It sends its advertisement by <b>unicast</b> to the elected BSR.</li>
<li>The elected <b>BSR</b> collects all C-RP advertisements into an <b>RP-set</b> and floods it, in <b>Bootstrap messages</b>, hop by hop to every PIM router. Each router then applies the same rules to the same RP-set, so all routers reach the same answer.</li>
</ul>
<p>The twist compared with Auto-RP: the BSR does not choose the RP. It only distributes the full list. Every router calculates the choice itself with a fixed algorithm.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BSR message flow">
<rect x="245" y="15" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">R1 elected BSR</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">priority 10, 1.1.1.1</text>
<rect x="20" y="150" width="130" height="55" rx="8" fill="#fde68a"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">R3 candidate RP</text><text x="85" y="192" text-anchor="middle" class="svg-muted" font-size="12">priority 5</text>
<rect x="255" y="150" width="130" height="55" rx="8" fill="#bae6fd"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">R4 any router</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">learns RP-set</text>
<rect x="490" y="150" width="130" height="55" rx="8" fill="#fde68a"/><text x="555" y="173" text-anchor="middle" class="svg-ink" font-size="13">R5 candidate RP</text><text x="555" y="192" text-anchor="middle" class="svg-muted" font-size="12">priority 10</text>
<line x1="110" y1="150" x2="270" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="120" y="105" class="svg-muted" font-size="12">unicast C-RP adv</text>
<line x1="530" y1="150" x2="370" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<line x1="320" y1="65" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><text x="330" y="112" class="svg-accent" font-size="12">Bootstrap flood (PIM)</text>
</svg><p class="cap">C-RPs talk to the BSR by unicast. The BSR floods the complete RP-set to all routers.</p></div>

<h3>How a router picks the RP from the set</h3>
<p>For a given group, every router applies the same four steps in order:</p>
<ol>
<li>Keep only C-RPs whose advertised group range contains the group, and take the <b>longest (most specific) range</b>.</li>
<li>Among them the <b>lowest priority value</b> wins (0 is the best; this is the opposite of the BSR election, where high wins).</li>
<li>If still tied, the highest <b>hash value</b> wins. The hash is a calculation over the group address, the C-RP address and the <b>hash mask length</b> given by the BSR. With mask length 0 every group gives the same hash result, so all groups choose the same RP. With a longer mask, different groups spread over the C-RPs, which gives load sharing.</li>
<li>If still tied, the highest RP address wins.</li>
</ol>
<p>The default hash mask length is 0 and the default priority is 0, both for C-BSR and C-RP. A C-RP interval of 60 seconds is the default (holdtime 150 seconds).</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1: candidate BSR, hash mask length 24, priority 10</span>
ip pim bsr-candidate Loopback0 24 10
<span class="c">! R2: backup candidate BSR, defaults</span>
ip pim bsr-candidate Loopback0
<span class="c">! R3 and R5: candidate RPs, lower priority value preferred</span>
ip pim rp-candidate Loopback0 priority 5
ip pim rp-candidate Loopback0 priority 10
<span class="c">! restrict a candidate RP to one range</span>
access-list 50 permit 239.50.0.0 0.0.255.255
ip pim rp-candidate Loopback0 group-list 50 priority 200</pre>
<p>The syntax is <code>ip pim bsr-candidate &lt;interface&gt; [hash-mask-len [priority]]</code> and <code>ip pim rp-candidate &lt;interface&gt; [group-list acl] [priority n] [interval s]</code>. No listener is needed. The interfaces need PIM sparse mode.</p>

<h3>Verify</h3>
<pre class="out">R4#show ip pim bsr-router
PIMv2 Bootstrap information
  <span class="hl">BSR address: 1.1.1.1 (?)</span>
  Uptime:      00:01:24, BSR Priority: 10, Hash mask length: 24
  Expires:     00:01:46

R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, <span class="hl">priority 5</span>, holdtime 150
  RP 5.5.5.5 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 10, holdtime 150

R3#show ip pim bsr-router
PIMv2 Bootstrap information
  BSR address: 1.1.1.1 (?)
  Uptime:      00:01:24, BSR Priority: 10, Hash mask length: 24
  Expires:     00:01:46
  Candidate RP: 3.3.3.3(Loopback0)
    Holdtime 150 seconds
    Advertisement interval 60 seconds
    Next advertisement in 00:00:17</pre>
<p>On the BSR itself the output starts with <code>This system is the Bootstrap Router (BSR)</code> and shows when the next bootstrap message goes out. Notice that R4 lists <i>both</i> C-RPs but uses 3.3.3.3, the one with the lower priority value. The mapping shows all candidates; the choice is made per group.</p>

<h3>Why the flood can break</h3>
<p>A Bootstrap message is accepted only if it arrives on the interface that the router would use to reach the BSR (the RPF interface). So a missing <code>ip pim sparse-mode</code> on one link, or an RPF problem, stops the flood at that point, and routers behind it can elect a different BSR or none. Also, a C-RP advertisement reaches the BSR only if the <i>unicast</i> path works: a candidate RP loopback that is not in OSPF never gets into the RP-set.</p>

<div class="note"><p><b>Junos note.</b> On Junos, BSR is configured under <code>protocols pim rp bootstrap</code> (candidate BSR, with <code>priority</code>) and <code>protocols pim rp local</code> (candidate RP, advertised through BSR). The ideas are identical.</p>
<pre class="code">set protocols pim rp bootstrap family inet priority 10
set protocols pim rp local address 3.3.3.3 priority 5 group-ranges 224.0.0.0/4</pre></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading priority the wrong way: for the BSR election <b>high</b> wins, for choosing the RP <b>low</b> wins. (2) Expecting the BSR to pick the RP. (3) A candidate loopback not advertised in the IGP. (4) A link without PIM that splits the flood.</p></div>
<div class="exam"><p><b>Exam trap.</b> The most specific group range wins before priority is compared. A C-RP for 239.50.0.0/16 with priority 200 beats a C-RP for 224.0.0.0/4 with priority 0, for groups in that /16.</p></div>

<div class="scn"><h4>Lab 3 walk-through: the election and the backup</h4><p>In <b>mq-rp-bsr</b> Zenith Logistics has two candidate BSRs and two candidate RPs. With R1 at priority 10, every router elects 1.1.1.1, even though R2 has the higher address, because priority is compared first. Remove R1's candidate line and the whole network re-elects 2.2.2.2 without a single change on the other routers. Then you give R5 a /16 with a bad priority (200) and see that the /16 still wins for 239.50.1.1.</p><p><b>Lesson:</b> to move one range to a different RP, give that RP a more specific range; do not fight with priority numbers.</p></div>

<div class="iv"><p class="q">"What is the difference between Auto-RP and BSR?"</p><p>Strong answer: Auto-RP is Cisco proprietary, the mapping agent <i>chooses</i> one RP per range and sends it on 224.0.1.40, and needs a listener or dense mode. BSR is an open standard in PIMv2, the BSR floods the whole RP-set inside PIM messages, and each router chooses the RP with the hash algorithm. BSR has no chicken-and-egg problem and gives load sharing with a hash mask.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>C-BSR election: highest priority, then highest address.</li>
<li>C-RPs send unicast advertisements to the elected BSR; the BSR floods the RP-set.</li>
<li>Choice per group: longest range, lowest priority value, highest hash, highest address.</li>
<li>Hash mask length 0 means one RP for all groups; longer masks spread groups.</li>
<li>A PIM or RPF break stops the flood; an unreachable C-RP never enters the set.</li>
</ul></div>
`,hi:`
<p><b>BSR</b> (bootstrap router) RP information distribute karne ka open-standard tareeka hai. Yeh PIM version 2 ke liye define hua hai, isliye vendors ke beech kaam karta hai, aur isme chicken-and-egg problem nahi hai kyunki iske messages PIM khud hop by hop le jaata hai, aise multicast groups se nahi jinhe RP chahiye. Agar aapke network mein Cisco aur Juniper mix hain, to BSR woh dynamic method hai jo aapko milega.</p>

<h3>Phir se do roles, ek extra twist ke saath</h3>
<ul>
<li><b>Candidate BSR (C-BSR)</b> kehta hai "main BSR ban sakta hoon". Saare candidates mein se <b>ek elect hota hai</b>: sabse high BSR priority jeetti hai, aur tie par sabse high IP address.</li>
<li><b>Candidate RP (C-RP)</b> kehta hai "main in groups ka RP ban sakta hoon". Yeh kuch flood nahi karta. Yeh apna advertisement elected BSR ko <b>unicast</b> se bhejta hai.</li>
<li>Elected <b>BSR</b> saare C-RP advertisements ko ek <b>RP-set</b> mein collect karke <b>Bootstrap messages</b> mein hop by hop har PIM router tak flood karta hai. Phir har router same RP-set par same rules lagata hai, isliye saare routers same jawab tak pahunchte hain.</li>
</ul>
<p>Auto-RP ke muqable twist yeh hai: BSR RP chunta nahi. Woh sirf poori list distribute karta hai. Har router fixed algorithm se choice khud calculate karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BSR message flow">
<rect x="245" y="15" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">R1 elected BSR</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">priority 10, 1.1.1.1</text>
<rect x="20" y="150" width="130" height="55" rx="8" fill="#fde68a"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">R3 candidate RP</text><text x="85" y="192" text-anchor="middle" class="svg-muted" font-size="12">priority 5</text>
<rect x="255" y="150" width="130" height="55" rx="8" fill="#bae6fd"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">R4 koi bhi router</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">RP-set seekhta hai</text>
<rect x="490" y="150" width="130" height="55" rx="8" fill="#fde68a"/><text x="555" y="173" text-anchor="middle" class="svg-ink" font-size="13">R5 candidate RP</text><text x="555" y="192" text-anchor="middle" class="svg-muted" font-size="12">priority 10</text>
<line x1="110" y1="150" x2="270" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="120" y="105" class="svg-muted" font-size="12">unicast C-RP adv</text>
<line x1="530" y1="150" x2="370" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<line x1="320" y1="65" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><text x="330" y="112" class="svg-accent" font-size="12">Bootstrap flood (PIM)</text>
</svg><p class="cap">C-RPs BSR se unicast mein baat karte hain. BSR poora RP-set saare routers ko flood karta hai.</p></div>

<h3>Router set se RP kaise chunta hai</h3>
<p>Diye gaye group ke liye har router yehi chaar steps order mein lagata hai:</p>
<ol>
<li>Sirf woh C-RPs rakho jinki advertised group range mein group aata hai, aur <b>sabse lambi (specific) range</b> lo.</li>
<li>Unmein <b>sabse kam priority value</b> jeetti hai (0 sabse achhi; yeh BSR election ka ulta hai, jahan high jeetta hai).</li>
<li>Phir bhi tie ho to sabse high <b>hash value</b> jeetti hai. Hash group address, C-RP address aur BSR ki di hui <b>hash mask length</b> par calculation hai. Mask length 0 ke saath har group ka hash result same aata hai, isliye saare groups same RP chunte hain. Lambi mask ke saath alag groups C-RPs mein bant jaate hain, jo load sharing deta hai.</li>
<li>Phir bhi tie ho to sabse high RP address jeetta hai.</li>
</ol>
<p>Default hash mask length 0 hai aur default priority 0 hai, C-BSR aur C-RP dono ke liye. C-RP ka 60 seconds interval default hai (holdtime 150 seconds).</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1: candidate BSR, hash mask length 24, priority 10</span>
ip pim bsr-candidate Loopback0 24 10
<span class="c">! R2: backup candidate BSR, defaults</span>
ip pim bsr-candidate Loopback0
<span class="c">! R3 aur R5: candidate RPs, kam priority value preferred</span>
ip pim rp-candidate Loopback0 priority 5
ip pim rp-candidate Loopback0 priority 10
<span class="c">! candidate RP ko ek range tak restrict karo</span>
access-list 50 permit 239.50.0.0 0.0.255.255
ip pim rp-candidate Loopback0 group-list 50 priority 200</pre>
<p>Syntax hai <code>ip pim bsr-candidate &lt;interface&gt; [hash-mask-len [priority]]</code> aur <code>ip pim rp-candidate &lt;interface&gt; [group-list acl] [priority n] [interval s]</code>. Listener ki zaroorat nahi. Interfaces par PIM sparse mode chahiye.</p>

<h3>Verify</h3>
<pre class="out">R4#show ip pim bsr-router
PIMv2 Bootstrap information
  <span class="hl">BSR address: 1.1.1.1 (?)</span>
  Uptime:      00:01:24, BSR Priority: 10, Hash mask length: 24
  Expires:     00:01:46

R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, <span class="hl">priority 5</span>, holdtime 150
  RP 5.5.5.5 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 10, holdtime 150

R3#show ip pim bsr-router
PIMv2 Bootstrap information
  BSR address: 1.1.1.1 (?)
  Uptime:      00:01:24, BSR Priority: 10, Hash mask length: 24
  Expires:     00:01:46
  Candidate RP: 3.3.3.3(Loopback0)
    Holdtime 150 seconds
    Advertisement interval 60 seconds
    Next advertisement in 00:00:17</pre>
<p>BSR par khud output <code>This system is the Bootstrap Router (BSR)</code> se shuru hota hai aur dikhata hai ki agla bootstrap message kab jaayega. Dhyan do ki R4 <i>dono</i> C-RPs list karta hai lekin 3.3.3.3 use karta hai, jiski priority value kam hai. Mapping saare candidates dikhata hai; choice har group ke liye hoti hai.</p>

<h3>Flood kyun toot sakta hai</h3>
<p>Bootstrap message tabhi accept hota hai jab woh us interface par aaye jisse router BSR tak jaata (RPF interface). Isliye ek link par <code>ip pim sparse-mode</code> missing ho, ya RPF problem ho, to flood wahin ruk jaata hai, aur uske peeche ke routers alag BSR elect kar sakte hain ya koi nahi. Aur C-RP advertisement BSR tak tabhi pahunchta hai jab <i>unicast</i> path kaam kare: candidate RP loopback jo OSPF mein nahi hai, kabhi RP-set mein nahi aata.</p>

<div class="note"><p><b>Junos note.</b> Junos par BSR <code>protocols pim rp bootstrap</code> (candidate BSR, <code>priority</code> ke saath) aur <code>protocols pim rp local</code> (candidate RP, BSR ke through advertise) ke neeche configure hota hai. Ideas identical hain.</p>
<pre class="code">set protocols pim rp bootstrap family inet priority 10
set protocols pim rp local address 3.3.3.3 priority 5 group-ranges 224.0.0.0/4</pre></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Priority ko ulta padhna: BSR election mein <b>high</b> jeetta hai, RP chunne mein <b>low</b> jeetta hai. (2) BSR se RP chunne ki ummeed rakhna. (3) Candidate loopback IGP mein advertise na hona. (4) PIM-rahit link jo flood ko split kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sabse specific group range priority compare hone se pehle jeet jaati hai. 239.50.0.0/16 ka C-RP priority 200 ke saath 224.0.0.0/4 ke C-RP ko priority 0 ke saath hara deta hai, us /16 ke groups ke liye.</p></div>

<div class="scn"><h4>Lab 3 walk-through: election aur backup</h4><p><b>mq-rp-bsr</b> mein Zenith Logistics ke paas do candidate BSRs aur do candidate RPs hain. R1 priority 10 par ho to har router 1.1.1.1 elect karta hai, bhale R2 ka address zyada ho, kyunki priority pehle compare hoti hai. R1 ki candidate line hata do to poora network baaki routers par ek bhi change ke bina 2.2.2.2 re-elect kar leta hai. Phir aap R5 ko kharab priority (200) wala /16 dete ho aur dekhte ho ki 239.50.1.1 ke liye /16 phir bhi jeet jaata hai.</p><p><b>Seekh:</b> ek range ko dusre RP par le jaana ho to us RP ko zyada specific range do; priority numbers se mat ladho.</p></div>

<div class="iv"><p class="q">"Auto-RP aur BSR mein kya farak hai?"</p><p>Strong answer: Auto-RP Cisco proprietary hai, mapping agent har range ke liye ek RP <i>chunta</i> hai aur 224.0.1.40 par bhejta hai, aur listener ya dense mode chahiye. BSR PIMv2 ka open standard hai, BSR poora RP-set PIM messages mein flood karta hai, aur har router hash algorithm se RP chunta hai. BSR mein chicken-and-egg problem nahi aur hash mask se load sharing milti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>C-BSR election: sabse high priority, phir sabse high address.</li>
<li>C-RPs elected BSR ko unicast advertisements bhejte hain; BSR RP-set flood karta hai.</li>
<li>Har group ke liye choice: longest range, kam priority value, high hash, high address.</li>
<li>Hash mask length 0 ka matlab saare groups ke liye ek RP; lambi mask groups ko spread karti hai.</li>
<li>PIM ya RPF break flood rokta hai; unreachable C-RP kabhi set mein nahi aata.</li>
</ul></div>
`}};export{e as default};