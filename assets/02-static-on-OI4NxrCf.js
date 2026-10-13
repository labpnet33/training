var e={id:`static-on`,h:{en:`Static EtherChannel: mode on`,hi:`Static EtherChannel: mode on`},body:{en:`
<p>Two friends agree last week to meet at the station at 6 pm. Nobody calls to confirm on the day; each simply turns up. If both remember, it works perfectly. If one forgets, the other waits on the platform with no idea anything is wrong. <b>Static EtherChannel</b> (mode <code>on</code>) works the same way: both switches are told "these ports are a bundle" and neither checks with the other.</p>

<h3>What mode on does</h3>
<p>With <code>channel-group N mode on</code> the switch bundles the ports <b>unconditionally</b>. It sends no LACP or PAgP packets and listens for none. As soon as a member's link is up and its configuration is compatible, the switch starts forwarding over it as part of Port-channel N. That makes static mode:</p>
<ul>
<li><b>Simple</b>: no protocol, no timers, nothing to negotiate.</li>
<li><b>Fast</b>: the bundle is up the moment the links are up.</li>
<li><b>Blind</b>: the switch cannot tell whether the other end is also bundled, whether the cables go to the right switch, or whether the far end is even configured yet.</li>
</ul>
<p>Static <code>on</code> only works with <code>on</code> on the other side. It never forms a channel with active, passive, desirable or auto, because those modes wait for protocol packets that an <code>on</code> port never sends.</p>

<h3>Lab walkthrough: bundle SW1 and SW2</h3>
<p>This is the first lab of the module. A call centre has two switches joined by Gi0/1 and Gi0/2. VLAN 10 (VOICE-AGENTS) and VLAN 20 (SUPERVISORS) exist on both. PC1 (172.20.10.11) and PC3 (172.20.20.11) hang off SW1; PC2 (172.20.10.12) and PC4 (172.20.20.12) hang off SW2. Today STP blocks one of the two cables.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Static EtherChannel lab topology">
<rect x="120" y="30" width="130" height="44" rx="8" fill="#bae6fd"/><text x="185" y="57" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="390" y="30" width="130" height="44" rx="8" fill="#bae6fd"/><text x="455" y="57" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<line x1="250" y1="44" x2="390" y2="44" stroke="#64748b" stroke-width="3"/><line x1="250" y1="62" x2="390" y2="62" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="53" rx="30" ry="18" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">Po1 mode on: Gi0/1, Gi0/2</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">trunk, allowed VLAN 10,20</text>
<rect x="60" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="115" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text><text x="115" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.10.11</text>
<rect x="190" y="180" width="110" height="44" rx="8" fill="#fde68a"/><text x="245" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC3 VLAN 20</text><text x="245" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.20.11</text>
<rect x="340" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="395" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 10</text><text x="395" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.10.12</text>
<rect x="470" y="180" width="110" height="44" rx="8" fill="#fde68a"/><text x="525" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC4 VLAN 20</text><text x="525" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.20.12</text>
<line x1="160" y1="74" x2="115" y2="180" stroke="#64748b"/><line x1="200" y1="74" x2="245" y2="180" stroke="#64748b"/>
<line x1="440" y1="74" x2="395" y2="180" stroke="#64748b"/><line x1="480" y1="74" x2="525" y2="180" stroke="#64748b"/>
</svg><p class="cap">Lab 1: two call-centre switches, two cables bundled into Po1 with mode on, carrying VLANs 10 and 20.</p></div>

<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 1 mode on
Creating a port-channel interface Port-channel 1
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
SW1(config-if)# end
<span class="c">! Repeat the same four lines on SW2. mode on only works when BOTH ends are on.</span></pre>
<p>Notice three things. First, <code>channel-group 1</code> <b>creates</b> Port-channel1 for you if it does not exist. Second, the trunk settings go on the <b>port-channel</b>, and the switch copies them to Gi0/1 and Gi0/2. Third, the channel-group number is local: SW1's Po1 could connect to SW2's Po7, although using the same number on both sides makes life easier for whoever troubleshoots it later.</p>

<h3>Verification</h3>
<pre class="out">SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)          -        Gi0/1(P)    Gi0/2(P)</span></pre>
<p>Read it left to right: group 1, Port-channel1 with flags <b>S</b> (Layer 2) and <b>U</b> (in use), the Protocol column shows a dash because <b>no protocol</b> is running, and both members are <b>P</b> (bundled in the port-channel). Then test: PC1 pings PC2 over VLAN 10, and PC3 pings PC4 over VLAN 20. If one VLAN fails, compare <code>show interfaces trunk</code> on both switches; the trunk is listed as <code>Po1</code>, not as its members.</p>
<p>A note on the lab engine: until SW2 is configured, the lab shows SW1's members as <b>(s)</b> suspended, which is a safe way to flag a half-built bundle. A real Catalyst is more dangerous: mode <code>on</code> bundles straight away, the far switch treats its two ports as separate links, and you can get a loop for a moment. That is exactly why the next feature exists.</p>

<h3>The safety net: EtherChannel misconfiguration guard</h3>
<p>Catalyst switches run <code>spanning-tree etherchannel guard misconfig</code>, enabled by default. If a switch has ports bundled with <code>on</code> but the neighbour is sending BPDUs on those ports as if they were separate links, the guard detects the inconsistency and <b>err-disables</b> the channel with reason <code>channel-misconfig</code>. You lose the link, but you do not lose the network to a loop. Chapter 10 shows how to recover.</p>

<div class="eg"><p><b>Worked example: where mode on is still used.</b> A VMware ESXi host on a <b>standard</b> vSwitch with the teaming policy "Route based on IP hash" does not speak LACP. The switch ports facing that host must be a static channel: <code>channel-group 20 mode on</code>, with a load-balance method that includes IP addresses. LACP towards VMware needs a distributed switch. This is the classic real-world reason to still know mode on.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring mode on first on one switch and leaving for lunch before configuring the other. For that window one side forwards on a bundle and the other on separate ports. Either configure both sides with the member ports shut down, or use LACP, which waits for the partner.</p></div>

<div class="exam"><p><b>Exam trap.</b> "on" is not a negotiation mode, and it is not "LACP on". The Protocol column shows <code>-</code>, and <code>on</code> with <code>active</code> does <b>not</b> form a channel even though both sound willing.</p></div>

<div class="scn"><h4>The bundle that came up too early</h4><p>During a night change at a logistics firm, an engineer configured <code>channel-group 3 mode on</code> on the core switch, then was called away before touching the access switch. Within seconds the core logged <code>%SPANTREE-2-CHNL_MISCFG</code> and err-disabled Po3; the warehouse lost connectivity until morning. The next night the team configured both switches with the members shut, then enabled them together, and later migrated to LACP.</p><p><b>Lesson:</b> mode on does not wait for the other side. Stage it carefully, or prefer LACP.</p></div>

<div class="iv"><p class="q">"When would you use a static EtherChannel instead of LACP?"</p><p>Strong answer: only when the far device cannot run LACP, for example a hypervisor standard vSwitch using IP hash or an old appliance. Explain the risk: mode on does no partner check, so mis-cabling or a half-done change can cause loops or black holes; the EtherChannel guard err-disables the channel as a safety net. Otherwise LACP active is the default choice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>channel-group N mode on</code> bundles unconditionally; no packets are exchanged.</li>
<li>on only forms a channel with on; it never works with LACP or PAgP modes.</li>
<li>The channel-group command creates Port-channel N; configure trunks and VLANs on the Po.</li>
<li><code>show etherchannel summary</code> shows Protocol <code>-</code> for a static bundle; healthy is Po1(SU) with members (P).</li>
<li>The EtherChannel misconfig guard err-disables a one-sided on bundle to prevent loops.</li>
</ul></div>
`,hi:`
<p>Do dost pichhle hafte tay karte hain ki shaam 6 baje station par milenge. Us din koi confirm karne ke liye phone nahi karta; dono bas pahunch jaate hain. Dono ko yaad raha to sab perfect. Ek bhool gaya to doosra platform par intezaar karta rehta hai aur use pata hi nahi chalta ki kuch galat hai. <b>Static EtherChannel</b> (mode <code>on</code>) bhi aise hi kaam karta hai: dono switches ko bata diya jaata hai "yeh ports ek bundle hain" aur koi bhi doosre se check nahi karta.</p>

<h3>Mode on kya karta hai</h3>
<p><code>channel-group N mode on</code> ke saath switch ports ko <b>bina kisi shart</b> bundle kar deta hai. Woh koi LACP ya PAgP packet nahi bhejta aur na kisi ka intezaar karta hai. Jaise hi member ka link up hota hai aur uska configuration compatible hota hai, switch us par Port-channel N ke hisse ke roop mein forward karna shuru kar deta hai. Isliye static mode:</p>
<ul>
<li><b>Simple</b> hai: koi protocol nahi, koi timers nahi, negotiate karne ko kuch nahi.</li>
<li><b>Fast</b> hai: links up hote hi bundle up.</li>
<li><b>Andha</b> hai: switch nahi bata sakta ki doosra end bhi bundled hai ya nahi, cables sahi switch par jaate hain ya nahi, ya doosra end abhi configure bhi hua hai ya nahi.</li>
</ul>
<p>Static <code>on</code> sirf doosri side ke <code>on</code> ke saath chalta hai. Yeh active, passive, desirable ya auto ke saath kabhi channel nahi banata, kyunki woh modes protocol packets ka intezaar karte hain jo <code>on</code> port kabhi bhejta hi nahi.</p>

<h3>Lab walkthrough: SW1 aur SW2 ko bundle karo</h3>
<p>Yeh module ka pehla lab hai. Ek call centre ke do switches Gi0/1 aur Gi0/2 se jude hain. VLAN 10 (VOICE-AGENTS) aur VLAN 20 (SUPERVISORS) dono par hain. PC1 (172.20.10.11) aur PC3 (172.20.20.11) SW1 par hain; PC2 (172.20.10.12) aur PC4 (172.20.20.12) SW2 par. Aaj STP do mein se ek cable block kar raha hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Static EtherChannel lab topology">
<rect x="120" y="30" width="130" height="44" rx="8" fill="#bae6fd"/><text x="185" y="57" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="390" y="30" width="130" height="44" rx="8" fill="#bae6fd"/><text x="455" y="57" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<line x1="250" y1="44" x2="390" y2="44" stroke="#64748b" stroke-width="3"/><line x1="250" y1="62" x2="390" y2="62" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="53" rx="30" ry="18" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">Po1 mode on: Gi0/1, Gi0/2</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">trunk, allowed VLAN 10,20</text>
<rect x="60" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="115" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text><text x="115" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.10.11</text>
<rect x="190" y="180" width="110" height="44" rx="8" fill="#fde68a"/><text x="245" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC3 VLAN 20</text><text x="245" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.20.11</text>
<rect x="340" y="180" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="395" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 10</text><text x="395" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.10.12</text>
<rect x="470" y="180" width="110" height="44" rx="8" fill="#fde68a"/><text x="525" y="200" text-anchor="middle" class="svg-ink" font-size="13">PC4 VLAN 20</text><text x="525" y="216" text-anchor="middle" class="svg-muted" font-size="12">172.20.20.12</text>
<line x1="160" y1="74" x2="115" y2="180" stroke="#64748b"/><line x1="200" y1="74" x2="245" y2="180" stroke="#64748b"/>
<line x1="440" y1="74" x2="395" y2="180" stroke="#64748b"/><line x1="480" y1="74" x2="525" y2="180" stroke="#64748b"/>
</svg><p class="cap">Lab 1: call centre ke do switches, do cables mode on ke saath Po1 mein bundled, VLAN 10 aur 20 le jaate hue.</p></div>

<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 1 mode on
Creating a port-channel interface Port-channel 1
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
SW1(config-if)# end
<span class="c">! SW2 par yahi chaar lines repeat karo. mode on tabhi chalta hai jab DONO ends on hon.</span></pre>
<p>Teen cheezein note karo. Pehli, <code>channel-group 1</code> Port-channel1 ko aapke liye <b>bana deta hai</b> agar woh exist nahi karta. Doosri, trunk settings <b>port-channel</b> par jaati hain, aur switch unhe Gi0/1 aur Gi0/2 par copy kar deta hai. Teesri, channel-group number local hai: SW1 ka Po1 SW2 ke Po7 se jud sakta hai, lekin dono sides par same number use karne se baad mein troubleshoot karne wale ki zindagi aasaan hoti hai.</p>

<h3>Verification</h3>
<pre class="out">SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)          -        Gi0/1(P)    Gi0/2(P)</span></pre>
<p>Left se right padho: group 1, Port-channel1 flags <b>S</b> (Layer 2) aur <b>U</b> (in use) ke saath, Protocol column mein dash hai kyunki <b>koi protocol</b> nahi chal raha, aur dono members <b>P</b> (port-channel mein bundled) hain. Phir test karo: PC1 VLAN 10 par PC2 ko ping kare, aur PC3 VLAN 20 par PC4 ko. Agar ek VLAN fail ho, to dono switches par <code>show interfaces trunk</code> compare karo; trunk <code>Po1</code> ke naam se dikhta hai, members ke naam se nahi.</p>
<p>Lab engine par ek note: jab tak SW2 configure nahi hota, lab SW1 ke members ko <b>(s)</b> suspended dikhata hai, jo aadhe bane bundle ko flag karne ka safe tarika hai. Asli Catalyst zyada khatarnak hai: mode <code>on</code> turant bundle kar deta hai, doosra switch apne do ports ko alag links maanta hai, aur thodi der ke liye loop ban sakta hai. Isi wajah se agla feature exist karta hai.</p>

<h3>Safety net: EtherChannel misconfiguration guard</h3>
<p>Catalyst switches <code>spanning-tree etherchannel guard misconfig</code> chalate hain, jo default mein enabled hai. Agar switch ke ports <code>on</code> se bundled hain lekin neighbour un ports par aise BPDUs bhej raha hai jaise woh alag links hon, to guard inconsistency pakad leta hai aur channel ko reason <code>channel-misconfig</code> ke saath <b>err-disable</b> kar deta hai. Aap link kho dete ho, lekin loop ki wajah se poora network nahi khote. Chapter 10 dikhata hai ki recover kaise karein.</p>

<div class="eg"><p><b>Worked example: mode on aaj bhi kahan use hota hai.</b> <b>Standard</b> vSwitch par VMware ESXi host jiski teaming policy "Route based on IP hash" hai, LACP nahi bolta. Us host ki taraf ke switch ports static channel hone chahiye: <code>channel-group 20 mode on</code>, aur aisa load-balance method jisme IP addresses shamil hon. VMware ki taraf LACP ke liye distributed switch chahiye. Mode on jaanne ki yeh classic real-world wajah hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek switch par pehle mode on configure karna aur doosre ko configure karne se pehle lunch par chale jaana. Us window mein ek side bundle par forward karti hai aur doosri alag ports par. Ya to dono sides ko member ports shut karke configure karo, ya LACP use karo, jo partner ka intezaar karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "on" koi negotiation mode nahi hai, aur yeh "LACP on" bhi nahi hai. Protocol column <code>-</code> dikhata hai, aur <code>on</code> ke saath <code>active</code> channel <b>nahi</b> banata, bhale hi dono raazi lagte hon.</p></div>

<div class="scn"><h4>Bundle jo bahut jaldi up ho gaya</h4><p>Ek logistics firm mein raat ke change ke dauraan engineer ne core switch par <code>channel-group 3 mode on</code> configure kiya, phir access switch ko chhune se pehle use kahin aur bula liya gaya. Kuch hi seconds mein core ne <code>%SPANTREE-2-CHNL_MISCFG</code> log kiya aur Po3 ko err-disable kar diya; warehouse subah tak connectivity ke bina raha. Agli raat team ne dono switches ko members shut karke configure kiya, phir unhe ek saath enable kiya, aur baad mein LACP par migrate kiya.</p><p><b>Seekh:</b> mode on doosri side ka intezaar nahi karta. Ise dhyan se stage karo, ya LACP prefer karo.</p></div>

<div class="iv"><p class="q">"Aap LACP ki jagah static EtherChannel kab use karoge?"</p><p>Strong answer: sirf tab jab doosra device LACP nahi chala sakta, jaise IP hash use karne wala hypervisor standard vSwitch ya koi purana appliance. Risk samjhao: mode on koi partner check nahi karta, isliye galat cabling ya aadha change loops ya black holes bana sakta hai; safety net ke roop mein EtherChannel guard channel ko err-disable kar deta hai. Warna LACP active default choice hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>channel-group N mode on</code> bina shart bundle karta hai; koi packets exchange nahi hote.</li>
<li>on sirf on ke saath channel banata hai; LACP ya PAgP modes ke saath kabhi nahi.</li>
<li>channel-group command Port-channel N banata hai; trunks aur VLANs Po par configure karo.</li>
<li>Static bundle ke liye <code>show etherchannel summary</code> Protocol <code>-</code> dikhata hai; healthy matlab Po1(SU) aur members (P).</li>
<li>EtherChannel misconfig guard ek-tarfa on bundle ko err-disable karke loops rokta hai.</li>
</ul></div>
`}};export{e as default};