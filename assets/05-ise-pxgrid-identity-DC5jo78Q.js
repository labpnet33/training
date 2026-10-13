var e={id:`ise-pxgrid`,h:{en:`ISE and pxGrid: identity, SGT and ISE-attribute rules`,hi:`ISE aur pxGrid: identity, SGT aur ISE-attribute rules`},body:{en:`
<p>So far every rule you wrote matched IP addresses and zones. But people move: Priya from Finance is on 10.0.1.10 today, on Wi-Fi with a different address tomorrow, and working from a meeting room on Friday. Cisco ISE always knows who is on which address because it authenticated them. <b>pxGrid</b> is how the Management Center learns that, so your policy can say "Finance users" or "SGT Contractors" instead of chasing addresses.</p>

<h3>An analogy: the badge office</h3>
<p>The guard at the door does not check passports; the badge office did that when the employee joined. The badge office keeps a live list: badge 1042 = Priya, Finance, laptop, currently on floor 3. If the guard can read that list, he can apply rules by department. pxGrid is the guard's live connection to the badge office.</p>

<h3>What pxGrid is</h3>
<p><b>pxGrid (Platform Exchange Grid)</b> is a publish/subscribe framework hosted by ISE. ISE nodes with the <b>pxGrid persona</b> act as the controller; clients such as the Management Center register, are approved, and then subscribe to <b>topics</b>. Current releases use pxGrid 2.0: REST and WebSocket over TLS on TCP 8910, with <b>mutual certificate authentication</b> — each side must trust the other's certificate authority.</p>
<table class="cmp"><tr><th>Topic</th><th>What the Management Center gets</th><th>Used for</th></tr>
<tr><td>Session directory</td><td>User, IP, MAC, SGT, endpoint profile, network device for each session</td><td>User/group, SGT and device-type rules</td></tr>
<tr><td>SXP mappings</td><td>IP-to-SGT bindings ISE learnt or configured (for hosts without sessions, such as servers)</td><td>SGT rules for static hosts</td></tr>
<tr><td>Adaptive Network Control</td><td>The ability to request ANC actions</td><td>Rapid Threat Containment (chapter 7)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="pxGrid identity flow">
<rect x="20" y="150" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="172" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="190" text-anchor="middle" class="svg-muted" font-size="12">priya, 10.0.1.10</text>
<rect x="190" y="150" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="245" y="180" text-anchor="middle" class="svg-ink" font-size="13">SW-ACC1</text>
<rect x="190" y="30" width="130" height="55" rx="8" fill="#bbf7d0"/><text x="255" y="53" text-anchor="middle" class="svg-ink" font-size="13">ISE1</text><text x="255" y="71" text-anchor="middle" class="svg-muted" font-size="12">10.0.9.20 pxGrid</text>
<rect x="400" y="30" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="485" y="53" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="485" y="71" text-anchor="middle" class="svg-muted" font-size="12">subscriber</text>
<rect x="420" y="150" width="130" height="50" rx="8" fill="#fed7aa"/><text x="485" y="180" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<line x1="140" y1="175" x2="190" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="150" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="190" y="122" class="svg-muted" font-size="12">802.1X / RADIUS</text>
<line x1="320" y1="57" x2="400" y2="57" stroke="#64748b" stroke-width="2"/><text x="360" y="48" text-anchor="middle" class="svg-accent" font-size="12">TCP 8910</text>
<line x1="485" y1="85" x2="485" y2="150" stroke="#64748b" stroke-width="2"/><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">user-IP, SGT</text>
</svg><p class="cap">ISE authenticates the user, publishes the session; the Management Center subscribes and distributes the mappings to Threat Defense.</p></div>

<h3>Configuration, step by step</h3>
<ol>
<li><b>ISE:</b> enable the pxGrid persona on a node (Administration → System → Deployment) and, under Administration → pxGrid Services, either approve new clients manually or allow automatic approval of certificate-based accounts.</li>
<li><b>Certificates:</b> import the CA that signed the ISE pxGrid certificate and the CA of the ISE monitoring (MnT) node into the Management Center as trusted CAs; give the Management Center an internal certificate that ISE trusts.</li>
<li><b>Management Center:</b> Integration → Other Integrations → Identity Sources → <b>Identity Services Engine</b>. Enter primary and secondary ISE host, the pxGrid server CA, the MnT server CA, the Management Center server certificate, an optional <b>ISE network filter</b> (only learn sessions from these subnets), and tick the topics (Session Directory, SXP). Click <b>Test</b>.</li>
<li><b>Realm and identity policy:</b> for user and group rules, add an Active Directory realm (so group membership can be downloaded) and an identity policy rule with action <b>Passive Authentication</b>; link the identity policy in the access control policy's advanced settings. Deploy.</li>
<li><b>Rules:</b> use the Users tab (users and groups) or the SGT/ISE attributes (called Dynamic Attributes in newer releases): Security Group Tag, Device Type (ISE endpoint profile) and Location IP (the network device).</li>
</ol>

<pre class="code"><span class="c">! Access control rule in NK-ACP (above Inside-Out)</span>
Name        : HR-Portal-Finance-Only
Source zone : INSIDE          Dest zone : DMZ
Dest network: WEB (10.0.2.10) Ports     : tcp/443
SGT         : Finance (10)
Action      : Allow
<span class="c">! next rule: same destination, any SGT, action Block</span></pre>

<pre class="out">&gt; system support firewall-engine-debug
10.0.1.10-51514 &gt; 10.0.2.10-443 6 AS 1-1 CID 0 Starting with minimum 2, 'HR-Portal-Finance-Only', and SrcZone first with zones 1 -&gt; 2, geo 0 -&gt; 0, vlan 0, <span class="hl">src sgt: 10, src sgt type: session directory</span>, dst sgt: 0, dst sgt type: unknown, svc 0, payload 0, client 0, misc 0, user 9, url , xff
10.0.1.10-51514 &gt; 10.0.2.10-443 6 AS 1-1 CID 0 <span class="hl">match rule order 2, 'HR-Portal-Finance-Only', action Allow</span></pre>

<div class="eg"><p><b>Worked example.</b> ISE authenticates priya@nwk.example on SW-ACC1 and assigns SGT 10 (Finance); her laptop gets 10.0.1.10. Within seconds the Management Center receives the session and pushes the mapping 10.0.1.10 → user priya, SGT 10 to FTD1. Her HTTPS request to 10.0.2.10 matches HR-Portal-Finance-Only. A contractor on 10.0.1.33 with SGT 15 hits the next rule and is blocked — although both are in the same subnet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trusting only the pxGrid CA and forgetting the MnT CA (bulk session download fails). The client is still "Pending" in ISE because nobody approved it. Using group rules without a realm — the groups never download. Assuming Threat Defense talks to ISE directly — it is the Management Center that subscribes.</p></div>

<div class="exam"><p><b>Exam trap.</b> pxGrid gives <b>passive</b> identity: the firewall learns who is on an address; it does not authenticate users itself. Active authentication (captive portal) is a different identity rule action. And SGT can arrive two ways: inline in the frame (Cisco metadata tag) or from ISE mappings; the rule matches either.</p></div>

<div class="scn"><h4>The test button that kept failing</h4><p>An engineer configured the ISE identity source, but Test failed with a certificate error. ISE showed the Management Center client as Pending. He approved it in pxGrid Services, and the pxGrid part passed — but the bulk session download still failed. The ISE MnT node's certificate was signed by a different internal CA than the pxGrid certificate, and only one CA had been imported. After importing the second CA, Test passed and 1,800 sessions appeared in Analysis → Users → Active Sessions.</p><p><b>Lesson:</b> pxGrid is certificate-driven in both directions. Check approval, then every CA in the chain.</p></div>

<div class="iv"><p class="q">"How does a Secure Firewall rule match an SGT when the firewall is not part of TrustSec?"</p><p>Strong answer: the Management Center subscribes to ISE over pxGrid (session directory and SXP topics) and distributes IP-to-SGT and IP-to-user mappings to the managed Threat Defense devices, so a rule can match the SGT even if the packet has no inline tag. If the packet carries an inline tag, that is used too. Mention mutual certificates on TCP 8910, client approval in ISE, the network filter, and verifying with firewall-engine-debug.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pxGrid is ISE's publish/subscribe bus; the Management Center is a subscriber.</li>
<li>Topics give user-IP, SGT and endpoint-profile context; ANC gives quarantine actions.</li>
<li>Mutual certificates, client approval and the MnT CA are the usual setup traps.</li>
<li>Rules can match users, groups, SGTs, device type and location IP.</li>
<li>Identity from ISE is passive; it follows the user as the IP changes.</li>
</ul></div>
`,hi:`
<p>Ab tak aapki har rule IP addresses aur zones match karti thi. Lekin log move karte hain: Finance ki Priya aaj 10.0.1.10 par hai, kal Wi-Fi par alag address ke saath, aur Friday ko meeting room se kaam kar rahi hai. Cisco ISE ko hamesha pata hota hai kaun kis address par hai kyunki usne unhe authenticate kiya. <b>pxGrid</b> se Management Center yeh seekhta hai, taaki aapki policy addresses ke peeche bhaagne ki jagah "Finance users" ya "SGT Contractors" keh sake.</p>

<h3>Ek analogy: badge office</h3>
<p>Gate ka guard passport check nahi karta; badge office ne yeh tab kiya jab employee join hua. Badge office ek live list rakhta hai: badge 1042 = Priya, Finance, laptop, abhi floor 3 par. Agar guard woh list padh sake, to woh department ke hisaab se rules laga sakta hai. pxGrid guard ka badge office se live connection hai.</p>

<h3>pxGrid kya hai</h3>
<p><b>pxGrid (Platform Exchange Grid)</b> ISE dwara host kiya gaya ek publish/subscribe framework hai. <b>pxGrid persona</b> wale ISE nodes controller ka kaam karte hain; Management Center jaise clients register hote hain, approve hote hain, aur phir <b>topics</b> subscribe karte hain. Current releases pxGrid 2.0 use karti hain: TCP 8910 par TLS ke upar REST aur WebSocket, <b>mutual certificate authentication</b> ke saath — har side ko doosri side ki certificate authority par trust karna padta hai.</p>
<table class="cmp"><tr><th>Topic</th><th>Management Center ko kya milta hai</th><th>Kis kaam aata hai</th></tr>
<tr><td>Session directory</td><td>Har session ka user, IP, MAC, SGT, endpoint profile, network device</td><td>User/group, SGT aur device-type rules</td></tr>
<tr><td>SXP mappings</td><td>IP-to-SGT bindings jo ISE ne seekhi ya configure ki (bina session wale hosts ke liye, jaise servers)</td><td>Static hosts ke liye SGT rules</td></tr>
<tr><td>Adaptive Network Control</td><td>ANC actions request karne ki capability</td><td>Rapid Threat Containment (chapter 7)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="pxGrid identity flow">
<rect x="20" y="150" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="172" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="190" text-anchor="middle" class="svg-muted" font-size="12">priya, 10.0.1.10</text>
<rect x="190" y="150" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="245" y="180" text-anchor="middle" class="svg-ink" font-size="13">SW-ACC1</text>
<rect x="190" y="30" width="130" height="55" rx="8" fill="#bbf7d0"/><text x="255" y="53" text-anchor="middle" class="svg-ink" font-size="13">ISE1</text><text x="255" y="71" text-anchor="middle" class="svg-muted" font-size="12">10.0.9.20 pxGrid</text>
<rect x="400" y="30" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="485" y="53" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="485" y="71" text-anchor="middle" class="svg-muted" font-size="12">subscriber</text>
<rect x="420" y="150" width="130" height="50" rx="8" fill="#fed7aa"/><text x="485" y="180" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<line x1="140" y1="175" x2="190" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="150" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="190" y="122" class="svg-muted" font-size="12">802.1X / RADIUS</text>
<line x1="320" y1="57" x2="400" y2="57" stroke="#64748b" stroke-width="2"/><text x="360" y="48" text-anchor="middle" class="svg-accent" font-size="12">TCP 8910</text>
<line x1="485" y1="85" x2="485" y2="150" stroke="#64748b" stroke-width="2"/><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">user-IP, SGT</text>
</svg><p class="cap">ISE user ko authenticate karta hai, session publish karta hai; Management Center subscribe karke mappings Threat Defense tak pahunchata hai.</p></div>

<h3>Configuration, step by step</h3>
<ol>
<li><b>ISE:</b> ek node par pxGrid persona enable karo (Administration → System → Deployment) aur Administration → pxGrid Services mein ya to naye clients manually approve karo ya certificate-based accounts ka automatic approval allow karo.</li>
<li><b>Certificates:</b> ISE pxGrid certificate sign karne wali CA aur ISE monitoring (MnT) node ki CA ko Management Center mein trusted CAs ki tarah import karo; Management Center ko ek internal certificate do jis par ISE trust kare.</li>
<li><b>Management Center:</b> Integration → Other Integrations → Identity Sources → <b>Identity Services Engine</b>. Primary aur secondary ISE host, pxGrid server CA, MnT server CA, Management Center server certificate, optional <b>ISE network filter</b> (sirf in subnets ke sessions seekho) daalo, aur topics tick karo (Session Directory, SXP). <b>Test</b> click karo.</li>
<li><b>Realm aur identity policy:</b> user aur group rules ke liye ek Active Directory realm jodo (taaki group membership download ho sake) aur action <b>Passive Authentication</b> wali identity policy rule banao; identity policy ko access control policy ki advanced settings mein link karo. Deploy karo.</li>
<li><b>Rules:</b> Users tab (users aur groups) ya SGT/ISE attributes use karo (naye releases mein Dynamic Attributes kehlaate hain): Security Group Tag, Device Type (ISE endpoint profile) aur Location IP (network device).</li>
</ol>

<pre class="code"><span class="c">! NK-ACP mein access control rule (Inside-Out ke upar)</span>
Name        : HR-Portal-Finance-Only
Source zone : INSIDE          Dest zone : DMZ
Dest network: WEB (10.0.2.10) Ports     : tcp/443
SGT         : Finance (10)
Action      : Allow
<span class="c">! agli rule: same destination, koi bhi SGT, action Block</span></pre>

<pre class="out">&gt; system support firewall-engine-debug
10.0.1.10-51514 &gt; 10.0.2.10-443 6 AS 1-1 CID 0 Starting with minimum 2, 'HR-Portal-Finance-Only', and SrcZone first with zones 1 -&gt; 2, geo 0 -&gt; 0, vlan 0, <span class="hl">src sgt: 10, src sgt type: session directory</span>, dst sgt: 0, dst sgt type: unknown, svc 0, payload 0, client 0, misc 0, user 9, url , xff
10.0.1.10-51514 &gt; 10.0.2.10-443 6 AS 1-1 CID 0 <span class="hl">match rule order 2, 'HR-Portal-Finance-Only', action Allow</span></pre>

<div class="eg"><p><b>Worked example.</b> ISE SW-ACC1 par priya@nwk.example ko authenticate karta hai aur SGT 10 (Finance) assign karta hai; uske laptop ko 10.0.1.10 milta hai. Seconds mein Management Center ko session milta hai aur woh mapping 10.0.1.10 → user priya, SGT 10 FTD1 ko push karta hai. Uski 10.0.2.10 ki HTTPS request HR-Portal-Finance-Only match karti hai. 10.0.1.33 par SGT 15 wala ek contractor agli rule hit karta hai aur block hota hai — jabki dono same subnet mein hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf pxGrid CA trust karna aur MnT CA bhool jaana (bulk session download fail hota hai). Client ISE mein ab bhi "Pending" hai kyunki kisi ne approve nahi kiya. Bina realm ke group rules use karna — groups kabhi download nahi hote. Yeh maan lena ki Threat Defense seedha ISE se baat karta hai — subscribe Management Center karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> pxGrid <b>passive</b> identity deta hai: firewall seekhta hai ki address par kaun hai; woh khud users authenticate nahi karta. Active authentication (captive portal) ek alag identity rule action hai. Aur SGT do tareekon se aa sakta hai: frame mein inline (Cisco metadata tag) ya ISE mappings se; rule dono ko match karti hai.</p></div>

<div class="scn"><h4>Woh Test button jo fail hota raha</h4><p>Ek engineer ne ISE identity source configure kiya, lekin Test certificate error ke saath fail hua. ISE mein Management Center client Pending dikh raha tha. Usne pxGrid Services mein use approve kiya, aur pxGrid wala hissa pass ho gaya — lekin bulk session download ab bhi fail tha. ISE MnT node ka certificate pxGrid certificate se alag internal CA ne sign kiya tha, aur sirf ek CA import hui thi. Doosri CA import karne ke baad Test pass hua aur Analysis → Users → Active Sessions mein 1,800 sessions dikhe.</p><p><b>Seekh:</b> pxGrid dono taraf certificate-driven hai. Pehle approval check karo, phir chain ki har CA.</p></div>

<div class="iv"><p class="q">"Jab firewall TrustSec ka hissa nahi hai, tab Secure Firewall rule SGT kaise match karti hai?"</p><p>Strong answer: Management Center pxGrid par ISE ko subscribe karta hai (session directory aur SXP topics) aur IP-to-SGT aur IP-to-user mappings managed Threat Defense devices ko distribute karta hai, isliye rule SGT match kar sakti hai chahe packet mein inline tag na ho. Agar packet mein inline tag hai, to woh bhi use hota hai. TCP 8910 par mutual certificates, ISE mein client approval, network filter, aur firewall-engine-debug se verify karna — inka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pxGrid ISE ka publish/subscribe bus hai; Management Center subscriber hai.</li>
<li>Topics user-IP, SGT aur endpoint-profile context dete hain; ANC quarantine actions deta hai.</li>
<li>Mutual certificates, client approval aur MnT CA aam setup traps hain.</li>
<li>Rules users, groups, SGTs, device type aur location IP match kar sakti hain.</li>
<li>ISE se identity passive hai; IP badalne par bhi user ko follow karti hai.</li>
</ul></div>
`}};export{e as default};