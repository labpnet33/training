var e={id:`troubleshooting`,h:{en:`Verification and troubleshooting: a policy that does not match`,hi:`Verification aur troubleshooting: policy jo match nahi karti`},body:{en:`
<p>Policy faults have a typical symptom: <b>"I wrote it, I activated it, and nothing changed."</b> A calm, ordered workflow solves them in minutes. This chapter gives you that workflow, the order in which the edge evaluates things (so you know what can block what), and the commands to prove each step.</p>

<h3>Analogy: a parcel that never reaches the sorting bench</h3>
<p>If a parcel is not routed as expected, you check in order: was the rule sheet delivered to this office? Is it pinned on the right bench? Does the parcel look like the rule describes? Did a guard at the door stop the parcel before it reached the bench? Troubleshooting a policy follows exactly that order.</p>

<h3>What does the edge evaluate first?</h3>
<p>For a packet entering the WAN Edge from the LAN, the order is:</p>
<ol>
<li><b>Ingress interface ACL</b> (a localized policy applied on the LAN interface). A deny here drops the packet <b>before any centralized policy sees it</b>.</li>
<li><b>Application-aware routing policy</b> (the SLA-based path choice).</li>
<li><b>Centralized data policy</b> (from-service). It is evaluated after AAR and can override its choices.</li>
<li><b>Routing and forwarding</b> (output interface or tunnel decided).</li>
<li><b>Security policy</b>: enterprise firewall, IPS, URL filtering, AMP (security module).</li>
<li><b>Encapsulation and encryption</b> into the IPsec tunnel.</li>
<li><b>Egress ACL and QoS</b> on the outgoing interface.</li>
</ol>
<p>For traffic that arrives from a tunnel, the data policy with <code>from-tunnel</code> is applied after decryption and before delivery to the LAN. In releases from 20.6 onward, the colors named in an AAR policy and a data policy that sets a TLOC are combined (the common colors are used while they meet the SLA); in earlier releases the data policy choice simply overrode the AAR choice. The safe habit is to keep the two from fighting: do not write AAR and TLOC-setting data policy for the same traffic unless you have tested it with the service-path tool.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Order of evaluation on a WAN Edge">
<g font-size="11">
<rect x="6" y="40" width="80" height="48" rx="6" fill="#fed7aa"/><text x="46" y="60" text-anchor="middle" class="svg-ink">Ingress</text><text x="46" y="76" text-anchor="middle" class="svg-ink">ACL</text>
<rect x="96" y="40" width="80" height="48" rx="6" fill="#ddd6fe"/><text x="136" y="60" text-anchor="middle" class="svg-ink">App-route</text><text x="136" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="186" y="40" width="80" height="48" rx="6" fill="#bae6fd"/><text x="226" y="60" text-anchor="middle" class="svg-ink">Data</text><text x="226" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="276" y="40" width="80" height="48" rx="6" fill="#e2e8f0"/><text x="316" y="60" text-anchor="middle" class="svg-ink">Routing /</text><text x="316" y="76" text-anchor="middle" class="svg-ink">forwarding</text>
<rect x="366" y="40" width="80" height="48" rx="6" fill="#bbf7d0"/><text x="406" y="60" text-anchor="middle" class="svg-ink">Security</text><text x="406" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="456" y="40" width="80" height="48" rx="6" fill="#fde68a"/><text x="496" y="60" text-anchor="middle" class="svg-ink">IPsec</text><text x="496" y="76" text-anchor="middle" class="svg-ink">encrypt</text>
<rect x="546" y="40" width="88" height="48" rx="6" fill="#fed7aa"/><text x="590" y="60" text-anchor="middle" class="svg-ink">Egress ACL</text><text x="590" y="76" text-anchor="middle" class="svg-ink">and QoS</text>
</g>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Packet from the LAN, left to right</text>
<text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">A drop at an earlier stage means later stages never see the packet.</text>
</svg><p class="cap">The ACL comes first. A centralized policy cannot fix a packet that an ACL already dropped.</p></div>

<h3>The six-step workflow</h3>
<ol>
<li><b>Did the policy arrive?</b> <code>show sdwan control connections</code> (is the Controller connection up?) and <code>show sdwan policy from-vsmart</code>. Empty output means the policy was not activated, the site is not in the site-list, or there is no control connection.</li>
<li><b>Is it the right site, VPN and direction?</b> Compare the vpn-list with the VPN of the traffic, and the direction with the packet's entry point.</li>
<li><b>Does the traffic match?</b> Check the counters with <code>show sdwan policy data-policy-filter</code> or <code>show sdwan policy app-route-policy-filter</code>. A counter at zero while traffic runs is a non-match.</li>
<li><b>Ask the edge.</b> <code>show sdwan policy service-path ...</code> (or Simulate Flows in Manager) for a specific flow.</li>
<li><b>Is something earlier blocking it?</b> Look at ingress ACLs on the LAN interface.</li>
<li><b>For AAR: are there choices and are they measured?</b> <code>show sdwan bfd sessions</code>, <code>show sdwan app-route stats</code>, and <code>show sdwan omp routes</code> for the prefix.</li>
</ol>

<h3>Worked example: voice never gets DSCP 46</h3>
<p>Help desk says Pune voice is not marked. The data policy DP-PUNE has sequence 10 matching VOICE-APPS with set dscp 46.</p>
<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 <span class="hl">direction from-tunnel</span>
 vpn-list CORP
  sequence 10
   match
    app-list VOICE-APPS
   action accept
    count VOICE-PKTS
    set
     dscp 46

E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter VOICE-PKTS
   <span class="hl">packets  0</span></pre>
<p>Step 1 passes: the policy arrived. Step 2 reveals the fault: the direction is <code>from-tunnel</code>, but voice enters from the LAN, so the policy never sees it. The fix is on the Controller: <code>apply-policy site-list PUNE data-policy DP-PUNE from-service</code>, then re-activate. After the next call, VOICE-PKTS increases.</p>

<h3>Common causes of "policy does not match"</h3>
<table class="cmp"><tr><th>Cause</th><th>How to spot it</th></tr>
<tr><td>Policy not activated or site not in the site-list</td><td><code>show sdwan policy from-vsmart</code> is empty</td></tr>
<tr><td>Wrong direction</td><td>from-vsmart shows the other direction</td></tr>
<tr><td>Wrong VPN in the vpn-list</td><td>The vpn-list shows a different VPN than the user's VRF</td></tr>
<tr><td>Application not recognised yet, or name not in the app-list</td><td>Counter zero for app-list sequences while prefix sequences count; check application visibility</td></tr>
<tr><td>An earlier sequence matched first</td><td>Another sequence's counter is increasing instead</td></tr>
<tr><td>Ingress ACL denies the packet</td><td>ACL counters increase; the policy counter stays zero</td></tr>
<tr><td>AAR has no second path to choose</td><td>Only one TLOC in <code>show sdwan omp routes</code>; BFD to the other color not up</td></tr>
<tr><td>SLA unreachable</td><td>sla-class-index never contains the class for any tunnel</td></tr></table>

<h3>When AAR behaves "strangely"</h3>
<pre class="out">E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
app-route statistics 172.16.1.2 172.16.2.2 ipsec 12346 12346
 local-color              mpls
 remote-color             mpls
 mean-loss                0
 mean-latency             41
 mean-jitter              4
 <span class="hl">sla-class-index          0,1,2</span>
app-route statistics 203.0.113.10 203.0.113.6 ipsec 12346 12346
 local-color              biz-internet
 remote-color             biz-internet
 mean-loss                3
 mean-latency             190
 mean-jitter              35
 <span class="hl">sla-class-index          0</span></pre>
<p>MPLS satisfies classes 0, 1 and 2. The internet tunnel satisfies only 0, so it fails VOICE (index 1) and BILLING (index 2). Voice and billing are therefore on MPLS, exactly as designed. If the tunnel indexes looked right but traffic did not move, go back to the data policy: a TLOC-setting action may be overriding the AAR decision.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Debugging the Controller when the policy never reached the edge because of a missing control connection. (2) Testing with ICMP when the policy matches an application or TCP port. (3) Changing several things at once and losing track of which one worked. (4) Reading a counter reset or a brand-new flow as "not matching"; generate fresh traffic and watch the counter.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which is evaluated first, the ACL or the centralized data policy?" The <b>ingress ACL</b> (localized policy) is evaluated first, then AAR, then the centralized data policy. Also remember: the tool that shows what the edge actually does with a flow is <code>show sdwan policy service-path</code>, not the Controller.</p></div>

<div class="scn"><h4>Voice policy active, counters at zero</h4><p>A new SLA policy for the Hyderabad site was activated at 6 pm. By 7 pm complaints continued. The engineer ran from-vsmart on the Hyderabad edge and found it empty, while Pune's edge showed the policy. The Hyderabad site ID was missing from the site-list HYD-PUNE; the policy had never been sent there. After adding the site ID and activating again, from-vsmart on Hyderabad showed the app-route policy and the next call moved to MPLS.</p><p><b>Lesson:</b> start at step 1. "Did the policy arrive at this edge?" saves hours.</p></div>

<div class="iv"><p class="q">"A centralized policy is activated but traffic is not affected. How do you troubleshoot?"</p><p>Walk the workflow: confirm control connections and the received policy with show sdwan policy from-vsmart; check site-list, vpn-list and direction; read the sequence counters; use service-path or Simulate Flows for a specific flow; look for an earlier ACL or sequence; for AAR confirm there are multiple tunnels and read the sla-class-index in app-route stats. State the evaluation order: ingress ACL, AAR, data policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order on the edge: ingress ACL, app-route policy, data policy, forwarding, security policy, encryption, egress ACL.</li>
<li>Start by proving the policy reached the edge: control connections and show sdwan policy from-vsmart.</li>
<li>Counters (data-policy-filter, app-route-policy-filter) prove whether sequences match.</li>
<li>service-path or Simulate Flows shows what the edge does with a specific flow.</li>
<li>For AAR read BFD sessions, app-route stats and sla-class-index to see which tunnels satisfy which class.</li>
</ul></div>
`,hi:`
<p>Policy faults ka typical symptom hota hai: <b>"Maine likhi, activate ki, aur kuch nahi badla."</b> Shaant, ordered workflow inhe minutes mein solve kar deta hai. Yeh chapter aapko woh workflow deta hai, woh order jisme edge cheezein evaluate karta hai (taaki pata ho kaun kisko block kar sakta hai), aur har step saabit karne ke commands.</p>

<h3>Analogy: parcel jo sorting bench tak pahunchta hi nahi</h3>
<p>Agar parcel expected tareeke se route nahi hua, to aap order mein check karte ho: rule sheet is office tak pahunchi? Sahi bench par lagi hai? Parcel waisa dikhta hai jaisa rule describe karta hai? Kya gate ke guard ne parcel bench tak pahunchne se pehle rok diya? Policy troubleshooting bilkul isi order mein chalti hai.</p>

<h3>Edge sabse pehle kya evaluate karta hai?</h3>
<p>LAN se WAN Edge mein aane wale packet ke liye order yeh hai:</p>
<ol>
<li><b>Ingress interface ACL</b> (LAN interface par lagi localized policy). Yahan deny ho to packet <b>kisi centralized policy ke dekhne se pehle hi drop</b> ho jaata hai.</li>
<li><b>Application-aware routing policy</b> (SLA-based path choice).</li>
<li><b>Centralized data policy</b> (from-service). Yeh AAR ke baad evaluate hoti hai aur uske choices ko override kar sakti hai.</li>
<li><b>Routing aur forwarding</b> (output interface ya tunnel decide hota hai).</li>
<li><b>Security policy</b>: enterprise firewall, IPS, URL filtering, AMP (security module).</li>
<li>IPsec tunnel mein <b>encapsulation aur encryption</b>.</li>
<li>Outgoing interface par <b>egress ACL aur QoS</b>.</li>
</ol>
<p>Tunnel se aane wale traffic ke liye <code>from-tunnel</code> wali data policy decryption ke baad aur LAN ko delivery se pehle lagti hai. 20.6 se aage ke releases mein AAR policy ke colors aur TLOC set karne wali data policy ke colors combine hote hain (common colors tab tak use hote hain jab tak woh SLA meet karein); pehle ke releases mein data policy ka choice seedha AAR choice ko override kar deta tha. Safe aadat yeh hai ki dono ko ladne mat do: ek hi traffic ke liye AAR aur TLOC-setting data policy tab tak mat likho jab tak service-path tool se test na kar lo.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="WAN Edge par evaluation ka order">
<g font-size="11">
<rect x="6" y="40" width="80" height="48" rx="6" fill="#fed7aa"/><text x="46" y="60" text-anchor="middle" class="svg-ink">Ingress</text><text x="46" y="76" text-anchor="middle" class="svg-ink">ACL</text>
<rect x="96" y="40" width="80" height="48" rx="6" fill="#ddd6fe"/><text x="136" y="60" text-anchor="middle" class="svg-ink">App-route</text><text x="136" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="186" y="40" width="80" height="48" rx="6" fill="#bae6fd"/><text x="226" y="60" text-anchor="middle" class="svg-ink">Data</text><text x="226" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="276" y="40" width="80" height="48" rx="6" fill="#e2e8f0"/><text x="316" y="60" text-anchor="middle" class="svg-ink">Routing /</text><text x="316" y="76" text-anchor="middle" class="svg-ink">forwarding</text>
<rect x="366" y="40" width="80" height="48" rx="6" fill="#bbf7d0"/><text x="406" y="60" text-anchor="middle" class="svg-ink">Security</text><text x="406" y="76" text-anchor="middle" class="svg-ink">policy</text>
<rect x="456" y="40" width="80" height="48" rx="6" fill="#fde68a"/><text x="496" y="60" text-anchor="middle" class="svg-ink">IPsec</text><text x="496" y="76" text-anchor="middle" class="svg-ink">encrypt</text>
<rect x="546" y="40" width="88" height="48" rx="6" fill="#fed7aa"/><text x="590" y="60" text-anchor="middle" class="svg-ink">Egress ACL</text><text x="590" y="76" text-anchor="middle" class="svg-ink">aur QoS</text>
</g>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">LAN se aaya packet, left se right</text>
<text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">Pehle stage par drop ka matlab hai ki baad ke stages packet dekhte hi nahi.</text>
</svg><p class="cap">ACL sabse pehle aata hai. Centralized policy us packet ko theek nahi kar sakti jise ACL pehle hi drop kar chuka ho.</p></div>

<h3>Chhe-step workflow</h3>
<ol>
<li><b>Policy pahunchi?</b> <code>show sdwan control connections</code> (Controller connection up hai?) aur <code>show sdwan policy from-vsmart</code>. Khaali output ka matlab policy activate nahi hui, site site-list mein nahi hai, ya control connection nahi hai.</li>
<li><b>Sahi site, VPN aur direction?</b> vpn-list ko traffic ke VPN se, aur direction ko packet ke entry point se compare karo.</li>
<li><b>Traffic match karta hai?</b> <code>show sdwan policy data-policy-filter</code> ya <code>show sdwan policy app-route-policy-filter</code> se counters dekho. Traffic chalte hue counter zero ho to non-match hai.</li>
<li><b>Edge se poocho.</b> Specific flow ke liye <code>show sdwan policy service-path ...</code> (ya Manager mein Simulate Flows).</li>
<li><b>Koi pehle wali cheez block kar rahi hai?</b> LAN interface ke ingress ACLs dekho.</li>
<li><b>AAR ke liye: choices hain aur measure ho rahe hain?</b> <code>show sdwan bfd sessions</code>, <code>show sdwan app-route stats</code>, aur prefix ke liye <code>show sdwan omp routes</code>.</li>
</ol>

<h3>Worked example: voice ko DSCP 46 kabhi nahi milta</h3>
<p>Help desk kehta hai Pune voice mark nahi ho rahi. Data policy DP-PUNE ka sequence 10 VOICE-APPS match karta hai aur set dscp 46 karta hai.</p>
<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 <span class="hl">direction from-tunnel</span>
 vpn-list CORP
  sequence 10
   match
    app-list VOICE-APPS
   action accept
    count VOICE-PKTS
    set
     dscp 46

E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter VOICE-PKTS
   <span class="hl">packets  0</span></pre>
<p>Step 1 pass hota hai: policy pahunch gayi. Step 2 fault dikhata hai: direction <code>from-tunnel</code> hai, lekin voice LAN se enter hoti hai, isliye policy use kabhi dekhti hi nahi. Fix Controller par hai: <code>apply-policy site-list PUNE data-policy DP-PUNE from-service</code>, phir re-activate. Agli call ke baad VOICE-PKTS badhne lagta hai.</p>

<h3>"Policy match nahi karti" ke common causes</h3>
<table class="cmp"><tr><th>Cause</th><th>Kaise pehchaanein</th></tr>
<tr><td>Policy activate nahi hui ya site site-list mein nahi</td><td><code>show sdwan policy from-vsmart</code> khaali hai</td></tr>
<tr><td>Galat direction</td><td>from-vsmart doosri direction dikhata hai</td></tr>
<tr><td>vpn-list mein galat VPN</td><td>vpn-list mein user ke VRF se alag VPN dikhta hai</td></tr>
<tr><td>Application abhi pehchani nahi gayi, ya naam app-list mein nahi</td><td>app-list sequences ka counter zero jabki prefix sequences count karte hain; application visibility check karo</td></tr>
<tr><td>Pehle wala sequence pehle match ho gaya</td><td>Uski jagah kisi aur sequence ka counter badh raha hai</td></tr>
<tr><td>Ingress ACL packet deny karta hai</td><td>ACL counters badhte hain; policy counter zero rehta hai</td></tr>
<tr><td>AAR ke paas chunne ko doosra path nahi</td><td><code>show sdwan omp routes</code> mein sirf ek TLOC; doosre color ka BFD up nahi</td></tr>
<tr><td>SLA reachable nahi</td><td>kisi bhi tunnel ke sla-class-index mein woh class kabhi nahi aati</td></tr></table>

<h3>Jab AAR "ajeeb" behave kare</h3>
<pre class="out">E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
app-route statistics 172.16.1.2 172.16.2.2 ipsec 12346 12346
 local-color              mpls
 remote-color             mpls
 mean-loss                0
 mean-latency             41
 mean-jitter              4
 <span class="hl">sla-class-index          0,1,2</span>
app-route statistics 203.0.113.10 203.0.113.6 ipsec 12346 12346
 local-color              biz-internet
 remote-color             biz-internet
 mean-loss                3
 mean-latency             190
 mean-jitter              35
 <span class="hl">sla-class-index          0</span></pre>
<p>MPLS class 0, 1 aur 2 ko satisfy karta hai. Internet tunnel sirf 0 ko satisfy karta hai, isliye woh VOICE (index 1) aur BILLING (index 2) fail karta hai. Isliye voice aur billing MPLS par hain, bilkul design ke hisaab se. Agar tunnel indexes sahi dikhte aur traffic phir bhi move nahi hota, to data policy par wapas jao: TLOC-setting action AAR decision ko override kar raha ho sakta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Controller debug karna jabki policy missing control connection ki wajah se edge tak pahunchi hi nahi. (2) ICMP se test karna jabki policy application ya TCP port match karti hai. (3) Ek saath kai cheezein badalna aur yeh na pata chalna ki kaunsi ne kaam kiya. (4) Counter reset ya bilkul naye flow ko "match nahi ho raha" samajhna; fresh traffic generate karo aur counter dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ACL aur centralized data policy mein se pehle kaunsa evaluate hota hai?" <b>Ingress ACL</b> (localized policy) pehle evaluate hoti hai, phir AAR, phir centralized data policy. Yeh bhi yaad rakho: edge kisi flow ke saath actually kya karta hai yeh dikhane wala tool <code>show sdwan policy service-path</code> hai, Controller nahi.</p></div>

<div class="scn"><h4>Voice policy active, counters zero</h4><p>Hyderabad site ke liye nayi SLA policy shaam 6 baje activate hui. 7 baje tak complaints jaari rahi. Engineer ne Hyderabad edge par from-vsmart chalaya aur woh khaali mila, jabki Pune ke edge par policy dikh rahi thi. Hyderabad ka site ID site-list HYD-PUNE mein missing tha; policy wahan kabhi bheji hi nahi gayi thi. Site ID jodne aur phir activate karne ke baad Hyderabad par from-vsmart mein app-route policy dikhi aur agli call MPLS par chali gayi.</p><p><b>Lesson:</b> step 1 se shuru karo. "Kya policy is edge tak pahunchi?" ghanton bachata hai.</p></div>

<div class="iv"><p class="q">"Centralized policy activate hai lekin traffic par koi asar nahi. Kaise troubleshoot karoge?"</p><p>Workflow chalao: control connections aur show sdwan policy from-vsmart se mili hui policy confirm karo; site-list, vpn-list aur direction check karo; sequence counters padho; specific flow ke liye service-path ya Simulate Flows use karo; pehle wala ACL ya sequence dhoondho; AAR ke liye confirm karo ki kai tunnels hain aur app-route stats mein sla-class-index padho. Evaluation order batao: ingress ACL, AAR, data policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge par order: ingress ACL, app-route policy, data policy, forwarding, security policy, encryption, egress ACL.</li>
<li>Pehle saabit karo ki policy edge tak pahunchi: control connections aur show sdwan policy from-vsmart.</li>
<li>Counters (data-policy-filter, app-route-policy-filter) saabit karte hain ki sequences match ho rahe hain ya nahi.</li>
<li>service-path ya Simulate Flows dikhata hai ki edge specific flow ke saath kya karta hai.</li>
<li>AAR ke liye BFD sessions, app-route stats aur sla-class-index padho taaki dikhe kaunsa tunnel kaunsi class satisfy karta hai.</li>
</ul></div>
`}};export{e as default};