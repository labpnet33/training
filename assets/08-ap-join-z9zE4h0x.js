var e={id:`ap-join`,h:{en:`AP join debugging, join statistics and the wl-diag-ap-join lab`,hi:`AP join debugging, join statistics aur wl-diag-ap-join lab`},body:{en:`
<p>Think of a new employee on day one. She must find the office (discovery), show her ID at the gate (security), get her desk assignment (join and configuration) and only then start work (run). If she stands outside, you ask first: did she get the address, can she reach the building, was her ID accepted? An access point does the same with <b>CAPWAP</b>. If no AP joins, nothing in chapters 2 to 7 can work. Wl-ops explained the join in normal operation; here we debug a join that fails.</p>

<h3>The join in four phases</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="AP join phases">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Get IP</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="11">DHCP, link, VLAN</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Discover</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="11">find a controller</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 DTLS and join</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="11">certs, time, MTU</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Config and run</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="11">tags, country, radios</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP control UDP 5246, data UDP 5247</text>
</svg><p class="cap">Each failure belongs to one phase. The first failing phase is the problem to solve.</p></div>

<h3>How an AP finds a controller</h3>
<ol>
<li><b>Static</b>: a controller address stored in the AP (previously joined controllers, or set by hand).</li>
<li><b>DHCP option 43</b>: the DHCP server hands the AP the controller management IP in vendor-specific data.</li>
<li><b>DNS</b>: the AP asks for <code>CISCO-CAPWAP-CONTROLLER.</code> plus its domain (concept only, not simulated in the lab).</li>
<li><b>Broadcast</b> on its own subnet (works only if a controller is in the same VLAN).</li>
</ol>
<p>The option 43 value for a Cisco AP is a TLV: type <code>f1</code>, length <code>04</code> per controller address (four bytes each), then the address in hex. For 10.10.99.10: 10 is 0a, 10 is 0a, 99 is 63, 10 is 0a, so <code>f104.0a0a.630a</code>. A typo such as <code>630b</code> is 10.10.99.11, an address nobody owns.</p>
<div class="eg"><p><b>Worked example.</b> Two controllers 10.10.99.10 and 10.10.99.20: length is 8, so the hex is <code>f108.0a0a.630a.0a0a.6314</code> (20 is 0x14). Count the bytes: 4 per address.</p></div>

<h3>Reading join statistics</h3>
<pre class="out">WLC1# show ap join stats summary
Number of APs: 2
Base MAC        Ethernet MAC    AP Name   IP Address     Status      Last Failure Phase  Last Disconnect Reason
...             ...             AP1       10.10.10.31    Not joined  Discovery           <span class="hl">Controller address unknown</span>
...             ...             AP2       10.10.10.32    Not joined  Discovery           Controller address unknown
WLC1# show ap join stats detailed AP1
Status                           : Not joined (Discovery)
Discovery phase
  - Controller addresses learned : static none; DHCP option 43 10.10.99.11
  - Reason for last unsuccessful discovery attempt : <span class="hl">learned address is not the management address of any controller</span>
Not modelled (concept only): DTLS handshake counters, image download phase, certificate and time checks, DNS discovery ...</pre>
<p>The command names are real; the layout and sentences are model wording. The lab's inspector stops at the <b>first</b> applicable cause, in this order: link down, no IP, no controller address learned, learned address is not any controller's management address (<code>badctrl</code>), controller known but unreachable (<code>unreach</code>), join pending. Joined APs with a country not in the controller's list show radios disabled (country mismatch).</p>
<p>History commands: <code>show wireless stats ap join summary</code> and <code>show wireless stats ap history</code> list join and drop events since the lab clock started. Web UI: <b>Monitoring &gt; Wireless &gt; Access Points</b>; the statistics themselves are CLI.</p>

<h3>Real-world causes outside the lab (concept only)</h3>
<ul>
<li><b>Certificate and time</b>: the AP and controller validate certificates; a wrong clock or an expired certificate fails DTLS. Check <code>show clock</code> and NTP.</li>
<li><b>MTU and fragmentation</b>: CAPWAP adds headers; a path with a small MTU drops the fragments and the join stalls in DTLS or join. Typical cure: allow fragments or tune TCP MSS.</li>
<li><b>Image mismatch</b>: the AP downloads the controller's image, reboots and rejoins.</li>
<li><b>AP authorisation</b>: MAC or certificate authorisation lists can refuse an AP.</li>
<li><b>Country</b>: radios stay disabled when the AP country is not allowed (in the lab).</li>
</ul>
<p>On the AP console, CAPWAP client debugs show these phases; that is concept only in this module.</p>

<h3>Lab walkthrough: wl-diag-ap-join</h3>
<p><b>Ticket.</b> Neither AP1 nor AP2 registers with WLC1, although the controller is configured and its management interface is up. Two faults hide behind one symptom.</p>
<pre class="code">WLC1# show ap join stats summary
WLC1# show ap join stats detailed AP1
WLC1# show wireless management interface</pre>
<p><b>Round 1:</b> the evidence says <code>badctrl</code>: the AP learned 10.10.99.11 by option 43, but the controller's management address is 10.10.99.10. The owner of the value is the DHCP pool on R1.</p>
<pre class="code">R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
AP1# ip dhcp
AP2# ip dhcp</pre>
<p>The AP command <code>ip dhcp</code> makes the AP renew its lease so it receives the corrected option. Read the statistics again.</p>
<p><b>Round 2:</b> the statistics now say <code>unreach</code>: the address is correct but the controller cannot be reached, with evidence lines (management interface state, the trunk allowed list of the controller port, controller ping to its gateway, AP ping to its gateway). The trunk from SW1 to WLC1 allows only VLANs 20 and 40, so management VLAN 99 is pruned.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk allowed vlan add 99</pre>
<p>Use <code>add</code>, never a bare <code>allowed vlan 99</code>, which would replace the list and cut VLANs 20 and 40. Wait about 40 seconds, then <code>show ap join stats summary</code> and <code>show wireless stats ap history</code> show both APs joined by DHCP option 43.</p>

<div class="warn"><p><b>Common mistake.</b> Replacing the trunk list (<code>allowed vlan 99</code>) and breaking every client VLAN. Always <code>add</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option 43 carries the controller <b>management</b> IP, in hex, with the length byte counting four bytes per controller. An AP that gets option 43 but never joins usually has a reachability or certificate problem, not a DHCP problem.</p></div>

<div class="scn"><h4>The pruned trunk</h4><p>After a switch clean-up, all new APs in one building stayed in discovery. DHCP gave correct option 43; the controller answered pings from its own side. A trunk allowed-list change had dropped the management VLAN. One <code>add</code> command fixed it.</p><p><b>Lesson:</b> a correct address is not enough; prove reachability on every hop.</p></div>

<div class="iv"><p class="q">"An AP will not join. Walk me through it."</p><p>I check link, IP address and VLAN, then what controller address the AP learned (option 43, DNS or static). I confirm that address is the controller management IP and is reachable, including the trunk's allowed VLANs. Then certificates, time, MTU and country. I read the join statistics first so I know the phase.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join phases: IP, discover, DTLS and join, config and run.</li>
<li>Option 43 TLV: f1, 04 per controller, then hex address (10.10.99.10 is f104.0a0a.630a).</li>
<li>Join statistics name the first failing cause; fix it and read again for the next.</li>
<li>Certificates, time, MTU and image mismatch are real causes, concept only here.</li>
<li>On a trunk use <code>allowed vlan add</code>, not a replacement.</li>
</ul></div>
`,hi:`
<p>Naye employee ka pehla din socho. Use office dhundhna hai (discovery), gate par ID dikhani hai (security), desk assignment lena hai (join aur configuration) aur tab kaam shuru (run). Agar woh bahar khadi hai to pehle poochte ho: address mila? building tak pahunch sakti hai? ID accept hui? Access point <b>CAPWAP</b> ke saath yahi karta hai. Agar koi AP join nahi karta to chapters 2 se 7 mein kuch kaam nahi karta. Wl-ops ne normal operation mein join samjhaya; yahan hum fail hote join ko debug karte hain.</p>

<h3>Join chaar phases mein</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="AP join phases">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 IP lena</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="11">DHCP, link, VLAN</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Discover</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="11">controller dhundo</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 DTLS aur join</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="11">certs, time, MTU</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Config aur run</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="11">tags, country, radios</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP control UDP 5246, data UDP 5247</text>
</svg><p class="cap">Har failure ek phase ka hota hai. Pehla failing phase hi solve karne wali problem hai.</p></div>

<h3>AP controller kaise dhundta hai</h3>
<ol>
<li><b>Static</b>: AP mein stored controller address (pehle joined controllers, ya haath se set).</li>
<li><b>DHCP option 43</b>: DHCP server vendor-specific data mein AP ko controller management IP deta hai.</li>
<li><b>DNS</b>: AP <code>CISCO-CAPWAP-CONTROLLER.</code> aur apna domain poochta hai (concept only, lab mein simulate nahi).</li>
<li>Apne subnet par <b>broadcast</b> (tabhi chalta hai jab controller usi VLAN mein ho).</li>
</ol>
<p>Cisco AP ke liye option 43 value ek TLV hai: type <code>f1</code>, har controller address ke liye length <code>04</code> (har ek chaar bytes), phir hex mein address. 10.10.99.10 ke liye: 10 matlab 0a, 10 matlab 0a, 99 matlab 63, 10 matlab 0a, to <code>f104.0a0a.630a</code>. <code>630b</code> jaisi typo 10.10.99.11 hai, jo kisi ka address nahi.</p>
<div class="eg"><p><b>Worked example.</b> Do controllers 10.10.99.10 aur 10.10.99.20: length 8 hai, hex <code>f108.0a0a.630a.0a0a.6314</code> (20 matlab 0x14). Bytes gino: har address ke 4.</p></div>

<h3>Join statistics padhna</h3>
<pre class="out">WLC1# show ap join stats summary
Number of APs: 2
Base MAC        Ethernet MAC    AP Name   IP Address     Status      Last Failure Phase  Last Disconnect Reason
...             ...             AP1       10.10.10.31    Not joined  Discovery           <span class="hl">Controller address unknown</span>
...             ...             AP2       10.10.10.32    Not joined  Discovery           Controller address unknown
WLC1# show ap join stats detailed AP1
Status                           : Not joined (Discovery)
Discovery phase
  - Controller addresses learned : static none; DHCP option 43 10.10.99.11
  - Reason for last unsuccessful discovery attempt : <span class="hl">learned address is not the management address of any controller</span>
Not modelled (concept only): DTLS handshake counters, image download phase, certificate and time checks, DNS discovery ...</pre>
<p>Command naam real hain; layout aur sentences model wording hain. Lab ka inspector <b>pehle</b> lagu hone wale cause par ruk jata hai, is order mein: link down, no IP, controller address learned nahi, learned address kisi controller ka management address nahi (<code>badctrl</code>), controller known lekin unreachable (<code>unreach</code>), join pending. Jo AP joined hai lekin country controller ki list mein nahi, uske radios disabled dikhte hain (country mismatch).</p>
<p>History commands: <code>show wireless stats ap join summary</code> aur <code>show wireless stats ap history</code> lab clock shuru hone ke baad ke join aur drop events dikhate hain. Web UI: <b>Monitoring &gt; Wireless &gt; Access Points</b>; statistics khud CLI hain.</p>

<h3>Lab ke bahar ke real causes (concept only)</h3>
<ul>
<li><b>Certificate aur time</b>: AP aur controller certificates validate karte hain; galat clock ya expired certificate DTLS fail karta hai. <code>show clock</code> aur NTP dekho.</li>
<li><b>MTU aur fragmentation</b>: CAPWAP headers jodta hai; chhote MTU wala path fragments drop karta hai aur join DTLS ya join mein atak jata hai. Aam ilaaj: fragments allow karo ya TCP MSS tune karo.</li>
<li><b>Image mismatch</b>: AP controller ki image download karta hai, reboot hota hai aur rejoin.</li>
<li><b>AP authorisation</b>: MAC ya certificate authorisation lists AP ko mana kar sakti hain.</li>
<li><b>Country</b>: AP country allowed na ho to radios disabled rehte hain (lab mein).</li>
</ul>
<p>AP console par CAPWAP client debugs yeh phases dikhate hain; is module mein yeh concept only hai.</p>

<h3>Lab walkthrough: wl-diag-ap-join</h3>
<p><b>Ticket.</b> Na AP1 na AP2 WLC1 se register hota hai, jabki controller configured hai aur uska management interface up hai. Ek symptom ke peeche do faults chhupe hain.</p>
<pre class="code">WLC1# show ap join stats summary
WLC1# show ap join stats detailed AP1
WLC1# show wireless management interface</pre>
<p><b>Round 1:</b> evidence <code>badctrl</code> kehta hai: AP ne option 43 se 10.10.99.11 seekha, jabki controller ka management address 10.10.99.10 hai. Value ka owner R1 ka DHCP pool hai.</p>
<pre class="code">R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
AP1# ip dhcp
AP2# ip dhcp</pre>
<p>AP command <code>ip dhcp</code> AP ko lease renew karwata hai taaki use corrected option mile. Statistics dubara padho.</p>
<p><b>Round 2:</b> statistics ab <code>unreach</code> kehte hain: address sahi hai lekin controller reach nahi hota, evidence lines ke saath (management interface state, controller port ki trunk allowed list, controller ka apne gateway ko ping, AP ka apne gateway ko ping). SW1 se WLC1 ka trunk sirf VLAN 20 aur 40 allow karta hai, isliye management VLAN 99 prune ho gaya.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk allowed vlan add 99</pre>
<p><code>add</code> use karo, kabhi akela <code>allowed vlan 99</code> nahi, kyunki woh list replace karke VLAN 20 aur 40 kaat deta hai. Lagbhag 40 second wait karo, phir <code>show ap join stats summary</code> aur <code>show wireless stats ap history</code> dono APs ko DHCP option 43 se joined dikhate hain.</p>

<div class="warn"><p><b>Common mistake.</b> Trunk list replace karna (<code>allowed vlan 99</code>) aur har client VLAN tod dena. Hamesha <code>add</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option 43 controller ka <b>management</b> IP hex mein carry karta hai, length byte har controller ke chaar bytes ginta hai. Jo AP option 43 pata hai lekin kabhi join nahi karta uski problem aam taur par reachability ya certificate hoti hai, DHCP nahi.</p></div>

<div class="scn"><h4>Prune hua trunk</h4><p>Switch clean-up ke baad ek building ke saare naye APs discovery mein atke rahe. DHCP sahi option 43 de raha tha; controller apni taraf se pings ka jawab de raha tha. Trunk allowed-list change ne management VLAN gira diya tha. Ek <code>add</code> command ne fix kiya.</p><p><b>Lesson:</b> sahi address kaafi nahi; har hop par reachability prove karo.</p></div>

<div class="iv"><p class="q">"AP join nahi ho raha. Mujhe walk karke batao."</p><p>Link, IP address aur VLAN check karta hoon, phir AP ne kaunsa controller address seekha (option 43, DNS ya static). Confirm karta hoon ki woh address controller management IP hai aur reachable hai, trunk ki allowed VLANs samet. Phir certificates, time, MTU aur country. Pehle join statistics padhta hoon taaki phase pata ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join phases: IP, discover, DTLS aur join, config aur run.</li>
<li>Option 43 TLV: f1, har controller ke liye 04, phir hex address (10.10.99.10 matlab f104.0a0a.630a).</li>
<li>Join statistics pehla failing cause batate hain; fix karo aur agle ke liye dubara padho.</li>
<li>Certificates, time, MTU aur image mismatch real causes hain, yahan concept only.</li>
<li>Trunk par <code>allowed vlan add</code> use karo, replacement nahi.</li>
</ul></div>
`}};export{e as default};