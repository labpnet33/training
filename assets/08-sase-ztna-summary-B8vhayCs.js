var e={id:`sase-ztna-summary`,h:{en:`SASE, ZTNA connector, and summary with exam checklist`,hi:`SASE, ZTNA connector, aur summary with exam checklist`},body:{en:`
<p>The last chapter looks at where VPN thinking is going, then closes the module with a checklist. SASE and ZTNA are concepts here. The simulator does not run them.</p>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> Cloud security services, connectors and agents are described as ideas. Names and features differ by vendor and release, so check the documentation for your NGFW version and your service provider.</p></div>

<h3>Analogy: from a castle gate to a smart badge</h3>
<p>A classic VPN is a castle gate: once you are inside the walls you can walk to many rooms. Zero trust is a smart badge: every door checks who you are and whether you may enter that one room, every time.</p>

<h3>SASE in plain words</h3>
<p><b>SASE</b> (secure access service edge, said "sassy") combines SD-WAN with security delivered as a cloud service: web filtering, firewall, threat protection and access control, placed near users instead of in one head office. A branch or a laptop connects to the nearest cloud point and the security checks happen there. It suits companies where most work is on the internet and people are everywhere.</p>

<h3>ZTNA in plain words</h3>
<p><b>ZTNA</b> (zero trust network access) gives a user access to one application, not to a whole network. The user and their device are verified first. A broker then connects the user to the application. A small <b>connector</b> sits inside the data center or cloud next to the application and makes an outbound connection to the broker, so no inbound port is opened to the internet. Compare that with remote access VPN, where a user gets an address in the office network and can try to reach anything the rules allow.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VPN versus ZTNA">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Remote access VPN</text>
<rect x="20" y="40" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="150" y="40" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="70" text-anchor="middle" class="svg-ink" font-size="13">Engine</text>
<rect x="150" y="120" width="100" height="70" rx="8" fill="#fed7aa"/><text x="200" y="150" text-anchor="middle" class="svg-ink" font-size="13">Whole LAN</text><text x="200" y="168" text-anchor="middle" class="svg-muted" font-size="12">rules limit it</text>
<line x1="110" y1="65" x2="150" y2="65" stroke="#64748b"/><line x1="200" y1="90" x2="200" y2="120" stroke="#64748b"/>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">ZTNA with connector</text>
<rect x="340" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="70" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="450" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="490" y="70" text-anchor="middle" class="svg-ink" font-size="13">Broker</text>
<rect x="560" y="40" width="70" height="50" rx="8" fill="#bae6fd"/><text x="595" y="70" text-anchor="middle" class="svg-ink" font-size="13">Connector</text>
<rect x="540" y="120" width="90" height="70" rx="8" fill="#fde68a"/><text x="585" y="160" text-anchor="middle" class="svg-ink" font-size="13">One app</text>
<line x1="420" y1="65" x2="450" y2="65" stroke="#64748b"/><line x1="530" y1="65" x2="560" y2="65" stroke="#64748b"/><line x1="595" y1="90" x2="585" y2="120" stroke="#64748b"/>
</svg><p class="cap">VPN gives network reach, limited by rules. ZTNA gives access to one application after checking user and device.</p></div>

<h3>How the labs connect to this</h3>
<p>Everything you practised remains useful: tunnels between sites, a gateway that checks identity, a second factor, least-access rules and several internet links with health checks. SASE and ZTNA change where these checks happen, not why.</p>

<div class="scn"><h4>Contractor access without a network address</h4><p>A vendor needed access to one reporting web app for a week. A remote access VPN would have placed the vendor laptop in the HQ address pool with reach to many servers. The team instead used a ZTNA style: the vendor user, with MFA, could open only that app, and the connector near the app made an outbound connection, so no new inbound port was published. Access ended with the account on Friday.</p><p><b>Lesson:</b> give access to the application, not the network, when you can.</p></div>

<div class="iv"><p class="q">"How is ZTNA different from a traditional VPN?"</p><p>Strong answer: a VPN connects a device to a network and relies on rules to limit reach. ZTNA verifies user and device and connects them to one application through a broker, usually with an outbound-only connector, so the network is not exposed. Say that both can use MFA and that many companies run both during a move.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>You should be able to:</b></p>
<ul>
<li>Explain policy-based VPN: rule with VPN option, protected networks, and no NAT before encapsulation.</li>
<li>Describe Apply and Enforce VPN.</li>
<li>Define gateway, site and profile, and spot a gateway address that is not an engine address.</li>
<li>Build the Pune to HQ tunnel and install on both engines (fp-vpn-1).</li>
<li>Diagnose VPN up, no traffic: wrong protected networks (fp-vpn-2).</li>
<li>Set Multi-Link standby or balance with probes and prove failover (fp-vpn-3).</li>
<li>Fix a remote access login that needs MFA by enrolling the user and installing the policy (fp-vpn-4).</li>
<li>Describe inbound Multi-Link, SD-WAN, SASE and ZTNA as concepts.</li>
</ul>
<dl class="terms">
<dt>Gateway</dt><dd>Engine address that ends a tunnel.</dd>
<dt>Protected network</dt><dd>Network behind a gateway allowed to use the tunnel.</dd>
<dt>Profile</dt><dd>Encryption, hash, DH group, authentication and lifetime settings.</dd>
<dt>Probe</dt><dd>Reachability test through a link to a target beyond the ISP.</dd>
<dt>MFA</dt><dd>Login with two or more factor families.</dd>
<dt>ZTNA</dt><dd>Per-application access after verifying user and device.</dd>
</dl>
<div class="exam"><p><b>Most tested facts.</b> Both engines install the same profile and key. Tunnel up does not mean traffic flows. NAT before VPN removes traffic from the tunnel. Standby uses the first alive link; balance uses all alive links. Without a probe a dead ISP link stays in use. Every lab passes only after Install Policy on the right engine or engines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SASE moves security to the cloud edge; ZTNA grants per-application access.</li>
<li>Both are concepts here; the principles from the labs still apply.</li>
<li>Check protected networks, rule, NAT and install on both engines for any VPN fault.</li>
<li>Probes make failover real; MFA makes remote login safer.</li>
<li>Check the documentation for your NGFW version for release-specific details.</li>
</ul></div>
`,hi:`
<p>Aakhri chapter dekhta hai ki VPN soch kahan ja rahi hai, phir module ko checklist se band karta hai. SASE aur ZTNA yahan concepts hain. Simulator inhe nahi chalata.</p>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> Cloud security services, connectors aur agents ideas ke roop mein samjhaye gaye hain. Names aur features vendor aur release ke hisaab se alag hote hain, isliye check the documentation for your NGFW version aur apne service provider ka.</p></div>

<h3>Analogy: qile ke gate se smart badge tak</h3>
<p>Classic VPN qile ka gate hai: deewaron ke andar aa gaye to aap kai kamron tak chal sakte ho. Zero trust smart badge hai: har darwaza har baar check karta hai ki aap kaun ho aur kya aap us ek kamre mein ja sakte ho.</p>

<h3>SASE saral shabdon mein</h3>
<p><b>SASE</b> (secure access service edge, "sassy" bola jaata hai) SD-WAN ko cloud service ke roop mein di gayi security ke saath jodta hai: web filtering, firewall, threat protection aur access control, jo ek head office ki jagah users ke paas rakhe jaate hain. Branch ya laptop sabse paas ke cloud point se connect hota hai aur security checks wahin hote hain. Yeh un companies ke liye theek hai jahan zyada kaam internet par hota hai aur log kahin bhi hain.</p>

<h3>ZTNA saral shabdon mein</h3>
<p><b>ZTNA</b> (zero trust network access) user ko ek application tak access deta hai, poore network tak nahi. Pehle user aur uska device verify hote hain. Phir ek broker user ko application se jodta hai. Ek chhota <b>connector</b> data center ya cloud mein application ke paas baithta hai aur broker ki taraf outbound connection banata hai, isliye internet ki taraf koi inbound port nahi khulta. Remote access VPN se tulna karo, jahan user ko office network mein address milta hai aur rules jo allow karein woh sab try kar sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VPN versus ZTNA">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Remote access VPN</text>
<rect x="20" y="40" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="150" y="40" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="70" text-anchor="middle" class="svg-ink" font-size="13">Engine</text>
<rect x="150" y="120" width="100" height="70" rx="8" fill="#fed7aa"/><text x="200" y="150" text-anchor="middle" class="svg-ink" font-size="13">Poora LAN</text><text x="200" y="168" text-anchor="middle" class="svg-muted" font-size="12">rules limit karte hain</text>
<line x1="110" y1="65" x2="150" y2="65" stroke="#64748b"/><line x1="200" y1="90" x2="200" y2="120" stroke="#64748b"/>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">Connector ke saath ZTNA</text>
<rect x="340" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="70" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="450" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="490" y="70" text-anchor="middle" class="svg-ink" font-size="13">Broker</text>
<rect x="560" y="40" width="70" height="50" rx="8" fill="#bae6fd"/><text x="595" y="70" text-anchor="middle" class="svg-ink" font-size="13">Connector</text>
<rect x="540" y="120" width="90" height="70" rx="8" fill="#fde68a"/><text x="585" y="160" text-anchor="middle" class="svg-ink" font-size="13">Ek app</text>
<line x1="420" y1="65" x2="450" y2="65" stroke="#64748b"/><line x1="530" y1="65" x2="560" y2="65" stroke="#64748b"/><line x1="595" y1="90" x2="585" y2="120" stroke="#64748b"/>
</svg><p class="cap">VPN network reach deta hai, rules se limited. ZTNA user aur device check karke ek application tak access deta hai.</p></div>

<h3>Labs ka isse kya connection hai</h3>
<p>Jo aapne practice kiya woh sab kaam aata hai: sites ke beech tunnels, identity check karne wala gateway, second factor, least-access rules aur health checks ke saath kai internet links. SASE aur ZTNA yeh badalte hain ki checks kahan hote hain, kyun hote hain yeh nahi.</p>

<div class="scn"><h4>Network address ke bina contractor access</h4><p>Ek vendor ko ek hafte ke liye sirf ek reporting web app tak access chahiye tha. Remote access VPN vendor laptop ko HQ address pool mein rakhta jahan se kai servers tak reach hoti. Team ne ZTNA style use kiya: MFA ke saath vendor user sirf wahi app khol sakta tha, aur app ke paas connector ne outbound connection banaya, isliye koi naya inbound port publish nahi hua. Access Friday ko account ke saath khatam ho gaya.</p><p><b>Lesson:</b> jab ho sake network nahi, application ka access do.</p></div>

<div class="iv"><p class="q">"ZTNA traditional VPN se kaise alag hai?"</p><p>Strong answer: VPN device ko network se jodta hai aur reach limit karne ke liye rules par depend karta hai. ZTNA user aur device verify karta hai aur broker ke through unhe ek application se jodta hai, aam taur par outbound-only connector ke saath, isliye network exposed nahi hota. Kaho ki dono MFA use kar sakte hain aur kai companies move ke dauran dono chalati hain.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>Aap yeh kar paane chahiye:</b></p>
<ul>
<li>Policy-based VPN samjhao: VPN option wala rule, protected networks, aur encapsulation se pehle no NAT.</li>
<li>Apply aur Enforce VPN batao.</li>
<li>Gateway, site aur profile define karo, aur aisa gateway address pakdo jo engine ka nahi hai.</li>
<li>Pune se HQ tunnel banao aur dono engines par install karo (fp-vpn-1).</li>
<li>VPN up, traffic nahi diagnose karo: galat protected networks (fp-vpn-2).</li>
<li>Probes ke saath Multi-Link standby ya balance set karo aur failover prove karo (fp-vpn-3).</li>
<li>MFA chahiye wala remote access login user ko enrol karke aur policy install karke theek karo (fp-vpn-4).</li>
<li>Inbound Multi-Link, SD-WAN, SASE aur ZTNA ko concepts ke roop mein batao.</li>
</ul>
<dl class="terms">
<dt>Gateway</dt><dd>Engine address jahan tunnel end hota hai.</dd>
<dt>Protected network</dt><dd>Gateway ke peeche ka network jo tunnel use kar sakta hai.</dd>
<dt>Profile</dt><dd>Encryption, hash, DH group, authentication aur lifetime settings.</dd>
<dt>Probe</dt><dd>Link ke through ISP ke aage ke target tak reachability test.</dd>
<dt>MFA</dt><dd>Do ya zyada factor families se login.</dd>
<dt>ZTNA</dt><dd>User aur device verify karke per-application access.</dd>
</dl>
<div class="exam"><p><b>Most tested facts.</b> Dono engines same profile aur key install karte hain. Tunnel up ka matlab traffic chalta hai, aisa nahi. Tunnel se pehle NAT traffic ko tunnel se hata deta hai. Standby pehla alive link use karta hai; balance saare alive links. Probe ke bina dead ISP link use mein rehta hai. Har lab sahi engine ya engines par Install Policy ke baad hi pass hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SASE security ko cloud edge par le jaata hai; ZTNA per-application access deta hai.</li>
<li>Dono yahan concepts hain; labs ke principles phir bhi lagte hain.</li>
<li>Kisi bhi VPN fault ke liye protected networks, rule, NAT aur dono engines par install check karo.</li>
<li>Probes failover ko real banate hain; MFA remote login ko safe banata hai.</li>
<li>Release-specific details ke liye check the documentation for your NGFW version.</li>
</ul></div>
`}};export{e as default};