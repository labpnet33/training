var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: dead ports, wrong leases, lost gateways`,hi:`Troubleshooting workflow: dead ports, galat leases, gayab gateways`},body:{en:`
<p>A good doctor does not start with surgery. They ask where it hurts, check the vital signs, then order the one test that confirms the diagnosis. Layer 2 security problems deserve the same discipline, because every feature in this module fails in a recognisable way: it <b>drops</b> something, and it usually <b>tells you</b> in a log or a counter. Your job is to find which feature dropped what, and why.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Scope the symptom.</b> One user or a whole VLAN? No link at all, no IP address, or an IP address but no gateway? Wrong address from a strange range?</li>
<li><b>Check the port.</b> <code>show interfaces status</code>: is it connected, notconnect or err-disabled, and in which VLAN?</li>
<li><b>If err-disabled, read the reason.</b> <code>show interfaces status err-disabled</code> names the feature: psecure-violation, bpduguard, dhcp-rate-limit, arp-inspection, storm-control.</li>
<li><b>Ask the feature.</b> Port security: <code>show port-security interface</code>. DHCP: <code>show ip dhcp snooping</code> and <code>binding</code>. ARP: <code>show ip arp inspection interfaces</code>, <code>statistics</code>, <code>show ip source binding</code>. Plus the syslog.</li>
<li><b>Fix the cause, recover, verify from the host.</b> Never just bounce the port or trust it to make the ticket go away.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layer 2 security troubleshooting flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Symptom and scope</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="75" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">show interfaces status</text>
<line x1="260" y1="115" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="530" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="150" width="200" height="44" rx="8" fill="#fed7aa"/><text x="110" y="170" text-anchor="middle" class="svg-ink" font-size="12">err-disabled</text><text x="110" y="187" text-anchor="middle" class="svg-muted" font-size="12">read the reason</text>
<rect x="220" y="150" width="200" height="44" rx="8" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">up, no / wrong IP</text><text x="320" y="187" text-anchor="middle" class="svg-muted" font-size="12">DHCP snooping</text>
<rect x="430" y="150" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="530" y="170" text-anchor="middle" class="svg-ink" font-size="12">IP OK, no gateway</text><text x="530" y="187" text-anchor="middle" class="svg-muted" font-size="12">DAI / IPSG</text>
<rect x="170" y="210" width="300" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Fix cause, recover, test from host</text>
</svg><p class="cap">The port state and the symptom point you to the feature; the feature's show command gives the proof.</p></div>

<h3>Symptom map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>First command</th></tr>
<tr><td>Link down, amber LED</td><td>err-disabled (port security, BPDU Guard, rate limit)</td><td><code>show interfaces status err-disabled</code></td></tr>
<tr><td>Link up, some devices on the port work, one does not</td><td>Port security restrict/protect, maximum reached</td><td><code>show port-security interface</code></td></tr>
<tr><td>Address from an unknown range</td><td>Rogue DHCP server; snooping off or port trusted</td><td><code>show ip dhcp snooping</code></td></tr>
<tr><td>169.254.x.x after enabling snooping</td><td>Uplink not trusted, or option 82 with giaddr 0</td><td><code>show ip dhcp snooping</code>, router debug</td></tr>
<tr><td>Correct IP, cannot reach gateway</td><td>DAI: no binding for static host, gateway port untrusted</td><td><code>show ip arp inspection statistics</code></td></tr>
<tr><td>Everything fine until a switch reload</td><td>Binding table lost (no snooping database)</td><td><code>show ip dhcp snooping binding</code></td></tr>
</table>

