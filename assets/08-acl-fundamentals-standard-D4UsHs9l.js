var e={id:`acl-standard`,h:{en:`ACL fundamentals: processing, wildcards and standard ACLs`,hi:`ACL fundamentals: processing, wildcards aur standard ACLs`},body:{en:`
<p>A bouncer at a wedding reception holds a guest list. He reads it from the top, and the first line that matches you decides your fate: "Sharma family, allow", "anyone with a camera, deny". If your name is not on the list at all, you do not get in. An <b>access control list (ACL)</b> works exactly like that list, and N10-009 names ACLs as a core security rule. Lab 1 already used a one-line ACL; this chapter and the next teach you to write any ACL correctly.</p>

<h3>How a router processes an ACL</h3>
<ul>
<li>An ACL is an ordered list of <b>access control entries (ACEs)</b>, each a permit or deny with match conditions.</li>
<li>The router checks entries <b>top-down</b> and stops at the <b>first match</b>. Later lines are never checked for that packet.</li>
<li>Every ACL ends with an invisible <b>implicit deny any</b>. A packet that matches nothing is dropped.</li>
<li>An ACL does nothing until it is applied: to an interface in a direction (<code>ip access-group</code>), or to VTY lines (<code>access-class</code>), or used by another feature such as NAT.</li>
<li>One ACL per interface, per direction, per protocol (IPv4 or IPv6).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ACL top-down processing">
<rect x="10" y="80" width="100" height="44" rx="10" fill="#bae6fd"/><text x="60" y="107" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="150" y="10" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="35" text-anchor="middle" class="svg-ink" font-size="12">Line 10 match?</text>
<rect x="150" y="80" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="105" text-anchor="middle" class="svg-ink" font-size="12">Line 20 match?</text>
<rect x="150" y="150" width="170" height="40" rx="8" fill="#fed7aa"/><text x="235" y="175" text-anchor="middle" class="svg-ink" font-size="12">Implicit deny any</text>
<line x1="110" y1="102" x2="150" y2="30" stroke="#64748b"/><line x1="235" y1="50" x2="235" y2="80" stroke="#64748b"/><line x1="235" y1="120" x2="235" y2="150" stroke="#64748b"/>
<text x="260" y="68" class="svg-muted" font-size="12">no</text><text x="260" y="138" class="svg-muted" font-size="12">no</text>
<line x1="320" y1="30" x2="420" y2="30" stroke="#64748b"/><line x1="320" y1="100" x2="420" y2="100" stroke="#64748b"/><line x1="320" y1="170" x2="420" y2="170" stroke="#64748b"/>
<rect x="420" y="10" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="35" text-anchor="middle" class="svg-ink" font-size="12">yes: apply action, stop</text>
<rect x="420" y="80" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="105" text-anchor="middle" class="svg-ink" font-size="12">yes: apply action, stop</text>
<rect x="420" y="150" width="210" height="40" rx="8" fill="#fed7aa"/><text x="525" y="175" text-anchor="middle" class="svg-ink" font-size="12">drop the packet</text>
</svg><p class="cap">Top-down, first match wins, and the invisible last line denies everything else.</p></div>

<h3>Wildcard masks</h3>
<p>ACLs describe address ranges with a <b>wildcard mask</b>. A 0 bit means "this bit must match"; a 1 bit means "ignore this bit". For a normal subnet, the wildcard is the inverse of the subnet mask: subtract each octet of the mask from 255.</p>
<table class="cmp"><tr><th>Range</th><th>Subnet mask</th><th>Wildcard</th><th>ACL form</th></tr>
<tr><td>10.0.99.0/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td><code>10.0.99.0 0.0.0.255</code></td></tr>
<tr><td>10.0.20.64/26</td><td>255.255.255.192</td><td>0.0.0.63</td><td><code>10.0.20.64 0.0.0.63</code></td></tr>
<tr><td>One host 10.0.99.5</td><td>/32</td><td>0.0.0.0</td><td><code>host 10.0.99.5</code></td></tr>
<tr><td>Everything</td><td>/0</td><td>255.255.255.255</td><td><code>any</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The jump hosts live in 10.0.99.0/28 (10.0.99.0 to 10.0.99.15). Mask 255.255.255.240; 255 minus 240 is 15, so the wildcard is 0.0.0.15 and the entry is <code>permit 10.0.99.0 0.0.0.15</code>. A host at 10.0.99.20 does not match because the 16s bit of the last octet (20 = 16 + 4) is 1 where the entry requires 0, so it falls through to the implicit deny.</p></div>

<h3>Standard vs extended</h3>
<p><b>Standard ACLs</b> (numbers 1 to 99 and 1300 to 1999) match <b>only the source address</b>. <b>Extended ACLs</b> (100 to 199 and 2000 to 2699) match source, destination, protocol and ports. Both can also be <b>named</b>, which is easier to read and edit (next chapter).</p>
<p><b>Placement rule of thumb.</b> A standard ACL cannot see the destination, so put it <b>close to the destination</b>; otherwise it blocks the source from everything. An extended ACL is precise, so put it <b>close to the source</b> and drop unwanted traffic before it crosses the network.</p>

<h3>Configuring a standard ACL on an interface</h3>
<p>Task: the guest subnet 10.0.20.0/24 must not reach the HR server LAN 10.0.50.0/24, which sits behind router R1's Gi0/2. Everyone else must still reach HR, and guests must still reach the internet.</p>
<pre class="code">R1(config)# access-list 20 deny 10.0.20.0 0.0.0.255
R1(config)# access-list 20 permit any          <span class="c">! without this, the implicit deny blocks everyone</span>
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 20 out           <span class="c">! out towards HR = close to the destination</span></pre>
<pre class="out">R1# show access-lists 20
Standard IP access list 20
<span class="hl">    10 deny   10.0.20.0, wildcard bits 0.0.0.255 (37 matches)</span>
    20 permit any (1204 matches)

R1# show ip interface GigabitEthernet0/2 | include access list
<span class="hl">  Outgoing access list is 20</span>
  Inbound  access list is not set</pre>
<p>The match counters prove guest traffic is hitting the deny. Direction is from the router's point of view: <b>in</b> means packets arriving on that interface, <b>out</b> means packets leaving through it.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing a subnet mask instead of a wildcard (<code>10.0.20.0 255.255.255.0</code> matches almost anything). Forgetting <code>permit any</code> after a deny. Placing a standard ACL near the source, which blocks guests from the internet too. Adding a new deny at the bottom of a numbered list after <code>permit any</code>, where it can never match.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which traffic is permitted by an ACL with only deny statements?" None, because of the implicit deny. "Where should a standard ACL go?" Close to the destination. The order of lines matters; the most specific entries go first.</p></div>

<div class="scn"><h4>The deny that never matched</h4><p>A security team asked to block a compromised laptop, 10.0.10.77, from the server LAN. An engineer typed <code>access-list 30 deny host 10.0.10.77</code> on a router where ACL 30 already ended with <code>permit any</code>. The laptop kept reaching the servers. <code>show access-lists 30</code> showed the new line at sequence 40 with zero matches, below the permit any at 30. He rebuilt the ACL with the deny first (later he converted it to a named ACL so he could insert lines by sequence number).</p><p><b>Lesson:</b> new lines in a numbered ACL go to the bottom; always check the order and the match counters.</p></div>

<div class="iv"><p class="q">"How does a router process an ACL, and where would you place a standard ACL?"</p><p>Top-down, first match, implicit deny at the end; nothing happens until it is applied in a direction. A standard ACL matches only the source, so place it close to the destination to avoid blocking the source from other networks. Give the wildcard rule (inverse of the mask) and mention checking counters with <code>show access-lists</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs are checked top-down, first match wins, with an implicit deny any at the end.</li>
<li>Wildcard 0 = must match, 1 = ignore; for a subnet, 255 minus each mask octet.</li>
<li>Standard ACLs (1 to 99, 1300 to 1999) match source only; place near the destination.</li>
<li>Apply with <code>ip access-group N in|out</code> on interfaces, <code>access-class N in</code> on VTY lines.</li>
<li>Verify with <code>show access-lists</code> counters and <code>show ip interface</code>.</li>
</ul></div>
`,hi:`
<p>Shaadi ke reception par bouncer ke paas guest list hoti hai. Woh use upar se padhta hai, aur jo pehli line aapse match karti hai wahi faisla karti hai: "Sharma family, allow", "camera wala koi bhi, deny". Agar aapka naam list mein hai hi nahi, to aap andar nahi jaate. <b>Access control list (ACL)</b> bilkul isi list ki tarah kaam karti hai, aur N10-009 ACLs ko core security rule ka naam deta hai. Lab 1 ne pehle hi ek-line ACL use ki; yeh chapter aur agla aapko koi bhi ACL sahi likhna sikhate hain.</p>

<h3>Router ACL ko kaise process karta hai</h3>
<ul>
<li>ACL <b>access control entries (ACEs)</b> ki ordered list hai, har ek match conditions ke saath permit ya deny.</li>
<li>Router entries <b>top-down</b> check karta hai aur <b>pehle match</b> par ruk jaata hai. Us packet ke liye baad ki lines kabhi check nahi hoti.</li>
<li>Har ACL ek invisible <b>implicit deny any</b> par khatam hoti hai. Jo packet kisi se match nahi karta woh drop hota hai.</li>
<li>ACL tab tak kuch nahi karti jab tak apply na ho: interface par ek direction mein (<code>ip access-group</code>), ya VTY lines par (<code>access-class</code>), ya NAT jaisa koi aur feature use kare.</li>
<li>Har interface, har direction, har protocol (IPv4 ya IPv6) par ek ACL.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ACL top-down processing">
<rect x="10" y="80" width="100" height="44" rx="10" fill="#bae6fd"/><text x="60" y="107" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="150" y="10" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="35" text-anchor="middle" class="svg-ink" font-size="12">Line 10 match?</text>
<rect x="150" y="80" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="235" y="105" text-anchor="middle" class="svg-ink" font-size="12">Line 20 match?</text>
<rect x="150" y="150" width="170" height="40" rx="8" fill="#fed7aa"/><text x="235" y="175" text-anchor="middle" class="svg-ink" font-size="12">Implicit deny any</text>
<line x1="110" y1="102" x2="150" y2="30" stroke="#64748b"/><line x1="235" y1="50" x2="235" y2="80" stroke="#64748b"/><line x1="235" y1="120" x2="235" y2="150" stroke="#64748b"/>
<text x="260" y="68" class="svg-muted" font-size="12">nahi</text><text x="260" y="138" class="svg-muted" font-size="12">nahi</text>
<line x1="320" y1="30" x2="420" y2="30" stroke="#64748b"/><line x1="320" y1="100" x2="420" y2="100" stroke="#64748b"/><line x1="320" y1="170" x2="420" y2="170" stroke="#64748b"/>
<rect x="420" y="10" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="35" text-anchor="middle" class="svg-ink" font-size="12">haan: action lagao, ruko</text>
<rect x="420" y="80" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="105" text-anchor="middle" class="svg-ink" font-size="12">haan: action lagao, ruko</text>
<rect x="420" y="150" width="210" height="40" rx="8" fill="#fed7aa"/><text x="525" y="175" text-anchor="middle" class="svg-ink" font-size="12">packet drop karo</text>
</svg><p class="cap">Top-down, pehla match jeetta hai, aur invisible aakhri line baaki sab deny karti hai.</p></div>

<h3>Wildcard masks</h3>
<p>ACLs address ranges ko <b>wildcard mask</b> se describe karti hain. 0 bit ka matlab "yeh bit match hona chahiye"; 1 bit ka matlab "is bit ko ignore karo". Normal subnet ke liye wildcard subnet mask ka ulta hai: mask ke har octet ko 255 se ghatao.</p>
<table class="cmp"><tr><th>Range</th><th>Subnet mask</th><th>Wildcard</th><th>ACL form</th></tr>
<tr><td>10.0.99.0/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td><code>10.0.99.0 0.0.0.255</code></td></tr>
<tr><td>10.0.20.64/26</td><td>255.255.255.192</td><td>0.0.0.63</td><td><code>10.0.20.64 0.0.0.63</code></td></tr>
<tr><td>Ek host 10.0.99.5</td><td>/32</td><td>0.0.0.0</td><td><code>host 10.0.99.5</code></td></tr>
<tr><td>Sab kuch</td><td>/0</td><td>255.255.255.255</td><td><code>any</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Jump hosts 10.0.99.0/28 mein hain (10.0.99.0 se 10.0.99.15). Mask 255.255.255.240; 255 minus 240 = 15, isliye wildcard 0.0.0.15 hai aur entry <code>permit 10.0.99.0 0.0.0.15</code> hai. 10.0.99.20 wala host match nahi karta kyunki aakhri octet ka 16 wala bit (20 = 16 + 4) 1 hai jabki entry 0 maangti hai, isliye woh implicit deny tak gir jaata hai.</p></div>

<h3>Standard vs extended</h3>
<p><b>Standard ACLs</b> (numbers 1 se 99 aur 1300 se 1999) <b>sirf source address</b> match karti hain. <b>Extended ACLs</b> (100 se 199 aur 2000 se 2699) source, destination, protocol aur ports match karti hain. Dono <b>named</b> bhi ho sakti hain, jo padhna aur edit karna aasaan hai (agla chapter).</p>
<p><b>Placement ka rule of thumb.</b> Standard ACL destination nahi dekh sakti, isliye use <b>destination ke paas</b> lagao; warna woh source ko har jagah se block kar degi. Extended ACL precise hai, isliye use <b>source ke paas</b> lagao aur unwanted traffic ko network cross karne se pehle hi drop karo.</p>

<h3>Interface par standard ACL configure karna</h3>
<p>Task: guest subnet 10.0.20.0/24 HR server LAN 10.0.50.0/24 tak na pahunche, jo router R1 ke Gi0/2 ke peeche hai. Baaki sab ab bhi HR tak pahunchein, aur guests ab bhi internet tak pahunchein.</p>
<pre class="code">R1(config)# access-list 20 deny 10.0.20.0 0.0.0.255
R1(config)# access-list 20 permit any          <span class="c">! without this, the implicit deny blocks everyone</span>
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip access-group 20 out           <span class="c">! out towards HR = close to the destination</span></pre>
<pre class="out">R1# show access-lists 20
Standard IP access list 20
<span class="hl">    10 deny   10.0.20.0, wildcard bits 0.0.0.255 (37 matches)</span>
    20 permit any (1204 matches)

R1# show ip interface GigabitEthernet0/2 | include access list
<span class="hl">  Outgoing access list is 20</span>
  Inbound  access list is not set</pre>
<p>Match counters prove karte hain ki guest traffic deny se takra raha hai. Direction router ke point of view se hoti hai: <b>in</b> matlab us interface par aane wale packets, <b>out</b> matlab usse bahar jaane wale packets.</p>

<div class="warn"><p><b>Common galtiyan.</b> Wildcard ki jagah subnet mask likhna (<code>10.0.20.0 255.255.255.0</code> lagbhag kuch bhi match kar leta hai). Deny ke baad <code>permit any</code> bhool jaana. Standard ACL ko source ke paas lagana, jisse guests internet se bhi block ho jaate hain. Numbered list mein <code>permit any</code> ke baad neeche naya deny jodna, jahan woh kabhi match nahi ho sakta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Sirf deny statements wali ACL kaunsa traffic permit karti hai?" Koi nahi, implicit deny ki wajah se. "Standard ACL kahan lagni chahiye?" Destination ke paas. Lines ka order matter karta hai; sabse specific entries pehle aati hain.</p></div>

<div class="scn"><h4>Woh deny jo kabhi match nahi hua</h4><p>Security team ne ek compromised laptop, 10.0.10.77, ko server LAN se block karne ko kaha. Engineer ne ek router par <code>access-list 30 deny host 10.0.10.77</code> type kiya jahan ACL 30 pehle se <code>permit any</code> par khatam hoti thi. Laptop servers tak pahunchta raha. <code>show access-lists 30</code> mein nayi line sequence 40 par zero matches ke saath dikhi, 30 wale permit any ke neeche. Usne ACL ko deny pehle rakh kar dobara banaya (baad mein use named ACL mein convert kiya taaki sequence number se lines insert kar sake).</p><p><b>Seekh:</b> numbered ACL mein nayi lines neeche jaati hain; hamesha order aur match counters check karo.</p></div>

<div class="iv"><p class="q">"Router ACL ko kaise process karta hai, aur aap standard ACL kahan lagaoge?"</p><p>Top-down, first match, end mein implicit deny; direction mein apply hone tak kuch nahi hota. Standard ACL sirf source match karti hai, isliye use destination ke paas lagao taaki source dusre networks se block na ho. Wildcard rule (mask ka ulta) batao aur <code>show access-lists</code> se counters check karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs top-down check hoti hain, pehla match jeetta hai, end mein implicit deny any.</li>
<li>Wildcard 0 = match hona chahiye, 1 = ignore; subnet ke liye 255 minus har mask octet.</li>
<li>Standard ACLs (1 se 99, 1300 se 1999) sirf source match karti hain; destination ke paas lagao.</li>
<li>Interfaces par <code>ip access-group N in|out</code>, VTY lines par <code>access-class N in</code> se apply karo.</li>
<li><code>show access-lists</code> counters aur <code>show ip interface</code> se verify karo.</li>
</ul></div>
`}};export{e as default};