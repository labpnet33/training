var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back at the office tower. The reception desk now knows the difference between "head office said no" and "head office did not answer" (FAIL versus ERROR). The door lists are read top down, with time locks that trust a correctly set clock (ACLs, time-ranges, NTP). The new wing has its own door list that never blocks the intercom (IPv6 ACLs and ND). The mailroom checks return addresses strictly at the customer gate and loosely at the busy provider gate (strict and loose uRPF). And the CEO's assistant keeps a written list with every important visitor type on it, plus a tally sheet (CoPP classes and counters).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary">
<rect x="10" y="20" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">AAA</text><text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="12">FAIL stops, ERROR falls</text>
<rect x="170" y="20" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="13">IPv4 ACLs</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="12">order, mask, direction</text>
<rect x="330" y="20" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="405" y="48" text-anchor="middle" class="svg-ink" font-size="13">IPv6 filter</text><text x="405" y="68" text-anchor="middle" class="svg-muted" font-size="12">ND permits</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">uRPF</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">rx vs any</text>
<rect x="170" y="110" width="310" height="60" rx="8" fill="#fed7aa"/><text x="325" y="135" text-anchor="middle" class="svg-ink" font-size="13">CoPP</text><text x="325" y="154" text-anchor="middle" class="svg-muted" font-size="12">classify first, then police</text>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">Every feature fails closed; every feature has a counter</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Predict which method list a line uses, and what happens on PASS, FAIL and ERROR.</li>
<li>Use <code>test aaa group</code>, <code>show aaa servers</code>, <code>show tacacs</code>, <code>debug aaa authentication</code>, <code>debug tacacs</code> and <code>debug radius</code> to separate reachability, source-interface, key and password problems.</li>
<li>Explain why users land at privilege 1 without exec authorization, and protect the console with its own local list.</li>
<li>Find ACL faults caused by order, the implicit deny, direction, wildcard errors and router-generated traffic.</li>
<li>Build and verify a time-based ACL, and connect an inactive time-range to a wrong clock or broken NTP.</li>
<li>Use network and service object groups and change the group instead of the ACL.</li>
<li>Write and apply an IPv6 ACL with <code>ipv6 traffic-filter</code>, insert entries with sequence numbers, and keep ND working.</li>
<li>Choose strict, loose or VRF-mode uRPF; explain allow-default, allow-self-ping and the exception ACL; prove drops with counters.</li>
<li>Classify Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF and BGP in CoPP; read <code>show policy-map control-plane</code>; tell classification errors from tight policers.</li>
<li>Explain the control-plane host, transit and cef-exception subinterfaces.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Method list</dt><dd>Ordered AAA methods for one service; named lists must be applied to lines, the default list applies everywhere else.</dd>
<dt>ERROR / FAIL</dt><dd>No valid server answer (try next method) versus an explicit rejection (stop).</dd>
<dt>NAS</dt><dd>Network access server: the router as the AAA server sees it, identified by its source IP.</dd>
<dt>Implicit deny</dt><dd>The hidden last line of every ACL; in IPv6 preceded by hidden permits for ND NS and NA.</dd>
<dt>Time-range</dt><dd>Named periodic or absolute schedule that activates ACL entries using the router's clock.</dd>
<dt>Object group</dt><dd>Named set of networks or services referenced by extended ACLs.</dd>
<dt>uRPF</dt><dd>Source-address check against the FIB: strict (<code>rx</code>), loose (<code>any</code>) or VRF mode.</dd>
<dt>CoPP / CPPr</dt><dd>MQC input policy on the control plane; CPPr splits it into host, transit and cef-exception.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Fallback to the next method happens only on ERROR, never on FAIL.</li>
<li>TACACS+ TCP 49, whole body encrypted; RADIUS UDP 1812/1813, password only.</li>
<li>Inbound ACLs filter traffic to the router, including routing protocols; outbound ACLs skip router-generated packets.</li>
<li>An inactive time-based entry is skipped, not converted into a deny.</li>
<li>IPv6 ACL implicit end: permit nd-na, permit nd-ns, deny ipv6 any any; RS and RA are not implicit.</li>
<li>uRPF ignores the default route unless <code>allow-default</code>; strict breaks on asymmetric paths.</li>
<li>CoPP only sees punted traffic; a deny in a class ACL means "not this class"; BGP needs port 179 in both directions.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! AAA</span>
test aaa group NK-TAC user pass legacy
show aaa servers
show tacacs
debug aaa authentication
debug tacacs
debug radius
<span class="c">! ACLs</span>
show ip access-lists
show ip interface Gi0/1 | include access list
show time-range
show object-group
show ipv6 access-list GUEST-IN
<span class="c">! uRPF</span>
ip verify unicast source reachable-via rx
ip verify unicast source reachable-via any
show ip interface Gi0/1 | include verif
show ip traffic | include RPF
show ip cef 198.51.100.10
<span class="c">! CoPP</span>
show policy-map control-plane
show ip access-lists ACL-ROUTING</pre>

