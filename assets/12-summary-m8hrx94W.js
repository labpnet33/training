var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you run through a short checklist: fuel, tyres, mirrors, documents. It takes two minutes and prevents most roadside disasters. This chapter is that checklist for ACLs: what you must be able to do, the words you must know, the facts the exam tests most, and a command sheet to keep beside your lab.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what an ACL is and name its uses: interface filtering, NAT selection, QoS classification, route filtering, VTY access and debug filtering.</li>
<li>Trace any packet through a list: top-down, first match, implicit deny.</li>
<li>Convert prefixes and ranges to wildcard masks, split non-aligned ranges, and read odd wildcards like 0.0.0.254.</li>
<li>Build numbered and named standard ACLs and place them close to the destination.</li>
<li>Build extended ACLs with protocols, ports (eq, neq, gt, lt, range), ICMP types and established, and place them close to the source.</li>
<li>Choose inbound or outbound by writing the packet as each interface sees it, for request and reply.</li>
<li>Insert, delete and resequence entries in a live named ACL without removing it from the interface.</li>
<li>Restrict VTY access with <code>access-class</code> on all lines.</li>
<li>Verify with <code>show access-lists</code>, <code>show ip interface</code> and logs.</li>
<li>Write an IPv6 ACL, apply it with <code>ipv6 traffic-filter</code> and keep ND working.</li>
<li>Troubleshoot with the six-step workflow, including the "ACL kills OSPF" ticket.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Choosing ACL type and placement">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Need dst or port?</text>
<line x1="280" y1="59" x2="160" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="78" class="svg-muted" font-size="12">no</text><text x="425" y="78" class="svg-muted" font-size="12">yes</text>
<rect x="60" y="100" width="200" height="44" rx="8" fill="#bae6fd"/><text x="160" y="127" text-anchor="middle" class="svg-ink" font-size="13">Standard ACL</text>
<rect x="380" y="100" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="127" text-anchor="middle" class="svg-ink" font-size="13">Extended ACL</text>
<rect x="60" y="160" width="200" height="44" rx="8" fill="#fde68a"/><text x="160" y="187" text-anchor="middle" class="svg-ink" font-size="13">near DESTINATION</text>
<rect x="380" y="160" width="200" height="44" rx="8" fill="#fed7aa"/><text x="480" y="187" text-anchor="middle" class="svg-ink" font-size="13">near SOURCE</text>
<line x1="160" y1="144" x2="160" y2="160" stroke="#64748b" stroke-width="2"/><line x1="480" y1="144" x2="480" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The one decision tree to remember: what must you match, and therefore where does the list go.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACE</dt><dd>Access control entry: one permit or deny line with a sequence number.</dd>
<dt>Implicit deny</dt><dd>Invisible final <code>deny any</code> in every IPv4 ACL; in IPv6 preceded by implicit ND permits.</dd>
<dt>Wildcard mask</dt><dd>0 = bit must match, 1 = ignore; for a subnet, 255.255.255.255 minus the mask.</dd>
<dt>Standard ACL</dt><dd>Matches source only; 1 to 99, 1300 to 1999, or named.</dd>
<dt>Extended ACL</dt><dd>Matches protocol, source, destination, ports; 100 to 199, 2000 to 2699, or named.</dd>
<dt>Sequence number</dt><dd>Position of an entry; default 10, 20, 30; used to insert, delete and resequence.</dd>
<dt>access-class</dt><dd>Applies an ACL to VTY lines to control management sessions.</dd>
<dt>established</dt><dd>Matches TCP segments with ACK or RST set.</dd>
<dt>traffic-filter</dt><dd>The IPv6 command to apply an ACL to an interface.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Remember it as</th></tr>
<tr><td>Processing</td><td>Top-down, first match, stop; implicit deny at the end</td></tr>
<tr><td>Only denies in a list</td><td>Everything is denied</td></tr>
<tr><td>Standard placement</td><td>Close to the destination</td></tr>
<tr><td>Extended placement</td><td>Close to the source</td></tr>
<tr><td>Per interface</td><td>One ACL per direction per protocol; a new one replaces the old</td></tr>
<tr><td>Outbound ACL</td><td>Does not filter router-generated traffic</td></tr>
<tr><td>Inbound ACL</td><td>Also filters traffic to the router, including OSPF hellos</td></tr>
<tr><td><code>host 10.1.1.1</code></td><td><code>10.1.1.1 0.0.0.0</code></td></tr>
<tr><td><code>any</code></td><td><code>0.0.0.0 255.255.255.255</code></td></tr>
<tr><td><code>no access-list 110 ...</code></td><td>Deletes the whole list</td></tr>
<tr><td>Denied ping from a PC</td><td>"Administratively prohibited", ICMP type 3 code 13; IOS shows U</td></tr>
<tr><td>IPv6 ACL</td><td>Named only, prefix lengths, <code>ipv6 traffic-filter</code>, implicit nd-na and nd-ns permits</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! standard, numbered and named</span>
access-list 10 deny 10.1.20.0 0.0.0.255
access-list 10 permit any
ip access-list standard VTY-MGMT
 permit 10.99.0.0 0.0.0.255
