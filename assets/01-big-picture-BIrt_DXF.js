var e={id:`big-picture`,h:{en:`FlexConnect: running a branch from a controller far away`,hi:`FlexConnect: door baithe controller se branch chalana`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why a branch office needs something different from the <b>local mode</b> access points you used at headquarters.</li>
<li>The four ideas behind FlexConnect: switching, authentication, association and standalone mode.</li>
<li>The 9800 objects that build it: <b>flex profile</b>, <b>site tag</b> (with <code>no local-site</code>), <b>policy profile</b> and <b>policy tag</b>.</li>
<li>How VLANs, the native VLAN, ACLs, local authentication, standalone mode, efficient AP upgrade and OEAP fit together.</li>
<li>How to design, verify and troubleshoot a branch, using the four labs of this module.</li>
</ul>
<p><b>Prerequisites.</b> You should already know the CAPWAP join process, the profile and tag model (module wl-control) and how a policy profile maps a WLAN to a VLAN (module wl-roaming). We refer back to them, we do not repeat them.</p>

<h3>An analogy: the franchise shop</h3>
<p>Imagine a head office in Mumbai and a small franchise shop in Pune. In the <b>local mode</b> model, every customer order in Pune is phoned to Mumbai, Mumbai decides, and Mumbai sends the goods back. It works when the phone line is fast and never fails. In the <b>FlexConnect</b> model the Pune manager is trained and trusted: he serves walk-in customers himself, calls Mumbai only for policy and reports, and keeps the shop open when the phone line is cut. The head office still writes the rules (the controller keeps one configuration for every branch), but the branch can act on them alone.</p>

<h3>The problem in network terms</h3>
<p>A local-mode AP builds a CAPWAP tunnel and sends <b>every client frame</b> through it to the controller, which places the client in a VLAN at headquarters. For a Pune laptop that wants the Pune file server, the packet travels Pune, WAN, Mumbai, WAN, Pune. Two WAN crossings for a conversation between two machines in the same room. Worse, if the provider circuit fails, the AP loses its controller and the branch has no Wi-Fi at all.</p>
<p>A <b>FlexConnect AP</b> solves both. It can switch client traffic <b>locally</b>, onto the branch VLAN of its own switch port, and it can keep working when the controller is unreachable. Documented limits differ by design: local mode expects a short round-trip time to the controller (around 100 ms), FlexConnect tolerates much longer links (around 300 ms). Treat these as figures to confirm in the release notes of your software version.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HQ Mumbai and Pune branch over a provider WAN">
<rect x="10" y="20" width="230" height="170" rx="10" fill="#e2e8f0"/><text x="125" y="40" text-anchor="middle" class="svg-ink" font-size="13">Mumbai HQ</text>
<rect x="30" y="55" width="80" height="34" rx="6" fill="#bae6fd"/><text x="70" y="77" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<rect x="130" y="55" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="175" y="77" text-anchor="middle" class="svg-ink" font-size="12">RAD1</text>
<rect x="30" y="110" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="70" y="132" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="130" y="110" width="90" height="34" rx="6" fill="#fde68a"/><text x="175" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP1 local</text>
<rect x="400" y="20" width="230" height="170" rx="10" fill="#e2e8f0"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text>
<rect x="420" y="55" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="520" y="55" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="12">RAD-PUN</text>
<rect x="420" y="110" width="90" height="34" rx="6" fill="#fed7aa"/><text x="465" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN1 flex</text>
<rect x="520" y="110" width="100" height="34" rx="6" fill="#fed7aa"/><text x="570" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2 flex</text>
<line x1="110" y1="127" x2="300" y2="127" stroke="#64748b" stroke-width="2"/><line x1="340" y1="127" x2="420" y2="72" stroke="#64748b" stroke-width="2"/>
<rect x="290" y="105" width="60" height="30" rx="15" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="12">provider WAN</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP control: Pune APs join WLC1 across the WAN. Client data stays in Pune.</text>
</svg><p class="cap">The lab topology: one controller in Mumbai, branch APs in Pune that join across the provider circuit.</p></div>

<h3>The four ideas of FlexConnect</h3>
<dl class="terms">
<dt>Switching</dt><dd>Where client frames go. <b>Central switching</b>: tunnelled to the controller. <b>Local switching</b>: put on the branch VLAN by the AP.</dd>
<dt>Authentication</dt><dd>Who checks the credentials. <b>Central authentication</b>: the controller talks to RADIUS. <b>Local authentication</b>: the AP does it, so it survives a dead WAN.</dd>
<dt>Association</dt><dd>Who answers the Wi-Fi association. Normally the AP in FlexConnect (local association); <code>central association</code> pushes it to the controller.</dd>
<dt>Standalone mode</dt><dd>What the AP does when the controller is unreachable: keep serving what it can serve alone.</dd>
</dl>

<h3>The objects, in one picture</h3>
<table class="cmp">
<tr><th>Object</th><th>Command</th><th>What it decides</th></tr>
<tr><td>Flex profile</td><td><code>wireless profile flex FLEX-PUNE</code></td><td>native VLAN, VLAN names and ids, ACLs, local auth group</td></tr>
<tr><td>Site tag</td><td><code>wireless tag site SITE-PUNE</code></td><td>links the flex profile; <code>no local-site</code> makes it a flex site</td></tr>
<tr><td>Policy profile</td><td><code>wireless profile policy PP-STAFF-PUN</code></td><td>VLAN, <code>no central switching</code>, authentication knobs</td></tr>
<tr><td>Policy tag</td><td><code>wireless tag policy PT-PUNE</code></td><td>which WLAN uses which policy at this site</td></tr>
</table>
<p>The web UI path for the flex objects is <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b>; the tags live under <b>Configuration &gt; Tags &amp; Profiles &gt; Tags</b>.</p>

<div class="note"><p><b>Honest note about the simulator.</b> The labs model the control-plane rules of FlexConnect and attach the client to a pseudo interface. The simulator applies the same VLAN placement, the rules that decide it are the real ones. Efficient AP upgrade, OEAP, split tunnelling and key caching are <b>concept only</b>: you will learn them, you will not configure them in a lab.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking FlexConnect is only "an AP mode you switch on". On the 9800 the mode comes from the <b>site tag</b>: a site tag that is still a local site keeps the AP in local mode, whatever flex profile you attach.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switching and authentication are two independent choices. A WLAN can be locally switched but centrally authenticated; that combination stops accepting new 802.1X clients the moment the WAN fails.</p></div>

<div class="scn"><h4>The hairpin through Mumbai</h4><p>A Pune team of 40 people used a locally mounted file server. Their Wi-Fi was served by local-mode APs on the Mumbai controller. Copying a 2 GB folder took ten minutes and saturated the WAN circuit, and on the day the provider had an outage nobody in Pune could even print. The engineer moved the branch to FlexConnect with local switching: file traffic stayed on the branch VLAN and the WAN carried only CAPWAP control.</p><p><b>Lesson:</b> FlexConnect keeps branch data in the branch and keeps branch Wi-Fi alive when the WAN is not.</p></div>

<div class="iv"><p class="q">"Why not just use local mode for a branch?"</p><p>Local mode tunnels all client traffic to the controller, so branch-to-branch-server traffic crosses the WAN twice and the branch has no Wi-Fi when the WAN fails. FlexConnect switches locally, tolerates higher latency and can run standalone. Mention that the cost is a more careful design of VLANs, native VLAN and authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FlexConnect lets a branch AP switch traffic and, optionally, authenticate locally.</li>
<li>The four ideas are switching, authentication, association and standalone mode.</li>
<li>Objects: flex profile, site tag with <code>no local-site</code>, policy profile, policy tag.</li>
<li>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex.</li>
<li>Some topics here are concept only in the simulator and are marked as such.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>Branch office ko headquarters ke <b>local mode</b> access points se alag cheez kyun chahiye.</li>
<li>FlexConnect ke char ideas: switching, authentication, association aur standalone mode.</li>
<li>9800 ke objects jo isse banate hain: <b>flex profile</b>, <b>site tag</b> (<code>no local-site</code> ke saath), <b>policy profile</b> aur <b>policy tag</b>.</li>
<li>VLANs, native VLAN, ACLs, local authentication, standalone mode, efficient AP upgrade aur OEAP kaise ek saath fit hote hain.</li>
<li>Is module ke chaar labs se branch ko design, verify aur troubleshoot kaise karna hai.</li>
</ul>
<p><b>Prerequisites.</b> Aapko CAPWAP join process, profile aur tag model (module wl-control) aur policy profile WLAN ko VLAN se kaise map karta hai (module wl-roaming) pehle se aana chahiye. Hum unka reference dete hain, dobara nahi padhate.</p>

<h3>Ek analogy: franchise shop</h3>
<p>Socho Mumbai mein head office hai aur Pune mein chhoti franchise shop. <b>Local mode</b> model mein Pune ka har customer order Mumbai ko phone hota hai, Mumbai decide karta hai aur saaman wapas bhejta hai. Yeh tab chalta hai jab phone line fast ho aur kabhi fail na ho. <b>FlexConnect</b> model mein Pune ka manager trained aur trusted hai: woh walk-in customers ko khud serve karta hai, Mumbai ko sirf policy aur reports ke liye phone karta hai, aur phone line kat jaye tab bhi shop khuli rakhta hai. Rules abhi bhi head office likhta hai (controller har branch ke liye ek hi configuration rakhta hai), lekin branch unpar akele act kar sakta hai.</p>

<h3>Network ki bhasha mein problem</h3>
<p>Local-mode AP CAPWAP tunnel banata hai aur <b>har client frame</b> usse controller tak bhejta hai, jo client ko headquarters ke VLAN mein rakhta hai. Pune laptop ko Pune file server chahiye to packet ka raasta hai Pune, WAN, Mumbai, WAN, Pune. Ek hi kamre ki do machines ki baat ke liye do baar WAN cross. Aur bura: provider circuit fail ho jaye to AP apna controller kho deta hai aur branch ka Wi-Fi poora band.</p>
<p>Ek <b>FlexConnect AP</b> dono problems solve karta hai. Woh client traffic ko <b>locally</b> switch kar sakta hai, apne switch port ke branch VLAN par, aur controller unreachable ho tab bhi kaam karta rehta hai. Documented limits design ke hisaab se alag hain: local mode controller tak chhota round-trip time maangta hai (lagbhag 100 ms), FlexConnect bahut lambe links tolerate karta hai (lagbhag 300 ms). Inhe apne software version ke release notes mein confirm karne wale figures samjho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HQ Mumbai aur Pune branch provider WAN par">
<rect x="10" y="20" width="230" height="170" rx="10" fill="#e2e8f0"/><text x="125" y="40" text-anchor="middle" class="svg-ink" font-size="13">Mumbai HQ</text>
<rect x="30" y="55" width="80" height="34" rx="6" fill="#bae6fd"/><text x="70" y="77" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<rect x="130" y="55" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="175" y="77" text-anchor="middle" class="svg-ink" font-size="12">RAD1</text>
<rect x="30" y="110" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="70" y="132" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="130" y="110" width="90" height="34" rx="6" fill="#fde68a"/><text x="175" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP1 local</text>
<rect x="400" y="20" width="230" height="170" rx="10" fill="#e2e8f0"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text>
<rect x="420" y="55" width="80" height="34" rx="6" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="520" y="55" width="100" height="34" rx="6" fill="#bbf7d0"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="12">RAD-PUN</text>
<rect x="420" y="110" width="90" height="34" rx="6" fill="#fed7aa"/><text x="465" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN1 flex</text>
<rect x="520" y="110" width="100" height="34" rx="6" fill="#fed7aa"/><text x="570" y="132" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2 flex</text>
<line x1="110" y1="127" x2="300" y2="127" stroke="#64748b" stroke-width="2"/><line x1="340" y1="127" x2="420" y2="72" stroke="#64748b" stroke-width="2"/>
<rect x="290" y="105" width="60" height="30" rx="15" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="12">provider WAN</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP control: Pune APs WAN ke upar WLC1 se join. Client data Pune mein rehta hai.</text>
</svg><p class="cap">Lab topology: Mumbai mein ek controller, Pune mein branch APs jo provider circuit ke upar join karte hain.</p></div>

<h3>FlexConnect ke char ideas</h3>
<dl class="terms">
<dt>Switching</dt><dd>Client frames kahan jaate hain. <b>Central switching</b>: controller tak tunnel. <b>Local switching</b>: AP unhe branch VLAN par rakhta hai.</dd>
<dt>Authentication</dt><dd>Credentials kaun check karta hai. <b>Central authentication</b>: controller RADIUS se baat karta hai. <b>Local authentication</b>: AP khud karta hai, isliye dead WAN mein bhi bachta hai.</dd>
<dt>Association</dt><dd>Wi-Fi association ka jawab kaun deta hai. FlexConnect mein normally AP (local association); <code>central association</code> use controller par dhakel deta hai.</dd>
<dt>Standalone mode</dt><dd>Controller unreachable ho to AP kya karta hai: jo woh akela serve kar sakta hai wahi serve karta rehta hai.</dd>
</dl>

<h3>Objects, ek hi picture mein</h3>
<table class="cmp">
<tr><th>Object</th><th>Command</th><th>Kya decide karta hai</th></tr>
<tr><td>Flex profile</td><td><code>wireless profile flex FLEX-PUNE</code></td><td>native VLAN, VLAN names aur ids, ACLs, local auth group</td></tr>
<tr><td>Site tag</td><td><code>wireless tag site SITE-PUNE</code></td><td>flex profile ko link karta hai; <code>no local-site</code> use flex site banata hai</td></tr>
<tr><td>Policy profile</td><td><code>wireless profile policy PP-STAFF-PUN</code></td><td>VLAN, <code>no central switching</code>, authentication knobs</td></tr>
<tr><td>Policy tag</td><td><code>wireless tag policy PT-PUNE</code></td><td>is site par kaunsa WLAN kaunsi policy use karega</td></tr>
</table>
<p>Flex objects ka web UI path hai <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b>; tags <b>Configuration &gt; Tags &amp; Profiles &gt; Tags</b> mein hain.</p>

<div class="note"><p><b>Simulator ke baare mein honest note.</b> Labs FlexConnect ke control-plane rules model karte hain aur client ko ek pseudo interface se attach karte hain. Simulator wahi VLAN placement lagata hai, use decide karne wale rules asli hain. Efficient AP upgrade, OEAP, split tunnelling aur key caching <b>concept only</b> hain: aap unhe seekhoge, lab mein configure nahi karoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> FlexConnect ko sirf "ek AP mode jo on kar do" samajhna. 9800 par mode <b>site tag</b> se aata hai: jo site tag abhi bhi local site hai woh AP ko local mode mein rakhta hai, chahe aap kitna bhi flex profile attach kar do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switching aur authentication do alag-alag choices hain. Ek WLAN locally switched lekin centrally authenticated ho sakta hai; yeh combination WAN fail hote hi naye 802.1X clients accept karna band kar deta hai.</p></div>

<div class="scn"><h4>Mumbai ke raste ka hairpin</h4><p>Pune ki 40 logon ki team local file server use karti thi. Unka Wi-Fi Mumbai controller ke local-mode APs se chalta tha. 2 GB folder copy hone mein das minute lagte aur WAN circuit saturate ho jata, aur jis din provider ka outage hua Pune mein koi print bhi nahi kar paya. Engineer ne branch ko local switching ke saath FlexConnect par move kiya: file traffic branch VLAN par raha aur WAN par sirf CAPWAP control gaya.</p><p><b>Lesson:</b> FlexConnect branch ka data branch mein rakhta hai aur WAN na ho tab bhi branch Wi-Fi zinda rakhta hai.</p></div>

<div class="iv"><p class="q">"Branch ke liye local mode kyun nahi use karte?"</p><p>Local mode sara client traffic controller tak tunnel karta hai, isliye branch-se-branch-server traffic WAN do baar cross karta hai aur WAN fail hone par branch mein Wi-Fi nahi rehta. FlexConnect locally switch karta hai, zyada latency tolerate karta hai aur standalone chal sakta hai. Bolo ki iski keemat VLANs, native VLAN aur authentication ke zyada careful design mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FlexConnect branch AP ko traffic locally switch karne aur optionally locally authenticate karne deta hai.</li>
<li>Char ideas: switching, authentication, association aur standalone mode.</li>
<li>Objects: flex profile, <code>no local-site</code> wala site tag, policy profile, policy tag.</li>
<li>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex.</li>
<li>Kuch topics simulator mein concept only hain aur waise hi mark kiye gaye hain.</li>
</ul></div>
`}};export{e as default};