<div class="eg"><p><b>Worked example: a five-line exam answer.</b> "OSPF went down after a CoPP change, and class CP-ROUTING shows 0 packets while class-default shows drops." Answer: the routing ACL does not match OSPF (IP protocol 89), so hellos fall to class-default, which drops them; add <code>permit ospf any any</code> to the ACL behind CP-ROUTING. Do not raise the policer and do not remove the policy.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Confusing <code>ipv6 traffic-filter</code> with <code>ip access-group</code>. Choosing strict uRPF for a dual-homed edge. Assuming a wrong password leads to local fallback. Reading only absolute counters instead of deltas.</p></div>

<div class="exam"><p><b>Exam trap.</b> Many answer options "fix" the symptom by removing the feature, adding <code>none</code> to a method list, adding <code>allow-default</code>, or putting <code>permit ip any any</code> at the top. The correct answer keeps the protection and fixes the specific line.</p></div>

<div class="scn"><h4>The quarterly security audit</h4><p>An auditor asked a network team to prove that management access was controlled, spoofing was prevented and the routers were protected from floods. The team showed: <code>show aaa servers</code> with rising accept and reject counters and one break-glass account; <code>show ip interface</code> with uRPF strict on every customer edge; <code>show ipv6 access-list</code> twins for every IPv4 guest filter; and <code>show policy-map control-plane</code> with routing and management classes counting and a small, policed class-default.</p><p><b>Lesson:</b> the same counters that troubleshoot these features also prove they work.</p></div>