<h3>Walkthrough 1: "The reception PC is dead"</h3>
<pre class="out">SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1     RECEPTION          err-disabled psecure-violation</span>
SW1# show port-security interface g0/1
Port Status                : Secure-shutdown
Maximum MAC Addresses      : 1
Sticky MAC Addresses       : 1
<span class="hl">Last Source Address:Vlan   : 0bad.0bad.0001:1</span>
Security Violation Count   : 1</pre>
<p>Diagnosis: the sticky MAC is 0050.7966.0a01, but 0bad.0bad.0001 appeared. Ask what changed: a new NIC, a docking station, a MAC-randomising setting, or an unauthorised device. Fix the cause (in the lab, <code>set mac 0050.7966.0a01</code> on PC1), then recover with shutdown / no shutdown, or wait for <code>errdisable recovery cause psecure-violation</code>. If the new device is legitimate, clear the old sticky entry and let the port learn again, then save.</p>

<h3>Walkthrough 2: "Users get 172.31.66.x and no internet"</h3>
<p>The range is not yours, so a rogue server answers. Trace it: <code>show mac address-table</code> for the server MAC seen in the client's DHCP details led to Gi0/5 (meeting room). Enable snooping for VLAN 10, trust only Gi0/0. If PC1 now gets <b>nothing</b>, check two things in <code>show ip dhcp snooping</code>: is Gi0/0 trusted, and is option 82 insertion enabled?</p>
<pre class="out">SW1# show ip dhcp snooping
<span class="hl">Insertion of option 82 is enabled</span>
GigabitEthernet0/0         yes        yes             unlimited
R1# debug ip dhcp server packet
<span class="hl">DHCPD: relay information option exists, but giaddr is zero.</span></pre>
<p>Fix: <code>no ip dhcp snooping information option</code> on SW1. PC1 renews, gets 10.10.10.100, and <code>show ip dhcp snooping binding</code> shows it on Gi0/1 in VLAN 10.</p>

<h3>Walkthrough 3: "Finance PCs lost their gateway after the security change"</h3>
<pre class="out">SW1# show ip arp inspection statistics vlan 30
 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
<span class="hl">   30              0             42             42              0</span>
%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/1, vlan 30.([0050.7966.1e01/10.30.0.11/0000.0000.0000/10.30.0.1/...])
SW1# show ip source binding
Total number of bindings: 0</pre>
<p>Diagnosis: DAI is dropping PC1's own ARP because the static-IP host has no binding. Fix: add <code>ip source binding</code> entries for PC1 and PC2, and confirm <code>ip arp inspection trust</code> on Gi0/0 towards R1. Never "fix" it by trusting Gi0/1: that would let MALLORY-style attacks through on that port.</p>

<div class="eg"><p><b>Worked example.</b> Ticket at 09:05: "floor 3 has no internet". Scope: every user in VLAN 20, all with valid 10.20.x addresses. Port states: all connected. So not err-disabled and not DHCP. Symptom "IP OK, no gateway" points to DAI. <code>show ip arp inspection interfaces</code> shows the uplink Gi0/48 as Untrusted after last night's change. One command, <code>ip arp inspection trust</code> on Gi0/48, restores the floor. Total time: under five minutes, because the workflow skipped everything the evidence ruled out.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Bouncing err-disabled ports without reading the reason. (2) Trusting access ports or disabling a feature to close a ticket. (3) Forgetting the order of dependencies: DAI and IPSG failures often start with a missing snooping binding. (4) Not checking the other end: native VLAN, trust and option 82 issues often live on the neighbour switch or router.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam scenarios give you output and ask for the fix. Look for the key line: <code>Secure-shutdown</code> or <code>psecure-violation</code> (port security), <code>Trusted no</code> on an uplink (snooping), <code>Insertion of option 82 is enabled</code> with an IOS server (option 82), <code>DHCP Drops</code> rising with static hosts (DAI bindings). The wrong answers usually "fix" by turning the security off.</p></div>

<div class="scn"><h4>The Monday uplink</h4><p>A retail head office lost DHCP on one floor every Monday morning. Port states showed the access switch uplink err-disabled with reason <code>dhcp-rate-limit</code>. A junior engineer had copied the access-port template, including <code>ip dhcp snooping limit rate 15</code>, onto the uplink trunk. On Mondays, 300 laptops renewed at once, the uplink exceeded 15 pps and went down, taking the floor with it. Removing the limit from the trusted uplink fixed it permanently.</p><p><b>Lesson:</b> the reason column told the whole story; templates for edge ports do not belong on uplinks.</p></div>

