var e={id:`vpn-verification`,h:{en:`Verifying a VPN: the commands and what they tell you`,hi:`VPN verify karna: commands aur woh kya batate hain`},body:{en:`<p><b>Analogy.</b> A doctor checks pulse, temperature and blood pressure in a fixed order. Each reading rules something in or out. VPN verification works the same way: IKE, then IPsec, then routing, then policy, then traffic.</p>
<h3>The commands in order</h3>
<table class="cmp"><tr><th>Command</th><th>Question it answers</th></tr>
<tr><td><code>show security ike security-associations</code></td><td>Is phase 1 (the IKE SA) up? With whom, in which mode?</td></tr>
<tr><td><code>show security ipsec security-associations</code></td><td>Is phase 2 up? Which algorithms? Two SAs per tunnel?</td></tr>
<tr><td><code>show log kmd</code></td><td>Why did negotiation fail? (the IKE log)</td></tr>
<tr><td><code>show route DEST</code></td><td>Does traffic to DEST enter st0.N?</td></tr>
<tr><td><code>show security flow session</code></td><td>Is traffic flowing, and through which interfaces?</td></tr>
<tr><td><code>show security policies hit-count</code></td><td>Is the policy for the tunnel traffic being used?</td></tr></table>
<pre class="out">user@DELHI-SRX&gt; show security ike security-associations
Index   State  Initiator cookie  Responder cookie  Mode           Remote Address
1000    <span class="hl">UP</span>     36700698d13a9751  05338cd8889ea991  Main           198.51.100.2

user@DELHI-SRX&gt; show security ipsec security-associations
Total active tunnels: <span class="hl">1</span>     Total Ipsec sas: 2

user@DELHI-SRX&gt; show log kmd
Oct 10 06:51:23  DELHI-SRX kmd: IKE negotiation successful. VPN: VPN1 Gateway: GW1, Local: 203.0.113.2/500, Remote: 198.51.100.2/500</pre>
<p>When nothing is up, <code>show security ike security-associations</code> prints "No IKE security associations". The log then tells you which check failed, for example "No proposal chosen" (algorithm mismatch), "Authentication failed" (key or identity) or a message that the peer never answered.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Verification order"><rect x="6" y="40" width="96" height="50" rx="8" fill="#fde68a"/><text x="54" y="70" text-anchor="middle" class="svg-ink" font-size="12">IKE SA</text><rect x="112" y="40" width="96" height="50" rx="8" fill="#fde68a"/><text x="160" y="70" text-anchor="middle" class="svg-ink" font-size="12">IPsec SAs</text><rect x="218" y="40" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="266" y="70" text-anchor="middle" class="svg-ink" font-size="12">route</text><rect x="324" y="40" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="372" y="70" text-anchor="middle" class="svg-ink" font-size="12">zone + policy</text><rect x="430" y="40" width="96" height="50" rx="8" fill="#bae6fd"/><text x="478" y="70" text-anchor="middle" class="svg-ink" font-size="12">session</text><rect x="536" y="40" width="94" height="50" rx="8" fill="#e2e8f0"/><text x="583" y="70" text-anchor="middle" class="svg-ink" font-size="12">application</text></svg><p class="cap">Work left to right and stop at the first failure.</p></div>
<div class="eg"><p><b>Worked example.</b> IKE SA up, IPsec table has one tunnel, but ping fails. <code>show route</code> shows the default route towards the ISP: the route into st0.0 is missing. After adding it, <code>show security flow session</code> shows sessions whose Out interface is <code>st0.0</code> and the policy hit counts move.</p></div>
<div class="warn"><p><b>Common mistake.</b> Staring at the IKE SA and declaring the VPN "up". A VPN carries traffic only if phase 2, the route, the zone policies and the return path are all right.</p></div>
<div class="exam"><p><b>Exam trap.</b> You need <b>both</b> an IKE SA and IPsec SAs. The IKE SA being UP with no IPsec SAs means a phase 2 problem. The log is the place for the exact reason.</p></div>
<div class="scn"><h4>One command saved an hour</h4><p>A tunnel looked up on one firewall and down on the other. <code>show log kmd</code> on the down side said the peer's gateway was not found: its configuration still named the old public address of the head office after an ISP change.</p><p><b>Lesson:</b> read the log on both ends.</p></div>
<div class="iv"><p class="q">"How do you verify a site-to-site VPN?"</p><p>IKE SA, IPsec SAs, the IKE log for the reason when down, the route into st0.N, zone and policies in both directions, then sessions and hit counts for real traffic.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Check IKE, IPsec, route, policy, session in order.</li><li>show log kmd explains negotiation failures.</li><li>An IKE SA alone does not prove traffic works.</li></ul></div>`,hi:`<p><b>Analogy.</b> Doctor nabz, bukhaar aur blood pressure ek tay order mein dekhta hai. Har reading kuch ko rule in ya rule out karti hai. VPN verification bhi aise hi hai: IKE, phir IPsec, phir routing, phir policy, phir traffic.</p>
<h3>Commands order mein</h3>
<table class="cmp"><tr><th>Command</th><th>Kaunsa sawaal solve karta hai</th></tr>
<tr><td><code>show security ike security-associations</code></td><td>Kya phase 1 (IKE SA) up hai? Kiske saath, kaunse mode mein?</td></tr>
<tr><td><code>show security ipsec security-associations</code></td><td>Kya phase 2 up hai? Kaunse algorithms? Har tunnel ke do SAs?</td></tr>
<tr><td><code>show log kmd</code></td><td>Negotiation kyun fail hui? (IKE log)</td></tr>
<tr><td><code>show route DEST</code></td><td>Kya DEST ka traffic st0.N mein jata hai?</td></tr>
<tr><td><code>show security flow session</code></td><td>Kya traffic chal raha hai, aur kaunse interfaces se?</td></tr>
<tr><td><code>show security policies hit-count</code></td><td>Kya tunnel traffic ki policy use ho rahi hai?</td></tr></table>
<pre class="out">user@DELHI-SRX&gt; show security ike security-associations
Index   State  Initiator cookie  Responder cookie  Mode           Remote Address
1000    <span class="hl">UP</span>     36700698d13a9751  05338cd8889ea991  Main           198.51.100.2

user@DELHI-SRX&gt; show security ipsec security-associations
Total active tunnels: <span class="hl">1</span>     Total Ipsec sas: 2

user@DELHI-SRX&gt; show log kmd
Oct 10 06:51:23  DELHI-SRX kmd: IKE negotiation successful. VPN: VPN1 Gateway: GW1, Local: 203.0.113.2/500, Remote: 198.51.100.2/500</pre>
<p>Jab kuch up nahi hota, <code>show security ike security-associations</code> "No IKE security associations" print karta hai. Log phir batata hai kaunsi check fail hui, jaise "No proposal chosen" (algorithm mismatch), "Authentication failed" (key ya identity) ya yeh message ki peer ne kabhi jawab nahi diya.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Verification order"><rect x="6" y="40" width="96" height="50" rx="8" fill="#fde68a"/><text x="54" y="70" text-anchor="middle" class="svg-ink" font-size="12">IKE SA</text><rect x="112" y="40" width="96" height="50" rx="8" fill="#fde68a"/><text x="160" y="70" text-anchor="middle" class="svg-ink" font-size="12">IPsec SAs</text><rect x="218" y="40" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="266" y="70" text-anchor="middle" class="svg-ink" font-size="12">route</text><rect x="324" y="40" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="372" y="70" text-anchor="middle" class="svg-ink" font-size="12">zone + policy</text><rect x="430" y="40" width="96" height="50" rx="8" fill="#bae6fd"/><text x="478" y="70" text-anchor="middle" class="svg-ink" font-size="12">session</text><rect x="536" y="40" width="94" height="50" rx="8" fill="#e2e8f0"/><text x="583" y="70" text-anchor="middle" class="svg-ink" font-size="12">application</text></svg><p class="cap">Left se right chalo aur pehli failure par ruk jao.</p></div>
<div class="eg"><p><b>Worked example.</b> IKE SA up, IPsec table mein ek tunnel, lekin ping fail. <code>show route</code> ISP ki taraf default route dikhata hai: st0.0 ka route missing hai. Jodne ke baad <code>show security flow session</code> aise sessions dikhata hai jinka Out interface <code>st0.0</code> hai aur policy hit counts chalte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> IKE SA ko dekhkar VPN ko "up" keh dena. VPN traffic tabhi carry karta hai jab phase 2, route, zone policies aur return path sab sahi ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aapko IKE SA <b>aur</b> IPsec SAs dono chahiye. IKE SA UP ho aur IPsec SAs na hon to phase 2 ki problem hai. Exact reason ke liye log dekho.</p></div>
<div class="scn"><h4>Ek command ne ek ghanta bachaya</h4><p>Tunnel ek firewall par up aur doosre par down dikhta tha. Down side par <code>show log kmd</code> ne kaha ki peer ka gateway nahi mila: ISP change ke baad uski configuration mein head office ka purana public address tha.</p><p><b>Lesson:</b> dono ends par log padho.</p></div>
<div class="iv"><p class="q">"Site-to-site VPN verify kaise karte ho?"</p><p>IKE SA, IPsec SAs, down hone par reason ke liye IKE log, st0.N ka route, dono directions mein zone aur policies, phir asli traffic ke liye sessions aur hit counts.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IKE, IPsec, route, policy, session order mein check karo.</li><li>show log kmd negotiation failures samjhata hai.</li><li>Sirf IKE SA saabit nahi karta ki traffic chalta hai.</li></ul></div>`}};export{e as default};