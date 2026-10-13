var e={id:`site-to-site-vpn`,h:{en:`Site-to-site VPN: both engines, same profile, same key, no NAT`,hi:`Site-to-site VPN: dono engines, same profile, same key, no NAT`},body:{en:`
<p>This chapter is the heart of the module. You will build the Pune to HQ tunnel (lab fp-vpn-1) and then learn to read the three typical failures, including the one in lab fp-vpn-2: VPN up, no traffic.</p>

<h3>Analogy: two keys, one lock</h3>
<p>A tunnel is like a safe with two keys, one in each office. The safe only opens if both keys match, and both offices must have installed the same lock. If Pune fitted lock version 3 and HQ still has version 2, nothing opens. Defining a lock in the head office files is not enough; the lock must be physically fitted in each office. For us, "fitted" means <b>Install Policy on that engine</b>.</p>

<h3>The build order</h3>
<ol>
<li>Create or choose the VPN profile.</li>
<li>Create the VPN element: two gateways (engine and address), protected networks on each side, the profile, the pre-shared key, and set it enabled.</li>
<li>In the Pune policy, add a rule from the Pune protected network to the HQ network with action Allow and the VPN option Apply (or Enforce). Do the mirror rule in the HQ policy.</li>
<li>Above any general NAT rule, add a <b>no-NAT</b> rule for the same source and destination.</li>
<li>Install the policy on NK-PUNE-FW <b>and</b> on NK-HQ-FW.</li>
<li>Check Monitoring for the tunnel state, test with a ping or a connection, and read the Logs.</li>
</ol>

<pre class="code"><span class="c">! Plan on paper before you click (names are examples)</span>
VPN element : pune-hq
Gateway A   : NK-PUNE-FW  203.0.113.2   protects 10.1.1.0/24
Gateway B   : NK-HQ-FW    198.51.100.2  protects 10.2.1.0/24
Profile     : strong AES, SHA-2, modern DH, pre-shared key
Pune rule   : src net-staff  dst net-hq  svc any  Allow  VPN Apply
Pune NAT    : 1 no-NAT  src net-staff dst net-hq
              2 dynamic src net-staff dst any -&gt; interface address
Install     : NK-PUNE-FW, then NK-HQ-FW</pre>

<h3>Why NAT must not touch VPN traffic</h3>
<p>You learnt that NAT runs after the Access rule and before routing. The engine compares the packet with the VPN's protected networks. If the general rule "Staff LAN to internet, dynamic NAT" changes 10.1.1.10 into 203.0.113.2 first, the source is no longer inside the protected network, so the packet misses the tunnel and goes to the internet as ordinary traffic. The cure is a rule above the general NAT rule: same source, destination HQ network, type <b>none</b> (no NAT). NAT is first match, so the exception wins for VPN traffic and the general rule still serves the internet.</p>

<h3>Reading the result</h3>
<pre class="out">CONFIG VPN page (illustrative layout)
VPN pune-hq        enabled   profile strong-1
  NK-PUNE-FW  203.0.113.2   installed   rev 12
  NK-HQ-FW    198.51.100.2  <span class="hl">installed   rev 7</span>
  state: <span class="hl">tunnel up</span>
Logs
  10:41:05  rule 4  Allow  VPN  10.1.1.10 -&gt; 10.2.1.20  TCP 445</pre>
<p>Look at three things: both engines show installed, the state is up, and the log line names the rule with the VPN. If the second engine shows "not installed" or an old revision, the tunnel will not form.</p>

<h3>The three classic failures</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where to look</th></tr>
<tr><td>Tunnel down</td><td>Only one engine installed; profile or key differs; gateway address not an engine address; peer unreachable</td><td>VPN page, Install state, Engines routing, Monitoring</td></tr>
<tr><td>Tunnel up, no traffic</td><td>Protected networks wrong or overlapping; rule VPN option none; source NATed first</td><td>VPN protected lists, Policy rule, NAT rules, Logs</td></tr>
<tr><td>Works one way only</td><td>Mirror rule missing on the other engine, or its protected list is wrong</td><td>Other engine's policy</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-2. STAFF-PC 10.1.1.10 cannot reach 10.2.1.20, yet Monitoring shows the tunnel up. The Pune side of the VPN lists protected network 10.1.2.0/24 by mistake. The rule is fine and the NAT exception exists. The engine decides: source 10.1.1.10 is not in 10.1.2.0/24, so no tunnel. Fix: change the protected network to net-staff (10.1.1.0/24), save, and Install Policy on NK-PUNE-FW. Because the VPN element is shared, also install on NK-HQ-FW so both engines hold the same revision.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Installing only one engine. Editing the key on one side only. Forgetting that a changed VPN needs a new install on both. Placing the no-NAT rule below the general NAT rule, where it never gets reached.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel up" means the two engines negotiated. It does not mean any user traffic matches. Always test traffic and check the rule and protected networks.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Decision path for a packet">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">Packet from PC</text>
<rect x="150" y="60" width="110" height="50" rx="8" fill="#fde68a"/><text x="205" y="82" text-anchor="middle" class="svg-ink" font-size="13">Access rule</text><text x="205" y="99" text-anchor="middle" class="svg-muted" font-size="12">VPN apply?</text>
<rect x="290" y="60" width="110" height="50" rx="8" fill="#fed7aa"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="13">NAT</text><text x="345" y="99" text-anchor="middle" class="svg-muted" font-size="12">no-NAT first</text>
<rect x="430" y="60" width="90" height="50" rx="8" fill="#bae6fd"/><text x="475" y="82" text-anchor="middle" class="svg-ink" font-size="13">Protected?</text><text x="475" y="99" text-anchor="middle" class="svg-muted" font-size="12">src and dst</text>
<rect x="545" y="60" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="587" y="90" text-anchor="middle" class="svg-ink" font-size="13">Tunnel</text>
<line x1="120" y1="85" x2="150" y2="85" stroke="#64748b"/><line x1="260" y1="85" x2="290" y2="85" stroke="#64748b"/><line x1="400" y1="85" x2="430" y2="85" stroke="#64748b"/><line x1="520" y1="85" x2="545" y2="85" stroke="#64748b"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">A miss at any step sends the packet to normal routing</text>
</svg><p class="cap">Check the packet at each step when you troubleshoot.</p></div>

<div class="scn"><h4>Half a tunnel on Monday morning</h4><p>The weekend change installed the new VPN on NK-PUNE-FW only, because the HQ change window was cancelled. On Monday the Pune users could not reach HQ. The VPN page showed Pune at revision 12 and HQ without the VPN. The engineer installed the HQ policy during the next window and the tunnel formed in a minute. A rollback of the Pune side was the fallback plan.</p><p><b>Lesson:</b> a site-to-site VPN is one change on two engines. Plan both installs together.</p></div>

<div class="iv"><p class="q">"The tunnel shows up but users cannot reach the remote site. What do you check?"</p><p>Strong answer: the rule matching the traffic has the VPN option, the source and destination are inside the protected networks of both sites, NAT is not changing the source (add a no-NAT rule above the general NAT), the mirror rule and install exist on the other engine, and the Logs show which rule matched.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Both engines must install the same VPN profile and key; one-sided installs leave the tunnel down.</li>
<li>Protected networks decide which traffic enters the tunnel; wrong lists give up-but-silent tunnels.</li>
<li>Put a no-NAT rule above the general NAT rule for VPN traffic.</li>
<li>Rules with the VPN option are needed on both engines.</li>
<li>Test traffic and read Logs; tunnel state alone proves little.</li>
</ul></div>
`,hi:`
<p>Yeh chapter is module ka dil hai. Aap Pune se HQ tunnel banaoge (lab fp-vpn-1) aur phir teen typical failures padhna seekhoge, jinmein lab fp-vpn-2 wala bhi hai: VPN up, traffic nahi.</p>

<h3>Analogy: do keys, ek lock</h3>
<p>Tunnel ek safe jaisa hai jiski do keys hain, ek-ek har office mein. Safe tabhi khulta hai jab dono keys match karein, aur dono offices ne same lock lagaya ho. Agar Pune ne lock version 3 lagaya aur HQ mein abhi version 2 hai, to kuch nahi khulta. Head office files mein lock define kar dena kaafi nahi; lock har office mein physically lagna chahiye. Hamare liye "lagna" ka matlab hai <b>us engine par Install Policy</b>.</p>

<h3>Build ka order</h3>
<ol>
<li>VPN profile banao ya chuno.</li>
<li>VPN element banao: do gateways (engine aur address), dono taraf ke protected networks, profile, pre-shared key, aur use enabled karo.</li>
<li>Pune policy mein Pune protected network se HQ network tak ka rule add karo, action Allow aur VPN option Apply (ya Enforce). HQ policy mein mirror rule banao.</li>
<li>Kisi bhi general NAT rule ke upar same source aur destination ke liye ek <b>no-NAT</b> rule add karo.</li>
<li>Policy NK-PUNE-FW <b>aur</b> NK-HQ-FW dono par install karo.</li>
<li>Monitoring mein tunnel state dekho, ping ya connection se test karo, aur Logs padho.</li>
</ol>

<pre class="code"><span class="c">! Click karne se pehle kagaz par plan (names examples hain)</span>
VPN element : pune-hq
Gateway A   : NK-PUNE-FW  203.0.113.2   protects 10.1.1.0/24
Gateway B   : NK-HQ-FW    198.51.100.2  protects 10.2.1.0/24
Profile     : strong AES, SHA-2, modern DH, pre-shared key
Pune rule   : src net-staff  dst net-hq  svc any  Allow  VPN Apply
Pune NAT    : 1 no-NAT  src net-staff dst net-hq
              2 dynamic src net-staff dst any -&gt; interface address
Install     : NK-PUNE-FW, then NK-HQ-FW</pre>

<h3>NAT VPN traffic ko kyun na chhue</h3>
<p>Aap jaante ho ki NAT Access rule ke baad aur routing se pehle chalta hai. Engine packet ko VPN ke protected networks se compare karta hai. Agar general rule "Staff LAN to internet, dynamic NAT" pehle 10.1.1.10 ko 203.0.113.2 bana de, to source ab protected network ke andar nahi raha, isliye packet tunnel miss karta hai aur normal traffic ki tarah internet par chala jaata hai. Ilaaj: general NAT rule ke upar ek rule, same source, destination HQ network, type <b>none</b> (no NAT). NAT first match hai, isliye VPN traffic ke liye exception jeetta hai aur general rule internet ko serve karta rehta hai.</p>

<h3>Result padhna</h3>
<pre class="out">CONFIG VPN page (illustrative layout)
VPN pune-hq        enabled   profile strong-1
  NK-PUNE-FW  203.0.113.2   installed   rev 12
  NK-HQ-FW    198.51.100.2  <span class="hl">installed   rev 7</span>
  state: <span class="hl">tunnel up</span>
Logs
  10:41:05  rule 4  Allow  VPN  10.1.1.10 -&gt; 10.2.1.20  TCP 445</pre>
<p>Teen cheezein dekho: dono engines installed dikhayein, state up ho, aur log line VPN wale rule ka naam bataye. Agar doosra engine "not installed" ya purani revision dikhaye, to tunnel nahi banega.</p>

<h3>Teen classic failures</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Kahan dekhein</th></tr>
<tr><td>Tunnel down</td><td>Sirf ek engine installed; profile ya key alag; gateway address engine ka nahi; peer unreachable</td><td>VPN page, Install state, Engines routing, Monitoring</td></tr>
<tr><td>Tunnel up, traffic nahi</td><td>Protected networks galat ya overlapping; rule ka VPN option none; source pehle NAT ho gaya</td><td>VPN protected lists, Policy rule, NAT rules, Logs</td></tr>
<tr><td>Sirf ek direction mein chalta hai</td><td>Doosre engine par mirror rule missing, ya uski protected list galat</td><td>Doosre engine ki policy</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-2. STAFF-PC 10.1.1.10 se 10.2.1.20 nahi pahunch raha, jabki Monitoring mein tunnel up hai. VPN ke Pune side par galti se protected network 10.1.2.0/24 likha hai. Rule theek hai aur NAT exception bhi hai. Engine ka faisla: source 10.1.1.10, 10.1.2.0/24 mein nahi hai, isliye tunnel nahi. Fix: protected network ko net-staff (10.1.1.0/24) karo, save karo, aur NK-PUNE-FW par Install Policy karo. VPN element shared hai, isliye NK-HQ-FW par bhi install karo taaki dono engines ke paas same revision ho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf ek engine install karna. Key sirf ek side par badalna. Bhool jaana ki VPN badalne par dono par naya install chahiye. No-NAT rule ko general NAT rule ke neeche rakhna, jahan woh kabhi reach hi nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel up" ka matlab hai dono engines ne negotiate kar liya. Iska matlab yeh nahi ki koi user traffic match hota hai. Hamesha traffic test karo aur rule aur protected networks check karo.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Packet ka decision path">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">PC se packet</text>
<rect x="150" y="60" width="110" height="50" rx="8" fill="#fde68a"/><text x="205" y="82" text-anchor="middle" class="svg-ink" font-size="13">Access rule</text><text x="205" y="99" text-anchor="middle" class="svg-muted" font-size="12">VPN apply?</text>
<rect x="290" y="60" width="110" height="50" rx="8" fill="#fed7aa"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="13">NAT</text><text x="345" y="99" text-anchor="middle" class="svg-muted" font-size="12">pehle no-NAT</text>
<rect x="430" y="60" width="90" height="50" rx="8" fill="#bae6fd"/><text x="475" y="82" text-anchor="middle" class="svg-ink" font-size="13">Protected?</text><text x="475" y="99" text-anchor="middle" class="svg-muted" font-size="12">src aur dst</text>
<rect x="545" y="60" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="587" y="90" text-anchor="middle" class="svg-ink" font-size="13">Tunnel</text>
<line x1="120" y1="85" x2="150" y2="85" stroke="#64748b"/><line x1="260" y1="85" x2="290" y2="85" stroke="#64748b"/><line x1="400" y1="85" x2="430" y2="85" stroke="#64748b"/><line x1="520" y1="85" x2="545" y2="85" stroke="#64748b"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Kisi bhi step par miss ho to packet normal routing par jaata hai</text>
</svg><p class="cap">Troubleshoot karte waqt har step par packet check karo.</p></div>

<div class="scn"><h4>Somvar subah aadha tunnel</h4><p>Weekend change mein naya VPN sirf NK-PUNE-FW par install hua, kyunki HQ ka change window cancel ho gaya tha. Somvar ko Pune users HQ tak nahi pahunche. VPN page mein Pune revision 12 par tha aur HQ par VPN tha hi nahi. Engineer ne agle window mein HQ policy install ki aur tunnel ek minute mein ban gaya. Fallback plan Pune side ka rollback tha.</p><p><b>Lesson:</b> site-to-site VPN do engines par ek hi change hai. Dono installs ek saath plan karo.</p></div>

<div class="iv"><p class="q">"Tunnel up dikh raha hai lekin users remote site tak nahi pahunch rahe. Aap kya check karoge?"</p><p>Strong answer: traffic se match hone wale rule mein VPN option hai, source aur destination dono sites ke protected networks ke andar hain, NAT source nahi badal raha (general NAT ke upar no-NAT rule), doosre engine par mirror rule aur install maujood hai, aur Logs dikhate hain kaun sa rule match hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dono engines ko same VPN profile aur key install karni hoti hai; ek-tarfa install tunnel ko down rakhta hai.</li>
<li>Protected networks decide karte hain tunnel mein kya jaaye; galat lists up-lekin-khamosh tunnel deti hain.</li>
<li>VPN traffic ke liye general NAT rule ke upar no-NAT rule rakho.</li>
<li>VPN option wale rules dono engines par chahiye.</li>
<li>Traffic test karo aur Logs padho; sirf tunnel state kam batata hai.</li>
</ul></div>
`}};export{e as default};