<div class="iv"><p class="q">"Users in one VLAN have valid IP addresses but cannot reach the gateway after a security change. How do you troubleshoot?"</p><p>Strong answer: valid IPs mean DHCP works, so suspect DAI or IP Source Guard. Check <code>show ip arp inspection interfaces</code> for an untrusted uplink or router port, <code>show ip arp inspection statistics</code> for rising drops, the SW_DAI syslog for which sender was denied, and <code>show ip source binding</code> for missing static hosts. Fix with trust on infrastructure ports and bindings or ARP ACLs for static hosts, never by trusting user ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope, port state, err-disable reason, feature show command, then fix, recover and verify from the host.</li>
<li>Link down points to err-disabled; wrong or no IP points to DHCP snooping; IP OK but no gateway points to DAI.</li>
<li>After enabling snooping, check uplink trust and option 82 before anything else.</li>
<li>Static-IP hosts under DAI need bindings or ARP ACLs; trusting user ports is never the fix.</li>
<li>Logs and counters (PSECURE_VIOLATION, ERR_DISABLE, DHCP_SNOOPING, SW_DAI) are your evidence.</li>
</ul></div>
`,hi:`
<p>Achha doctor surgery se shuru nahi karta. Woh poochta hai kahan dard hai, vital signs check karta hai, phir woh ek test karwata hai jo diagnosis confirm kare. Layer 2 security problems ko bhi wahi discipline chahiye, kyunki is module ka har feature pehchaanne laayak tareeke se fail hota hai: woh kuch <b>drop</b> karta hai, aur aam taur par log ya counter mein <b>bata deta</b> hai. Aapka kaam yeh dhoondhna hai ki kis feature ne kya drop kiya, aur kyun.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Symptom ka scope samjho.</b> Ek user ya poora VLAN? Link hi nahi, IP address nahi, ya IP address hai par gateway nahi? Ajeeb range se galat address?</li>
<li><b>Port check karo.</b> <code>show interfaces status</code>: connected hai, notconnect ya err-disabled, aur kis VLAN mein?</li>
<li><b>Err-disabled hai to reason padho.</b> <code>show interfaces status err-disabled</code> feature ka naam batata hai: psecure-violation, bpduguard, dhcp-rate-limit, arp-inspection, storm-control.</li>
<li><b>Feature se poochho.</b> Port security: <code>show port-security interface</code>. DHCP: <code>show ip dhcp snooping</code> aur <code>binding</code>. ARP: <code>show ip arp inspection interfaces</code>, <code>statistics</code>, <code>show ip source binding</code>. Plus syslog.</li>
<li><b>Cause fix karo, recover karo, host se verify karo.</b> Ticket band karne ke liye kabhi bas port bounce ya trust mat karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layer 2 security troubleshooting flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Symptom aur scope</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="75" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">show interfaces status</text>
<line x1="260" y1="115" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="530" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="150" width="200" height="44" rx="8" fill="#fed7aa"/><text x="110" y="170" text-anchor="middle" class="svg-ink" font-size="12">err-disabled</text><text x="110" y="187" text-anchor="middle" class="svg-muted" font-size="12">reason padho</text>
<rect x="220" y="150" width="200" height="44" rx="8" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">up, IP nahi / galat</text><text x="320" y="187" text-anchor="middle" class="svg-muted" font-size="12">DHCP snooping</text>
<rect x="430" y="150" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="530" y="170" text-anchor="middle" class="svg-ink" font-size="12">IP OK, gateway nahi</text><text x="530" y="187" text-anchor="middle" class="svg-muted" font-size="12">DAI / IPSG</text>
<rect x="170" y="210" width="300" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Cause fix, recover, host se test</text>
</svg><p class="cap">Port state aur symptom aapko feature tak le jaate hain; feature ki show command saboot deti hai.</p></div>

