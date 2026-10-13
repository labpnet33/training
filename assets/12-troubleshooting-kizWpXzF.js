var e={id:`troubleshooting`,h:{en:`Troubleshooting IPv4 addressing: a workflow that always works`,hi:`IPv4 addressing troubleshooting: ek workflow jo hamesha kaam karta hai`},body:{en:`
<p>A good doctor does not guess. She asks where it hurts, checks pulse, temperature and blood pressure in the same order every time, and only then orders a scan. Addressing faults deserve the same discipline, because they produce confusing symptoms: some hosts work and others do not, pings work one way but not back, or everything worked until "a small change last night". This chapter gives you a fixed workflow, a catalogue of the classic faults, and a full walk-through of the troubleshooting lab.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the symptom exactly.</b> Which source, which destination, what fails? One host or many? Local destinations or only remote ones? Did anything change?</li>
<li><b>Read the host's four parameters</b>: address, mask, gateway, DNS (chapter 11 commands). Is the address in the right subnet? Is the gateway inside the host's own block?</li>
<li><b>Compare with the router interface</b>: <code>show ip interface</code> or the running config. Host and router must agree on the subnet, which means the <b>same mask</b>.</li>
<li><b>Check the router's routes</b>: <code>show ip route connected</code> for the local subnet, and the <b>return path</b>. Many addressing faults break only the replies.</li>
<li><b>Test in steps</b>: ping the host's own address, then the gateway, then a remote router, then the destination. The first failing hop tells you where to look.</li>
<li><b>Look for duplicates and overlaps</b>: <code>show ip arp</code>, duplicate-address log messages, and the address plan.</li>
<li><b>Fix one thing, then verify from both ends.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv4 troubleshooting flow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. define symptom</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. host: IP, mask, GW</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. router interface</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="100" width="180" height="44" rx="8" fill="#fde68a"/><text x="530" y="127" text-anchor="middle" class="svg-ink" font-size="13">4. routes and return</text>
<line x1="530" y1="64" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="100" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">5. ping hop by hop</text>
<line x1="440" y1="122" x2="410" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="180" height="44" rx="8" fill="#fed7aa"/><text x="110" y="127" text-anchor="middle" class="svg-ink" font-size="13">6. duplicates, overlaps</text>
<line x1="230" y1="122" x2="200" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="180" width="320" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">7. fix one thing, verify both ends</text>
<line x1="110" y1="144" x2="200" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The same seven steps for every addressing ticket, in the same order.</p></div>

<h3>The classic faults and their fingerprints</h3>
<table class="cmp"><tr><th>Fault</th><th>Typical symptom</th><th>How to confirm</th></tr>
<tr><td>Host mask too short (e.g. /23 instead of /24)</td><td>Host cannot reach some remote hosts that it wrongly thinks are local</td><td>Compare host mask with router interface</td></tr>
<tr><td>Host mask too long</td><td>Host cannot reach some local neighbours; sends them to the gateway</td><td>Same comparison</td></tr>
<tr><td>Router mask wrong</td><td>Only some hosts in the LAN work (the ones inside the router's smaller subnet)</td><td><code>show ip interface</code>, connected route</td></tr>
<tr><td>Wrong gateway</td><td>Local works, remote fails for one host</td><td>Gateway outside the subnet, or not the router's address</td></tr>
<tr><td>Duplicate address</td><td>Intermittent loss, "(Duplicate)" on Windows, log messages</td><td><code>show ip arp</code>, DUPADDR log</td></tr>
<tr><td>Overlapping subnets</td><td>Traffic for part of a subnet goes to the wrong site</td><td>Compare routing tables and the address plan</td></tr>
<tr><td>169.254.x.x on the host</td><td>No DHCP lease</td><td>DHCP server or relay (later module)</td></tr></table>

<h3>Walk-through: the troubleshooting lab</h3>
<p><b>Ticket.</b> The office LAN is 10.20.30.0/26. PC1 (10.20.30.10) reaches the server 172.16.1.10; PC2 (10.20.30.50) does not, though its settings look correct. Someone re-addressed R1 last night.</p>
<p><b>Step 1 and 2.</b> One host fails, one works, same switch, same VLAN. PC2 has 10.20.30.50/26, gateway 10.20.30.1: the gateway is inside .0 to .63, so the host is fine. PC1 has the same mask and gateway.</p>
<p><b>Step 3.</b> <code>show ip interface brief</code> on R1 looks perfect (right address, up/up), which is why the fault survived the night. The mask tells the truth:</p>
<pre class="out">R1# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
<span class="hl">  Internet address is 10.20.30.1/28</span></pre>
<p>/28 = block 16. R1 believes its LAN is 10.20.30.0 to 10.20.30.15, broadcast <b>10.20.30.15</b> (the first answer the lab asks for).</p>
<p><b>Step 4.</b> The routing table shows why only PC2 fails:</p>
<pre class="out">R1# show ip route
Gateway of last resort is 10.0.0.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.0.2
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
L        10.0.0.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.20.30.0/28 is directly connected, GigabitEthernet0/1</span>
L        10.20.30.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>PC1 at .10 is inside the /28, so replies to it are delivered on Gi0/1. PC2 at .50 is outside the /28, so R1's only match is the <b>default route</b>: replies to PC2, including replies to pings of the gateway, are sent back towards R2 instead of onto the LAN. PC2's packets get out; the answers never come home.</p>
<p><b>Step 5 and fix.</b> The intended /26 has 2<sup>6</sup> − 2 = <b>62</b> usable hosts (the lab's second question). Re-enter the address with the right mask; it replaces the old one:</p>
<pre class="code">R1# configure terminal
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.20.30.1 255.255.255.192
R1(config-if)# end</pre>
<p><b>Verify both ends.</b> <code>show ip route connected</code> now shows <code>C 10.20.30.0/26</code>; ping 172.16.1.10 from PC2 and from PC1. Both succeed.</p>

<div class="eg"><p><b>Worked example: wrong gateway.</b> A host has 192.168.50.140/26 with gateway 192.168.50.1. Block 64: the host lives in .128 to .191, the gateway in .0 to .63. The host cannot ARP for a gateway outside its subnet (Windows even warns that the gateway is not on the same network segment). Correct gateway: 192.168.50.129, R2's LAN-B address.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping at <code>show ip interface brief</code>. Testing only one direction: a successful outbound packet says nothing about the return path. Changing several things at once, so that nobody knows which change fixed it.</p></div>

<div class="exam"><p><b>Exam trap.</b> When some hosts in a LAN work and others do not, suspect a mask mismatch between router and hosts. When one host fails and its neighbours work, suspect that host's own settings: gateway, mask or duplicate address.</p></div>

<div class="scn"><h4>The printer that stole the gateway's address</h4><p>Users on a floor reported the internet "dropping every few minutes". The router log showed <code>%IP-4-DUPADDR: Duplicate address 10.20.30.1 on GigabitEthernet0/1, sourced by 5254.00ab.cdef</code>. A new printer had been configured statically with the gateway address. Hosts that ARPed at the wrong moment cached the printer's MAC for the gateway. <code>show ip arp</code> and the switch MAC table led to the printer's port; it was re-addressed to a reserved range.</p><p><b>Lesson:</b> intermittent loss plus duplicate-address messages means two devices share one IP. Reserve gateway and infrastructure addresses in the plan.</p></div>

<div class="iv"><p class="q">"A user can reach local servers but nothing in other subnets. Walk me through it."</p><p>Strong answer: follow the workflow. Check the host's address, mask and gateway; confirm the gateway lies in the host's block and matches the router interface; ping the gateway; check the router's interface mask with <code>show ip interface</code> and its connected and return routes; look for duplicates. Name the likely causes in order: wrong or missing gateway, wrong mask, gateway interface down, then a routing problem beyond the gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the same seven steps every time: symptom, host, router interface, routes, pings, duplicates, fix and verify.</li>
<li>Host and router must agree on the mask; <code>show ip interface brief</code> will not show a mismatch.</li>
<li>"Some hosts work" usually means a router mask problem; "one host fails" usually means that host's settings.</li>
<li>Many addressing faults break only the return path; always verify both directions.</li>
<li>Duplicate addresses cause intermittent loss; look for DUPADDR logs and "(Duplicate)".</li>
</ul></div>
`,hi:`
<p>Achhi doctor andaza nahi lagati. Woh poochti hai dard kahan hai, har baar same order mein pulse, temperature aur blood pressure check karti hai, aur tabhi scan ke liye bolti hai. Addressing faults ko bhi yahi discipline chahiye, kyunki woh confusing symptoms dete hain: kuch hosts chalte hain aur kuch nahi, pings ek taraf jaate hain par wapas nahi aate, ya sab kuch "kal raat ke chhote se change" tak theek chal raha tha. Yeh chapter aapko ek fixed workflow, classic faults ki list, aur troubleshooting lab ka poora walk-through deta hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Symptom ko exactly define karo.</b> Kaunsa source, kaunsa destination, kya fail hota hai? Ek host ya kai? Local destinations ya sirf remote? Kya kuch badla?</li>
<li><b>Host ke chaar parameters padho</b>: address, mask, gateway, DNS (chapter 11 ke commands). Kya address sahi subnet mein hai? Kya gateway host ke apne block ke andar hai?</li>
<li><b>Router interface se compare karo</b>: <code>show ip interface</code> ya running config. Host aur router ko subnet par agree karna chahiye, matlab <b>same mask</b>.</li>
<li><b>Router ke routes check karo</b>: local subnet ke liye <code>show ip route connected</code>, aur <b>return path</b>. Kai addressing faults sirf replies todte hain.</li>
<li><b>Steps mein test karo</b>: host ka apna address ping karo, phir gateway, phir remote router, phir destination. Pehla fail hone wala hop batata hai kahan dekhna hai.</li>
<li><b>Duplicates aur overlaps dhoondo</b>: <code>show ip arp</code>, duplicate-address log messages, aur address plan.</li>
<li><b>Ek cheez fix karo, phir dono ends se verify karo.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv4 troubleshooting flow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. symptom define</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. host: IP, mask, GW</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. router interface</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="100" width="180" height="44" rx="8" fill="#fde68a"/><text x="530" y="127" text-anchor="middle" class="svg-ink" font-size="13">4. routes aur return</text>
<line x1="530" y1="64" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="100" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">5. hop by hop ping</text>
<line x1="440" y1="122" x2="410" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="180" height="44" rx="8" fill="#fed7aa"/><text x="110" y="127" text-anchor="middle" class="svg-ink" font-size="13">6. duplicates, overlaps</text>
<line x1="230" y1="122" x2="200" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="180" width="320" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">7. ek fix, dono ends verify</text>
<line x1="110" y1="144" x2="200" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har addressing ticket ke liye same saat steps, same order mein.</p></div>

<h3>Classic faults aur unke fingerprints</h3>
<table class="cmp"><tr><th>Fault</th><th>Typical symptom</th><th>Confirm kaise karein</th></tr>
<tr><td>Host mask bahut chhota (jaise /24 ki jagah /23)</td><td>Host kuch remote hosts tak nahi pahunchta jinhe woh galti se local samajhta hai</td><td>Host mask ko router interface se compare karo</td></tr>
<tr><td>Host mask bahut lamba</td><td>Host kuch local padosiyon tak nahi pahunchta; unhe gateway ko bhejta hai</td><td>Wahi comparison</td></tr>
<tr><td>Router mask galat</td><td>LAN ke sirf kuch hosts chalte hain (jo router ke chhote subnet ke andar hain)</td><td><code>show ip interface</code>, connected route</td></tr>
<tr><td>Galat gateway</td><td>Ek host ke liye local chalta hai, remote fail</td><td>Gateway subnet ke bahar, ya router ka address nahi</td></tr>
<tr><td>Duplicate address</td><td>Beech beech mein loss, Windows par "(Duplicate)", log messages</td><td><code>show ip arp</code>, DUPADDR log</td></tr>
<tr><td>Overlapping subnets</td><td>Subnet ke ek hisse ka traffic galat site jaata hai</td><td>Routing tables aur address plan compare karo</td></tr>
<tr><td>Host par 169.254.x.x</td><td>DHCP lease nahi mili</td><td>DHCP server ya relay (baad ka module)</td></tr></table>

<h3>Walk-through: troubleshooting lab</h3>
<p><b>Ticket.</b> Office LAN 10.20.30.0/26 hai. PC1 (10.20.30.10) server 172.16.1.10 tak pahunchta hai; PC2 (10.20.30.50) nahi, jabki uski settings sahi lagti hain. Kal raat kisi ne R1 ko re-address kiya.</p>
<p><b>Step 1 aur 2.</b> Ek host fail, ek chalta hai, same switch, same VLAN. PC2 ke paas 10.20.30.50/26, gateway 10.20.30.1 hai: gateway .0 se .63 ke andar hai, to host theek hai. PC1 ka mask aur gateway bhi same hai.</p>
<p><b>Step 3.</b> R1 par <code>show ip interface brief</code> perfect dikhta hai (sahi address, up/up), isiliye fault raat bhar bacha raha. Mask sach batata hai:</p>
<pre class="out">R1# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
<span class="hl">  Internet address is 10.20.30.1/28</span></pre>
<p>/28 = block 16. R1 maanta hai uska LAN 10.20.30.0 se 10.20.30.15 hai, broadcast <b>10.20.30.15</b> (lab ka pehla answer).</p>
<p><b>Step 4.</b> Routing table dikhati hai ki sirf PC2 kyun fail hota hai:</p>
<pre class="out">R1# show ip route
Gateway of last resort is 10.0.0.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.0.2
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
L        10.0.0.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.20.30.0/28 is directly connected, GigabitEthernet0/1</span>
L        10.20.30.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>.10 wala PC1 /28 ke andar hai, isliye use replies Gi0/1 par deliver hote hain. .50 wala PC2 /28 ke bahar hai, isliye R1 ka akela match <b>default route</b> hai: PC2 ke replies, gateway ke pings ke replies bhi, LAN par jaane ki jagah wapas R2 ki taraf bhej diye jaate hain. PC2 ke packets bahar jaate hain; jawab kabhi ghar nahi aate.</p>
<p><b>Step 5 aur fix.</b> Sahi /26 mein 2<sup>6</sup> − 2 = <b>62</b> usable hosts hain (lab ka doosra sawaal). Sahi mask ke saath address dobara do; yeh purane ko replace karta hai:</p>
<pre class="code">R1# configure terminal
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip address 10.20.30.1 255.255.255.192
R1(config-if)# end</pre>
<p><b>Dono ends verify karo.</b> <code>show ip route connected</code> ab <code>C 10.20.30.0/26</code> dikhata hai; PC2 aur PC1 dono se 172.16.1.10 ping karo. Dono succeed karte hain.</p>

<div class="eg"><p><b>Worked example: galat gateway.</b> Ek host ke paas 192.168.50.140/26 hai gateway 192.168.50.1 ke saath. Block 64: host .128 se .191 mein rehta hai, gateway .0 se .63 mein. Host apne subnet ke bahar wale gateway ke liye ARP nahi kar sakta (Windows warning bhi deta hai ki gateway same network segment par nahi hai). Sahi gateway: 192.168.50.129, R2 ka LAN-B address.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>show ip interface brief</code> par ruk jaana. Sirf ek direction test karna: successful outbound packet return path ke baare mein kuch nahi batata. Ek saath kai cheezein badalna, jisse kisi ko pata nahi chalta kaunse change ne fix kiya.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab LAN ke kuch hosts chalte hain aur kuch nahi, router aur hosts ke beech mask mismatch par shak karo. Jab ek host fail hota hai aur uske padosi chalte hain, us host ki apni settings par shak karo: gateway, mask ya duplicate address.</p></div>

<div class="scn"><h4>Woh printer jisne gateway ka address chura liya</h4><p>Ek floor ke users ne report kiya ki internet "har kuch minute mein drop" ho raha hai. Router log ne dikhaya <code>%IP-4-DUPADDR: Duplicate address 10.20.30.1 on GigabitEthernet0/1, sourced by 5254.00ab.cdef</code>. Ek naye printer ko statically gateway address ke saath configure kar diya gaya tha. Jin hosts ne galat waqt par ARP kiya, unhone gateway ke liye printer ka MAC cache kar liya. <code>show ip arp</code> aur switch MAC table printer ke port tak le gaye; use ek reserved range mein re-address kiya gaya.</p><p><b>Seekh:</b> beech beech ka loss plus duplicate-address messages matlab do devices ek IP share kar rahe hain. Plan mein gateway aur infrastructure addresses reserve karo.</p></div>

<div class="iv"><p class="q">"User local servers tak pahunch pata hai par doosre subnets mein kuch nahi. Mujhe step by step samjhao."</p><p>Strong answer: workflow follow karo. Host ka address, mask aur gateway check karo; confirm karo ki gateway host ke block mein hai aur router interface se match karta hai; gateway ping karo; <code>show ip interface</code> se router ke interface ka mask aur uske connected aur return routes check karo; duplicates dhoondo. Likely causes order mein batao: galat ya missing gateway, galat mask, gateway interface down, phir gateway ke aage routing problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har baar same saat steps: symptom, host, router interface, routes, pings, duplicates, fix aur verify.</li>
<li>Host aur router ko mask par agree karna chahiye; <code>show ip interface brief</code> mismatch nahi dikhayega.</li>
<li>"Kuch hosts chalte hain" aam taur par router mask problem hai; "ek host fail" aam taur par us host ki settings.</li>
<li>Kai addressing faults sirf return path todte hain; hamesha dono directions verify karo.</li>
<li>Duplicate addresses beech beech ka loss karte hain; DUPADDR logs aur "(Duplicate)" dhoondo.</li>
</ul></div>
`}};export{e as default};