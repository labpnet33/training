var e={id:`data-plane`,h:{en:`Data plane: IPsec tunnels, BFD and application-aware routing`,hi:`Data plane: IPsec tunnels, BFD aur application-aware routing`},body:{en:`
<p>A delivery company with two roads between its warehouses does not just pick one road forever. It sends a scout bike down each road every second, timing the trip and counting lost parcels. When the expressway is jammed, fragile parcels (voice) switch to the quieter road while bulk parcels keep using both. That is the SD-WAN data plane: <b>IPsec tunnels</b> are the roads, <b>BFD</b> is the scout, and <b>application-aware routing</b> is the dispatcher's rule book.</p>

<h3>IPsec tunnels between TLOCs</h3>
<ul>
<li>Each edge builds a tunnel from its TLOCs to the remote TLOCs it is allowed to pair with (colours and restrict decide which). By default the overlay is a <b>full mesh</b> between sites.</li>
<li>Encryption is <b>ESP with AES-256-GCM</b>, carried in <b>UDP</b> (base port 12346) so it crosses NAT. There is no IKE between edges: keys are generated per TLOC by each edge and distributed through OMP by the Controller. Keys are rekeyed periodically (default once a day) with anti-replay protection.</li>
<li><b>GRE</b> encapsulation is also available when encryption is not needed, for example towards a service that terminates GRE.</li>
<li>The IPsec and UDP headers add overhead. Plan MTU: BFD can discover the path MTU, and a TCP MSS adjustment on the service side (a value around 1350 is common) avoids fragmentation.</li>
</ul>

<h3>BFD in every tunnel</h3>
<p><b>BFD</b> (Bidirectional Forwarding Detection) runs inside <b>every</b> tunnel automatically; you cannot turn it off. Defaults: <b>hello 1 s, multiplier 7</b>, so a dead path is detected in about 7 seconds. BFD does three jobs:</p>
<ol><li><b>Liveness</b>: a tunnel is up only while BFD is up; this is what makes a TLOC "resolved" for OMP.</li>
<li><b>Measurement</b>: every hello records <b>loss, latency and jitter</b> per tunnel. They are averaged over the <b>app-route poll interval</b> (default 10 minutes) and a multiplier of buckets.</li>
<li><b>Path MTU discovery</b> for the tunnel.</li></ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two tunnels with BFD and a voice policy">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">EDGE1</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">site 100</text>
<rect x="500" y="80" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="106" text-anchor="middle" class="svg-ink" font-size="13">EDGE2</text><text x="565" y="124" text-anchor="middle" class="svg-muted" font-size="12">site 200</text>
<path d="M140 95 C 250 30, 390 30, 500 95" fill="none" stroke="#64748b" stroke-width="3"/>
<path d="M140 125 C 250 190, 390 190, 500 125" fill="none" stroke="#64748b" stroke-width="3"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">biz-internet tunnel: loss 2%, 45 ms</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">mpls tunnel: loss 0%, 30 ms</text>
<rect x="215" y="95" width="210" height="32" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">DSCP 46 prefers mpls</text>
</svg><p class="cap">BFD measures each tunnel; the app-route policy pins voice to mpls while it meets its SLA.</p></div>

<h3>Default forwarding and application-aware routing</h3>
<p>Without any policy, traffic for a remote prefix is load-shared per flow across <b>all up tunnels</b> to that site (ECMP). <b>Application-aware routing (AAR)</b> adds intelligence:</p>
<ul>
<li>An <b>SLA class</b> sets thresholds, for example VOICE: loss 1%, latency 150 ms, jitter 30 ms.</li>
<li>An <b>app-route policy</b> matches traffic (application recognised by DPI, DSCP, prefixes, ports) and sets an action: use tunnels that meet the SLA class, optionally with a <b>preferred colour</b>.</li>
<li>If the preferred colour breaks the SLA or fails, traffic moves to another compliant tunnel. If no tunnel is compliant, it falls back to the best available (or you choose strict behaviour).</li>
<li>AAR is a <b>centralised</b> policy: written on the Manager, held by the Controller and pushed to edges over OMP.</li>
</ul>

<pre class="code"><span class="c">! Real controller CLI form (as the Manager generates it)</span>
policy
 sla-class VOICE-SLA
  loss 1
  latency 150
  jitter 30
 lists
  site-list ALL-SITES
   site-id 100-200
  vpn-list VPN1
   vpn 1
 app-route-policy AAR-VOICE
  vpn-list VPN1
   sequence 10
    match
     dscp 46
    action
     sla-class VOICE-SLA preferred-color mpls
apply-policy
 site-list ALL-SITES
  app-route-policy AAR-VOICE
<span class="c">! Lab shorthand on CTRL</span>
app-route-policy VOICE-MPLS
 sequence 10 match dscp 46 preferred-color mpls
apply-policy app-route VOICE-MPLS</pre>

<h3>Reading BFD sessions</h3>
<pre class="out">EDGE1# show sdwan bfd sessions
SYSTEM IP       SITE ID  STATE  SOURCE TLOC     REMOTE TLOC     SOURCE IP       DST PUBLIC IP   PORT   ENCAP  MULT TX(ms) UPTIME      TRANSITIONS
                                COLOR           COLOR
------------------------------------------------------------------------------------------------------------------------------------------------
<span class="hl">10.255.0.12     200      up     biz-internet    biz-internet    198.51.100.2    198.51.100.6    12346  ipsec  7    1000   0:00:03:41  0</span>
<span class="hl">10.255.0.12     200      up     mpls            mpls            172.16.1.2      172.16.2.2      12346  ipsec  7    1000   0:00:03:41  0</span></pre>
<p>Two sessions to EDGE2 (system-ip 10.255.0.12, site 200), one per colour pair, both up, hello 1000 ms, multiplier 7. A rising <b>TRANSITIONS</b> counter means a flapping path. On a real edge, <code>show sdwan app-route stats</code> shows the measured loss, latency and jitter per tunnel, and <code>show sdwan policy from-controller</code> shows the AAR policy received.</p>

<div class="eg"><p><b>Worked example.</b> BFD sends one hello per second, so a 10-minute poll interval collects 600 hellos per tunnel. If 18 are lost, loss is 3%. For VOICE-SLA (loss 1%) the biz-internet tunnel is non-compliant; if mpls shows 0% loss and 30 ms, voice stays on mpls. Bulk traffic without a policy still uses both tunnels.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting AAR to react in one second: it reacts to averaged statistics, while BFD reacts to a dead path in about 7 seconds. Marking voice with DSCP on the phones but re-marking it to 0 on the LAN switch, so the policy never matches. Forgetting that an SLA class with thresholds no circuit can meet sends traffic to the fallback path.</p></div>

<div class="exam"><p><b>Exam traps.</b> BFD in SD-WAN runs automatically in every tunnel (1 s, x7) and measures loss, latency and jitter. AAR = centralised policy + SLA classes + preferred colour. IPsec keys are distributed by the Controller, not negotiated by IKE between edges. Default forwarding without policy is ECMP across all up tunnels.</p></div>

<div class="scn"><h4>Choppy calls every afternoon</h4><p>A call centre complained that calls broke up between 2 and 4 pm. The edges showed all tunnels up. <code>show sdwan app-route stats</code> revealed 4% loss on biz-internet during that window while mpls stayed clean. There was no AAR policy, so voice was being load-shared across both tunnels. The team added an SLA class (loss 1%, latency 150 ms, jitter 30 ms) and an app-route policy matching DSCP 46 with preferred colour mpls. The complaints stopped the next day.</p><p><b>Lesson:</b> "tunnel up" is not "tunnel good". BFD measurements plus AAR are how SD-WAN protects sensitive traffic.</p></div>

<div class="iv"><p class="q">"How does application-aware routing decide the path for a voice call?"</p><p>Strong answer: BFD in every tunnel measures loss, latency and jitter, averaged over the poll interval. The app-route policy from the Controller matches the voice traffic (DPI or DSCP 46) and applies an SLA class; tunnels meeting the SLA are eligible, the preferred colour is used if compliant, and traffic moves when it is not. Without AAR traffic is simply ECMP across all tunnels. Mention BFD 1 s x7 and that AAR uses averages, not per-packet decisions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels are IPsec ESP (AES-256-GCM) in UDP between TLOCs; keys come via OMP, no IKE mesh.</li>
<li>BFD runs in every tunnel (1 s, x7): liveness, loss/latency/jitter, PMTU.</li>
<li>Without policy, traffic is ECMP across all up tunnels.</li>
<li>AAR uses SLA classes and preferred colours, pushed by the Controller.</li>
<li>Verify with <code>show sdwan bfd sessions</code>, <code>app-route stats</code>, <code>policy from-controller</code>.</li>
</ul></div>
`,hi:`
<p>Jis delivery company ke godowns ke beech do sadakein hain, woh hamesha ke liye ek sadak nahi chun leti. Woh har second har sadak par ek scout bike bhejti hai, safar ka time naapti hai aur khoye parcels ginti hai. Jab expressway jam ho, to fragile parcels (voice) shaant sadak par chale jaate hain jabki bulk parcels dono use karte rehte hain. Yahi SD-WAN data plane hai: <b>IPsec tunnels</b> sadakein hain, <b>BFD</b> scout hai, aur <b>application-aware routing</b> dispatcher ki rule book hai.</p>

<h3>TLOCs ke beech IPsec tunnels</h3>
<ul>
<li>Har edge apne TLOCs se un remote TLOCs tak tunnel banata hai jinke saath use jodi banane ki ijaazat hai (colours aur restrict decide karte hain). Default mein overlay sites ke beech <b>full mesh</b> hai.</li>
<li>Encryption <b>AES-256-GCM ke saath ESP</b> hai, <b>UDP</b> (base port 12346) mein le jaaya jaata hai taaki NAT paar kar sake. Edges ke beech IKE nahi hota: har edge har TLOC ke liye keys banata hai aur Controller unhe OMP se baant-ta hai. Keys periodically rekey hoti hain (default din mein ek baar), anti-replay protection ke saath.</li>
<li>Jab encryption ki zaroorat na ho to <b>GRE</b> encapsulation bhi available hai, jaise kisi service ki taraf jo GRE terminate karti hai.</li>
<li>IPsec aur UDP headers overhead jodte hain. MTU plan karo: BFD path MTU discover kar sakta hai, aur service side par TCP MSS adjustment (lagbhag 1350 common hai) fragmentation se bachata hai.</li>
</ul>

<h3>Har tunnel mein BFD</h3>
<p><b>BFD</b> (Bidirectional Forwarding Detection) <b>har</b> tunnel ke andar automatically chalta hai; aap ise band nahi kar sakte. Defaults: <b>hello 1 s, multiplier 7</b>, isliye mara hua path lagbhag 7 seconds mein detect hota hai. BFD teen kaam karta hai:</p>
<ol><li><b>Liveness</b>: tunnel tabhi up hai jab tak BFD up hai; isi se TLOC OMP ke liye "resolved" hota hai.</li>
<li><b>Measurement</b>: har hello per tunnel <b>loss, latency aur jitter</b> record karta hai. Inka average <b>app-route poll interval</b> (default 10 minute) aur buckets ke multiplier par nikala jaata hai.</li>
<li>Tunnel ke liye <b>Path MTU discovery</b>.</li></ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BFD ke saath do tunnels aur voice policy">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">EDGE1</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">site 100</text>
<rect x="500" y="80" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="106" text-anchor="middle" class="svg-ink" font-size="13">EDGE2</text><text x="565" y="124" text-anchor="middle" class="svg-muted" font-size="12">site 200</text>
<path d="M140 95 C 250 30, 390 30, 500 95" fill="none" stroke="#64748b" stroke-width="3"/>
<path d="M140 125 C 250 190, 390 190, 500 125" fill="none" stroke="#64748b" stroke-width="3"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">biz-internet tunnel: loss 2%, 45 ms</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">mpls tunnel: loss 0%, 30 ms</text>
<rect x="215" y="95" width="210" height="32" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">DSCP 46 mpls prefer kare</text>
</svg><p class="cap">BFD har tunnel ko naapta hai; app-route policy voice ko mpls par pin karti hai jab tak woh SLA meet kare.</p></div>

<h3>Default forwarding aur application-aware routing</h3>
<p>Kisi policy ke bina, remote prefix ka traffic us site tak ke <b>saare up tunnels</b> par per flow baant diya jaata hai (ECMP). <b>Application-aware routing (AAR)</b> intelligence jodta hai:</p>
<ul>
<li><b>SLA class</b> thresholds set karti hai, jaise VOICE: loss 1%, latency 150 ms, jitter 30 ms.</li>
<li><b>App-route policy</b> traffic match karti hai (DPI se pehchani application, DSCP, prefixes, ports) aur action set karti hai: SLA class meet karne wale tunnels use karo, optionally <b>preferred colour</b> ke saath.</li>
<li>Agar preferred colour SLA tode ya fail ho, to traffic doosre compliant tunnel par chala jaata hai. Agar koi tunnel compliant nahi, to best available par fallback hota hai (ya aap strict behaviour chun sakte ho).</li>
<li>AAR ek <b>centralised</b> policy hai: Manager par likhi jaati hai, Controller rakhta hai aur OMP se edges tak push karta hai.</li>
</ul>

<pre class="code"><span class="c">! Real controller CLI form (jaisa Manager generate karta hai)</span>
policy
 sla-class VOICE-SLA
  loss 1
  latency 150
  jitter 30
 lists
  site-list ALL-SITES
   site-id 100-200
  vpn-list VPN1
   vpn 1
 app-route-policy AAR-VOICE
  vpn-list VPN1
   sequence 10
    match
     dscp 46
    action
     sla-class VOICE-SLA preferred-color mpls
apply-policy
 site-list ALL-SITES
  app-route-policy AAR-VOICE
<span class="c">! CTRL par lab shorthand</span>
app-route-policy VOICE-MPLS
 sequence 10 match dscp 46 preferred-color mpls
apply-policy app-route VOICE-MPLS</pre>

<h3>BFD sessions padhna</h3>
<pre class="out">EDGE1# show sdwan bfd sessions
SYSTEM IP       SITE ID  STATE  SOURCE TLOC     REMOTE TLOC     SOURCE IP       DST PUBLIC IP   PORT   ENCAP  MULT TX(ms) UPTIME      TRANSITIONS
                                COLOR           COLOR
------------------------------------------------------------------------------------------------------------------------------------------------
<span class="hl">10.255.0.12     200      up     biz-internet    biz-internet    198.51.100.2    198.51.100.6    12346  ipsec  7    1000   0:00:03:41  0</span>
<span class="hl">10.255.0.12     200      up     mpls            mpls            172.16.1.2      172.16.2.2      12346  ipsec  7    1000   0:00:03:41  0</span></pre>
<p>EDGE2 (system-ip 10.255.0.12, site 200) tak do sessions, har colour pair ka ek, dono up, hello 1000 ms, multiplier 7. Badhta hua <b>TRANSITIONS</b> counter matlab flap karta path. Real edge par <code>show sdwan app-route stats</code> har tunnel ka naapa gaya loss, latency aur jitter dikhata hai, aur <code>show sdwan policy from-controller</code> mili hui AAR policy dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> BFD har second ek hello bhejta hai, isliye 10-minute poll interval har tunnel ke 600 hellos ikatthe karta hai. Agar 18 kho jaayein, to loss 3% hai. VOICE-SLA (loss 1%) ke liye biz-internet tunnel non-compliant hai; agar mpls 0% loss aur 30 ms dikhaye, to voice mpls par rehta hai. Bina policy wala bulk traffic ab bhi dono tunnels use karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> AAR se ek second mein react karne ki ummeed rakhna: yeh averaged statistics par react karta hai, jabki BFD mare hue path par lagbhag 7 seconds mein react karta hai. Phones par voice ko DSCP se mark karna par LAN switch par use 0 re-mark kar dena, jisse policy kabhi match nahi hoti. Yeh bhoolna ki jis SLA class ki thresholds koi circuit meet na kar sake woh traffic ko fallback path par bhejti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> SD-WAN mein BFD har tunnel mein automatically chalta hai (1 s, x7) aur loss, latency aur jitter naapta hai. AAR = centralised policy + SLA classes + preferred colour. IPsec keys Controller baant-ta hai, edges ke beech IKE se negotiate nahi hoti. Bina policy default forwarding saare up tunnels par ECMP hai.</p></div>

<div class="scn"><h4>Har dopahar toot-ti calls</h4><p>Ek call centre ne shikayat ki ki 2 se 4 baje ke beech calls toot-ti hain. Edges par saare tunnels up the. <code>show sdwan app-route stats</code> ne dikhaya ki us window mein biz-internet par 4% loss tha jabki mpls saaf tha. Koi AAR policy nahi thi, isliye voice dono tunnels par baanta ja raha tha. Team ne ek SLA class (loss 1%, latency 150 ms, jitter 30 ms) aur DSCP 46 match karne wali preferred colour mpls wali app-route policy jodi. Agle din se shikayatein band ho gayi.</p><p><b>Seekh:</b> "tunnel up" ka matlab "tunnel achha" nahi. BFD measurements aur AAR se hi SD-WAN sensitive traffic ko bachata hai.</p></div>

<div class="iv"><p class="q">"Application-aware routing voice call ka path kaise decide karta hai?"</p><p>Strong answer: har tunnel mein BFD loss, latency aur jitter naapta hai, jinka poll interval par average nikalta hai. Controller se aayi app-route policy voice traffic match karti hai (DPI ya DSCP 46) aur SLA class lagati hai; SLA meet karne wale tunnels eligible hain, preferred colour compliant ho to use hota hai, aur na ho to traffic shift hota hai. AAR ke bina traffic bas saare tunnels par ECMP hai. BFD 1 s x7 aur yeh batao ki AAR averages use karta hai, per-packet decisions nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels TLOCs ke beech UDP mein IPsec ESP (AES-256-GCM) hain; keys OMP se aati hain, IKE mesh nahi.</li>
<li>BFD har tunnel mein chalta hai (1 s, x7): liveness, loss/latency/jitter, PMTU.</li>
<li>Policy ke bina traffic saare up tunnels par ECMP hai.</li>
<li>AAR SLA classes aur preferred colours use karta hai, Controller push karta hai.</li>
<li><code>show sdwan bfd sessions</code>, <code>app-route stats</code>, <code>policy from-controller</code> se verify karo.</li>
</ul></div>
`}};export{e as default};