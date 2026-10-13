var e={id:`verification`,h:{en:`Verification: policy, OMP routes and TLOCs`,hi:`Verification: policy, OMP routes aur TLOCs`},body:{en:`
<p>After activation, verify in this order: <b>(1)</b> is the policy on the Controller and applied; <b>(2)</b> what do the edges learn (TLOCs and routes); <b>(3)</b> did the data plane react (BFD sessions, next hop, traffic path). Always compare the view before and after the change.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where to run each verification command">
<rect x="225" y="15" width="190" height="75" rx="10" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">show running-config policy</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">show omp routes / tlocs / services</text>
<rect x="15" y="140" width="190" height="75" rx="10" fill="#bbf7d0"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="14">Edge (spoke)</text><text x="110" y="185" text-anchor="middle" class="svg-muted" font-size="12">show sdwan omp tlocs / routes</text><text x="110" y="203" text-anchor="middle" class="svg-muted" font-size="12">show sdwan bfd sessions</text>
<rect x="435" y="140" width="190" height="75" rx="10" fill="#bbf7d0"/><text x="530" y="165" text-anchor="middle" class="svg-ink" font-size="14">Edge (any)</text><text x="530" y="185" text-anchor="middle" class="svg-muted" font-size="12">show sdwan policy from-vsmart</text><text x="530" y="203" text-anchor="middle" class="svg-muted" font-size="12">traceroute vrf 10</text>
<path d="M270 90 L150 140 M370 90 L490 140" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Controller for the cause, edge for the result.</p></div>

<h3>Step 1: the policy on the Controller</h3>
<pre class="out">vsmart# show running-config policy
policy
 lists
  site-list HUB
   site-id 100
  site-list SPOKES
   site-id 200-400
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   action accept
  sequence 20
   match route
    site-list HUB
   action accept
  default-action reject

vsmart# show running-config apply-policy
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out</pre>
<p>The wanted site list, the policy name and the direction should match the design. In the Manager, the activated policy shows the status Active in the policy list.</p>

<h3>Step 2: what the Controller holds, and what an edge learns</h3>
<p>On the Controller, <code>show omp routes</code> and <code>show omp tlocs</code> show the table as the Controller sees it, before the out policy. On an edge, <code>show sdwan omp routes</code> and <code>show sdwan omp tlocs</code> show what the edge actually received. A hub-and-spoke policy should reduce the edge view.</p>
<pre class="out">vsmart# show omp tlocs | include 10.255.0
10.255.0.11   mpls          ipsec   C,I,R
10.255.0.11   biz-internet  ipsec   C,I,R
10.255.0.12   mpls          ipsec   C,I,R
10.255.0.12   biz-internet  ipsec   C,I,R
10.255.0.13   biz-internet  ipsec   C,I,R
10.255.0.14   biz-internet  ipsec   C,I,R

E-BLR-1# show sdwan omp tlocs | include 10.255.0
10.255.0.11   mpls          ipsec   C,I,R
10.255.0.11   biz-internet  ipsec   C,I,R
10.255.0.13   biz-internet  ipsec   C,I,R</pre>
<p>The Controller knows six TLOC entries from the edges. E-BLR-1 sees its own TLOC (10.255.0.13) and the two hub TLOCs. Mumbai and Hyderabad are gone from its view, which is what the policy wanted. Status codes: <code>C</code> chosen, <code>I</code> installed, <code>R</code> resolved. A route marked <code>Inv</code> or <code>U</code> is invalid or unresolved, which usually means its TLOC is missing.</p>
<pre class="out">E-BLR-1# show sdwan omp routes vpn 10
VPN  PREFIX         FROM PEER      STATUS  ATTRIBUTE  TLOC IP        COLOR         ENCAP
10   10.1.10.0/24   10.255.255.2   C,I,R   installed  10.255.0.11    biz-internet  ipsec
10   10.3.10.0/24   0.0.0.0        C,Red,R installed  10.255.0.13    biz-internet  ipsec</pre>

<h3>Step 3: the data plane</h3>
<p><code>show sdwan bfd sessions</code> on E-BLR-1 should list only the hub. Any extra remote system IP means the policy did not apply to this site. Then trace the path in the service VPN:</p>
<pre class="out">E-BLR-1# show sdwan bfd sessions
SYSTEM IP     SITE ID  STATE  SOURCE TLOC COLOR  REMOTE TLOC COLOR  DST PUBLIC IP
10.255.0.11   100      up     biz-internet       biz-internet       203.0.113.6

E-BLR-1# traceroute vrf 10 10.2.10.1
 1  10.255.0.11 (hub over the tunnel)
 2  10.2.10.1</pre>

<h3>What the edge says about policy</h3>
<p><code>show sdwan policy from-vsmart</code> on an edge shows the policies the edge received from the Controller, such as a data policy or application-aware routing policy. A control policy does not appear there, because it stays on the Controller. If this command is empty and you expect a data policy, the policy was not applied to that site's list or was not activated.</p>
<pre class="out">E-MUM-1# show sdwan policy from-vsmart
% No entries found.</pre>

<h3>Check list</h3>
<ol>
<li>Policy listed as Active in the Manager, and shown in <code>show running-config policy</code> on the Controller.</li>
<li>apply-policy site list and direction correct.</li>
<li>Edge TLOC and route tables changed as designed.</li>
<li>Routes valid (<code>C,I,R</code>), not <code>Inv</code> or <code>U</code>.</li>
<li>BFD sessions only to the intended peers.</li>
<li>Traceroute follows the intended path.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Looking at the edge for a control policy; trusting a Controller table as proof of what the edge has; forgetting to compare with a "before" capture.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show sdwan policy from-vsmart</code> is an edge command and shows data-plane policies received. To see a control policy, look at the Controller configuration and at the OMP tables.</p></div>

<div class="scn"><h4>Proof for the change board</h4><p>Before the hub-and-spoke change the team saved <code>show sdwan bfd sessions</code> and <code>show sdwan omp tlocs</code> from E-BLR-1. After activation they ran the same commands and attached both outputs to the ticket. The change board approved the wider rollout because the evidence showed three sessions reduced to one, with traffic still flowing.</p></div>

<div class="iv"><p class="q">"How do you prove that a control policy is working?"</p><p>Strong answer: show it on the Controller with show running-config policy and apply-policy; show the OMP route and TLOC tables on an affected edge and compare before and after; then show the BFD sessions and a traceroute. A control policy never appears in show sdwan policy from-vsmart on an edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify in three layers: policy, OMP view, data plane.</li>
<li>Controller shows the cause; the edge shows the result.</li>
<li>Status codes C, I, R mean chosen, installed, resolved; Inv or U point to a missing TLOC.</li>
<li>show sdwan policy from-vsmart lists policies received by an edge, not control policy.</li>
</ul></div>
`,hi:`
<p>Activation ke baad is order mein verify karo: <b>(1)</b> kya policy Controller par hai aur applied hai; <b>(2)</b> edges kya seekhte hain (TLOCs aur routes); <b>(3)</b> kya data plane ne react kiya (BFD sessions, next hop, traffic path). Hamesha change se pehle aur baad ka view compare karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Har verification command kahan chalani hai">
<rect x="225" y="15" width="190" height="75" rx="10" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">show running-config policy</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">show omp routes / tlocs / services</text>
<rect x="15" y="140" width="190" height="75" rx="10" fill="#bbf7d0"/><text x="110" y="165" text-anchor="middle" class="svg-ink" font-size="14">Edge (spoke)</text><text x="110" y="185" text-anchor="middle" class="svg-muted" font-size="12">show sdwan omp tlocs / routes</text><text x="110" y="203" text-anchor="middle" class="svg-muted" font-size="12">show sdwan bfd sessions</text>
<rect x="435" y="140" width="190" height="75" rx="10" fill="#bbf7d0"/><text x="530" y="165" text-anchor="middle" class="svg-ink" font-size="14">Edge (koi bhi)</text><text x="530" y="185" text-anchor="middle" class="svg-muted" font-size="12">show sdwan policy from-vsmart</text><text x="530" y="203" text-anchor="middle" class="svg-muted" font-size="12">traceroute vrf 10</text>
<path d="M270 90 L150 140 M370 90 L490 140" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Karan ke liye Controller, result ke liye edge.</p></div>

<h3>Step 1: Controller par policy</h3>
<pre class="out">vsmart# show running-config policy
policy
 lists
  site-list HUB
   site-id 100
  site-list SPOKES
   site-id 200-400
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   action accept
  sequence 20
   match route
    site-list HUB
   action accept
  default-action reject

vsmart# show running-config apply-policy
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out</pre>
<p>Chahi hui site list, policy ka naam aur direction design se match karni chahiye. Manager mein activated policy policy list mein Active status dikhati hai.</p>

<h3>Step 2: Controller ke paas kya hai, aur edge kya seekhta hai</h3>
<p>Controller par <code>show omp routes</code> aur <code>show omp tlocs</code> table woh dikhate hain jaisa Controller dekhta hai, out policy se pehle. Edge par <code>show sdwan omp routes</code> aur <code>show sdwan omp tlocs</code> dikhate hain ki edge ko asal mein kya mila. Hub-and-spoke policy se edge ka view chhota hona chahiye.</p>
<pre class="out">vsmart# show omp tlocs | include 10.255.0
10.255.0.11   mpls          ipsec   C,I,R
10.255.0.11   biz-internet  ipsec   C,I,R
10.255.0.12   mpls          ipsec   C,I,R
10.255.0.12   biz-internet  ipsec   C,I,R
10.255.0.13   biz-internet  ipsec   C,I,R
10.255.0.14   biz-internet  ipsec   C,I,R

E-BLR-1# show sdwan omp tlocs | include 10.255.0
10.255.0.11   mpls          ipsec   C,I,R
10.255.0.11   biz-internet  ipsec   C,I,R
10.255.0.13   biz-internet  ipsec   C,I,R</pre>
<p>Controller edges se aaye chhe TLOC entries jaanta hai. E-BLR-1 ko apna TLOC (10.255.0.13) aur do hub TLOCs dikhte hain. Mumbai aur Hyderabad uske view se gayab hain, jo policy chahti thi. Status codes: <code>C</code> chosen, <code>I</code> installed, <code>R</code> resolved. <code>Inv</code> ya <code>U</code> wala route invalid ya unresolved hai, jiska matlab aam taur par uska TLOC missing hai.</p>
<pre class="out">E-BLR-1# show sdwan omp routes vpn 10
VPN  PREFIX         FROM PEER      STATUS  ATTRIBUTE  TLOC IP        COLOR         ENCAP
10   10.1.10.0/24   10.255.255.2   C,I,R   installed  10.255.0.11    biz-internet  ipsec
10   10.3.10.0/24   0.0.0.0        C,Red,R installed  10.255.0.13    biz-internet  ipsec</pre>

<h3>Step 3: data plane</h3>
<p>E-BLR-1 par <code>show sdwan bfd sessions</code> mein sirf hub dikhna chahiye. Koi extra remote system IP matlab policy is site par apply nahi hui. Phir service VPN mein path trace karo:</p>
<pre class="out">E-BLR-1# show sdwan bfd sessions
SYSTEM IP     SITE ID  STATE  SOURCE TLOC COLOR  REMOTE TLOC COLOR  DST PUBLIC IP
10.255.0.11   100      up     biz-internet       biz-internet       203.0.113.6

E-BLR-1# traceroute vrf 10 10.2.10.1
 1  10.255.0.11 (hub over the tunnel)
 2  10.2.10.1</pre>

<h3>Edge policy ke baare mein kya kehta hai</h3>
<p>Edge par <code>show sdwan policy from-vsmart</code> woh policies dikhata hai jo edge ne Controller se receive ki, jaise data policy ya application-aware routing policy. Control policy yahan nahi dikhti, kyunki woh Controller par rehti hai. Agar yeh command khaali hai aur aap data policy expect kar rahe the, to policy us site ki list par apply nahi hui ya activate nahi hui.</p>
<pre class="out">E-MUM-1# show sdwan policy from-vsmart
% No entries found.</pre>

<h3>Check list</h3>
<ol>
<li>Manager mein policy Active dikhe, aur Controller par <code>show running-config policy</code> mein dikhe.</li>
<li>apply-policy site list aur direction sahi.</li>
<li>Edge TLOC aur route tables design ke hisaab se badli.</li>
<li>Routes valid (<code>C,I,R</code>), <code>Inv</code> ya <code>U</code> nahi.</li>
<li>BFD sessions sirf intended peers ke saath.</li>
<li>Traceroute intended path follow kare.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Control policy ke liye edge par dhundhna; Controller table ko edge ke paas kya hai uska saboot maan lena; "before" capture se compare karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show sdwan policy from-vsmart</code> edge command hai aur receive hui data-plane policies dikhata hai. Control policy dekhne ke liye Controller configuration aur OMP tables dekho.</p></div>

<div class="scn"><h4>Change board ke liye saboot</h4><p>Hub-and-spoke change se pehle team ne E-BLR-1 se <code>show sdwan bfd sessions</code> aur <code>show sdwan omp tlocs</code> save kiye. Activation ke baad wahi commands chalayi aur dono outputs ticket se attach kiye. Change board ne wider rollout approve kiya kyunki saboot ne dikhaya ki teen sessions ek reh gaye, aur traffic phir bhi chal rahi thi.</p></div>

<div class="iv"><p class="q">"Kaise prove karoge ki control policy kaam kar rahi hai?"</p><p>Strong answer: Controller par show running-config policy aur apply-policy se dikhao; affected edge par OMP route aur TLOC tables dikhao aur before aur after compare karo; phir BFD sessions aur traceroute dikhao. Control policy edge par show sdwan policy from-vsmart mein kabhi nahi dikhti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers mein verify karo: policy, OMP view, data plane.</li>
<li>Controller karan dikhata hai; edge result.</li>
<li>Status codes C, I, R matlab chosen, installed, resolved; Inv ya U missing TLOC ki taraf ishara karte hain.</li>
<li>show sdwan policy from-vsmart edge ko mili policies list karta hai, control policy nahi.</li>
</ul></div>
`}};export{e as default};