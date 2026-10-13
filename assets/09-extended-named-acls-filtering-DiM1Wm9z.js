var e={id:`acl-extended`,h:{en:`Extended and named ACLs, URL filtering and content filtering`,hi:`Extended aur named ACLs, URL filtering aur content filtering`},body:{en:`
<p>The wedding bouncer now has a smarter list: "Sharma family may enter the dining hall but not the kitchen; caterers may enter the kitchen only through the back door". The list checks who you are, where you are going and which door you use. That is an <b>extended ACL</b>. And at the door of the hall, a second person checks what is inside your bags; that is <b>content filtering</b>.</p>

<h3>Extended ACL syntax</h3>
<p>Each extended entry reads: <b>action, protocol, source, [source port], destination, [destination port], [options]</b>.</p>
<pre class="code">permit tcp 10.0.20.0 0.0.0.255 any eq 443
<span class="c">! action protocol  source + wildcard  dest  port</span></pre>
<ul>
<li>Protocols: <code>ip</code> (everything), <code>tcp</code>, <code>udp</code>, <code>icmp</code>.</li>
<li>Port operators: <code>eq</code> (equal), <code>neq</code>, <code>gt</code>, <code>lt</code>, <code>range</code>. Names are allowed: <code>www</code> = 80, <code>domain</code> = 53, <code>bootps</code> = 67, <code>22</code> for SSH, <code>443</code> for HTTPS.</li>
<li>Options: <code>log</code> sends a syslog message on match; <code>established</code> matches TCP packets with ACK or RST set.</li>
</ul>

<h3>Named ACLs and sequence numbers</h3>
<p>A <b>named ACL</b> has a readable name and lets you insert or delete single lines by sequence number, which fixes the "new line lands at the bottom" problem from the previous chapter.</p>

<div class="eg"><p><b>Worked example: the guest VLAN.</b> Guests on 10.0.20.0/24 connect to R1 Gi0/3 (gateway 10.0.20.1, also their DHCP server). Policy: guests get DHCP and DNS, may browse the web on ports 80 and 443, must never reach any internal 10.0.0.0/8 address, and everything else is logged and dropped. It is an extended ACL, so it goes close to the source: inbound on Gi0/3.</p>
<pre class="code">R1(config)# ip access-list extended GUEST-IN
R1(config-ext-nacl)# 5 permit udp any any eq bootps                          <span class="c">! DHCP from 0.0.0.0</span>
R1(config-ext-nacl)# 10 permit udp 10.0.20.0 0.0.0.255 any eq domain         <span class="c">! DNS</span>
R1(config-ext-nacl)# 20 deny ip 10.0.20.0 0.0.0.255 10.0.0.0 0.255.255.255   <span class="c">! no internal access</span>
R1(config-ext-nacl)# 30 permit tcp 10.0.20.0 0.0.0.255 any eq 443
R1(config-ext-nacl)# 40 permit tcp 10.0.20.0 0.0.0.255 any eq www
R1(config-ext-nacl)# 50 deny ip any any log
R1(config-ext-nacl)# exit
R1(config)# interface GigabitEthernet0/3
R1(config-if)# ip access-group GUEST-IN in</pre>
<pre class="out">R1# show access-lists GUEST-IN
Extended IP access list GUEST-IN
    5 permit udp any any eq bootps (12 matches)
    10 permit udp 10.0.20.0 0.0.0.255 any eq domain (842 matches)
<span class="hl">    20 deny ip 10.0.20.0 0.0.0.255 10.0.0.0 0.255.255.255 (57 matches)</span>
    30 permit tcp 10.0.20.0 0.0.0.255 any eq 443 (15230 matches)
    40 permit tcp 10.0.20.0 0.0.0.255 any eq www (611 matches)
    50 deny ip any any log (9 matches)</pre>
<p>Line 5 matters: a DHCP Discover comes from 0.0.0.0, not from 10.0.20.x, so without it guests never get an address. Line 20 comes before 30 and 40 so a guest cannot reach an internal web server on port 443.</p></div>

<p>Editing by sequence number, then seeing a logged drop:</p>
<pre class="code">R1(config)# ip access-list extended GUEST-IN
R1(config-ext-nacl)# 25 permit icmp 10.0.20.0 0.0.0.255 any echo   <span class="c">! insert between 20 and 30</span>
R1(config-ext-nacl)# no 40                                           <span class="c">! remove plain web</span></pre>
<pre class="out"><span class="hl">%SEC-6-IPACCESSLOGP: list GUEST-IN denied tcp 10.0.20.33(51544) -&gt; 10.0.50.10(445), 1 packet</span></pre>
<p>A router ACL is <b>stateless</b>: it judges each packet alone. A <b>stateful firewall</b> remembers sessions and automatically allows the replies, which is why perimeter policy normally lives on a firewall while ACLs handle simple segmentation and device protection.</p>

<h3>URL filtering and content filtering</h3>
<table class="cmp"><tr><th>Control</th><th>Looks at</th><th>Typical rule</th><th>Where it runs</th></tr>
<tr><td><b>ACL</b></td><td>IP addresses, protocol, ports (layers 3 and 4)</td><td>Guests may not reach 10.0.0.0/8</td><td>Routers, switches, firewalls</td></tr>
<tr><td><b>URL filtering</b></td><td>The web address or domain and its category</td><td>Block gambling and known-malware categories; allow the partner portal</td><td>Next-generation firewall, secure web gateway or proxy, DNS filter</td></tr>
<tr><td><b>Content filtering</b></td><td>What is actually inside the traffic: file types, keywords, malware, sensitive data</td><td>Block executable downloads; scan attachments; stop card numbers leaving</td><td>NGFW, web and email gateways</td></tr>
</table>
<p>URL filtering answers "where is this user going?"; content filtering answers "what is being carried?". Both need visibility into HTTPS: URL filters can read the domain from the TLS handshake (SNI) or DNS, while full content filtering usually needs <b>TLS inspection</b>, where the firewall decrypts and re-encrypts traffic using a certificate the company's devices trust.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Three layers of filtering">
<rect x="10" y="40" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">ACL</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">IPs, protocol, ports</text>
<rect x="225" y="40" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">URL filtering</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">domain and category</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Content filtering</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">files, keywords, malware</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">each layer looks deeper into the same traffic</text>
</svg><p class="cap">ACLs judge the envelope; URL filters read the address; content filters open the parcel.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting DHCP (<code>bootps</code>) or DNS in an inbound ACL on a client-facing interface. Putting the broad permit before the specific deny. Mixing up source and destination ports: to allow users to reach web servers, the destination port is 443, not the source. Expecting an ACL to block a website by name; that is URL filtering.</p></div>

<div class="exam"><p><b>Exam trap.</b> Extended ACLs match source, destination, protocol and port, and go close to the source. "Block access to social media sites" is URL filtering; "block users downloading .exe files" is content filtering; "block TCP 23 to the router" is an ACL. ACLs are stateless; firewalls are stateful.</p></div>

<div class="scn"><h4>Guests with no IP address</h4><p>After an engineer applied a new inbound guest ACL, every guest phone showed "No internet" and a 169.254.x.x address. <code>show access-lists</code> showed rising matches on the final <code>deny ip any any log</code> line, and the log said <code>denied udp 0.0.0.0(68) -&gt; 255.255.255.255(67)</code>. DHCP Discover messages come from 0.0.0.0, so they never matched the 10.0.20.0 source lines. Adding <code>5 permit udp any any eq bootps</code> fixed it immediately.</p><p><b>Lesson:</b> the log keyword on a final deny line tells you exactly what your ACL is blocking.</p></div>

<div class="iv"><p class="q">"Write an ACL that lets a guest VLAN reach only the internet on web ports."</p><p>Describe a named extended ACL inbound on the guest gateway interface: permit DHCP and DNS, deny guest to all private internal ranges, permit TCP 80 and 443 to any, deny and log the rest. Explain why deny-internal must come before the web permits and why it goes close to the source. Then add that URL and content filtering on the firewall complete the policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Extended entries: action, protocol, source, destination, ports, options such as log.</li>
<li>Named ACLs allow inserting and deleting lines by sequence number.</li>
<li>Place extended ACLs close to the source; put specific denies before broad permits.</li>
<li>ACLs are stateless; stateful firewalls track sessions.</li>
<li>URL filtering controls destinations by domain and category; content filtering inspects payloads and files.</li>
</ul></div>
`,hi:`
<p>Shaadi ke bouncer ke paas ab zyada smart list hai: "Sharma family dining hall mein ja sakti hai lekin kitchen mein nahi; caterers kitchen mein sirf peeche ke darwaze se ja sakte hain". List check karti hai ki aap kaun ho, kahan ja rahe ho aur kaunsa darwaza use kar rahe ho. Yahi <b>extended ACL</b> hai. Aur hall ke darwaze par ek doosra insaan check karta hai ki aapke bag mein kya hai; yeh <b>content filtering</b> hai.</p>

<h3>Extended ACL syntax</h3>
<p>Har extended entry aise padhi jaati hai: <b>action, protocol, source, [source port], destination, [destination port], [options]</b>.</p>
<pre class="code">permit tcp 10.0.20.0 0.0.0.255 any eq 443
<span class="c">! action protocol  source + wildcard  dest  port</span></pre>
<ul>
<li>Protocols: <code>ip</code> (sab kuch), <code>tcp</code>, <code>udp</code>, <code>icmp</code>.</li>
<li>Port operators: <code>eq</code> (barabar), <code>neq</code>, <code>gt</code>, <code>lt</code>, <code>range</code>. Naam allowed hain: <code>www</code> = 80, <code>domain</code> = 53, <code>bootps</code> = 67, SSH ke liye <code>22</code>, HTTPS ke liye <code>443</code>.</li>
<li>Options: <code>log</code> match hone par syslog message bhejta hai; <code>established</code> ACK ya RST set wale TCP packets match karta hai.</li>
</ul>

<h3>Named ACLs aur sequence numbers</h3>
<p><b>Named ACL</b> ka ek padhne layak naam hota hai aur yeh aapko sequence number se single lines insert ya delete karne deti hai, jo pichhle chapter ki "nayi line neeche chali jaati hai" problem ko theek karta hai.</p>

<div class="eg"><p><b>Worked example: guest VLAN.</b> 10.0.20.0/24 ke guests R1 Gi0/3 se jude hain (gateway 10.0.20.1, jo unka DHCP server bhi hai). Policy: guests ko DHCP aur DNS mile, woh ports 80 aur 443 par web browse kar sakein, kabhi kisi internal 10.0.0.0/8 address tak na pahunchein, aur baaki sab log hokar drop ho. Yeh extended ACL hai, isliye source ke paas jaati hai: Gi0/3 par inbound.</p>
<pre class="code">R1(config)# ip access-list extended GUEST-IN
R1(config-ext-nacl)# 5 permit udp any any eq bootps                          <span class="c">! DHCP from 0.0.0.0</span>
R1(config-ext-nacl)# 10 permit udp 10.0.20.0 0.0.0.255 any eq domain         <span class="c">! DNS</span>
R1(config-ext-nacl)# 20 deny ip 10.0.20.0 0.0.0.255 10.0.0.0 0.255.255.255   <span class="c">! no internal access</span>
R1(config-ext-nacl)# 30 permit tcp 10.0.20.0 0.0.0.255 any eq 443
R1(config-ext-nacl)# 40 permit tcp 10.0.20.0 0.0.0.255 any eq www
R1(config-ext-nacl)# 50 deny ip any any log
R1(config-ext-nacl)# exit
R1(config)# interface GigabitEthernet0/3
R1(config-if)# ip access-group GUEST-IN in</pre>
<pre class="out">R1# show access-lists GUEST-IN
Extended IP access list GUEST-IN
    5 permit udp any any eq bootps (12 matches)
    10 permit udp 10.0.20.0 0.0.0.255 any eq domain (842 matches)
<span class="hl">    20 deny ip 10.0.20.0 0.0.0.255 10.0.0.0 0.255.255.255 (57 matches)</span>
    30 permit tcp 10.0.20.0 0.0.0.255 any eq 443 (15230 matches)
    40 permit tcp 10.0.20.0 0.0.0.255 any eq www (611 matches)
    50 deny ip any any log (9 matches)</pre>
<p>Line 5 zaroori hai: DHCP Discover 0.0.0.0 se aata hai, 10.0.20.x se nahi, isliye iske bina guests ko kabhi address nahi milta. Line 20, 30 aur 40 se pehle aati hai taaki guest port 443 par kisi internal web server tak na pahunch sake.</p></div>

<p>Sequence number se editing, phir ek logged drop dekhna:</p>
<pre class="code">R1(config)# ip access-list extended GUEST-IN
R1(config-ext-nacl)# 25 permit icmp 10.0.20.0 0.0.0.255 any echo   <span class="c">! insert between 20 and 30</span>
R1(config-ext-nacl)# no 40                                           <span class="c">! remove plain web</span></pre>
<pre class="out"><span class="hl">%SEC-6-IPACCESSLOGP: list GUEST-IN denied tcp 10.0.20.33(51544) -&gt; 10.0.50.10(445), 1 packet</span></pre>
<p>Router ACL <b>stateless</b> hoti hai: har packet ko akele judge karti hai. <b>Stateful firewall</b> sessions yaad rakhta hai aur replies ko apne aap allow karta hai, isiliye perimeter policy normally firewall par rehti hai jabki ACLs simple segmentation aur device protection sambhalti hain.</p>

<h3>URL filtering aur content filtering</h3>
<table class="cmp"><tr><th>Control</th><th>Kya dekhta hai</th><th>Typical rule</th><th>Kahan chalta hai</th></tr>
<tr><td><b>ACL</b></td><td>IP addresses, protocol, ports (layers 3 aur 4)</td><td>Guests 10.0.0.0/8 tak nahi pahunch sakte</td><td>Routers, switches, firewalls</td></tr>
<tr><td><b>URL filtering</b></td><td>Web address ya domain aur uski category</td><td>Gambling aur known-malware categories block; partner portal allow</td><td>Next-generation firewall, secure web gateway ya proxy, DNS filter</td></tr>
<tr><td><b>Content filtering</b></td><td>Traffic ke andar asal mein kya hai: file types, keywords, malware, sensitive data</td><td>Executable downloads block; attachments scan; card numbers bahar jaane se roko</td><td>NGFW, web aur email gateways</td></tr>
</table>
<p>URL filtering jawab deta hai "yeh user kahan ja raha hai?"; content filtering jawab deta hai "kya le jaaya ja raha hai?". Dono ko HTTPS mein visibility chahiye: URL filters domain ko TLS handshake (SNI) ya DNS se padh sakte hain, jabki poore content filtering ke liye aam taur par <b>TLS inspection</b> chahiye, jismein firewall ek aise certificate se traffic decrypt aur re-encrypt karta hai jis par company ke devices bharosa karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Filtering ki teen layers">
<rect x="10" y="40" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">ACL</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">IPs, protocol, ports</text>
<rect x="225" y="40" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">URL filtering</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">domain aur category</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Content filtering</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">files, keywords, malware</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">har layer usi traffic mein aur gehra dekhti hai</text>
</svg><p class="cap">ACLs lifafa judge karti hain; URL filters pata padhte hain; content filters parcel kholte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Client-facing interface ki inbound ACL mein DHCP (<code>bootps</code>) ya DNS bhool jaana. Specific deny se pehle broad permit rakhna. Source aur destination ports mix karna: users ko web servers tak pahunchane ke liye destination port 443 hai, source nahi. ACL se naam ke basis par website block hone ki ummeed rakhna; woh URL filtering hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Extended ACLs source, destination, protocol aur port match karti hain, aur source ke paas jaati hain. "Social media sites ka access block karo" URL filtering hai; "users ko .exe files download karne se roko" content filtering hai; "router ke liye TCP 23 block karo" ACL hai. ACLs stateless hain; firewalls stateful.</p></div>

<div class="scn"><h4>Bina IP address wale guests</h4><p>Engineer ke nayi inbound guest ACL lagane ke baad har guest phone "No internet" aur 169.254.x.x address dikhane laga. <code>show access-lists</code> mein aakhri <code>deny ip any any log</code> line par matches badh rahe the, aur log keh raha tha <code>denied udp 0.0.0.0(68) -&gt; 255.255.255.255(67)</code>. DHCP Discover messages 0.0.0.0 se aate hain, isliye woh kabhi 10.0.20.0 source lines se match nahi hue. <code>5 permit udp any any eq bootps</code> jodte hi problem theek ho gayi.</p><p><b>Seekh:</b> final deny line par log keyword aapko exactly batata hai ki aapki ACL kya block kar rahi hai.</p></div>

<div class="iv"><p class="q">"Ek ACL likho jo guest VLAN ko sirf web ports par internet tak pahunchne de."</p><p>Guest gateway interface par inbound named extended ACL describe karo: DHCP aur DNS permit, guest se saari private internal ranges deny, kisi bhi destination ke liye TCP 80 aur 443 permit, baaki deny aur log. Samjhao ki deny-internal web permits se pehle kyun aana chahiye aur yeh source ke paas kyun jaati hai. Phir jodo ki firewall par URL aur content filtering policy ko poora karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Extended entries: action, protocol, source, destination, ports, log jaise options.</li>
<li>Named ACLs sequence number se lines insert aur delete karne deti hain.</li>
<li>Extended ACLs ko source ke paas lagao; specific denies broad permits se pehle rakho.</li>
<li>ACLs stateless hain; stateful firewalls sessions track karte hain.</li>
<li>URL filtering domain aur category se destinations control karta hai; content filtering payloads aur files inspect karta hai.</li>
</ul></div>
`}};export{e as default};