<div class="iv"><p class="q">"Summarise how you would secure and troubleshoot a router's infrastructure security in two minutes."</p><p>Strong answer: AAA with TACACS+ or RADIUS, a pinned source interface, a local break-glass account and exec authorization; IPv4 and IPv6 ACLs written in the right order and direction with ND permitted; uRPF strict at single-homed edges and loose where routing is asymmetric; CoPP with explicit classes for routing and management and a policed class-default, deployed after a baseline. For troubleshooting, follow the packet path and read each feature's counter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA: FAIL stops, ERROR falls through; keys, source interface and reachability cause ERROR.</li>
<li>ACLs: order, implicit deny, direction, wildcards, clocks for time-ranges, object groups for scale.</li>
<li>IPv6 filters: named, prefix-based, <code>ipv6 traffic-filter</code>, keep ND permitted.</li>
<li>uRPF: strict for single-homed, loose for asymmetric; default route ignored unless allowed.</li>
<li>CoPP: classify every routing and management flow, then police; read the counters.</li>
</ul></div>
`,hi:`
<p>Office tower par wapas. Reception desk ab "head office ne mana kiya" aur "head office ne jawab nahi diya" ka fark jaanta hai (FAIL vs ERROR). Door lists upar se neeche padhi jaati hain, time locks ke saath jo sahi set ki gayi ghadi par bharosa karte hain (ACLs, time-ranges, NTP). Naye wing ki apni door list hai jo intercom ko kabhi block nahi karti (IPv6 ACLs aur ND). Mailroom customer gate par return addresses strictly aur busy provider gate par dheel se check karta hai (strict aur loose uRPF). Aur CEO ki assistant ek likhi hui list rakhti hai jismein har zaroori visitor type hai, plus ek tally sheet (CoPP classes aur counters).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary">
<rect x="10" y="20" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">AAA</text><text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="12">FAIL rukta, ERROR aage</text>
<rect x="170" y="20" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="13">IPv4 ACLs</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="12">order, mask, direction</text>
<rect x="330" y="20" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="405" y="48" text-anchor="middle" class="svg-ink" font-size="13">IPv6 filter</text><text x="405" y="68" text-anchor="middle" class="svg-muted" font-size="12">ND permits</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">uRPF</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">rx vs any</text>
<rect x="170" y="110" width="310" height="60" rx="8" fill="#fed7aa"/><text x="325" y="135" text-anchor="middle" class="svg-ink" font-size="13">CoPP</text><text x="325" y="154" text-anchor="middle" class="svg-muted" font-size="12">pehle classify, phir police</text>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">Har feature fail closed hota hai; har feature ka counter hai</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Predict karo ki line kaunsi method list use karti hai, aur PASS, FAIL aur ERROR par kya hota hai.</li>
<li><code>test aaa group</code>, <code>show aaa servers</code>, <code>show tacacs</code>, <code>debug aaa authentication</code>, <code>debug tacacs</code> aur <code>debug radius</code> se reachability, source-interface, key aur password problems alag karo.</li>
<li>Samjhao ki exec authorization ke bina users privilege 1 par kyun aate hain, aur console ko uski apni local list se bachao.</li>
<li>Order, implicit deny, direction, wildcard errors aur router-generated traffic se hone wale ACL faults dhoondho.</li>
<li>Time-based ACL banao aur verify karo, aur inactive time-range ko galat clock ya tooti NTP se jodo.</li>
<li>Network aur service object groups use karo aur ACL ki jagah group badlo.</li>
<li><code>ipv6 traffic-filter</code> se IPv6 ACL likho aur lagao, sequence numbers se entries insert karo, aur ND chalta rakho.</li>
<li>Strict, loose ya VRF-mode uRPF chuno; allow-default, allow-self-ping aur exception ACL samjhao; counters se drops sabit karo.</li>
<li>CoPP mein Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF aur BGP classify karo; <code>show policy-map control-plane</code> padho; classification errors ko tight policers se alag pehchano.</li>
<li>Control-plane host, transit aur cef-exception subinterfaces samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Method list</dt><dd>Ek service ke liye ordered AAA methods; named lists lines par apply karni padti hain, default list baaki har jagah lagti hai.</dd>
<dt>ERROR / FAIL</dt><dd>Server ka koi valid jawab nahi (agla method try) vs saaf rejection (ruk jao).</dd>
<dt>NAS</dt><dd>Network access server: router jaisa AAA server use dekhta hai, uske source IP se pehchana hua.</dd>
<dt>Implicit deny</dt><dd>Har ACL ki chhupi aakhri line; IPv6 mein isse pehle ND NS aur NA ke chhupe permits.</dd>
<dt>Time-range</dt><dd>Named periodic ya absolute schedule jo router ki clock se ACL entries active karta hai.</dd>
<dt>Object group</dt><dd>Networks ya services ka named set jise extended ACLs reference karti hain.</dd>
<dt>uRPF</dt><dd>FIB ke against source-address check: strict (<code>rx</code>), loose (<code>any</code>) ya VRF mode.</dd>
<dt>CoPP / CPPr</dt><dd>Control plane par MQC input policy; CPPr ise host, transit aur cef-exception mein baant-ta hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Agle method par fallback sirf ERROR par hota hai, FAIL par kabhi nahi.</li>
<li>TACACS+ TCP 49, poori body encrypted; RADIUS UDP 1812/1813, sirf password.</li>
<li>Inbound ACLs router ki taraf ka traffic filter karti hain, routing protocols samet; outbound ACLs router-generated packets chhod deti hain.</li>
<li>Inactive time-based entry skip hoti hai, deny mein nahi badalti.</li>
<li>IPv6 ACL ka implicit end: permit nd-na, permit nd-ns, deny ipv6 any any; RS aur RA implicit nahi.</li>
<li><code>allow-default</code> ke bina uRPF default route ignore karta hai; strict asymmetric paths par tootta hai.</li>
<li>CoPP sirf punted traffic dekhta hai; class ACL mein deny matlab "is class ka nahi"; BGP ko dono directions mein port 179 chahiye.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! AAA</span>
test aaa group NK-TAC user pass legacy
show aaa servers
show tacacs
debug aaa authentication
debug tacacs
debug radius
<span class="c">! ACLs</span>
show ip access-lists
show ip interface Gi0/1 | include access list
show time-range
show object-group
show ipv6 access-list GUEST-IN
<span class="c">! uRPF</span>
ip verify unicast source reachable-via rx
ip verify unicast source reachable-via any
show ip interface Gi0/1 | include verif
show ip traffic | include RPF
show ip cef 198.51.100.10
<span class="c">! CoPP</span>
show policy-map control-plane
show ip access-lists ACL-ROUTING</pre>

