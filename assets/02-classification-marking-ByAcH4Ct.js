var e={id:`classification-marking`,h:{en:`Classification and marking: DSCP, forwarding classes and the trust boundary`,hi:`Classification aur marking: DSCP, forwarding classes aur trust boundary`},body:{en:`
<p>At an airport, staff look at each passenger and give a coloured tag: first class, business, economy. Everything later (the lounge, the boarding queue, the baggage priority) depends on that tag. <b>Classification</b> is the act of looking at a packet and deciding what kind of traffic it is. <b>Marking</b> is writing that decision into the packet so the next device does not have to look again.</p>

<h3>The marks a packet can carry</h3>
<p>An IPv4 packet has a one-byte field called ToS. Its upper 6 bits are the <b>DSCP</b> (Differentiated Services Code Point), a number from 0 to 63. DSCP values map to <b>per-hop behaviours (PHB)</b>: the treatment each router should give the packet. On an Ethernet trunk a 3-bit <b>CoS</b> value in the 802.1Q tag does a similar job, and on MPLS the 3-bit <b>EXP</b> (traffic class) field does. The commonly used values are:</p>
<table class="cmp"><tr><th>Traffic</th><th>PHB name</th><th>DSCP</th><th>Typical treatment</th></tr>
<tr><td>Voice bearer</td><td>EF</td><td>46</td><td>Priority queue (LLQ)</td></tr>
<tr><td>Interactive video</td><td>AF41</td><td>34</td><td>Guaranteed bandwidth</td></tr>
<tr><td>Signalling, call control</td><td>CS3 (or AF31)</td><td>24 (26)</td><td>Guaranteed, small</td></tr>
<tr><td>Business-critical data (ERP)</td><td>AF21</td><td>18</td><td>Guaranteed bandwidth</td></tr>
<tr><td>Bulk, backup</td><td>AF11 or CS1</td><td>10 or 8</td><td>Leftover bandwidth</td></tr>
<tr><td>Everything else</td><td>BE (default)</td><td>0</td><td>Best effort</td></tr></table>

<h3>Forwarding class: the SD-WAN label for a queue</h3>
<p>DSCP travels in the packet. A <b>forwarding class</b> is a name that exists only inside the router. You create names such as VOICE, VIDEO, CRITICAL and BULK, and you map each to an output queue (chapter 3). Classification therefore has two outputs: optionally a new DSCP value, and always a forwarding class. The router uses the forwarding class to choose the queue and, on egress, a <b>rewrite rule</b> can turn the class back into a DSCP value for the provider.</p>

<h3>Where do you classify in Catalyst SD-WAN?</h3>
<p>There are two tools, and exam questions test the difference:</p>
<ul>
<li><b>Localized ACL with a class action.</b> An access list in the localized policy matches on source, destination, protocol, ports or <b>existing DSCP</b>, and the accept action can set a <b>class</b> and a <b>DSCP</b> value or a policer. It is applied <b>inbound on the service-side (LAN) interface</b>. It works on the router alone, even if the Controller is unreachable.</li>
<li><b>Centralized data policy.</b> A policy built in Manager and sent by the Controller can match on <b>applications</b> from the DPI (deep packet inspection) engine, via an app-list, as well as addresses and ports. Its actions include <b>set DSCP</b> and a <b>forwarding class</b>, besides the traffic engineering actions you saw in the sdw-aar module. Use it when you want to classify by application name, or to apply one marking policy to many sites at once.</li>
</ul>
<p>Both do the same job at the end: the packet gets a forwarding class and, optionally, a DSCP value. In practice many designs use the data policy for application-based marking and keep the ACL for simple port or DSCP-based classes.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where classification happens">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<rect x="150" y="40" width="150" height="100" rx="8" fill="#bae6fd"/><text x="225" y="64" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 LAN port</text><text x="225" y="86" text-anchor="middle" class="svg-muted" font-size="12">ingress ACL: match</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">dscp 46: class VOICE</text><text x="225" y="122" text-anchor="middle" class="svg-muted" font-size="12">or data policy by app</text>
<rect x="330" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="395" y="86" text-anchor="middle" class="svg-ink" font-size="13">Queue 0</text><text x="395" y="104" text-anchor="middle" class="svg-muted" font-size="12">VOICE (LLQ)</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">WAN port</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">rewrite: EF 46</text>
<line x1="120" y1="90" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="460" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Classify at ingress, queue by class, rewrite at egress</text>
</svg><p class="cap">Classification happens once, at ingress; the forwarding class then drives the queue and the egress rewrite.</p></div>

<h3>A localized ACL that classifies by DSCP</h3>
<p>The phones at Bharat Retail already send voice as DSCP 46 and video as DSCP 34. The branch router trusts them and turns the marks into forwarding classes.</p>
<pre class="code"><span class="c">! localized policy: classify by incoming DSCP</span>
policy
 access-list ACL-CLASSIFY
  sequence 10
   match
    dscp 46
   !
   action accept
    class VOICE
   !
  !
  sequence 20
   match
    dscp 34
   !
   action accept
    class VIDEO
   !
  !
  default-action accept
 !
!
<span class="c">! applied inbound on the LAN-facing interface through the template</span></pre>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>default-action accept</code>. An ACL in the localized policy drops packets that match no sequence unless the default action is accept. A QoS classification ACL that drops everything else will break the branch.</p></div>

<h3>A data policy that classifies by application</h3>
<p>Many applications cannot be matched by port. The data policy uses DPI application names, sets DSCP and a forwarding class, and stays accepted so the packet continues:</p>
<pre class="code">policy
 data-policy DP-QOS-MARK
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    !
    action accept
     count VOICE-PKTS
     set
      dscp 46
      forwarding-class VOICE
     !
    !
   !
   default-action accept
  !
 !
!</pre>
<p>You verify it with <code>show sdwan policy from-vsmart</code> (is it present?) and <code>show sdwan policy data-policy-filter</code> (are the counters increasing?), the same commands as in the sdw-aar module.</p>

<h3>The trust boundary</h3>
<p>The <b>trust boundary</b> is the point where you stop believing the marks that arrive and start deciding them yourself. A user PC can set DSCP 46 and jump the queue. Good practice:</p>
<ul>
<li>Trust marks from managed IP phones and video endpoints only, by matching their subnet or VLAN.</li>
<li>Re-mark everything else (guest Wi-Fi in VPN 20, user PCs) to 0 or to a fixed class, with an ACL or a data policy on that VPN.</li>
<li>Do the marking <b>as close to the source as possible</b>, once, and trust it afterwards.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> At E-MUM-1 the LAN 10.2.10.0/24 has phones in 10.2.10.64/26 and PCs elsewhere. Sequence 10 matches source 10.2.10.64/26 with DSCP 46 and sets class VOICE. Sequence 20 matches the ERP server 10.1.50.10 ports 443 and sets AF21 (DSCP 18), class CRITICAL. Sequence 30, with no match, sets DSCP 0, class DEFAULT. A PC that sets DSCP 46 falls through to sequence 30 and is re-marked to 0.</p></div>

<div class="exam"><p><b>Exam trap.</b> The ACL with a class is localized and applied on the interface; it does not need the Controller. Matching by <b>application name</b> needs the centralized data policy. A forwarding class has meaning only on the router; the DSCP is what leaves the box.</p></div>

<div class="scn"><h4>Everyone's calls became "priority"</h4><p>After a software rollout, a helpdesk tool on user PCs started marking its own traffic as DSCP 46. The voice queue filled with screen-sharing traffic and real calls were delayed. The engineer saw the voice queue counters rising on PCs' subnets with <code>show sdwan policy access-list-counters</code>. The fix was an ingress ACL on the PC VLAN that re-marked everything to DSCP 0, and only the phone subnet kept its marks.</p><p><b>Lesson:</b> trust marks only from devices you manage.</p></div>

<div class="iv"><p class="q">"Where do you classify traffic in Catalyst SD-WAN, and what is a forwarding class?"</p><p>I classify on ingress at the service side, either with a localized ACL (matching addresses, ports or DSCP and setting a class and DSCP) or with a centralized data policy (matching DPI applications and setting DSCP and a forwarding class). A forwarding class is a router-local name mapped to an output queue; the DSCP is the value that travels in the packet. I define a trust boundary and re-mark untrusted traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP is carried in the packet; a forwarding class is local and chooses the queue.</li>
<li>EF 46 voice, AF41 34 video, AF21 18 critical data, CS1 8 or AF11 bulk, BE 0.</li>
<li>Localized ACL with a class works on the interface; data policy can match applications.</li>
<li>An ACL without <code>default-action accept</code> drops unmatched packets.</li>
<li>Define the trust boundary and re-mark untrusted traffic near the source.</li>
</ul></div>
`,hi:`
<p>Airport par staff har passenger ko dekh kar rangeen tag deta hai: first class, business, economy. Baad ki har cheez (lounge, boarding queue, baggage priority) usi tag par depend karti hai. <b>Classification</b> woh kaam hai jisme packet ko dekh kar tay kiya jaata hai ki yeh kis tarah ka traffic hai. <b>Marking</b> us faisle ko packet mein likh dena hai taaki agle device ko dobara dekhna na pade.</p>

<h3>Packet par kaunse marks hote hain</h3>
<p>IPv4 packet mein ek byte ka field hota hai jise ToS kehte hain. Iske upar ke 6 bits <b>DSCP</b> (Differentiated Services Code Point) hain, 0 se 63 tak ka number. DSCP values <b>per-hop behaviours (PHB)</b> se map hoti hain: yaani har router packet ko kaisa treatment de. Ethernet trunk par 802.1Q tag ka 3-bit <b>CoS</b> value yahi kaam karta hai, aur MPLS par 3-bit <b>EXP</b> (traffic class) field. Aam taur par use hone wali values:</p>
<table class="cmp"><tr><th>Traffic</th><th>PHB name</th><th>DSCP</th><th>Typical treatment</th></tr>
<tr><td>Voice bearer</td><td>EF</td><td>46</td><td>Priority queue (LLQ)</td></tr>
<tr><td>Interactive video</td><td>AF41</td><td>34</td><td>Guaranteed bandwidth</td></tr>
<tr><td>Signalling, call control</td><td>CS3 (ya AF31)</td><td>24 (26)</td><td>Guaranteed, chhota</td></tr>
<tr><td>Business-critical data (ERP)</td><td>AF21</td><td>18</td><td>Guaranteed bandwidth</td></tr>
<tr><td>Bulk, backup</td><td>AF11 ya CS1</td><td>10 ya 8</td><td>Bachi hui bandwidth</td></tr>
<tr><td>Baaki sab</td><td>BE (default)</td><td>0</td><td>Best effort</td></tr></table>

<h3>Forwarding class: queue ka SD-WAN label</h3>
<p>DSCP packet ke andar travel karta hai. <b>Forwarding class</b> ek naam hai jo sirf router ke andar rehta hai. Aap VOICE, VIDEO, CRITICAL aur BULK jaise naam banate ho aur har ek ko output queue se map karte ho (chapter 3). Isliye classification ke do output hote hain: optional naya DSCP value, aur hamesha ek forwarding class. Router forwarding class se queue chunta hai, aur egress par <b>rewrite rule</b> class ko wapas DSCP value mein badal sakta hai provider ke liye.</p>

<h3>Catalyst SD-WAN mein classify kahan karte hain?</h3>
<p>Do tools hain, aur exam sawal inke fark par aate hain:</p>
<ul>
<li><b>Class action wala localized ACL.</b> Localized policy ka access list source, destination, protocol, ports ya <b>maujooda DSCP</b> par match karta hai, aur accept action <b>class</b>, <b>DSCP</b> value ya policer set kar sakta hai. Yeh <b>service-side (LAN) interface par inbound</b> lagta hai. Yeh sirf router par kaam karta hai, Controller unreachable ho tab bhi.</li>
<li><b>Centralized data policy.</b> Manager mein bani aur Controller se aayi policy DPI (deep packet inspection) engine ke <b>applications</b> par app-list se match kar sakti hai, addresses aur ports ke saath. Iske actions mein <b>set DSCP</b> aur <b>forwarding class</b> hain, sdw-aar module ke traffic engineering actions ke alawa. Jab application name se classify karna ho, ya ek marking policy kai sites par ek saath lagani ho, tab use karo.</li>
</ul>
<p>Dono ant mein ek hi kaam karte hain: packet ko forwarding class aur optional DSCP value milti hai. Practice mein kai designs application-based marking ke liye data policy use karte hain aur simple port ya DSCP-based classes ke liye ACL.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Classification kahan hota hai">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<rect x="150" y="40" width="150" height="100" rx="8" fill="#bae6fd"/><text x="225" y="64" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 LAN port</text><text x="225" y="86" text-anchor="middle" class="svg-muted" font-size="12">ingress ACL: match</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">dscp 46: class VOICE</text><text x="225" y="122" text-anchor="middle" class="svg-muted" font-size="12">ya app se data policy</text>
<rect x="330" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="395" y="86" text-anchor="middle" class="svg-ink" font-size="13">Queue 0</text><text x="395" y="104" text-anchor="middle" class="svg-muted" font-size="12">VOICE (LLQ)</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">WAN port</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">rewrite: EF 46</text>
<line x1="120" y1="90" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="460" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Ingress par classify, class se queue, egress par rewrite</text>
</svg><p class="cap">Classification ek baar, ingress par hota hai; phir forwarding class queue aur egress rewrite chalati hai.</p></div>

<h3>DSCP se classify karne wala localized ACL</h3>
<p>Bharat Retail ke phones pehle se voice ko DSCP 46 aur video ko DSCP 34 bhejte hain. Branch router unpar bharosa karta hai aur marks ko forwarding classes mein badalta hai.</p>
<pre class="code"><span class="c">! localized policy: incoming DSCP se classify</span>
policy
 access-list ACL-CLASSIFY
  sequence 10
   match
    dscp 46
   !
   action accept
    class VOICE
   !
  !
  sequence 20
   match
    dscp 34
   !
   action accept
    class VIDEO
   !
  !
  default-action accept
 !
!
<span class="c">! template ke zariye LAN-facing interface par inbound lagaya jaata hai</span></pre>

<div class="warn"><p><b>Common mistake.</b> <code>default-action accept</code> bhool jaana. Localized policy ka ACL un packets ko drop kar deta hai jo kisi sequence se match nahi karte, jab tak default action accept na ho. Aisa QoS classification ACL jo baaki sab drop kare, branch tod dega.</p></div>

<h3>Application se classify karne wali data policy</h3>
<p>Kai applications port se match nahi hote. Data policy DPI application names use karti hai, DSCP aur forwarding class set karti hai, aur accepted rehti hai taaki packet aage badhe:</p>
<pre class="code">policy
 data-policy DP-QOS-MARK
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    !
    action accept
     count VOICE-PKTS
     set
      dscp 46
      forwarding-class VOICE
     !
    !
   !
   default-action accept
  !
 !
!</pre>
<p>Verify karne ke liye <code>show sdwan policy from-vsmart</code> (kya yeh maujood hai?) aur <code>show sdwan policy data-policy-filter</code> (kya counters badh rahe hain?), wahi commands jo sdw-aar module mein the.</p>

<h3>Trust boundary</h3>
<p><b>Trust boundary</b> woh point hai jahan aap aaye hue marks par bharosa karna band karte ho aur khud tay karte ho. User PC DSCP 46 set karke queue mein aage kud sakta hai. Achhi practice:</p>
<ul>
<li>Sirf managed IP phones aur video endpoints ke marks par bharosa karo, unke subnet ya VLAN se match karke.</li>
<li>Baaki sab (VPN 20 mein guest Wi-Fi, user PCs) ko ACL ya data policy se 0 ya fixed class par re-mark karo.</li>
<li>Marking <b>source ke jitna paas ho sake</b> utna paas, ek baar karo, aur phir us par bharosa karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> E-MUM-1 par LAN 10.2.10.0/24 mein phones 10.2.10.64/26 mein hain aur PCs baaki jagah. Sequence 10 source 10.2.10.64/26 aur DSCP 46 match karke class VOICE set karta hai. Sequence 20 ERP server 10.1.50.10 port 443 match karke AF21 (DSCP 18), class CRITICAL set karta hai. Sequence 30, bina match ke, DSCP 0, class DEFAULT set karta hai. DSCP 46 set karne wala PC sequence 30 tak girta hai aur 0 par re-mark ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Class wala ACL localized hai aur interface par lagta hai; usse Controller nahi chahiye. <b>Application name</b> se match karna centralized data policy maangta hai. Forwarding class ka matlab sirf router par hai; box se DSCP nikalta hai.</p></div>

<div class="scn"><h4>Sabki calls "priority" ban gayin</h4><p>Ek software rollout ke baad user PCs par ek helpdesk tool apna traffic DSCP 46 mark karne laga. Voice queue screen-sharing traffic se bhar gayi aur asli calls late hone lagin. Engineer ne <code>show sdwan policy access-list-counters</code> se dekha ki voice queue ke counters PCs ke subnets se badh rahe hain. Fix: PC VLAN par ingress ACL jo sab kuch DSCP 0 par re-mark kare, aur sirf phone subnet apne marks rakhe.</p><p><b>Lesson:</b> sirf un devices ke marks par bharosa karo jo aap manage karte ho.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein traffic kahan classify karte ho, aur forwarding class kya hai?"</p><p>Main service side par ingress mein classify karta hoon, ya localized ACL se (addresses, ports ya DSCP match karke class aur DSCP set karta hai) ya centralized data policy se (DPI applications match karke DSCP aur forwarding class set karta hai). Forwarding class router-local naam hai jo output queue se map hota hai; DSCP woh value hai jo packet mein travel karti hai. Main trust boundary define karta hoon aur untrusted traffic re-mark karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP packet mein jaata hai; forwarding class local hai aur queue chunti hai.</li>
<li>EF 46 voice, AF41 34 video, AF21 18 critical data, CS1 8 ya AF11 bulk, BE 0.</li>
<li>Class wala localized ACL interface par kaam karta hai; data policy applications match kar sakti hai.</li>
<li><code>default-action accept</code> ke bina ACL unmatched packets drop karta hai.</li>
<li>Trust boundary define karo aur untrusted traffic source ke paas re-mark karo.</li>
</ul></div>
`}};export{e as default};