<span class="c">! extended</span>
access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www
ip access-list extended BRANCH-IN
 15 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www
 no 10
ip access-list resequence BRANCH-IN 10 10
<span class="c">! apply</span>
interface GigabitEthernet0/0
 ip access-group 10 out
line vty 0 15
 access-class VTY-MGMT in
<span class="c">! IPv6</span>
ipv6 access-list LAB6-IN
 sequence 45 permit udp 2001:db8:40::/64 host 2001:db8:31::53 eq domain
interface GigabitEthernet0/2
 ipv6 traffic-filter LAB6-IN in</pre>
<pre class="out">show access-lists [name]          counters per entry
show ip access-lists [name]       IPv4 only
show ipv6 access-list [name]      IPv6, sequence shown at the end
<span class="hl">show ip interface g0/0            Inbound / Outgoing access list</span>
show running-config | include access-group|access-class|traffic-filter
clear access-list counters [name]</pre>

<div class="warn"><p><b>Common mistake in the exam room.</b> Answering from habit instead of reading the list. Slow down: write the packet's source, destination, protocol and port on the scratch board, then walk the entries one by one.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Subnet mask used as a wildcard; port after the source; ACL applied in the wrong direction; <code>ip access-group</code> under a VTY line; <code>deny ipv6 any any</code> without ND permits; a second access-group silently replacing the first.</p></div>