<div class="eg"><p><b>Worked example: paanch line ka exam jawab.</b> "CoPP change ke baad OSPF down ho gaya, aur class CP-ROUTING 0 packets dikhati hai jabki class-default drops dikhati hai." Jawab: routing ACL OSPF (IP protocol 89) se match nahi karti, isliye hellos class-default mein girte hain, jo unhe drop karti hai; CP-ROUTING ke peeche ki ACL mein <code>permit ospf any any</code> jodo. Policer mat badhao aur policy mat hatao.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali common galtiyan.</b> <code>ipv6 traffic-filter</code> ko <code>ip access-group</code> se confuse karna. Dual-homed edge ke liye strict uRPF chunna. Yeh maan lena ki galat password se local fallback hota hai. Deltas ki jagah sirf absolute counters padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kai answer options feature hata kar, method list mein <code>none</code> jod kar, <code>allow-default</code> jod kar, ya sabse upar <code>permit ip any any</code> daal kar lakshan "theek" karte hain. Sahi jawab protection rakhta hai aur specific line theek karta hai.</p></div>

<div class="scn"><h4>Quarterly security audit</h4><p>Ek auditor ne network team se sabit karne ko kaha ki management access controlled hai, spoofing roki gayi hai aur routers floods se protected hain. Team ne dikhaya: badhte accept aur reject counters aur ek break-glass account ke saath <code>show aaa servers</code>; har customer edge par uRPF strict ke saath <code>show ip interface</code>; har IPv4 guest filter ke <code>show ipv6 access-list</code> judwa; aur <code>show policy-map control-plane</code> jismein routing aur management classes gin rahi thi aur ek chhoti, policed class-default thi.</p><p><b>Seekh:</b> jo counters in features ko troubleshoot karte hain wahi sabit bhi karte hain ki woh kaam kar rahe hain.</p></div>

<div class="iv"><p class="q">"Do minute mein batao ki aap router ki infrastructure security kaise secure aur troubleshoot karoge."</p><p>Strong answer: TACACS+ ya RADIUS ke saath AAA, pinned source interface, ek local break-glass account aur exec authorization; sahi order aur direction mein likhi IPv4 aur IPv6 ACLs jismein ND permitted ho; single-homed edges par uRPF strict aur jahan routing asymmetric ho wahan loose; routing aur management ke liye explicit classes aur policed class-default ke saath CoPP, baseline ke baad deploy. Troubleshooting ke liye packet path follow karo aur har feature ka counter padho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA: FAIL rukta hai, ERROR aage jaata hai; keys, source interface aur reachability ERROR ka kaaran hain.</li>
<li>ACLs: order, implicit deny, direction, wildcards, time-ranges ke liye clocks, scale ke liye object groups.</li>
<li>IPv6 filters: named, prefix-based, <code>ipv6 traffic-filter</code>, ND permitted rakho.</li>
<li>uRPF: single-homed ke liye strict, asymmetric ke liye loose; allow na ho to default route ignore.</li>
<li>CoPP: har routing aur management flow classify karo, phir police karo; counters padho.</li>
</ul></div>
`}};export{e as default};