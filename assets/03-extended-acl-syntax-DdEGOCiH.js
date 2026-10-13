var e={id:`syntax`,h:{en:`Extended ACL syntax on the ASA (masks, not wildcards)`,hi:`ASA par extended ACL syntax (masks, wildcards nahi)`},body:{en:`
<p>An ACL is a numbered list of rules. Each rule is called an <b>ACE</b> (access control entry). In this chapter you learn to read and write any ASA ACE fluently, and to avoid the IOS habits that break ASA configs.</p>

<h3>The analogy: a sentence with fixed slots</h3>
<p>Every ACE is the same sentence with slots: <i>"[permit or deny] [this protocol] from [this source] [source port] to [this destination] [destination port], and [log it]."</i> Once you know the slots, any ACE reads like plain English.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Anatomy of an ASA ACE">
<rect x="5" y="20" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="52" y="45" text-anchor="middle" class="svg-ink" font-size="12">OUTSIDE_IN</text>
<rect x="105" y="20" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="180" y="20" width="50" height="40" rx="6" fill="#ddd6fe"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="12">tcp</text>
<rect x="235" y="20" width="120" height="40" rx="6" fill="#fed7aa"/><text x="295" y="45" text-anchor="middle" class="svg-ink" font-size="12">host 198.51.100.10</text>
<rect x="360" y="20" width="150" height="40" rx="6" fill="#bae6fd"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="12">10.0.2.0 255.255.255.0</text>
<rect x="515" y="20" width="60" height="40" rx="6" fill="#fde68a"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">eq ssh</text>
<rect x="580" y="20" width="55" height="40" rx="6" fill="#e2e8f0"/><text x="607" y="45" text-anchor="middle" class="svg-ink" font-size="12">log</text>
<text x="52" y="85" text-anchor="middle" class="svg-muted" font-size="12">ACL name</text>
<text x="140" y="85" text-anchor="middle" class="svg-muted" font-size="12">action</text>
<text x="205" y="85" text-anchor="middle" class="svg-muted" font-size="12">protocol</text>
<text x="295" y="85" text-anchor="middle" class="svg-muted" font-size="12">source</text>
<text x="435" y="85" text-anchor="middle" class="svg-muted" font-size="12">destination (mask)</text>
<text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="12">dst port</text>
<text x="607" y="85" text-anchor="middle" class="svg-muted" font-size="12">option</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">access-list NAME extended ACTION PROTO SRC [PORT] DST [PORT] [OPTIONS]</text>
</svg><p class="cap">Every extended ACE uses the same slots. The source port slot is rarely used; the destination port is where services live.</p></div>

<h3>Slot by slot</h3>
<dl class="terms">
<dt>Action</dt><dd><code>permit</code> or <code>deny</code>.</dd>
<dt>Protocol</dt><dd><code>ip</code> (all IP), <code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>icmp6</code>, <code>gre</code>, <code>esp</code>, a protocol number such as <code>50</code>, or an object/object-group (chapter 5).</dd>
<dt>Address</dt><dd><code>any</code> (IPv4 and IPv6 since 9.0), <code>any4</code>, <code>any6</code>, <code>host 10.0.2.10</code>, <code>10.0.2.0 255.255.255.0</code>, <code>object NAME</code>, <code>object-group NAME</code>, or <code>interface outside</code> (the interface's own address).</dd>
<dt>Port operators</dt><dd><code>eq</code> (equal), <code>neq</code> (not equal), <code>lt</code> (less than), <code>gt</code> (greater than), <code>range 8000 8080</code>. Only valid with tcp, udp or tcp-udp services.</dd>
<dt>Options</dt><dd><code>log</code>, <code>time-range NAME</code>, <code>inactive</code> (chapter 7).</dd>
</dl>

<h3>Subnet masks, not wildcards</h3>
<p>This is the number-one IOS habit to unlearn. On IOS you write <code>10.0.2.0 0.0.0.255</code>. On the ASA you write <code>10.0.2.0 255.255.255.0</code>, exactly like an interface address. If you type a wildcard, the ASA does not silently fix it; it rejects the pair because 0.0.0.255 is not a valid mask, or, worse, a pasted IOS line with <code>0.0.0.0</code> as the mask means "any address".</p>

<table class="cmp"><tr><th>Item</th><th>IOS router</th><th>Cisco ASA</th></tr>
<tr><td>Mask style</td><td>Wildcard 0.0.0.255</td><td>Subnet mask 255.255.255.0</td></tr>
<tr><td>Apply to interface</td><td><code>ip access-group NAME in</code> under the interface</td><td><code>access-group NAME in interface outside</code> in global config</td></tr>
<tr><td>Numbered ACLs</td><td>Common (100 to 199)</td><td>Names used; the name can be a number but has no meaning</td></tr>
<tr><td>NAT and ACL</td><td>Order depends on direction</td><td>ACL always matches real IPs (8.3+)</td></tr>
<tr><td>Return traffic</td><td>Needs reflexive ACL or ZBF</td><td>Automatic via the conn table</td></tr>
</table>

<h3>Ports: names and numbers</h3>
<p>You can type a number or a keyword: <code>eq 80</code> or <code>eq www</code>, <code>eq 443</code> or <code>eq h&#116;tps</code>, <code>eq 22</code> or <code>eq ssh</code>, <code>eq 25</code> or <code>eq smtp</code>, <code>eq 53</code> or <code>eq domain</code>. The ASA always <i>displays</i> the keyword, so <code>eq 80</code> shows as <code>eq www</code>. Do not panic when the running-config does not look like what you typed.</p>

<h3>Building and editing an ACL</h3>
<pre class="code"><span class="c">! new lines are added at the bottom</span>
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.10 eq www
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.10 eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.25 eq smtp
<span class="c">! insert at a chosen position with the line keyword</span>
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 10.0.2.0 255.255.255.0 eq ssh
<span class="c">! remove one ACE by repeating it with no</span>
no access-list OUTSIDE_IN extended permit tcp any host 10.0.2.25 eq smtp
<span class="c">! ICMP with a type</span>
access-list OUTSIDE_IN extended permit icmp any host 10.0.2.10 echo
<span class="c">! bind it: one ACL per interface per direction</span>
access-group OUTSIDE_IN in interface outside</pre>

<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 4 elements; name hash: 0x6892a938
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 10.0.2.0 255.255.255.0 eq ssh (hitcnt=0) 0x5b1f6d02</span>
access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq www (hitcnt=14) 0x1c2a31fe
access-list OUTSIDE_IN line 3 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=9) 0x7a04c8e1
access-list OUTSIDE_IN line 4 extended permit icmp any host 10.0.2.10 echo (hitcnt=2) 0x33b9d0aa</pre>

<p>Note that line numbers are <b>not stored</b> in the config; they are simply the current position. After an insert, every line below shifts down by one.</p>

<h3>Standard ACLs: not for traffic filtering</h3>
<p>The ASA also has <code>access-list NAME standard permit 10.0.1.0 255.255.255.0</code>. Standard ACLs match only destination-style address lists and are used by other features, such as route maps, OSPF distribute lists and VPN split tunnelling. You cannot bind a standard ACL to an interface with <code>access-group</code>.</p>

<div class="eg"><p><b>Worked example.</b> Allow a monitoring server 198.51.100.50 to reach all DMZ servers on SNMP (UDP 161) and the web server on TCP 8080 to 8090. Two ACEs: <code>permit udp host 198.51.100.50 10.0.2.0 255.255.255.0 eq snmp</code> and <code>permit tcp host 198.51.100.50 host 10.0.2.10 range 8080 8090</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using wildcards; using <code>eq</code> with protocol <code>ip</code> (ports only exist for tcp and udp); putting a port on the source by accident (<code>permit tcp any eq www host 10.0.2.10</code> matches traffic <i>from</i> port 80); and forgetting <code>access-group</code>, so the ACL exists but does nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which ACE permits HTTPS to 10.0.2.0/24?" Reject every option with 0.0.0.255 or with the port placed after the source. The correct form is <code>permit tcp any 10.0.2.0 255.255.255.0 eq 443</code>.</p></div>

<div class="scn"><h4>The pasted router ACL</h4><p>An engineer migrating from a router copied <code>permit tcp any 10.0.2.0 0.0.0.255 eq 443</code> into the ASA. The CLI rejected it with an "Invalid netmask" style error, so the colleague "fixed" it by changing the mask to <code>0.0.0.0</code>. The line was accepted, and it matched every destination on port 443, not just the DMZ. A review of <code>show access-list</code> caught the unusually high hit count.</p><p><b>Lesson:</b> ASA ACLs use subnet masks; never tweak a mask until the CLI accepts it without understanding what it now matches.</p></div>

<div class="iv"><p class="q">"What are the main differences between IOS ACLs and ASA ACLs?"</p><p>Strong answer: ASA uses subnet masks, not wildcards; ACLs are named and bound globally with <code>access-group NAME in|out interface X</code>; return traffic is handled by the stateful conn table; since 8.3 ACLs match real, untranslated IPs; ASA supports objects and object-groups natively; and the ASA shows hit counts and hashes per ACE. Bonus: <code>any</code> covers IPv4 and IPv6 since 9.0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACE slots: action, protocol, source, source port, destination, destination port, options.</li>
<li>ASA uses subnet masks; a wildcard is an error, and 0.0.0.0 as a mask means any.</li>
<li>Use <code>line N</code> to insert; line numbers are positions, not saved values.</li>
<li>Port keywords are displayed even if you type numbers.</li>
<li>Only extended ACLs filter through-traffic; bind them with <code>access-group</code>.</li>
</ul></div>
`,hi:`
<p>ACL rules ki ek numbered list hai. Har rule ko <b>ACE</b> (access control entry) kehte hain. Is chapter mein aap koi bhi ASA ACE fluently padhna aur likhna seekhoge, aur un IOS aadaton se bachna seekhoge jo ASA configs tod deti hain.</p>

<h3>Analogy: fixed slots wala sentence</h3>
<p>Har ACE slots wala ek hi sentence hai: <i>"[permit ya deny] [yeh protocol] [is source] [source port] se [is destination] [destination port] tak, aur [ise log karo]."</i> Slots samajh aa gaye to koi bhi ACE plain English jaisi padhi jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ASA ACE ki anatomy">
<rect x="5" y="20" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="52" y="45" text-anchor="middle" class="svg-ink" font-size="12">OUTSIDE_IN</text>
<rect x="105" y="20" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="180" y="20" width="50" height="40" rx="6" fill="#ddd6fe"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="12">tcp</text>
<rect x="235" y="20" width="120" height="40" rx="6" fill="#fed7aa"/><text x="295" y="45" text-anchor="middle" class="svg-ink" font-size="12">host 198.51.100.10</text>
<rect x="360" y="20" width="150" height="40" rx="6" fill="#bae6fd"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="12">10.0.2.0 255.255.255.0</text>
<rect x="515" y="20" width="60" height="40" rx="6" fill="#fde68a"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">eq ssh</text>
<rect x="580" y="20" width="55" height="40" rx="6" fill="#e2e8f0"/><text x="607" y="45" text-anchor="middle" class="svg-ink" font-size="12">log</text>
<text x="52" y="85" text-anchor="middle" class="svg-muted" font-size="12">ACL naam</text>
<text x="140" y="85" text-anchor="middle" class="svg-muted" font-size="12">action</text>
<text x="205" y="85" text-anchor="middle" class="svg-muted" font-size="12">protocol</text>
<text x="295" y="85" text-anchor="middle" class="svg-muted" font-size="12">source</text>
<text x="435" y="85" text-anchor="middle" class="svg-muted" font-size="12">destination (mask)</text>
<text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="12">dst port</text>
<text x="607" y="85" text-anchor="middle" class="svg-muted" font-size="12">option</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">access-list NAME extended ACTION PROTO SRC [PORT] DST [PORT] [OPTIONS]</text>
</svg><p class="cap">Har extended ACE same slots use karti hai. Source port slot kam use hota hai; services destination port par rehti hain.</p></div>

<h3>Slot by slot</h3>
<dl class="terms">
<dt>Action</dt><dd><code>permit</code> ya <code>deny</code>.</dd>
<dt>Protocol</dt><dd><code>ip</code> (saara IP), <code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>icmp6</code>, <code>gre</code>, <code>esp</code>, <code>50</code> jaisa protocol number, ya object/object-group (chapter 5).</dd>
<dt>Address</dt><dd><code>any</code> (9.0 se IPv4 aur IPv6 dono), <code>any4</code>, <code>any6</code>, <code>host 10.0.2.10</code>, <code>10.0.2.0 255.255.255.0</code>, <code>object NAME</code>, <code>object-group NAME</code>, ya <code>interface outside</code> (interface ka apna address).</dd>
<dt>Port operators</dt><dd><code>eq</code> (barabar), <code>neq</code> (barabar nahi), <code>lt</code> (kam), <code>gt</code> (zyada), <code>range 8000 8080</code>. Sirf tcp, udp ya tcp-udp services ke saath valid.</dd>
<dt>Options</dt><dd><code>log</code>, <code>time-range NAME</code>, <code>inactive</code> (chapter 7).</dd>
</dl>

<h3>Subnet masks, wildcards nahi</h3>
<p>Yeh unlearn karne wali number-one IOS aadat hai. IOS par aap <code>10.0.2.0 0.0.0.255</code> likhte ho. ASA par aap <code>10.0.2.0 255.255.255.0</code> likhte ho, bilkul interface address ki tarah. Agar aap wildcard type karte ho, to ASA chupchaap theek nahi karta; woh pair reject kar deta hai kyunki 0.0.0.255 valid mask nahi hai, ya usse bhi bura, <code>0.0.0.0</code> mask wali paste ki hui IOS line ka matlab hota hai "koi bhi address".</p>

<table class="cmp"><tr><th>Item</th><th>IOS router</th><th>Cisco ASA</th></tr>
<tr><td>Mask style</td><td>Wildcard 0.0.0.255</td><td>Subnet mask 255.255.255.0</td></tr>
<tr><td>Interface par apply</td><td>Interface ke neeche <code>ip access-group NAME in</code></td><td>Global config mein <code>access-group NAME in interface outside</code></td></tr>
<tr><td>Numbered ACLs</td><td>Common (100 se 199)</td><td>Names use hote hain; naam number ho sakta hai lekin uska koi matlab nahi</td></tr>
<tr><td>NAT aur ACL</td><td>Order direction par depend karta hai</td><td>ACL hamesha real IPs match karti hai (8.3+)</td></tr>
<tr><td>Return traffic</td><td>Reflexive ACL ya ZBF chahiye</td><td>Conn table se automatic</td></tr>
</table>

<h3>Ports: naam aur numbers</h3>
<p>Aap number ya keyword type kar sakte ho: <code>eq 80</code> ya <code>eq www</code>, <code>eq 443</code> ya <code>eq h&#116;tps</code>, <code>eq 22</code> ya <code>eq ssh</code>, <code>eq 25</code> ya <code>eq smtp</code>, <code>eq 53</code> ya <code>eq domain</code>. ASA hamesha keyword <i>dikhata</i> hai, isliye <code>eq 80</code> <code>eq www</code> ke roop mein dikhta hai. Jab running-config aapke type kiye jaisa na dikhe to ghabrao mat.</p>

<h3>ACL banana aur edit karna</h3>
<pre class="code"><span class="c">! nayi lines neeche judti hain</span>
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.10 eq www
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.10 eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp any host 10.0.2.25 eq smtp
<span class="c">! line keyword se chuni hui position par insert karo</span>
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 10.0.2.0 255.255.255.0 eq ssh
<span class="c">! ek ACE ko no ke saath repeat karke hatao</span>
no access-list OUTSIDE_IN extended permit tcp any host 10.0.2.25 eq smtp
<span class="c">! type ke saath ICMP</span>
access-list OUTSIDE_IN extended permit icmp any host 10.0.2.10 echo
<span class="c">! bind karo: har interface har direction ek ACL</span>
access-group OUTSIDE_IN in interface outside</pre>

<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 4 elements; name hash: 0x6892a938
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 10.0.2.0 255.255.255.0 eq ssh (hitcnt=0) 0x5b1f6d02</span>
access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq www (hitcnt=14) 0x1c2a31fe
access-list OUTSIDE_IN line 3 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=9) 0x7a04c8e1
access-list OUTSIDE_IN line 4 extended permit icmp any host 10.0.2.10 echo (hitcnt=2) 0x33b9d0aa</pre>

<p>Dhyan do ki line numbers config mein <b>store nahi hote</b>; woh bas current position hain. Insert ke baad neeche ki har line ek niche khisak jaati hai.</p>

<h3>Standard ACLs: traffic filtering ke liye nahi</h3>
<p>ASA mein <code>access-list NAME standard permit 10.0.1.0 255.255.255.0</code> bhi hota hai. Standard ACLs sirf destination-style address lists match karti hain aur dusre features use karte hain, jaise route maps, OSPF distribute lists aur VPN split tunnelling. Standard ACL ko <code>access-group</code> se interface par bind nahi kar sakte.</p>

<div class="eg"><p><b>Worked example.</b> Monitoring server 198.51.100.50 ko saare DMZ servers tak SNMP (UDP 161) par aur web server tak TCP 8080 se 8090 par pahunchne do. Do ACEs: <code>permit udp host 198.51.100.50 10.0.2.0 255.255.255.0 eq snmp</code> aur <code>permit tcp host 198.51.100.50 host 10.0.2.10 range 8080 8090</code>.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Wildcards use karna; protocol <code>ip</code> ke saath <code>eq</code> use karna (ports sirf tcp aur udp mein hote hain); galti se source par port laga dena (<code>permit tcp any eq www host 10.0.2.10</code> port 80 <i>se aane wala</i> traffic match karta hai); aur <code>access-group</code> bhool jaana, jisse ACL exist karti hai lekin kuch nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi ACE 10.0.2.0/24 tak HTTPS permit karti hai?" 0.0.0.255 wale ya source ke baad port wale har option ko reject karo. Sahi form hai <code>permit tcp any 10.0.2.0 255.255.255.0 eq 443</code>.</p></div>

<div class="scn"><h4>Paste ki hui router ACL</h4><p>Router se migrate karte hue ek engineer ne <code>permit tcp any 10.0.2.0 0.0.0.255 eq 443</code> ASA mein copy kiya. CLI ne "Invalid netmask" jaisa error dekar reject kiya, to ek colleague ne mask ko <code>0.0.0.0</code> karke use "theek" kar diya. Line accept ho gayi, aur woh port 443 par har destination match karti thi, sirf DMZ nahi. <code>show access-list</code> ke review mein unusually high hit count ne ise pakda.</p><p><b>Seekh:</b> ASA ACLs subnet masks use karti hain; mask ko tab tak mat badlo jab tak CLI accept na kare, bina samjhe ki ab woh kya match karta hai.</p></div>

<div class="iv"><p class="q">"IOS ACLs aur ASA ACLs mein main differences kya hain?"</p><p>Strong answer: ASA subnet masks use karta hai, wildcards nahi; ACLs named hoti hain aur <code>access-group NAME in|out interface X</code> se globally bind hoti hain; return traffic stateful conn table handle karti hai; 8.3 se ACLs real, untranslated IPs match karti hain; ASA objects aur object-groups natively support karta hai; aur ASA har ACE ke hit counts aur hashes dikhata hai. Bonus: 9.0 se <code>any</code> IPv4 aur IPv6 dono cover karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACE slots: action, protocol, source, source port, destination, destination port, options.</li>
<li>ASA subnet masks use karta hai; wildcard error hai, aur 0.0.0.0 mask ka matlab any hai.</li>
<li>Insert ke liye <code>line N</code> use karo; line numbers positions hain, saved values nahi.</li>
<li>Numbers type karo tab bhi port keywords dikhte hain.</li>
<li>Sirf extended ACLs through-traffic filter karti hain; unhe <code>access-group</code> se bind karo.</li>
</ul></div>
`}};export{e as default};