<div class="scn"><h4>The audit that passed in one afternoon</h4><p>A mid-size company failed an audit because any employee could SSH to core routers and guests could reach internal servers. The network engineer used everything in this module in one afternoon: a standard <code>access-class</code> ACL on <code>line vty 0 15</code> for the NOC subnet, an extended ACL inbound on the guest interface allowing only DNS and web to the internet, a named ACL edited live with sequence numbers to add a printer exception, counters and logged denies as evidence, and IPv6 equivalents with ND permits. The re-audit passed with the show outputs attached as proof.</p><p><b>Lesson:</b> ACLs are simple tools; applied with discipline and verified with evidence, they close real gaps quickly.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of ACLs as if I were a new team member."</p><p>Strong answer: an ACL is an ordered permit/deny list checked top-down with first match and an implicit deny. Standard lists match source only and go near the destination; extended lists match protocol, addresses and ports and go near the source. Wildcards: 0 match, 1 ignore. Apply with ip access-group in or out, one per direction, or access-class on VTY lines. Edit named lists with sequence numbers, verify with counters and logs. IPv6 lists are named, use traffic-filter and keep implicit ND permits. And remember they are stateless, so think about return traffic and routing protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Top-down, first match, implicit deny: every ACL answer starts here.</li>
<li>Standard near the destination, extended near the source.</li>
<li>Wildcards: 0 match, 1 ignore; check power of two and alignment for ranges.</li>
<li>Named ACLs and sequence numbers make live edits safe; <code>no access-list N</code> deletes the whole list.</li>
<li>Prove everything with counters, <code>show ip interface</code> and logs; in IPv6 protect ND.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap ek chhoti checklist chalate ho: fuel, tyres, mirrors, documents. Isme do minute lagte hain aur zyada tar raaste ki museebaton se bachata hai. Yeh chapter ACLs ke liye wahi checklist hai: aapko kya kar paana chahiye, kaunse shabd aane chahiye, exam sabse zyada kaunse facts test karta hai, aur lab ke bagal mein rakhne ke liye ek command sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjha pao ki ACL kya hai aur uske uses batao: interface filtering, NAT selection, QoS classification, route filtering, VTY access aur debug filtering.</li>
<li>Kisi bhi packet ko list se trace karo: top-down, first match, implicit deny.</li>
<li>Prefixes aur ranges ko wildcard masks mein badlo, non-aligned ranges split karo, aur 0.0.0.254 jaise odd wildcards padho.</li>
<li>Numbered aur named standard ACLs banao aur unhe destination ke paas lagao.</li>
<li>Protocols, ports (eq, neq, gt, lt, range), ICMP types aur established ke saath extended ACLs banao, aur unhe source ke paas lagao.</li>
<li>Inbound ya outbound chuno, packet ko waise likh kar jaise har interface use dekhta hai, request aur reply dono ke liye.</li>
<li>Live named ACL mein entries insert, delete aur resequence karo, use interface se hataye bina.</li>
<li><code>access-class</code> se saari lines par VTY access restrict karo.</li>
<li><code>show access-lists</code>, <code>show ip interface</code> aur logs se verify karo.</li>
<li>IPv6 ACL likho, use <code>ipv6 traffic-filter</code> se apply karo aur ND chalu rakho.</li>
<li>Six-step workflow se troubleshoot karo, "ACL ne OSPF maar diya" ticket samet.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ACL type aur placement chunna">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Dst ya port chahiye?</text>
<line x1="280" y1="59" x2="160" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="78" class="svg-muted" font-size="12">nahi</text><text x="425" y="78" class="svg-muted" font-size="12">haan</text>
<rect x="60" y="100" width="200" height="44" rx="8" fill="#bae6fd"/><text x="160" y="127" text-anchor="middle" class="svg-ink" font-size="13">Standard ACL</text>
<rect x="380" y="100" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="127" text-anchor="middle" class="svg-ink" font-size="13">Extended ACL</text>
<rect x="60" y="160" width="200" height="44" rx="8" fill="#fde68a"/><text x="160" y="187" text-anchor="middle" class="svg-ink" font-size="13">DESTINATION ke paas</text>
<rect x="380" y="160" width="200" height="44" rx="8" fill="#fed7aa"/><text x="480" y="187" text-anchor="middle" class="svg-ink" font-size="13">SOURCE ke paas</text>
<line x1="160" y1="144" x2="160" y2="160" stroke="#64748b" stroke-width="2"/><line x1="480" y1="144" x2="480" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Yaad rakhne wala ek decision tree: aapko kya match karna hai, aur isliye list kahan jaayegi.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACE</dt><dd>Access control entry: sequence number wali ek permit ya deny line.</dd>
<dt>Implicit deny</dt><dd>Har IPv4 ACL mein invisible aakhri <code>deny any</code>; IPv6 mein isse pehle implicit ND permits hote hain.</dd>
<dt>Wildcard mask</dt><dd>0 = bit match hona chahiye, 1 = ignore; subnet ke liye 255.255.255.255 minus mask.</dd>
<dt>Standard ACL</dt><dd>Sirf source match karta hai; 1 se 99, 1300 se 1999, ya named.</dd>
<dt>Extended ACL</dt><dd>Protocol, source, destination, ports match karta hai; 100 se 199, 2000 se 2699, ya named.</dd>
<dt>Sequence number</dt><dd>Entry ki position; default 10, 20, 30; insert, delete aur resequence ke liye use hota hai.</dd>
<dt>access-class</dt><dd>Management sessions control karne ke liye ACL ko VTY lines par lagata hai.</dd>
<dt>established</dt><dd>ACK ya RST set wale TCP segments match karta hai.</dd>
<dt>traffic-filter</dt><dd>Interface par ACL lagane ki IPv6 command.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Aise yaad rakho</th></tr>
<tr><td>Processing</td><td>Top-down, first match, stop; end mein implicit deny</td></tr>
<tr><td>List mein sirf denies</td><td>Sab kuch deny</td></tr>
<tr><td>Standard placement</td><td>Destination ke paas</td></tr>
<tr><td>Extended placement</td><td>Source ke paas</td></tr>
<tr><td>Har interface par</td><td>Har direction har protocol par ek ACL; naya purane ko replace karta hai</td></tr>
<tr><td>Outbound ACL</td><td>Router ka banaya traffic filter nahi karta</td></tr>
<tr><td>Inbound ACL</td><td>Router tak aane wala traffic bhi filter karta hai, OSPF hellos samet</td></tr>
<tr><td><code>host 10.1.1.1</code></td><td><code>10.1.1.1 0.0.0.0</code></td></tr>
<tr><td><code>any</code></td><td><code>0.0.0.0 255.255.255.255</code></td></tr>
<tr><td><code>no access-list 110 ...</code></td><td>Poori list delete</td></tr>
<tr><td>PC se denied ping</td><td>"Administratively prohibited", ICMP type 3 code 13; IOS U dikhata hai</td></tr>
<tr><td>IPv6 ACL</td><td>Sirf named, prefix lengths, <code>ipv6 traffic-filter</code>, implicit nd-na aur nd-ns permits</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! standard, numbered aur named</span>
access-list 10 deny 10.1.20.0 0.0.0.255
access-list 10 permit any
ip access-list standard VTY-MGMT
 permit 10.99.0.0 0.0.0.255
