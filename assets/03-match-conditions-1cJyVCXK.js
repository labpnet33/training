var e={id:`match-conditions`,h:{en:`Match conditions: addresses, protocols, ports and flags`,hi:`Match conditions: addresses, protocols, ports aur flags`},body:{en:`
<p>A term can only block what it can describe. The <code>from</code> statement describes the packet. This chapter lists the match conditions you need for JNCIA-Junos and the lab, with the exact names Junos uses.</p>

<h3>Analogy: a wanted poster</h3>
<p>A poster describes a person by height, hair, coat and last seen place. The more fields you fill in, the narrower the match, because all details must fit. A filter term works the same way: each condition you add makes the match more specific.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Packet header fields used for matching">
<rect x="20" y="30" width="600" height="60" rx="8" fill="#e2e8f0"/>
<rect x="30" y="40" width="130" height="40" rx="6" fill="#bae6fd"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">source-address</text>
<rect x="170" y="40" width="130" height="40" rx="6" fill="#bae6fd"/><text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="12">destination-address</text>
<rect x="310" y="40" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="355" y="65" text-anchor="middle" class="svg-ink" font-size="12">protocol</text>
<rect x="410" y="40" width="95" height="40" rx="6" fill="#fde68a"/><text x="457" y="65" text-anchor="middle" class="svg-ink" font-size="12">source-port</text>
<rect x="515" y="40" width="95" height="40" rx="6" fill="#fde68a"/><text x="562" y="58" text-anchor="middle" class="svg-ink" font-size="11">destination-</text><text x="562" y="72" text-anchor="middle" class="svg-ink" font-size="11">port</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">plus: icmp-type, tcp-flags, tcp-established, fragment, prefix-lists</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">All conditions in a term must be true (AND)</text>
</svg><p class="cap">Each field of the IP, TCP, UDP or ICMP header can be a match condition.</p></div>

<h3>Address matches</h3>
<table class="cmp"><tr><th>Statement</th><th>Meaning</th></tr>
<tr><td><code>source-address 10.10.10.0/24</code></td><td>Packet sent from that network</td></tr>
<tr><td><code>destination-address 10.40.9.10/32</code></td><td>Packet sent to that host</td></tr>
<tr><td><code>address 192.0.2.0/24</code></td><td>Either source or destination matches</td></tr>
<tr><td><code>source-prefix-list MGMT</code></td><td>Source is in a named prefix-list (defined under policy-options)</td></tr>
<tr><td><code>source-address 10.9.0.0/16 except</code></td><td>Matches everything except that prefix</td></tr></table>
<p>A host is written as <code>/32</code>. The simulator and real Junos accept a bare address as /32, but writing <code>/32</code> makes the intent clear.</p>

<h3>Protocol and port matches</h3>
<pre class="code">from {
    protocol tcp;
    destination-port ssh;           <i>name or number (22)</i>
    source-port 1024-65535;         <i>range</i>
    port bgp;                       <i>source OR destination 179</i>
}</pre>
<p><code>protocol</code> accepts names (<code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>ospf</code>, <code>gre</code>) or numbers. Port names such as <code>ssh</code>, <code>telnet</code>, <code>h&#116;tp</code>, <code>h&#116;tps</code>, <code>domain</code>, <code>bgp</code>, <code>tftp</code>, <code>snmp</code> and <code>ntp</code> are valid. Ports only make sense after you set <code>protocol tcp</code> or <code>protocol udp</code>. Junos usually adds the right protocol for you, but writing it explicitly is clearer.</p>

<h3>ICMP and TCP details</h3>
<table class="cmp"><tr><th>Statement</th><th>Use</th></tr>
<tr><td><code>icmp-type echo-request</code></td><td>Match ping requests only</td></tr>
<tr><td><code>icmp-type [ echo-request echo-reply ]</code></td><td>A list means OR</td></tr>
<tr><td><code>tcp-established</code></td><td>Packets of an existing TCP connection (ACK or RST set), the stateless way to allow replies</td></tr>
<tr><td><code>tcp-initial</code></td><td>The first packet of a connection (SYN without ACK)</td></tr>
<tr><td><code>fragment</code></td><td>Fragmented packets after the first one</td></tr></table>
<p>Because filters are stateless, a reply cannot be recognised by session. <code>tcp-established</code> is the trick: accept traffic to your servers' ports, and accept replies from the outside using <code>tcp-established</code> in the opposite direction.</p>

<div class="eg"><p><b>Worked example.</b> Allow only SSH to the router from the NOC, and only from the NOC:</p>
<pre class="code">set firewall family inet filter PROTECT-RE term SSH-NOC from source-address 10.10.10.0/24
set firewall family inet filter PROTECT-RE term SSH-NOC from protocol tcp
set firewall family inet filter PROTECT-RE term SSH-NOC from destination-port ssh
set firewall family inet filter PROTECT-RE term SSH-NOC then accept</pre>
<p>All three conditions are ANDed: source in 10.10.10.0/24, protocol tcp, destination port 22. A user at 10.20.20.50 fails the first. The NOC host at 10.10.10.10 trying telnet fails the third. Only the NOC host using SSH passes.</p></div>

<h3>OR with lists, AND with separate lines</h3>
<pre class="code"><span class="c">! OR: either port</span>
set ... from destination-port [ 80 443 ]
<span class="c">! AND: protocol and port together</span>
set ... from protocol tcp
set ... from destination-port 443
<span class="c">! two terms are needed for different sources with different ports</span></pre>
<p>If you need "TCP 22 from net A, or TCP 443 from net B", you cannot put both in one term, because the conditions would be ANDed across them. Use two terms.</p>

<h3>Routing protocols are matched by protocol</h3>
<p>OSPF is its own IP protocol (number 89), not TCP or UDP. Use <code>protocol ospf</code>. BGP uses TCP port 179. LDP, RSVP and others have their own names or ports. This matters in the protect-the-RE lab: <code>term OSPF from protocol ospf then accept</code> is what keeps the adjacency alive.</p>

<div class="warn"><p><b>Common mistake.</b> Writing <code>destination-port ssh</code> and forgetting <code>protocol tcp</code>, or placing a port match on a term that also tries to match ICMP. Ports belong to TCP and UDP only. A term mixing <code>protocol icmp</code> and <code>destination-port 22</code> can never match anything.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember that multiple values in one statement (a list in square brackets) are an OR, while multiple different statements in one from block are an AND.</p></div>

<div class="scn"><h4>The rule that could never match</h4><p>A new engineer wanted to log ping and SSH attempts to a router in one term. He wrote <code>protocol icmp</code> and <code>destination-port ssh</code> together, and the log stayed empty for a week. His senior explained that no packet is both ICMP and a TCP port 22 at the same time. They split it into two terms, one per protocol, each with its own <code>then log</code>. Logs filled immediately and showed repeated SSH attempts from a user subnet.</p><p><b>Lesson:</b> conditions in one term are ANDed. Use separate terms for alternatives of different kinds.</p></div>

<div class="iv"><p class="q">"How do you allow reply traffic with a stateless filter?"</p><p>Strong answer: either write a term in the return direction that accepts expected source ports, or for TCP use tcp-established, which matches packets with ACK or RST set. It is not a session table, only a flag test, so UDP replies have to be allowed by source port and address. This is why stateless filters need more explicit rules than a stateful firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Common matches: source-address, destination-address, address, protocol, source-port, destination-port, port, icmp-type, tcp-established.</li>
<li>Lists in brackets are OR; different statements in one from are AND.</li>
<li>Ports only apply with protocol tcp or udp; OSPF matches by protocol ospf.</li>
<li>Prefix-lists can be reused with source-prefix-list and destination-prefix-list.</li>
<li>tcp-established is the stateless way to recognise TCP replies.</li>
</ul></div>
`,hi:`
<p>Term sirf wahi block kar sakta hai jo woh describe kar sake. <code>from</code> statement packet ko describe karta hai. Yeh chapter woh match conditions batata hai jo JNCIA-Junos aur lab ke liye chahiye, Junos ke exact naamon ke saath.</p>

<h3>Analogy: wanted poster</h3>
<p>Poster kisi vyakti ko height, baal, coat aur last seen jagah se describe karta hai. Jitne zyada fields bharoge, match utna narrow hoga, kyunki saari details fit honi chahiye. Filter term bhi aise hi kaam karta hai: har condition jo aap jodte ho match ko aur specific bana deti hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Packet header fields used for matching">
<rect x="20" y="30" width="600" height="60" rx="8" fill="#e2e8f0"/>
<rect x="30" y="40" width="130" height="40" rx="6" fill="#bae6fd"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">source-address</text>
<rect x="170" y="40" width="130" height="40" rx="6" fill="#bae6fd"/><text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="12">destination-address</text>
<rect x="310" y="40" width="90" height="40" rx="6" fill="#ddd6fe"/><text x="355" y="65" text-anchor="middle" class="svg-ink" font-size="12">protocol</text>
<rect x="410" y="40" width="95" height="40" rx="6" fill="#fde68a"/><text x="457" y="65" text-anchor="middle" class="svg-ink" font-size="12">source-port</text>
<rect x="515" y="40" width="95" height="40" rx="6" fill="#fde68a"/><text x="562" y="58" text-anchor="middle" class="svg-ink" font-size="11">destination-</text><text x="562" y="72" text-anchor="middle" class="svg-ink" font-size="11">port</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">aur: icmp-type, tcp-flags, tcp-established, fragment, prefix-lists</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Term ki saari conditions true honi chahiye (AND)</text>
</svg><p class="cap">IP, TCP, UDP ya ICMP header ka har field match condition ban sakta hai.</p></div>

<h3>Address matches</h3>
<table class="cmp"><tr><th>Statement</th><th>Matlab</th></tr>
<tr><td><code>source-address 10.10.10.0/24</code></td><td>Us network se bheja gaya packet</td></tr>
<tr><td><code>destination-address 10.40.9.10/32</code></td><td>Us host ko bheja gaya packet</td></tr>
<tr><td><code>address 192.0.2.0/24</code></td><td>Source ya destination, koi bhi match</td></tr>
<tr><td><code>source-prefix-list MGMT</code></td><td>Source naam wali prefix-list mein hai (policy-options ke neeche define)</td></tr>
<tr><td><code>source-address 10.9.0.0/16 except</code></td><td>Us prefix ke alawa sab match</td></tr></table>
<p>Host ko <code>/32</code> likhte hain. Simulator aur asli Junos bare address ko /32 maante hain, lekin <code>/32</code> likhne se intent saaf rehta hai.</p>

<h3>Protocol aur port matches</h3>
<pre class="code">from {
    protocol tcp;
    destination-port ssh;           <i>naam ya number (22)</i>
    source-port 1024-65535;         <i>range</i>
    port bgp;                       <i>source YA destination 179</i>
}</pre>
<p><code>protocol</code> naam (<code>tcp</code>, <code>udp</code>, <code>icmp</code>, <code>ospf</code>, <code>gre</code>) ya number leta hai. <code>ssh</code>, <code>telnet</code>, <code>h&#116;tp</code>, <code>h&#116;tps</code>, <code>domain</code>, <code>bgp</code>, <code>tftp</code>, <code>snmp</code> aur <code>ntp</code> jaise port names valid hain. Ports tabhi sense banate hain jab <code>protocol tcp</code> ya <code>protocol udp</code> set ho. Junos aksar sahi protocol khud jod deta hai, lekin explicit likhna zyada saaf hai.</p>

<h3>ICMP aur TCP details</h3>
<table class="cmp"><tr><th>Statement</th><th>Use</th></tr>
<tr><td><code>icmp-type echo-request</code></td><td>Sirf ping requests match</td></tr>
<tr><td><code>icmp-type [ echo-request echo-reply ]</code></td><td>List matlab OR</td></tr>
<tr><td><code>tcp-established</code></td><td>Maujooda TCP connection ke packets (ACK ya RST set), replies allow karne ka stateless tareeka</td></tr>
<tr><td><code>tcp-initial</code></td><td>Connection ka pehla packet (SYN bina ACK)</td></tr>
<tr><td><code>fragment</code></td><td>Pehle ke baad ke fragmented packets</td></tr></table>
<p>Filters stateless hain, isliye reply ko session se pehchana nahi ja sakta. <code>tcp-established</code> trick hai: apne servers ke ports ka traffic accept karo, aur bahar se replies ko ulti direction mein <code>tcp-established</code> se accept karo.</p>

<div class="eg"><p><b>Worked example.</b> Router tak SSH sirf NOC se allow karo, aur sirf NOC se:</p>
<pre class="code">set firewall family inet filter PROTECT-RE term SSH-NOC from source-address 10.10.10.0/24
set firewall family inet filter PROTECT-RE term SSH-NOC from protocol tcp
set firewall family inet filter PROTECT-RE term SSH-NOC from destination-port ssh
set firewall family inet filter PROTECT-RE term SSH-NOC then accept</pre>
<p>Teeno conditions AND hain: source 10.10.10.0/24 mein, protocol tcp, destination port 22. 10.20.20.50 ka user pehli condition mein fail hota hai. NOC host 10.10.10.10 telnet try kare to teesri mein fail. Sirf SSH use karne wala NOC host guzarta hai.</p></div>

<h3>Lists se OR, alag lines se AND</h3>
<pre class="code"><span class="c">! OR: dono mein se koi port</span>
set ... from destination-port [ 80 443 ]
<span class="c">! AND: protocol aur port saath mein</span>
set ... from protocol tcp
set ... from destination-port 443
<span class="c">! alag sources aur alag ports ke liye do terms chahiye</span></pre>
<p>Agar aapko "net A se TCP 22, ya net B se TCP 443" chahiye to dono ek term mein nahi daal sakte, kyunki conditions inke across AND ho jaati. Do terms use karo.</p>

<h3>Routing protocols protocol se match hote hain</h3>
<p>OSPF apna IP protocol (number 89) hai, TCP ya UDP nahi. <code>protocol ospf</code> use karo. BGP TCP port 179 use karta hai. LDP, RSVP aur doosron ke apne naam ya ports hain. Protect-the-RE lab mein yeh important hai: <code>term OSPF from protocol ospf then accept</code> adjacency ko zinda rakhta hai.</p>

<div class="warn"><p><b>Common mistake.</b> <code>destination-port ssh</code> likhna aur <code>protocol tcp</code> bhool jaana, ya ICMP match karne wale term mein port match daalna. Ports sirf TCP aur UDP ke hain. <code>protocol icmp</code> aur <code>destination-port 22</code> mila hua term kabhi kuch match nahi kar sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki ek statement mein kai values (square brackets ki list) OR hoti hain, jabki ek from block mein kai alag statements AND hote hain.</p></div>

<div class="scn"><h4>Woh rule jo kabhi match nahi kar sakta tha</h4><p>Ek naye engineer ko ek term mein router par ping aur SSH attempts log karne the. Usne <code>protocol icmp</code> aur <code>destination-port ssh</code> saath likhe, aur ek hafte tak log khaali raha. Uske senior ne samjhaya ki koi packet ek saath ICMP aur TCP port 22 nahi ho sakta. Unhone use do terms mein baanta, har protocol ke liye ek, har ek ke apne <code>then log</code> ke saath. Logs turant bharne lage aur user subnet se baar-baar SSH attempts dikhe.</p><p><b>Lesson:</b> ek term ki conditions AND hoti hain. Alag kisam ke alternatives ke liye alag terms use karo.</p></div>

<div class="iv"><p class="q">"Stateless filter se reply traffic kaise allow karte ho?"</p><p>Strong answer: ya to return direction mein term likho jo expected source ports accept kare, ya TCP ke liye tcp-established use karo, jo ACK ya RST set wale packets match karta hai. Yeh session table nahi, sirf flag test hai, isliye UDP replies ko source port aur address se allow karna padta hai. Isi wajah se stateless filters ko stateful firewall se zyada explicit rules chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Common matches: source-address, destination-address, address, protocol, source-port, destination-port, port, icmp-type, tcp-established.</li>
<li>Brackets ki lists OR hain; ek from mein alag statements AND hain.</li>
<li>Ports sirf protocol tcp ya udp ke saath; OSPF protocol ospf se match hota hai.</li>
<li>Prefix-lists source-prefix-list aur destination-prefix-list se reuse ho sakti hain.</li>
<li>tcp-established TCP replies pehchanne ka stateless tareeka hai.</li>
</ul></div>
`}};export{e as default};