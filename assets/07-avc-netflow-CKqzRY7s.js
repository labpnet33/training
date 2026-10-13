var e={id:`avc-netflow`,h:{en:`AVC, NBAR2 and the flexible NetFlow monitor`,hi:`AVC, NBAR2 aur flexible NetFlow monitor`},body:{en:`
<p>A security guard at a building entrance can check the colour of your badge (that is DSCP: a label you wear) or open your bag and see what you really carry (that is deep packet inspection). A badge can lie. The bag cannot. <b>AVC</b> (Application Visibility and Control) is the bag check for network traffic: the controller looks inside the flow, recognises the application, and then you can <b>see</b> it and <b>act</b> on it.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>NBAR2</dt><dd>Next-generation Network-Based Application Recognition: the engine that inspects packets and names the application (rtp-audio, ms-teams, webex-meeting, sip, ssh...). It is updated with <b>protocol packs</b> because applications change.</dd>
<dt>Flexible NetFlow</dt><dd>The export framework: a <b>flow record</b> (which fields identify and describe a flow), an optional <b>exporter</b> (where the data goes, for example a collector), and a <b>flow monitor</b> that ties a record to a cache and is applied in a direction.</dd>
<dt>wireless-avc-basic</dt><dd>The predefined flow monitor on the 9800. Attaching it to a policy profile turns on application recognition for the clients of that profile.</dd>
<dt>Visibility and control</dt><dd>Visibility = see which applications run. Control = use the recognised application in a class-map (<code>match protocol</code>) to mark, or in a real deployment to rate limit or drop.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AVC pipeline">
<rect x="20" y="60" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="75" y="93" text-anchor="middle" class="svg-ink" font-size="13">client flow</text>
<rect x="170" y="60" width="130" height="56" rx="8" fill="#bae6fd"/><text x="235" y="86" text-anchor="middle" class="svg-ink" font-size="13">NBAR2</text><text x="235" y="104" text-anchor="middle" class="svg-muted" font-size="12">names the app</text>
<rect x="340" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="50" text-anchor="middle" class="svg-ink" font-size="13">class-map</text>
<rect x="340" y="110" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="132" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="405" y="150" text-anchor="middle" class="svg-muted" font-size="12">record, export</text>
<rect x="510" y="20" width="110" height="50" rx="8" fill="#fed7aa"/><text x="565" y="50" text-anchor="middle" class="svg-ink" font-size="13">set dscp</text>
<rect x="510" y="110" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="132" text-anchor="middle" class="svg-ink" font-size="13">collector</text><text x="565" y="150" text-anchor="middle" class="svg-muted" font-size="12">concept only</text>
<line x1="130" y1="88" x2="170" y2="88" stroke="#64748b" stroke-width="2"/><line x1="300" y1="80" x2="340" y2="48" stroke="#64748b" stroke-width="2"/><line x1="300" y1="96" x2="340" y2="132" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="510" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="510" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Recognition feeds both control (marking) and visibility (statistics).</text>
</svg><p class="cap">NBAR2 recognises the application; the class-map uses it for marking, the monitor for visibility.</p></div>

<h3>Enable it on the policy profile</h3>
<p>The monitor is applied per direction. <b>Input</b> sees traffic from the clients, <b>output</b> sees traffic toward them. The policy profile must be shut while you edit it.</p>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 ipv4 flow monitor wireless-avc-basic input
 ipv4 flow monitor wireless-avc-basic output
 no shutdown
 exit</pre>
<p>Remove with <code>no ipv4 flow monitor wireless-avc-basic input</code>. In the lab only the predefined <code>wireless-avc-basic</code> exists. Any other name is refused with a message that custom flexible NetFlow records and exporters are <b>concept only</b>. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS &gt; Policy profile QoS &gt; AVC monitor</b> (ingress and egress).</p>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF
...
QOS Service Policy
  Input Policy Name              : VOICE-MARK
  Output Policy Name             : (none)
AVC (flexible NetFlow monitor)
  <span class="hl">Ingress Monitor                : wireless-avc-basic</span>
  Egress Monitor                 : (none)
mDNS
  Service Policy                 : (none)</pre>

<h3>The link between AVC and a protocol class</h3>
<p>This is the single most tested behaviour of the lab. A class with <code>match protocol rtp-audio</code> can only hit when the monitor is on <b>in the same direction</b> as the service-policy. If the monitor is missing, NBAR2 has not named the application, so the class never matches, and the trace says so:</p>
<pre class="out">  2. Controller WLC1 (input policy VOICE-MARK): policy-map VOICE-MARK: no class matched (a match protocol class needs the AVC flow monitor wireless-avc-basic on this direction of the policy profile)</pre>
<p>A <code>match dscp</code> class works without the monitor because DSCP is already in the header. Choose the classifier by the question: "do I trust the label?" (DSCP) or "do I need to know the real application?" (protocol).</p>

<h3>What is real and what is concept only</h3>
<table class="cmp"><tr><th>Topic</th><th>In the lab</th></tr>
<tr><td>predefined wireless-avc-basic, both directions</td><td>modelled, round-trips in the running config</td></tr>
<tr><td>match protocol classes using recognition</td><td>modelled (needs the monitor)</td></tr>
<tr><td>per-application statistics (bytes, packets, top talkers)</td><td><b>concept only</b>: the lab shows no counters</td></tr>
<tr><td>custom flow records, exporters, collectors, NBAR protocol pack updates</td><td><b>concept only</b></td></tr>
<tr><td>AVC rate limiting and dropping by application</td><td><b>concept only</b></td></tr></table>
<p>On real equipment the statistics are visible in the controller's monitoring pages and in Catalyst Center assurance, and a protocol pack can be upgraded without a full image change. Exact output text is not simulated here.</p>

<div class="eg"><p><b>Worked example.</b> A branch has Teams, Webex and a video streaming site. With AVC on, the dashboard reports that streaming uses 40 percent of the bytes. The team writes a policy-map: class TEAMS-WEBEX matches protocol ms-teams and webex-meeting and sets EF/AF41 as designed; class STREAMING (concept) would be lowered to CS1. Without AVC they could only guess from ports, and encrypted applications on port 443 all look identical.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Writing a perfect protocol class and forgetting the flow monitor.</li>
<li>Enabling the monitor on the wrong direction (input for a downstream policy).</li>
<li>Editing the policy profile while it is enabled.</li>
<li>Forgetting that recognition adds CPU work: enable AVC where you need it.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> AVC is <b>NBAR2 plus flexible NetFlow</b>. The monitor does not mark by itself; marking is done by the policy-map. And encrypted traffic is recognised by patterns and metadata, not by reading the payload.</p></div>

<div class="scn"><h4>The class that never hit</h4><p>An engineer sees DSCP 0 upstream even though the VOICE-MARK class matches rtp-audio. <code>show policy-map VOICE-MARK</code> is right and the policy is on input. The detailed policy profile output shows Ingress Monitor: (none). Adding <code>ipv4 flow monitor wireless-avc-basic input</code> (policy shut first) made the class match and the trace showed DSCP 46.</p><p><b>Lesson:</b> a protocol class and the AVC monitor are a pair.</p></div>

<div class="iv"><p class="q">"What is AVC and how does it relate to QoS?"</p><p>AVC uses NBAR2 for deep packet inspection and flexible NetFlow to report. For QoS, the recognised application becomes a match protocol class, so you can mark by application instead of trusting the client. On the 9800 you enable it with ipv4 flow monitor wireless-avc-basic on the policy profile in the right direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AVC = NBAR2 recognition plus flexible NetFlow reporting.</li>
<li>wireless-avc-basic is the predefined monitor; attach it per direction.</li>
<li>match protocol needs the monitor on that direction; match dscp does not.</li>
<li>The policy profile must be shut while you change monitor or policy.</li>
<li>Per-application statistics and custom records are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Building ke entrance par security guard aapke badge ka rang dekh sakta hai (yeh DSCP hai: ek label jo aap pehente ho) ya aapka bag khol kar dekh sakta hai ki aap asal mein kya le ja rahe ho (yeh deep packet inspection hai). Badge jhooth bol sakta hai. Bag nahi. <b>AVC</b> (Application Visibility and Control) network traffic ka bag check hai: controller flow ke andar dekhta hai, application pehchanta hai, aur phir aap use <b>dekh</b> sakte ho aur uspar <b>action</b> le sakte ho.</p>

<h3>Hisse</h3>
<dl class="terms">
<dt>NBAR2</dt><dd>Next-generation Network-Based Application Recognition: woh engine jo packets inspect karke application ka naam batata hai (rtp-audio, ms-teams, webex-meeting, sip, ssh...). Applications badalte rehte hain isliye isse <b>protocol packs</b> se update karte hain.</dd>
<dt>Flexible NetFlow</dt><dd>Export framework: ek <b>flow record</b> (kaun se fields flow ko pehchante aur describe karte hain), ek optional <b>exporter</b> (data kahan jaata hai, jaise collector), aur ek <b>flow monitor</b> jo record ko cache se jodta hai aur ek direction mein lagta hai.</dd>
<dt>wireless-avc-basic</dt><dd>9800 par predefined flow monitor. Ise policy profile par lagane se us profile ke clients ke liye application recognition on ho jaati hai.</dd>
<dt>Visibility aur control</dt><dd>Visibility = dekhna ki kaun si applications chal rahi hain. Control = recognised application ko class-map mein (<code>match protocol</code>) mark karne ke liye use karna, ya real deployment mein rate limit ya drop karne ke liye.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AVC pipeline">
<rect x="20" y="60" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="75" y="93" text-anchor="middle" class="svg-ink" font-size="13">client flow</text>
<rect x="170" y="60" width="130" height="56" rx="8" fill="#bae6fd"/><text x="235" y="86" text-anchor="middle" class="svg-ink" font-size="13">NBAR2</text><text x="235" y="104" text-anchor="middle" class="svg-muted" font-size="12">app ka naam</text>
<rect x="340" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="50" text-anchor="middle" class="svg-ink" font-size="13">class-map</text>
<rect x="340" y="110" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="132" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="405" y="150" text-anchor="middle" class="svg-muted" font-size="12">record, export</text>
<rect x="510" y="20" width="110" height="50" rx="8" fill="#fed7aa"/><text x="565" y="50" text-anchor="middle" class="svg-ink" font-size="13">set dscp</text>
<rect x="510" y="110" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="132" text-anchor="middle" class="svg-ink" font-size="13">collector</text><text x="565" y="150" text-anchor="middle" class="svg-muted" font-size="12">concept only</text>
<line x1="130" y1="88" x2="170" y2="88" stroke="#64748b" stroke-width="2"/><line x1="300" y1="80" x2="340" y2="48" stroke="#64748b" stroke-width="2"/><line x1="300" y1="96" x2="340" y2="132" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="510" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="510" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Recognition control (marking) aur visibility (statistics) dono ko feed karti hai.</text>
</svg><p class="cap">NBAR2 application pehchanta hai; class-map use marking ke liye, monitor visibility ke liye use karta hai.</p></div>

<h3>Policy profile par enable karo</h3>
<p>Monitor per direction lagta hai. <b>Input</b> clients se aane wala traffic dekhta hai, <b>output</b> unki taraf jaane wala. Edit karte waqt policy profile shut hona chahiye.</p>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 ipv4 flow monitor wireless-avc-basic input
 ipv4 flow monitor wireless-avc-basic output
 no shutdown
 exit</pre>
<p>Hatane ke liye <code>no ipv4 flow monitor wireless-avc-basic input</code>. Lab mein sirf predefined <code>wireless-avc-basic</code> exist karta hai. Koi aur naam refuse hota hai is message ke saath ki custom flexible NetFlow records aur exporters <b>concept only</b> hain. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS &gt; Policy profile QoS &gt; AVC monitor</b> (ingress aur egress).</p>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF
...
QOS Service Policy
  Input Policy Name              : VOICE-MARK
  Output Policy Name             : (none)
AVC (flexible NetFlow monitor)
  <span class="hl">Ingress Monitor                : wireless-avc-basic</span>
  Egress Monitor                 : (none)
mDNS
  Service Policy                 : (none)</pre>

<h3>AVC aur protocol class ka rishta</h3>
<p>Yeh lab ka sabse zyada test hone wala behaviour hai. <code>match protocol rtp-audio</code> wali class tabhi hit kar sakti hai jab monitor service-policy ki <b>same direction</b> mein on ho. Monitor na ho to NBAR2 ne application ka naam nahi diya, isliye class kabhi match nahi karti, aur trace yahi kehta hai:</p>
<pre class="out">  2. Controller WLC1 (input policy VOICE-MARK): policy-map VOICE-MARK: no class matched (a match protocol class needs the AVC flow monitor wireless-avc-basic on this direction of the policy profile)</pre>
<p><code>match dscp</code> class monitor ke bina chalti hai kyunki DSCP header mein pehle se hai. Classifier sawaal se chuno: "kya main label par bharosa karta hoon?" (DSCP) ya "mujhe asli application jaanni hai?" (protocol).</p>

<h3>Kya real hai aur kya concept only</h3>
<table class="cmp"><tr><th>Topic</th><th>Lab mein</th></tr>
<tr><td>predefined wireless-avc-basic, dono directions</td><td>modelled, running config mein round-trip</td></tr>
<tr><td>recognition use karne wali match protocol classes</td><td>modelled (monitor chahiye)</td></tr>
<tr><td>per-application statistics (bytes, packets, top talkers)</td><td><b>concept only</b>: lab koi counters nahi dikhata</td></tr>
<tr><td>custom flow records, exporters, collectors, NBAR protocol pack updates</td><td><b>concept only</b></td></tr>
<tr><td>application ke hisaab se AVC rate limiting aur dropping</td><td><b>concept only</b></td></tr></table>
<p>Real equipment par statistics controller ke monitoring pages aur Catalyst Center assurance mein dikhti hain, aur protocol pack ko poori image change ke bina upgrade kar sakte hain. Exact output text yahan simulate nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch mein Teams, Webex aur ek video streaming site hai. AVC on karne par dashboard batata hai ki streaming 40 percent bytes use karti hai. Team policy-map likhti hai: class TEAMS-WEBEX protocol ms-teams aur webex-meeting match karti hai aur design ke mutabiq EF/AF41 set karti hai; class STREAMING (concept) ko CS1 tak girana hota. AVC ke bina woh sirf ports se andaza lagate, aur port 443 par encrypted applications sab ek jaisi dikhti hain.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Perfect protocol class likhna aur flow monitor bhool jaana.</li>
<li>Monitor galat direction mein lagana (downstream policy ke liye input).</li>
<li>Policy profile enabled hone par edit karna.</li>
<li>Yeh bhoolna ki recognition CPU kaam badhata hai: AVC wahan on karo jahan zaroorat ho.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> AVC <b>NBAR2 plus flexible NetFlow</b> hai. Monitor khud mark nahi karta; marking policy-map karti hai. Aur encrypted traffic patterns aur metadata se pehchana jaata hai, payload padhkar nahi.</p></div>

<div class="scn"><h4>Woh class jo kabhi hit nahi hui</h4><p>Engineer upstream DSCP 0 dekhta hai jabki VOICE-MARK class rtp-audio match karti hai. <code>show policy-map VOICE-MARK</code> sahi hai aur policy input par hai. Detailed policy profile output mein Ingress Monitor: (none) dikhta hai. <code>ipv4 flow monitor wireless-avc-basic input</code> jodne (pehle policy shut karke) se class match hui aur trace mein DSCP 46 dikha.</p><p><b>Lesson:</b> protocol class aur AVC monitor ek jodi hain.</p></div>

<div class="iv"><p class="q">"AVC kya hai aur QoS se kaise judta hai?"</p><p>AVC deep packet inspection ke liye NBAR2 aur reporting ke liye flexible NetFlow use karta hai. QoS ke liye recognised application match protocol class ban jaati hai, isliye aap client par bharosa karne ke bajaye application ke hisaab se mark kar sakte ho. 9800 par policy profile par sahi direction mein ipv4 flow monitor wireless-avc-basic se enable karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AVC = NBAR2 recognition plus flexible NetFlow reporting.</li>
<li>wireless-avc-basic predefined monitor hai; per direction attach karo.</li>
<li>match protocol ko us direction par monitor chahiye; match dscp ko nahi.</li>
<li>Monitor ya policy badalte waqt policy profile shut hona chahiye.</li>
<li>Per-application statistics aur custom records lab mein concept only hain.</li>
</ul></div>
`}};export{e as default};