<span class="c">! extended</span>
access-list 110 permit tcp 192.168.40.0 0.0.0.255 host 172.31.1.80 eq www
ip access-list extended BRANCH-IN
 15 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www
 no 10
ip access-list resequence BRANCH-IN 10 10
<span class="c">! apply</span>
interface GigabitEthernet0/0
 ip access-group 10 out
line vty 0 15
 access-class VTY-MGMT in
<span class="c">! IPv6</span>
ipv6 access-list LAB6-IN
 sequence 45 permit udp 2001:db8:40::/64 host 2001:db8:31::53 eq domain
interface GigabitEthernet0/2
 ipv6 traffic-filter LAB6-IN in</pre>
<pre class="out">show access-lists [name]          har entry ke counters
show ip access-lists [name]       sirf IPv4
show ipv6 access-list [name]      IPv6, sequence end mein dikhta hai
<span class="hl">show ip interface g0/0            Inbound / Outgoing access list</span>
show running-config | include access-group|access-class|traffic-filter
clear access-list counters [name]</pre>

<div class="warn"><p><b>Exam room ki common galti.</b> List padhne ki bajaye aadat se answer dena. Dheere chalo: scratch board par packet ka source, destination, protocol aur port likho, phir entries ek ek karke chalo.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Wildcard ki jagah subnet mask; source ke baad port; galat direction mein laga ACL; VTY line ke neeche <code>ip access-group</code>; ND permits ke bina <code>deny ipv6 any any</code>; doosra access-group chupchaap pehle ko replace karta hua.</p></div>

<div class="scn"><h4>Audit jo ek dopahar mein pass hua</h4><p>Ek mid-size company audit mein fail hui kyunki koi bhi employee core routers par SSH kar sakta tha aur guests internal servers tak pahunch sakte the. Network engineer ne ek dopahar mein is module ki har cheez use ki: NOC subnet ke liye <code>line vty 0 15</code> par standard <code>access-class</code> ACL, guest interface par inbound extended ACL jo internet ki taraf sirf DNS aur web allow karta tha, printer exception jodne ke liye sequence numbers se live edit kiya gaya named ACL, saboot ke liye counters aur logged denies, aur ND permits ke saath IPv6 equivalents. Re-audit show outputs ko proof ki tarah attach karke pass ho gaya.</p><p><b>Seekh:</b> ACLs simple tools hain; discipline se lagaye jaayein aur saboot se verify kiye jaayein, to yeh asli gaps jaldi band karte hain.</p></div>

<div class="iv"><p class="q">"Mujhe ACLs ka do minute ka overview do jaise main naya team member hoon."</p><p>Strong answer: ACL ordered permit/deny list hai jo top-down first match aur implicit deny ke saath check hoti hai. Standard lists sirf source match karti hain aur destination ke paas jaati hain; extended lists protocol, addresses aur ports match karti hain aur source ke paas jaati hain. Wildcards: 0 match, 1 ignore. ip access-group in ya out se apply karo, har direction mein ek, ya VTY lines par access-class. Named lists ko sequence numbers se edit karo, counters aur logs se verify karo. IPv6 lists named hoti hain, traffic-filter use karti hain aur implicit ND permits rakhti hain. Aur yaad rakho yeh stateless hain, isliye return traffic aur routing protocols ke baare mein socho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Top-down, first match, implicit deny: har ACL answer yahin se shuru hota hai.</li>
<li>Standard destination ke paas, extended source ke paas.</li>
<li>Wildcards: 0 match, 1 ignore; ranges ke liye power of two aur alignment check karo.</li>
<li>Named ACLs aur sequence numbers live edits ko safe banate hain; <code>no access-list N</code> poori list delete karta hai.</li>
<li>Sab kuch counters, <code>show ip interface</code> aur logs se prove karo; IPv6 mein ND bachao.</li>
</ul></div>
`}};export{e as default};