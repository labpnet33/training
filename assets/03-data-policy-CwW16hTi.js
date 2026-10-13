var e={id:`data-policy`,h:{en:`Centralized data policy: match conditions and actions`,hi:`Centralized data policy: match conditions aur actions`},body:{en:`
<p>A centralized <b>data policy</b> is the general-purpose "if the packet looks like this, do that" tool of Catalyst SD-WAN. It is where you mark traffic, drop it, count it, push it into another VPN, send it to a firewall, pick a transport, or break it out to the internet. This chapter is the full tour of what you can match and what you can do.</p>

<h3>Analogy: the rules at a toll plaza</h3>
<p>At a toll plaza, a camera looks at each vehicle (the <b>match</b>: car, truck, ambulance, number plate) and a rule decides the lane (the <b>action</b>: open the barrier, charge double, send to the heavy lane, wave through free). The first rule that fits is used. A data policy works the same way on every packet that enters the WAN Edge, in the direction you chose.</p>

<h3>Match conditions</h3>
<table class="cmp"><tr><th>Match</th><th>What it looks at</th><th>Typical use</th></tr>
<tr><td><code>app-list</code></td><td>Application identified by deep packet inspection</td><td>Voice and video apps, SaaS, backup tools</td></tr>
<tr><td><code>dscp</code></td><td>DSCP value in the IP header (0-63)</td><td>Honour markings that phones or switches already set</td></tr>
<tr><td><code>source-data-prefix-list</code>, <code>destination-data-prefix-list</code>, <code>source-ip</code>, <code>destination-ip</code></td><td>Source or destination address</td><td>Guest subnet, DC subnet, a specific server</td></tr>
<tr><td><code>source-port</code>, <code>destination-port</code>, <code>protocol</code></td><td>Layer 4 fields</td><td>Old applications that are not recognised by name</td></tr>
<tr><td><code>packet-length</code>, <code>plp</code>, <code>tcp</code>, <code>icmp-message</code></td><td>Size, packet loss priority, TCP flags, ICMP type</td><td>Special cases, QoS tricks</td></tr>
<tr><td><code>dns</code>, <code>dns-app-list</code></td><td>DNS requests and responses, and the applications they belong to</td><td>Redirecting DNS, learning applications from DNS</td></tr></table>
<p>A sequence can have several matches. They are combined with <b>AND</b>: the packet must satisfy all of them. If you need an OR, write two sequences.</p>

<h3>Actions</h3>
<p>Every sequence ends with <code>accept</code> or <code>drop</code>. After <code>accept</code> you can attach more actions:</p>
<table class="cmp"><tr><th>Action</th><th>What it does</th></tr>
<tr><td><code>drop</code></td><td>Discards the packet. Often combined with <code>count</code> and <code>log</code> to prove what was blocked.</td></tr>
<tr><td><code>count NAME</code></td><td>A named counter you read with <code>show sdwan policy data-policy-filter</code>.</td></tr>
<tr><td><code>log</code></td><td>Sends a copy of the first packet of matching flows to syslog.</td></tr>
<tr><td><code>set dscp</code>, <code>set forwarding-class</code></td><td>Marks the packet and assigns it to a QoS class (queues are in the QoS module).</td></tr>
<tr><td><code>set local-tloc-list</code>, <code>set tloc-list</code>, <code>set tloc</code></td><td>Picks the <b>local</b> transport (own color) or the <b>remote</b> TLOC to use. This is traffic engineering.</td></tr>
<tr><td><code>set next-hop</code>, <code>set vpn</code>, <code>set service</code></td><td>Forces a next-hop IP, moves the packet to another service VPN, or sends it through a service such as a firewall.</td></tr>
<tr><td><code>nat use-vpn 0</code></td><td>Breaks the traffic out locally through the transport (Direct Internet Access, next module).</td></tr>
<tr><td><code>tcp-optimization</code>, <code>loss-protect</code></td><td>TCP optimization and loss correction (chapter 7).</td></tr>
<tr><td><code>policer</code>, <code>cflowd</code>, <code>redirect-dns</code></td><td>Rate limit, export flow records, redirect DNS to a chosen resolver.</td></tr></table>

<h3>Worked example: three sequences for Pune</h3>
<p>Bharat Retail asks for three things at E-BR1. Voice must be marked DSCP 46 and counted. Guest Wi-Fi (10.1.20.0/24) must never reach the DC subnet (10.100.0.0/24). Everything else flows normally.</p>
<pre class="code"><span class="c">! on VSMART (policy lists omitted: VOICE-APPS, GUEST-NET, DC-NET as before)</span>
policy
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action accept
     count VOICE-PKTS
     set
      dscp 46
      forwarding-class VOICE
   sequence 20
    match
     source-data-prefix-list GUEST-NET
     destination-data-prefix-list DC-NET
    action drop
     count GUEST-BLOCKED
     log
   default-action accept</pre>
<p>Order matters. If the guest drop sequence were first, a guest voice call to the DC would be dropped. If voice were first and a guest softphone call to the DC matched <code>VOICE-APPS</code>, it would be accepted. Sequence 10 as written has this loophole, so many teams place the <b>security drops first</b>. Decide deliberately which rule is more important and number it lower.</p>

<h3>Seeing it work</h3>
<pre class="out">E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter VOICE-PKTS
   packets  48211
   bytes    7234118
  data-policy-counter GUEST-BLOCKED
   <span class="hl">packets  37</span>
   bytes    2220</pre>
<p>A counter that stays at zero while you generate matching traffic means the policy is not matching (see the troubleshooting chapter). A counter that increases proves the sequence is being hit.</p>

<h3>Application recognition is not instant</h3>
<p>The edge recognises applications with its DPI engine, using the first packets of a flow, SNI or DNS clues, and an application database that can be updated. For the first few packets of a new flow the application may still be unknown, so an <code>app-list</code> sequence may miss them. For traffic that you must catch from the very first packet, match addresses or ports as well, or use <code>dns-app-list</code> so the edge learns the application from the DNS answer before the flow starts.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing a sequence with <code>action accept</code> and no counter, then having no way to prove it matched. (2) Using <code>match destination-ip</code> with the wrong mask or an overlapping prefix list. (3) Forgetting that two matches in one sequence mean AND. (4) Marking DSCP without a QoS policy on the egress interface, so the marking changes nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> A centralized data policy can set a next-hop, TLOC, VPN or service, but it <b>cannot change the routing table</b> of the device; it only changes how matching packets are forwarded. Changing which routes exist is the job of control policy.</p></div>

<div class="scn"><h4>The guest who reached the finance server</h4><p>Security reported that a laptop on the Pune guest Wi-Fi had opened a connection to a server in 10.100.0.0/24. The team found that the guest drop rule was sequence 20, below a broad "accept everything from the 10.1.0.0/16 aggregate" sequence 10 written for a different purpose. Packets matched sequence 10 first and never reached the drop. They swapped the numbers, kept <code>count</code> and <code>log</code> on the drop, and saw GUEST-BLOCKED increase within seconds of the next probe.</p><p><b>Lesson:</b> first match wins. Put the most specific and the most important (security) sequences at the top.</p></div>

<div class="iv"><p class="q">"What can a centralized data policy do to a packet?"</p><p>List the groups, not every keyword: accept or drop; count and log; mark DSCP and forwarding class; choose the transport or next hop (local-tloc, tloc, next-hop, vpn, service); local internet breakout with nat use-vpn 0; TCP optimization and loss correction; policing and flow export. Then add that it matches on application, DSCP, addresses, ports and protocol, with AND inside a sequence, and that it is enforced on the edge in the direction chosen in apply-policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match = application, DSCP, prefixes, ports, protocol, length and more; matches in one sequence are ANDed.</li>
<li>Actions = accept or drop plus count, log, set (dscp, forwarding-class, tloc, next-hop, vpn, service), nat, tcp-optimization, loss-protect.</li>
<li>First matching sequence wins; put security rules first and finish with a default-action.</li>
<li>Counters in <code>show sdwan policy data-policy-filter</code> prove a sequence is matching.</li>
<li>Application recognition needs a few packets; combine app matches with prefix or port matches when the first packet matters.</li>
</ul></div>
`,hi:`
<p>Centralized <b>data policy</b> Catalyst SD-WAN ka general-purpose "agar packet aisa dikhe to yeh karo" tool hai. Yahan aap traffic mark karte ho, drop karte ho, count karte ho, doosre VPN mein dhakelte ho, firewall ko bhejte ho, transport chunte ho, ya internet par break out karte ho. Yeh chapter is poore tour ka hai: kya match kar sakte ho aur kya kar sakte ho.</p>

<h3>Analogy: toll plaza ke rules</h3>
<p>Toll plaza par camera har gaadi ko dekhta hai (<b>match</b>: car, truck, ambulance, number plate) aur ek rule lane decide karta hai (<b>action</b>: barrier kholo, double charge karo, heavy lane mein bhejo, free nikalne do). Jo pehla rule fit ho woh use hota hai. Data policy WAN Edge mein enter karne wale har packet par, aapki chuni hui direction mein, bilkul aise hi kaam karti hai.</p>

<h3>Match conditions</h3>
<table class="cmp"><tr><th>Match</th><th>Kya dekhta hai</th><th>Typical use</th></tr>
<tr><td><code>app-list</code></td><td>Deep packet inspection se pehchani gayi application</td><td>Voice aur video apps, SaaS, backup tools</td></tr>
<tr><td><code>dscp</code></td><td>IP header mein DSCP value (0-63)</td><td>Phones ya switches ne jo marking pehle se set ki hai use maanna</td></tr>
<tr><td><code>source-data-prefix-list</code>, <code>destination-data-prefix-list</code>, <code>source-ip</code>, <code>destination-ip</code></td><td>Source ya destination address</td><td>Guest subnet, DC subnet, koi specific server</td></tr>
<tr><td><code>source-port</code>, <code>destination-port</code>, <code>protocol</code></td><td>Layer 4 fields</td><td>Purani applications jo naam se pehchani nahi jaati</td></tr>
<tr><td><code>packet-length</code>, <code>plp</code>, <code>tcp</code>, <code>icmp-message</code></td><td>Size, packet loss priority, TCP flags, ICMP type</td><td>Special cases, QoS tricks</td></tr>
<tr><td><code>dns</code>, <code>dns-app-list</code></td><td>DNS requests aur responses, aur jin applications ke woh hain</td><td>DNS redirect karna, DNS se applications seekhna</td></tr></table>
<p>Ek sequence mein kai matches ho sakte hain. Woh <b>AND</b> se jude hote hain: packet ko sabko satisfy karna padta hai. OR chahiye to do sequences likho.</p>

<h3>Actions</h3>
<p>Har sequence <code>accept</code> ya <code>drop</code> par khatam hota hai. <code>accept</code> ke baad aap aur actions laga sakte ho:</p>
<table class="cmp"><tr><th>Action</th><th>Kya karta hai</th></tr>
<tr><td><code>drop</code></td><td>Packet discard karta hai. Aksar <code>count</code> aur <code>log</code> ke saath, taaki saabit ho ki kya block hua.</td></tr>
<tr><td><code>count NAME</code></td><td>Naam wala counter jo aap <code>show sdwan policy data-policy-filter</code> se padhte ho.</td></tr>
<tr><td><code>log</code></td><td>Matching flows ke pehle packet ki copy syslog ko bhejta hai.</td></tr>
<tr><td><code>set dscp</code>, <code>set forwarding-class</code></td><td>Packet mark karta hai aur QoS class assign karta hai (queues QoS module mein hain).</td></tr>
<tr><td><code>set local-tloc-list</code>, <code>set tloc-list</code>, <code>set tloc</code></td><td><b>Local</b> transport (apna color) ya <b>remote</b> TLOC chunta hai. Yahi traffic engineering hai.</td></tr>
<tr><td><code>set next-hop</code>, <code>set vpn</code>, <code>set service</code></td><td>Next-hop IP force karta hai, packet ko doosre service VPN mein bhejta hai, ya firewall jaisi service se guzaarta hai.</td></tr>
<tr><td><code>nat use-vpn 0</code></td><td>Traffic ko transport se locally break out karta hai (Direct Internet Access, agla module).</td></tr>
<tr><td><code>tcp-optimization</code>, <code>loss-protect</code></td><td>TCP optimization aur loss correction (chapter 7).</td></tr>
<tr><td><code>policer</code>, <code>cflowd</code>, <code>redirect-dns</code></td><td>Rate limit, flow records export, DNS ko chune hue resolver par redirect.</td></tr></table>

<h3>Worked example: Pune ke liye teen sequences</h3>
<p>Bharat Retail E-BR1 par teen cheezein maangta hai. Voice DSCP 46 mark ho aur count ho. Guest Wi-Fi (10.1.20.0/24) kabhi DC subnet (10.100.0.0/24) tak na pahunche. Baaki sab normal chale.</p>
<pre class="code"><span class="c">! on VSMART (policy lists omitted: VOICE-APPS, GUEST-NET, DC-NET as before)</span>
policy
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action accept
     count VOICE-PKTS
     set
      dscp 46
      forwarding-class VOICE
   sequence 20
    match
     source-data-prefix-list GUEST-NET
     destination-data-prefix-list DC-NET
    action drop
     count GUEST-BLOCKED
     log
   default-action accept</pre>
<p>Order matter karta hai. Agar guest drop sequence pehle hota to DC ko guest voice call drop ho jaati. Agar voice pehle ho aur guest ki softphone call DC ko <code>VOICE-APPS</code> se match kare to woh accept ho jaayegi. Jaisa likha hai, sequence 10 mein yeh loophole hai, isliye kai teams <b>security drops ko pehle</b> rakhti hain. Soch samajh kar decide karo ki kaunsa rule zyada important hai aur use chhota number do.</p>

<h3>Kaam karte hue dekhna</h3>
<pre class="out">E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter VOICE-PKTS
   packets  48211
   bytes    7234118
  data-policy-counter GUEST-BLOCKED
   <span class="hl">packets  37</span>
   bytes    2220</pre>
<p>Agar matching traffic generate karne par bhi counter zero rahe to policy match nahi kar rahi (troubleshooting chapter dekho). Jo counter badhta hai woh saabit karta hai ki sequence hit ho raha hai.</p>

<h3>Application recognition turant nahi hoti</h3>
<p>Edge applications ko apne DPI engine se pehchanta hai, flow ke pehle packets, SNI ya DNS clues, aur application database se jo update ho sakta hai. Naye flow ke pehle kuch packets tak application abhi unknown ho sakti hai, isliye <code>app-list</code> sequence unhe miss kar sakta hai. Jo traffic aapko bilkul pehle packet se pakadna hai uske liye addresses ya ports bhi match karo, ya <code>dns-app-list</code> use karo taaki edge flow shuru hone se pehle DNS answer se application seekh le.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>action accept</code> wala sequence bina counter ke likhna, aur phir saabit karne ka koi tareeka na hona ki woh match hua. (2) <code>match destination-ip</code> mein galat mask ya overlapping prefix list. (3) Yeh bhool jaana ki ek sequence ke do matches ka matlab AND hai. (4) Egress interface par QoS policy ke bina DSCP marking karna, jisse marking se kuch nahi badalta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Centralized data policy next-hop, TLOC, VPN ya service set kar sakti hai, lekin woh device ka <b>routing table nahi badal sakti</b>; woh sirf matching packets ki forwarding badalti hai. Kaunse routes exist karte hain yeh badalna control policy ka kaam hai.</p></div>

<div class="scn"><h4>Guest jo finance server tak pahunch gaya</h4><p>Security ne report kiya ki Pune guest Wi-Fi ke ek laptop ne 10.100.0.0/24 ke server se connection khola. Team ko mila ki guest drop rule sequence 20 tha, jo sequence 10 ke neeche tha, jo kisi aur kaam ke liye likha gaya "10.1.0.0/16 aggregate se sab accept karo" tha. Packets pehle sequence 10 se match hue aur drop tak kabhi nahi pahunche. Unhone numbers badal diye, drop par <code>count</code> aur <code>log</code> rakhe, aur agle probe ke kuch seconds mein GUEST-BLOCKED badhta dekha.</p><p><b>Lesson:</b> first match jeetta hai. Sabse specific aur sabse important (security) sequences upar rakho.</p></div>

<div class="iv"><p class="q">"Centralized data policy packet ke saath kya kar sakti hai?"</p><p>Groups batao, har keyword nahi: accept ya drop; count aur log; DSCP aur forwarding class mark karna; transport ya next hop chunna (local-tloc, tloc, next-hop, vpn, service); nat use-vpn 0 se local internet breakout; TCP optimization aur loss correction; policing aur flow export. Phir jodo ki woh application, DSCP, addresses, ports aur protocol par match karti hai, ek sequence ke andar AND ke saath, aur apply-policy mein chuni direction mein edge par enforce hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match = application, DSCP, prefixes, ports, protocol, length aur zyada; ek sequence ke matches AND hote hain.</li>
<li>Actions = accept ya drop plus count, log, set (dscp, forwarding-class, tloc, next-hop, vpn, service), nat, tcp-optimization, loss-protect.</li>
<li>Pehla matching sequence jeetta hai; security rules pehle rakho aur default-action se khatam karo.</li>
<li><code>show sdwan policy data-policy-filter</code> ke counters saabit karte hain ki sequence match ho raha hai.</li>
<li>Application recognition ko kuch packets chahiye; jab pehla packet matter kare to app match ke saath prefix ya port match karo.</li>
</ul></div>
`}};export{e as default};