<h3>Symptom map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Pehli command</th></tr>
<tr><td>Link down, amber LED</td><td>err-disabled (port security, BPDU Guard, rate limit)</td><td><code>show interfaces status err-disabled</code></td></tr>
<tr><td>Link up, port par kuch devices chalte hain, ek nahi</td><td>Port security restrict/protect, maximum poora</td><td><code>show port-security interface</code></td></tr>
<tr><td>Unknown range se address</td><td>Rogue DHCP server; snooping off ya port trusted</td><td><code>show ip dhcp snooping</code></td></tr>
<tr><td>Snooping enable karne ke baad 169.254.x.x</td><td>Uplink trusted nahi, ya giaddr 0 ke saath option 82</td><td><code>show ip dhcp snooping</code>, router debug</td></tr>
<tr><td>Sahi IP, gateway tak nahi pahunchta</td><td>DAI: static host ki binding nahi, gateway port untrusted</td><td><code>show ip arp inspection statistics</code></td></tr>
<tr><td>Switch reload tak sab theek</td><td>Binding table kho gayi (snooping database nahi)</td><td><code>show ip dhcp snooping binding</code></td></tr>
</table>

<h3>Walkthrough 1: "Reception PC dead hai"</h3>
<pre class="out">SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1     RECEPTION          err-disabled psecure-violation</span>
SW1# show port-security interface g0/1
Port Status                : Secure-shutdown
Maximum MAC Addresses      : 1
Sticky MAC Addresses       : 1
<span class="hl">Last Source Address:Vlan   : 0bad.0bad.0001:1</span>
Security Violation Count   : 1</pre>
<p>Diagnosis: sticky MAC 0050.7966.0a01 hai, lekin 0bad.0bad.0001 aaya. Poochho kya badla: naya NIC, docking station, MAC-randomising setting, ya koi unauthorised device. Cause fix karo (lab mein PC1 par <code>set mac 0050.7966.0a01</code>), phir shutdown / no shutdown se recover karo, ya <code>errdisable recovery cause psecure-violation</code> ka intezaar karo. Agar naya device legitimate hai, purani sticky entry clear karo aur port ko dobara seekhne do, phir save karo.</p>

<h3>Walkthrough 2: "Users ko 172.31.66.x mil raha hai aur internet nahi"</h3>
<p>Range aapki nahi hai, isliye koi rogue server jawab de raha hai. Trace karo: client ki DHCP details mein dikhe server MAC ke liye <code>show mac address-table</code> ne Gi0/5 (meeting room) tak pahunchaya. VLAN 10 ke liye snooping enable karo, sirf Gi0/0 trust karo. Agar ab PC1 ko <b>kuch nahi</b> milta, to <code>show ip dhcp snooping</code> mein do cheezein check karo: kya Gi0/0 trusted hai, aur kya option 82 insertion enabled hai?</p>
<pre class="out">SW1# show ip dhcp snooping
<span class="hl">Insertion of option 82 is enabled</span>
GigabitEthernet0/0         yes        yes             unlimited
R1# debug ip dhcp server packet
<span class="hl">DHCPD: relay information option exists, but giaddr is zero.</span></pre>
<p>Fix: SW1 par <code>no ip dhcp snooping information option</code>. PC1 renew karta hai, 10.10.10.100 leta hai, aur <code>show ip dhcp snooping binding</code> use VLAN 10 mein Gi0/1 par dikhata hai.</p>

<h3>Walkthrough 3: "Security change ke baad finance PCs ka gateway chala gaya"</h3>
<pre class="out">SW1# show ip arp inspection statistics vlan 30
 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
<span class="hl">   30              0             42             42              0</span>
%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/1, vlan 30.([0050.7966.1e01/10.30.0.11/0000.0000.0000/10.30.0.1/...])
SW1# show ip source binding
Total number of bindings: 0</pre>
<p>Diagnosis: DAI PC1 ka apna ARP drop kar raha hai kyunki static-IP host ki koi binding nahi hai. Fix: PC1 aur PC2 ke liye <code>ip source binding</code> entries jodo, aur R1 ki taraf Gi0/0 par <code>ip arp inspection trust</code> confirm karo. Isse Gi0/1 trust karke kabhi "fix" mat karo: isse us port par MALLORY jaise attacks nikal jaate.</p>

