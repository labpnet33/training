var e={id:`traffic-engineering`,h:{en:`Traffic engineering with data policy: TLOCs, next hops and service chains`,hi:`Data policy se traffic engineering: TLOCs, next hops aur service chains`},body:{en:`
<p>Sometimes you do not need a measurement to decide the path. You simply know that nightly backups should use the cheap internet tunnel, that finance traffic must go through the hub, or that guest traffic must be inspected by a firewall first. For these <b>fixed, intent-based</b> choices you use the path-selecting actions of the data policy. This chapter shows when to use them, how they behave when a path fails, and how they differ from AAR.</p>

<h3>Analogy: choosing a courier by parcel type</h3>
<p>A company sends legal documents with the secure courier, catalogues with the cheapest courier, and fragile items with a specialist. The sender does not check traffic every morning. The rule is fixed by <i>what</i> is being sent. That is data-policy traffic engineering. AAR (next chapters) is the extra step of changing the courier when the road is blocked.</p>

<h3>Three levers for steering traffic</h3>
<table class="cmp"><tr><th>Lever</th><th>Where</th><th>Scope</th><th>Reacts to quality?</th></tr>
<tr><td><b>TLOC preference</b> in OMP or a control policy</td><td>Controller</td><td>All traffic to a destination, for everybody</td><td>No (reacts to up/down only)</td></tr>
<tr><td><b>Data policy</b> set local-tloc, set tloc, set next-hop, set vpn, set service</td><td>WAN Edge, per match</td><td>Only the traffic you match</td><td>No</td></tr>
<tr><td><b>App-route policy</b> with SLA class</td><td>WAN Edge, per match</td><td>Only the traffic you match</td><td><b>Yes</b></td></tr></table>

<h3>Choosing the local transport: set local-tloc-list</h3>
<p>A <b>local TLOC</b> choice answers "which of my <b>own</b> WAN interfaces should this packet leave from?". You identify an interface by its <b>color</b>.</p>
<pre class="code"><span class="c">! on VSMART: backups leave Pune on biz-internet only</span>
policy
 lists
  app-list BACKUP-APPS
   app rsync
   app ftp
 data-policy DP-PUNE
  vpn-list CORP
   sequence 30
    match
     app-list BACKUP-APPS
    action accept
     count BACKUP-PKTS
     set
      local-tloc-list
       color biz-internet
       encap ipsec
       <span class="hl">restrict</span>
   default-action accept</pre>
<p>The <code>restrict</code> keyword matters. <b>With restrict</b>, if the chosen color is unavailable the traffic is <b>dropped</b>. <b>Without restrict</b>, the edge falls back to any other available path. Backups can wait, so a drop might be acceptable; a payment system must never use restrict without a very good reason.</p>

<h3>Choosing the remote end: set tloc and set tloc-list</h3>
<p>A <b>remote TLOC</b> is identified by the remote system-ip, color and encapsulation. Use it to force traffic to a specific hub or a specific circuit at the far end.</p>
<pre class="code">     action accept
      set
       tloc 10.255.0.1 color mpls encap ipsec</pre>
<p>For several candidates, build a <b>tloc-list</b> with <code>preference</code> values: the highest-preference reachable TLOC is used, and lower ones are backups. If none are reachable, the edge routes the traffic normally. These settings only change the TLOC <b>within the OMP routes the Controller already advertised</b>; you cannot send traffic to a TLOC that has no route to the destination.</p>

<h3>Choosing the next hop: set next-hop, set vpn, set service</h3>
<ul>
<li><b>set next-hop 10.1.10.254</b> overrides the routing next hop with a LAN address in the same VPN, for example a local proxy.</li>
<li><b>set vpn 20</b> hands the packet to another VPN, a way to leak selected traffic between segments without exposing the whole VRF.</li>
<li><b>set service FW</b> sends the traffic to a service (such as a firewall) that a site advertises through the Controller. The next module on control policy explains the service chaining design; the data policy is the trigger that says <i>which</i> traffic enters the chain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Data policy sending backups over internet and billing over MPLS">
<rect x="20" y="85" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="12">data policy</text>
<rect x="490" y="85" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-DC</text><text x="555" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<line x1="150" y1="100" x2="490" y2="50" stroke="#64748b" stroke-width="3"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">backups: local-tloc biz-internet</text>
<line x1="150" y1="130" x2="490" y2="180" stroke="#64748b" stroke-width="3"/><text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">billing: tloc 10.255.0.1 mpls</text>
</svg><p class="cap">Two matches, two fixed choices. Neither reacts to quality.</p></div>

<h3>Verify the decision: service-path</h3>
<p>Do not guess. Ask the edge what it would do with a given flow:</p>
<pre class="out">E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.20 protocol 6 dest-port 873
Number of possible next hops: 1
 Next Hop: IPsec
  Source: 203.0.113.10 12346 Destination: 203.0.113.6 12346
  <span class="hl">Local Color: biz-internet Remote Color: biz-internet</span> Remote System IP: 10.255.0.1</pre>
<p>In Manager the same tool is Monitor, Devices, Troubleshooting, Simulate Flows. It is the fastest way to prove that a policy chooses the path you intended, before users complain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>restrict</code> on critical traffic and then losing it when one circuit fails. (2) Choosing a color the remote site does not have, so no tunnel pair exists. (3) Expecting <code>set tloc</code> to create reachability: the destination prefix must still be advertised by that TLOC. (4) Using fixed data-policy choices where a quality-driven AAR policy would adapt on its own.</p></div>

<div class="exam"><p><b>Exam trap.</b> A data policy action <b>set tloc / set local-tloc</b> is static: it does not look at loss, latency or jitter. If the question says "move traffic when the path degrades", the answer is an app-route policy with an SLA class, not a data policy.</p></div>

<div class="scn"><h4>Backups that filled the MPLS circuit</h4><p>At Bharat Retail the nightly database backup from Pune to Mumbai ran at 2 am and saturated the 20 Mbps MPLS circuit, so a night-shift call centre had choppy voice. Both tunnels were equal-cost, so the backup flows were spread across both. The engineer added a data policy sequence that matched the backup application list and set <code>local-tloc-list color biz-internet</code>, with no restrict. The backups moved to the internet tunnel, MPLS stayed clean for voice, and if the internet circuit ever failed the backups would still complete over MPLS.</p><p><b>Lesson:</b> use intent-based steering for bulk traffic and leave restrict off unless dropping is the safer outcome.</p></div>

<div class="iv"><p class="q">"How can you force an application over a specific transport in Catalyst SD-WAN, and what happens if that transport fails?"</p><p>Use a centralized data policy with set local-tloc-list (or set tloc for the remote end) applied from-service. Explain restrict: with it, traffic is dropped if the color is down; without it, the edge falls back to other paths. Then contrast with AAR, which changes the path automatically based on measured SLA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data policy path actions are fixed, intent-based choices: set local-tloc-list, set tloc, set next-hop, set vpn, set service.</li>
<li>restrict turns a preference into a hard rule: no available color means drop.</li>
<li>TLOC choices work only among routes the Controller already advertises.</li>
<li>Use show sdwan policy service-path (or Simulate Flows in Manager) to prove the chosen path.</li>
<li>Static steering does not react to quality; that is AAR's job.</li>
</ul></div>
`,hi:`
<p>Kabhi kabhi path decide karne ke liye measurement ki zaroorat nahi hoti. Aapko bas pata hota hai ki raat ke backups sasta internet tunnel use karein, finance traffic hub se guzre, ya guest traffic pehle firewall se inspect ho. In <b>fixed, intent-based</b> choices ke liye aap data policy ke path-selecting actions use karte ho. Yeh chapter batata hai ki unhe kab use karna hai, path fail hone par woh kaise behave karte hain, aur AAR se kaise alag hain.</p>

<h3>Analogy: parcel type ke hisaab se courier chunna</h3>
<p>Company legal documents secure courier se bhejti hai, catalogues sabse sasta courier se, aur fragile items specialist se. Bhejne wala roz subah traffic check nahi karta. Rule isse fix hai ki <i>kya</i> bheja ja raha hai. Yeh data-policy traffic engineering hai. AAR (agle chapters) extra step hai jahan road band hone par courier badal diya jaata hai.</p>

<h3>Traffic steer karne ke teen levers</h3>
<table class="cmp"><tr><th>Lever</th><th>Kahan</th><th>Scope</th><th>Quality par react karta hai?</th></tr>
<tr><td>OMP ya control policy mein <b>TLOC preference</b></td><td>Controller</td><td>Ek destination ka saara traffic, sabke liye</td><td>Nahi (sirf up/down par react)</td></tr>
<tr><td><b>Data policy</b> set local-tloc, set tloc, set next-hop, set vpn, set service</td><td>WAN Edge, match ke hisaab se</td><td>Sirf jo traffic aap match karo</td><td>Nahi</td></tr>
<tr><td><b>App-route policy</b> SLA class ke saath</td><td>WAN Edge, match ke hisaab se</td><td>Sirf jo traffic aap match karo</td><td><b>Haan</b></td></tr></table>

<h3>Local transport chunna: set local-tloc-list</h3>
<p><b>Local TLOC</b> choice jawab deti hai "yeh packet mere kaunse <b>apne</b> WAN interface se nikle?". Interface ko uske <b>color</b> se pehchante hain.</p>
<pre class="code"><span class="c">! on VSMART: backups leave Pune on biz-internet only</span>
policy
 lists
  app-list BACKUP-APPS
   app rsync
   app ftp
 data-policy DP-PUNE
  vpn-list CORP
   sequence 30
    match
     app-list BACKUP-APPS
    action accept
     count BACKUP-PKTS
     set
      local-tloc-list
       color biz-internet
       encap ipsec
       <span class="hl">restrict</span>
   default-action accept</pre>
<p><code>restrict</code> keyword important hai. <b>restrict ke saath</b>, agar chuna hua color available na ho to traffic <b>drop</b> ho jaata hai. <b>restrict ke bina</b>, edge kisi bhi doosre available path par fall back karta hai. Backups ruk sakte hain, isliye drop acceptable ho sakta hai; payment system par bina bahut achchi wajah ke restrict kabhi mat lagao.</p>

<h3>Remote end chunna: set tloc aur set tloc-list</h3>
<p><b>Remote TLOC</b> ko remote system-ip, color aur encapsulation se pehchante hain. Isse traffic ko specific hub ya door ke specific circuit par force karo.</p>
<pre class="code">     action accept
      set
       tloc 10.255.0.1 color mpls encap ipsec</pre>
<p>Kai candidates ke liye <code>preference</code> values wali <b>tloc-list</b> banao: sabse high-preference reachable TLOC use hota hai, baaki backup hote hain. Agar koi reachable na ho to edge traffic ko normal route karta hai. Yeh settings sirf un <b>OMP routes ke andar TLOC badalti hain jo Controller pehle se advertise kar chuka hai</b>; aap aise TLOC par traffic nahi bhej sakte jiska destination tak route nahi hai.</p>

<h3>Next hop chunna: set next-hop, set vpn, set service</h3>
<ul>
<li><b>set next-hop 10.1.10.254</b> routing next hop ko same VPN ke LAN address se override karta hai, jaise local proxy.</li>
<li><b>set vpn 20</b> packet ko doosre VPN ko deta hai, poora VRF expose kiye bina chune hue traffic ko segments ke beech leak karne ka tareeka.</li>
<li><b>set service FW</b> traffic ko aisi service (jaise firewall) ko bhejta hai jo koi site Controller ke through advertise karti hai. Control policy ka agla module service chaining design samjhata hai; data policy woh trigger hai jo batata hai <i>kaunsa</i> traffic chain mein jaayega.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Data policy backups ko internet par aur billing ko MPLS par bhejti hai">
<rect x="20" y="85" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="12">data policy</text>
<rect x="490" y="85" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-DC</text><text x="555" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<line x1="150" y1="100" x2="490" y2="50" stroke="#64748b" stroke-width="3"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">backups: local-tloc biz-internet</text>
<line x1="150" y1="130" x2="490" y2="180" stroke="#64748b" stroke-width="3"/><text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">billing: tloc 10.255.0.1 mpls</text>
</svg><p class="cap">Do matches, do fixed choices. Koi bhi quality par react nahi karta.</p></div>

<h3>Decision verify karo: service-path</h3>
<p>Andaaza mat lagao. Edge se poocho ki diye gaye flow ke saath woh kya karega:</p>
<pre class="out">E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.20 protocol 6 dest-port 873
Number of possible next hops: 1
 Next Hop: IPsec
  Source: 203.0.113.10 12346 Destination: 203.0.113.6 12346
  <span class="hl">Local Color: biz-internet Remote Color: biz-internet</span> Remote System IP: 10.255.0.1</pre>
<p>Manager mein yahi tool Monitor, Devices, Troubleshooting, Simulate Flows hai. Users ke complain karne se pehle yeh saabit karne ka sabse tez tareeka hai ki policy aapka chaha hua path chunti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Critical traffic par <code>restrict</code> lagana aur ek circuit fail hone par traffic kho dena. (2) Aisa color chunna jo remote site ke paas nahi hai, isliye koi tunnel pair exist nahi karta. (3) <code>set tloc</code> se reachability banne ki ummeed rakhna: destination prefix us TLOC se advertise hona hi chahiye. (4) Wahan fixed data-policy choices use karna jahan quality-driven AAR policy khud adapt kar leti.</p></div>

<div class="exam"><p><b>Exam trap.</b> Data policy action <b>set tloc / set local-tloc</b> static hai: woh loss, latency ya jitter nahi dekhta. Agar sawaal kehta hai "path degrade hone par traffic move karo", to jawab SLA class wali app-route policy hai, data policy nahi.</p></div>

<div class="scn"><h4>Backups jinhone MPLS circuit bhar diya</h4><p>Bharat Retail mein Pune se Mumbai ka raat ka database backup 2 baje chalta tha aur 20 Mbps MPLS circuit saturate kar deta tha, isliye night-shift call centre ki voice choppy ho jaati thi. Dono tunnels equal-cost the, isliye backup flows dono par bant jaate the. Engineer ne ek data policy sequence joda jo backup application list match karta tha aur <code>local-tloc-list color biz-internet</code> set karta tha, bina restrict ke. Backups internet tunnel par chale gaye, MPLS voice ke liye saaf raha, aur agar kabhi internet circuit fail ho to backups MPLS par poore ho jaayenge.</p><p><b>Lesson:</b> bulk traffic ke liye intent-based steering use karo aur restrict tab tak mat lagao jab tak drop karna zyada safe na ho.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein kisi application ko specific transport par kaise force karte hain, aur woh transport fail ho to kya hota hai?"</p><p>Centralized data policy set local-tloc-list (ya remote end ke liye set tloc) ke saath from-service apply karo. restrict samjhao: uske saath color down hone par traffic drop hota hai; uske bina edge doosre paths par fall back karta hai. Phir AAR se contrast karo, jo measured SLA ke basis par path khud badalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data policy ke path actions fixed, intent-based choices hain: set local-tloc-list, set tloc, set next-hop, set vpn, set service.</li>
<li>restrict preference ko hard rule bana deta hai: koi color available nahi to drop.</li>
<li>TLOC choices sirf un routes ke beech kaam karti hain jo Controller pehle se advertise karta hai.</li>
<li>Chuna hua path saabit karne ke liye show sdwan policy service-path (ya Manager mein Simulate Flows) use karo.</li>
<li>Static steering quality par react nahi karta; yeh AAR ka kaam hai.</li>
</ul></div>
`}};export{e as default};