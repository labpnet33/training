var e={id:`policy-anatomy`,h:{en:`Policy anatomy: lists, sequences, apply-policy and direction`,hi:`Policy anatomy: lists, sequences, apply-policy aur direction`},body:{en:`
<p>Before we write a single match or action, you need the skeleton that every centralized policy shares. Once you can read this skeleton, every policy in this module (and the ones in the QoS and security modules) looks familiar.</p>

<h3>Analogy: a sorting office with rules</h3>
<p>Imagine a courier sorting office. You pin a rule sheet on the wall: "<i>For the Pune and Nashik branches (WHO), for the finance department (WHICH TRAFFIC CLASS), if a parcel is marked urgent (MATCH), send it by air (ACTION), otherwise send it by road (DEFAULT)</i>". A centralized policy is that rule sheet. It has three layers: <b>lists</b> (the named groups you refer to), the <b>policy definition</b> (sequences with match and action), and the <b>apply-policy</b> statement (which sites the sheet is pinned in, and in which direction).</p>

<h3>Layer 1: lists</h3>
<p>Lists give names to groups so that a policy stays readable. The ones you will use in this module:</p>
<dl class="terms">
<dt>site-list</dt><dd>A set of site IDs. This answers "<b>where</b> is the policy applied?" (for example site 200 = Pune).</dd>
<dt>vpn-list</dt><dd>A set of service VPNs (VRFs), for example VPN 10. The policy only touches traffic in these VPNs.</dd>
<dt>app-list</dt><dd>A set of applications or application families recognised by the deep-packet-inspection engine on the edge (for example webex-meeting).</dd>
<dt>data-prefix-list</dt><dd>IP prefixes used to match source or destination addresses in a <i>data</i> policy. Do not confuse it with <code>prefix-list</code>, which is for control policy.</dd>
<dt>color-list / tloc-list</dt><dd>Sets of colors or TLOCs used in actions such as set local-tloc or preferred-color.</dd>
<dt>sla-class</dt><dd>Not a list, but a named set of loss, latency and jitter limits that an app-route policy refers to (chapter 6).</dd>
</dl>

<h3>Layer 2: the policy definition</h3>
<p>A data policy is built from <b>sequences</b>, evaluated from the lowest number to the highest. Each sequence has a <b>match</b> (what the packet looks like) and an <b>action</b> (what to do). The first sequence that matches wins and evaluation stops. At the end there is a <b>default-action</b> for packets that matched nothing. For a data policy the default is drop unless you say otherwise, which is why almost every real policy ends with <code>default-action accept</code>.</p>

<h3>Layer 3: apply-policy</h3>
<p>A policy does nothing until it is applied with <code>apply-policy</code>. Data policies are attached to a <b>site-list with a direction</b>; app-route policies are attached to a site-list with no direction.</p>
<pre class="code"><span class="c">! on the Controller (VSMART), in CLI form</span>
policy
 lists
  site-list PUNE
   site-id 200
  vpn-list CORP
   vpn 10
  app-list VOICE-APPS
   app webex-meeting
   app ms-teams-audio
  data-prefix-list DC-NET
   ip-prefix 10.100.0.0/24
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     destination-data-prefix-list DC-NET
    action accept
   default-action accept
apply-policy
 site-list PUNE
  data-policy DP-PUNE from-service
  app-route-policy AAR-PUNE</pre>

<h3>Direction: from-service, from-tunnel, all</h3>
<p>Every WAN Edge has two "sides". The <b>service side</b> faces the LAN (VPN 10 interfaces). The <b>tunnel side</b> faces the overlay (the IPsec tunnels in VPN 0). Direction tells the edge which packets the data policy looks at:</p>
<ul>
<li><b>from-service</b>: packets that <b>enter the edge from the LAN</b>, before they are sent anywhere. This is the most common choice: marking DSCP, choosing a TLOC, DIA with NAT, drop rules for local users.</li>
<li><b>from-tunnel</b>: packets that <b>arrive from the overlay</b> and are about to be delivered to the LAN. Used, for example, to re-mark or count return traffic, or to filter what a remote site may send into this site.</li>
<li><b>all</b>: both of the above. Use it sparingly.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Directions of a data policy on a WAN Edge">
<rect x="20" y="70" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="13">LAN (VPN 10)</text>
<rect x="240" y="55" width="160" height="90" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">WAN Edge</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">E-BR1</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">Overlay tunnels</text>
<line x1="140" y1="88" x2="240" y2="88" stroke="#64748b" stroke-width="3"/><text x="190" y="80" text-anchor="middle" class="svg-accent" font-size="12">from-service</text>
<line x1="400" y1="112" x2="500" y2="112" stroke="#64748b" stroke-width="3"/><text x="450" y="132" text-anchor="middle" class="svg-accent" font-size="12">toward tunnel</text>
<line x1="500" y1="88" x2="400" y2="88" stroke="#64748b" stroke-width="3"/><text x="450" y="80" text-anchor="middle" class="svg-accent" font-size="12">from-tunnel</text>
<line x1="240" y1="112" x2="140" y2="112" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">from-service looks at packets as they enter from the LAN; from-tunnel looks at packets as they arrive from the overlay.</p></div>

<p>An app-route policy has <b>no direction</b>. It only influences <b>outbound</b> traffic, the packets the edge is about to send into a tunnel, because that is the only moment a path choice exists.</p>

<h3>How a policy travels</h3>
<ol>
<li>You build and <b>activate</b> the centralized policy in Manager (Configuration, Policies, Centralized Policy).</li>
<li>Manager pushes it to the <b>Controller</b> over the management connection.</li>
<li>The Controller sends the parts that concern each site (data and app-route policies) to those WAN Edges over their control connections. Control policy stays on the Controller and is applied there.</li>
<li>The WAN Edge enforces it in the data plane. <code>show sdwan policy from-vsmart</code> shows what was received.</li>
</ol>
<p>Only <b>one centralized policy</b> can be active at a time, so all sequences for topology, data and app-route live together.</p>

<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 direction from-service
 vpn-list CORP
  sequence 10
   match
    destination-data-prefix-list DC-NET
   action accept
  default-action accept
from-vsmart lists vpn-list CORP
 <span class="hl">vpn 10</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Overlapping site IDs: the same site ID must not appear in two site-lists that are applied for the same policy type, or the activation fails. (2) Wrong VPN: the vpn-list holds <i>service</i> VPNs; putting VPN 0 or 512 in it is a design error. (3) Applying a LAN-source policy <code>from-tunnel</code>, where it never sees a matching packet.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default action of a data policy is <b>drop</b>; the default action of an app-route policy is to continue with normal path selection. Forgetting <code>default-action accept</code> is how engineers black-hole a whole VPN with a policy meant for one application.</p></div>

<div class="scn"><h4>The policy that took the branch offline</h4><p>A junior engineer wrote a data policy "mark voice as DSCP 46" with one sequence that matched the voice app-list, and activated it for site 200. Within a minute Pune lost all non-voice traffic. The policy had no default-action, so every other packet fell into the implicit drop. The engineer deactivated the policy, added <code>default-action accept</code> and activated again. Counters on <code>show sdwan policy data-policy-filter</code> then showed the voice sequence increasing and everything else flowing.</p><p><b>Lesson:</b> a data policy is an allow-list until you say otherwise. Always finish with an explicit default-action.</p></div>

<div class="iv"><p class="q">"Explain the difference between from-service and from-tunnel in a centralized data policy."</p><p>from-service applies to packets coming from the LAN side into the edge, typically before they are encapsulated; from-tunnel applies to packets arriving from the overlay going to the LAN; all covers both. Mention that app-route policy has no direction and only affects outbound traffic, and give one example for each direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy = lists + definition (sequences with match and action) + apply-policy.</li>
<li>Sequences are evaluated lowest to highest; first match wins; the default-action catches the rest.</li>
<li>Data policies are applied to a site-list with from-service, from-tunnel or all; app-route policies have no direction.</li>
<li>Manager activates the policy, the Controller distributes it, the WAN Edge enforces it.</li>
<li>Verify the received copy with <code>show sdwan policy from-vsmart</code>.</li>
</ul></div>
`,hi:`
<p>Koi bhi match ya action likhne se pehle aapko woh skeleton chahiye jo har centralized policy mein common hota hai. Jab aap yeh skeleton padh sakoge, is module ki (aur QoS aur security modules ki) har policy jaani-pehchani lagegi.</p>

<h3>Analogy: rules wala sorting office</h3>
<p>Ek courier sorting office socho. Aap deewar par rule sheet lagate ho: "<i>Pune aur Nashik branches ke liye (KAHAN), finance department ke liye (KAUNSA TRAFFIC), agar parcel urgent mark hai (MATCH), to air se bhejo (ACTION), warna road se (DEFAULT)</i>". Centralized policy wahi rule sheet hai. Isme teen layers hain: <b>lists</b> (naam wale groups jinhe aap refer karte ho), <b>policy definition</b> (match aur action wale sequences), aur <b>apply-policy</b> statement (sheet kin sites par lagi hai, aur kis direction mein).</p>

<h3>Layer 1: lists</h3>
<p>Lists groups ko naam deti hain taaki policy readable rahe. Is module mein aap yeh use karoge:</p>
<dl class="terms">
<dt>site-list</dt><dd>Site IDs ka set. Yeh jawab deta hai "policy <b>kahan</b> lagi hai?" (jaise site 200 = Pune).</dd>
<dt>vpn-list</dt><dd>Service VPNs (VRFs) ka set, jaise VPN 10. Policy sirf in VPNs ke traffic ko chhuti hai.</dd>
<dt>app-list</dt><dd>Applications ya application families ka set jinhe edge ka deep-packet-inspection engine pehchanta hai (jaise webex-meeting).</dd>
<dt>data-prefix-list</dt><dd><i>Data</i> policy mein source ya destination addresses match karne ke liye IP prefixes. Ise <code>prefix-list</code> se confuse mat karo, woh control policy ke liye hai.</dd>
<dt>color-list / tloc-list</dt><dd>Colors ya TLOCs ke sets jo set local-tloc ya preferred-color jaise actions mein use hote hain.</dd>
<dt>sla-class</dt><dd>List nahi hai, lekin loss, latency aur jitter limits ka naam wala set hai jise app-route policy refer karti hai (chapter 6).</dd>
</dl>

<h3>Layer 2: policy definition</h3>
<p>Data policy <b>sequences</b> se bani hoti hai, jo sabse chhote number se sabse bade tak evaluate hote hain. Har sequence mein ek <b>match</b> (packet kaisa dikhta hai) aur ek <b>action</b> (kya karna hai) hota hai. Jo pehla sequence match kare woh jeet jaata hai aur evaluation ruk jaata hai. Ant mein un packets ke liye ek <b>default-action</b> hota hai jo kisi se match nahi hue. Data policy mein default drop hota hai jab tak aap kuch aur na kaho, isliye lagbhag har real policy <code>default-action accept</code> par khatam hoti hai.</p>

<h3>Layer 3: apply-policy</h3>
<p>Policy tab tak kuch nahi karti jab tak <code>apply-policy</code> se apply na ho. Data policies <b>direction ke saath site-list</b> par lagti hain; app-route policies bina direction ke site-list par lagti hain.</p>
<pre class="code"><span class="c">! on the Controller (VSMART), in CLI form</span>
policy
 lists
  site-list PUNE
   site-id 200
  vpn-list CORP
   vpn 10
  app-list VOICE-APPS
   app webex-meeting
   app ms-teams-audio
  data-prefix-list DC-NET
   ip-prefix 10.100.0.0/24
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     destination-data-prefix-list DC-NET
    action accept
   default-action accept
apply-policy
 site-list PUNE
  data-policy DP-PUNE from-service
  app-route-policy AAR-PUNE</pre>

<h3>Direction: from-service, from-tunnel, all</h3>
<p>Har WAN Edge ke do "sides" hote hain. <b>Service side</b> LAN (VPN 10 interfaces) ki taraf hai. <b>Tunnel side</b> overlay (VPN 0 ke IPsec tunnels) ki taraf hai. Direction edge ko batati hai ki data policy kaunse packets dekhe:</p>
<ul>
<li><b>from-service</b>: woh packets jo <b>LAN se edge mein aate hain</b>, kahin bheje jaane se pehle. Sabse common choice: DSCP marking, TLOC chunna, NAT wala DIA, local users ke liye drop rules.</li>
<li><b>from-tunnel</b>: woh packets jo <b>overlay se aate hain</b> aur LAN ko deliver hone wale hain. Jaise return traffic re-mark ya count karna, ya filter karna ki remote site is site mein kya bhej sakta hai.</li>
<li><b>all</b>: upar ke dono. Kam use karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="WAN Edge par data policy ki directions">
<rect x="20" y="70" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="13">LAN (VPN 10)</text>
<rect x="240" y="55" width="160" height="90" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">WAN Edge</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">E-BR1</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">Overlay tunnels</text>
<line x1="140" y1="88" x2="240" y2="88" stroke="#64748b" stroke-width="3"/><text x="190" y="80" text-anchor="middle" class="svg-accent" font-size="12">from-service</text>
<line x1="400" y1="112" x2="500" y2="112" stroke="#64748b" stroke-width="3"/><text x="450" y="132" text-anchor="middle" class="svg-accent" font-size="12">tunnel ki taraf</text>
<line x1="500" y1="88" x2="400" y2="88" stroke="#64748b" stroke-width="3"/><text x="450" y="80" text-anchor="middle" class="svg-accent" font-size="12">from-tunnel</text>
<line x1="240" y1="112" x2="140" y2="112" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">from-service un packets ko dekhta hai jo LAN se edge mein enter karte hain; from-tunnel un packets ko jo overlay se aate hain.</p></div>

<p>App-route policy ki <b>koi direction nahi</b> hoti. Woh sirf <b>outbound</b> traffic ko influence karti hai, yaani woh packets jo edge tunnel mein bhejne wala hai, kyunki path choice usi pal par hota hai.</p>

<h3>Policy ka safar</h3>
<ol>
<li>Aap Manager mein centralized policy banate aur <b>activate</b> karte ho (Configuration, Policies, Centralized Policy).</li>
<li>Manager use management connection se <b>Controller</b> ko push karta hai.</li>
<li>Controller har site se related hisse (data aur app-route policies) un WAN Edges ko control connections par bhejta hai. Control policy Controller par rehti hai aur wahin apply hoti hai.</li>
<li>WAN Edge use data plane mein enforce karta hai. <code>show sdwan policy from-vsmart</code> dikhata hai ki kya mila.</li>
</ol>
<p>Ek samay mein sirf <b>ek centralized policy</b> active ho sakti hai, isliye topology, data aur app-route ke saare sequences ek saath rehte hain.</p>

<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 direction from-service
 vpn-list CORP
  sequence 10
   match
    destination-data-prefix-list DC-NET
   action accept
  default-action accept
from-vsmart lists vpn-list CORP
 <span class="hl">vpn 10</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Overlapping site IDs: ek hi site ID do site-lists mein nahi hona chahiye jo same policy type ke liye apply ho, warna activation fail hota hai. (2) Galat VPN: vpn-list mein <i>service</i> VPNs hote hain; VPN 0 ya 512 daalna design error hai. (3) LAN-source policy ko <code>from-tunnel</code> par lagana, jahan use koi matching packet kabhi nahi milta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Data policy ka default action <b>drop</b> hai; app-route policy ka default action normal path selection ke saath aage badhna hai. <code>default-action accept</code> bhoolna hi woh tareeka hai jisse engineers ek application ki policy se poora VPN black-hole kar dete hain.</p></div>

<div class="scn"><h4>Jis policy ne branch offline kar di</h4><p>Ek junior engineer ne "voice ko DSCP 46 mark karo" data policy likhi jisme sirf ek sequence tha jo voice app-list match karta tha, aur use site 200 ke liye activate kar diya. Ek minute ke andar Pune ka voice ke alawa saara traffic gir gaya. Policy mein default-action nahi tha, isliye baaki har packet implicit drop mein chala gaya. Engineer ne policy deactivate ki, <code>default-action accept</code> joda aur phir activate kiya. Phir <code>show sdwan policy data-policy-filter</code> ke counters mein voice sequence badhta dikha aur baaki sab traffic chalne laga.</p><p><b>Lesson:</b> data policy tab tak allow-list hai jab tak aap kuch aur na kaho. Hamesha explicit default-action se khatam karo.</p></div>

<div class="iv"><p class="q">"Centralized data policy mein from-service aur from-tunnel ka difference samjhao."</p><p>from-service un packets par lagta hai jo LAN side se edge mein aate hain, aam taur par encapsulate hone se pehle; from-tunnel un packets par jo overlay se LAN ki taraf aate hain; all dono ko cover karta hai. Batao ki app-route policy ki koi direction nahi hoti aur woh sirf outbound traffic ko affect karti hai, aur har direction ka ek example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy = lists + definition (match aur action wale sequences) + apply-policy.</li>
<li>Sequences lowest se highest evaluate hote hain; first match jeetta hai; default-action baaki ko pakadta hai.</li>
<li>Data policies site-list par from-service, from-tunnel ya all ke saath lagti hain; app-route policies ki direction nahi hoti.</li>
<li>Manager activate karta hai, Controller distribute karta hai, WAN Edge enforce karta hai.</li>
<li>Mila hua copy <code>show sdwan policy from-vsmart</code> se verify karo.</li>
</ul></div>
`}};export{e as default};