<div class="eg"><p><b>Worked example.</b> 09:05 par ticket: "floor 3 par internet nahi". Scope: VLAN 20 ka har user, sabke paas valid 10.20.x addresses. Port states: sab connected. Yaani err-disabled nahi aur DHCP nahi. Symptom "IP OK, gateway nahi" DAI ki taraf ishaara karta hai. <code>show ip arp inspection interfaces</code> kal raat ke change ke baad uplink Gi0/48 ko Untrusted dikhata hai. Ek command, Gi0/48 par <code>ip arp inspection trust</code>, floor wapas le aati hai. Kul time: paanch minute se kam, kyunki workflow ne woh sab skip kiya jo evidence ne rule out kar diya tha.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Reason padhe bina err-disabled ports bounce karna. (2) Ticket band karne ke liye access ports trust karna ya feature band karna. (3) Dependencies ka order bhool jaana: DAI aur IPSG failures aksar missing snooping binding se shuru hote hain. (4) Doosra end check na karna: native VLAN, trust aur option 82 issues aksar neighbour switch ya router par hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam scenarios output dete hain aur fix poochte hain. Key line dhoondho: <code>Secure-shutdown</code> ya <code>psecure-violation</code> (port security), uplink par <code>Trusted no</code> (snooping), IOS server ke saath <code>Insertion of option 82 is enabled</code> (option 82), static hosts ke saath badhte <code>DHCP Drops</code> (DAI bindings). Galat answers aam taur par security band karke "fix" karte hain.</p></div>

<div class="scn"><h4>Monday wala uplink</h4><p>Ek retail head office mein har Monday subah ek floor ka DHCP chala jaata tha. Port states ne access switch uplink ko reason <code>dhcp-rate-limit</code> ke saath err-disabled dikhaya. Ek junior engineer ne access-port template, <code>ip dhcp snooping limit rate 15</code> samet, uplink trunk par copy kar diya tha. Mondays ko 300 laptops ek saath renew karte, uplink 15 pps exceed karta aur down ho jaata, saath mein floor ko le kar. Trusted uplink se limit hatane se yeh hamesha ke liye theek ho gaya.</p><p><b>Seekh:</b> reason column ne poori kahani bata di; edge ports ke templates uplinks par nahi lagte.</p></div>

<div class="iv"><p class="q">"Security change ke baad ek VLAN ke users ke paas valid IP addresses hain lekin gateway tak nahi pahunch pa rahe. Aap kaise troubleshoot karoge?"</p><p>Strong answer: valid IPs matlab DHCP chal raha hai, isliye DAI ya IP Source Guard par shak karo. Untrusted uplink ya router port ke liye <code>show ip arp inspection interfaces</code>, badhte drops ke liye <code>show ip arp inspection statistics</code>, kaunsa sender deny hua uske liye SW_DAI syslog, aur missing static hosts ke liye <code>show ip source binding</code> check karo. Infrastructure ports par trust aur static hosts ke liye bindings ya ARP ACLs se fix karo, user ports trust karke kabhi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope, port state, err-disable reason, feature ki show command, phir fix, recover aur host se verify.</li>
<li>Link down err-disabled ki taraf; galat ya koi IP nahi DHCP snooping ki taraf; IP OK par gateway nahi DAI ki taraf ishaara karta hai.</li>
<li>Snooping enable karne ke baad sabse pehle uplink trust aur option 82 check karo.</li>
<li>DAI ke neeche static-IP hosts ko bindings ya ARP ACLs chahiye; user ports trust karna kabhi fix nahi hai.</li>
<li>Logs aur counters (PSECURE_VIOLATION, ERR_DISABLE, DHCP_SNOOPING, SW_DAI) aapka saboot hain.</li>
</ul></div>
`}};export{e as default};